import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
    })
  )
  .mutation(async ({ input }) => {
    const { email, password } = input;

    try {
      console.log('[Auth] Sign in attempt:', email);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      const token = await user.getIdToken();

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
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: error.code === 'auth/invalid-credential' ? 'Invalid email or password' : 'Invalid credentials',
      });
    }
  });
