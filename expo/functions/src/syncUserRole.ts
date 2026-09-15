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
import * as admin from 'firebase-admin';

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
