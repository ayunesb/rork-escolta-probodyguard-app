import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { checkRateLimit, resetRateLimit } from "@/backend/middleware/rateLimitMiddleware";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type SignInInput = z.infer<typeof signInSchema>;

export default publicProcedure
  .input(signInSchema)
  .mutation(async ({ input }: { input: SignInInput }) => {
    const { email, password } = input;

    try {
      console.log('[Auth] Sign in attempt:', email);

      const rateLimit = await checkRateLimit('login', email);
      if (!rateLimit.allowed) {
        console.log('[Auth] Rate limit exceeded for:', email);
        throw new Error(rateLimit.error || 'Too many login attempts. Please try again later.');
      }

      const authInstance = auth();
      const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      const user = userCredential.user;

      const dbInstance = db();
      const userDoc = await getDoc(doc(dbInstance, 'users', user.uid));
      const userData = userDoc.data();

      const token = await user.getIdToken();

      await resetRateLimit('login', email);

      return {
        success: true,
        message: 'Sign in successful',
        token,
        user: {
          id: user.uid,
          email: user.email!,
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
          phone: userData?.phone || '',
          role: userData?.role || 'client',
        },
      };
    } catch (error: any) {
      console.error('[Auth] Sign in error:', error);
      
      throw new Error(error.code === 'auth/invalid-credential' ? 'Invalid email or password' : 'Invalid credentials');
    }
  });
