import { publicProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";
import { auth, db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";

export default publicProcedure.query(async ({ ctx }) => {
  try {
    const authHeader = ctx.req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null };
    }

    console.log('[Auth] Get user request');

    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { user: null };
    }

    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!userDoc.exists()) {
      return { user: null };
    }

    const userData = userDoc.data();

    return {
      user: {
        id: currentUser.uid,
        email: currentUser.email!,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role,
      },
    };
  } catch (error) {
    console.error('[Auth] Get user error:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get user',
    });
  }
});
