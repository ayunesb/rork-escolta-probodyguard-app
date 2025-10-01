import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phone: z.string().min(1),
      role: z.enum(['client', 'guard', 'company', 'admin']),
    })
  )
  .mutation(async ({ input }) => {
    const { email, password, firstName, lastName, phone, role } = input;

    try {
      console.log('[Auth] Sign up attempt:', email, role);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email,
        firstName,
        lastName,
        phone,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const token = await user.getIdToken();

      return {
        success: true,
        message: 'Sign up successful',
        token,
        user: {
          id: user.uid,
          email,
          firstName,
          lastName,
          phone,
          role,
        },
      };
    } catch (error: any) {
      console.error('[Auth] Sign up error:', error);
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: error.code === 'auth/email-already-in-use' ? 'Email already in use' : 'Failed to create account',
      });
    }
  });
