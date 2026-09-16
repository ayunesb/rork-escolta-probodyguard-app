/**
 * Las reglas de Realtime Database (database.rules.json) deciden permisos de
 * admin/empresa leyendo `root.child('users').child(auth.uid).child('role')`
 * — un espejo del rol en RTDB. El problema: nada escribia ese espejo. El
 * nodo /users de RTDB estaba vacio para todas las cuentas reales, asi que
 * esas reglas de admin/empresa nunca eran verdaderas para nadie. Este
 * disparador es lo que faltaba.
 *
 * RTDB no puede llamar a Firestore desde sus reglas (a diferencia de Storage,
 * que si puede via firestore.get()) — por eso el espejo tiene que existir
 * como datos, actualizado por este trigger cada vez que cambia el usuario en
 * Firestore, en vez de consultarse en el momento.
 */
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onCall, CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

/**
 * El disparador de abajo solo corre hacia adelante, desde que se desplego.
 * Las cuentas que ya existian (todas las demo, y cualquier usuario real de
 * antes de hoy) se quedan sin espejo hasta que alguien vuelva a escribir su
 * documento. Esta funcion es el barrido de una sola vez para ponerlas al
 * dia; se puede volver a correr sin riesgo, no hace nada destructivo.
 */
export const backfillRoleMirrors = onCall({ invoker: 'public' }, async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  const perfilQuienLlama = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (perfilQuienLlama.data()?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Solo un administrador puede correr el barrido');
  }

  const snapshot = await admin.firestore().collection('users').get();
  const updates: Record<string, unknown> = {};
  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    updates[docSnap.id] = { role: data.role ?? null, companyId: data.companyId ?? null };
  });

  await admin.database().ref('users').update(updates);

  return { mirrored: snapshot.size };
});

export const espejarRolARealtimeDB = onDocumentWritten('users/{userId}', async (event) => {
  const userId = event.params.userId;
  const after = event.data?.after;

  if (!after || !after.exists) {
    await admin.database().ref(`users/${userId}`).remove();
    return;
  }

  const data = after.data() ?? {};
  await admin.database().ref(`users/${userId}`).set({
    role: data.role ?? null,
    companyId: data.companyId ?? null,
  });
});
