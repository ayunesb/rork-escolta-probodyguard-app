/**
 * Avisos en tiempo real cuando cambia el estado de una reserva.
 *
 * Antes de este archivo el circuito estaba a medias: la app pedia permiso,
 * obtenia el token de Expo y lo guardaba en `deviceTokens`, y los ayudantes
 * `notifyBookingAccepted`, `notifyGuardEnRoute` y demas escribian un documento
 * en `notifications` con status 'pending'. Nadie leia esa cola. Los avisos se
 * encolaban y no salia ninguno.
 *
 * Aqui viven las dos piezas que faltaban:
 *
 *  1. `avisarCambioDeReserva` — disparador de Firestore sobre bookings. Es la
 *     fuente de verdad: no depende de que la app de nadie este abierta.
 *  2. `enviarAvisoEncolado` — vacia la cola `notifications` que la app ya
 *     escribia, para que los ayudantes existentes empiecen a funcionar.
 *
 * Se envia por Expo Push, que es la capa que la app ya usa
 * (`getExpoPushTokenAsync`) y que por dentro habla con APNs en iOS y con FCM
 * en Android. Enviar FCM crudo obligaria a cambiar el registro del token en el
 * cliente sin ganar nada.
 *
 * REQUISITO DE PLAN: Cloud Functions v2 y las llamadas salientes a exp.host
 * necesitan el plan Blaze. En Spark estas funciones no se despliegan y, aunque
 * se desplegaran, no podrian salir a internet.
 */
import { onDocumentUpdated, onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface Aviso {
  titulo: string;
  cuerpo: string;
}

/** Que se le dice a cada parte cuando la reserva entra a cada estado. */
const MENSAJES: Record<string, { cliente?: Aviso; escolta?: Aviso }> = {
  confirmed: {
    cliente: { titulo: 'Reserva confirmada', cuerpo: 'Tu servicio de proteccion quedo confirmado.' },
    escolta: { titulo: 'Servicio confirmado', cuerpo: 'Se confirmo un servicio asignado a ti.' },
  },
  accepted: {
    cliente: { titulo: 'Escolta asignado', cuerpo: 'Un escolta acepto tu solicitud.' },
    escolta: { titulo: 'Servicio aceptado', cuerpo: 'Aceptaste el servicio. Revisa los detalles.' },
  },
  rejected: {
    cliente: { titulo: 'Solicitud rechazada', cuerpo: 'El escolta no pudo tomar el servicio. Te buscamos otro.' },
  },
  en_route: {
    cliente: { titulo: 'Tu escolta va en camino', cuerpo: 'Puedes seguir su ubicacion en la app.' },
  },
  active: {
    cliente: { titulo: 'Servicio iniciado', cuerpo: 'Tu servicio de proteccion comenzo.' },
    escolta: { titulo: 'Servicio iniciado', cuerpo: 'Registraste el inicio del servicio.' },
  },
  completed: {
    cliente: { titulo: 'Servicio terminado', cuerpo: 'Tu servicio termino. Puedes calificar a tu escolta.' },
    escolta: { titulo: 'Servicio terminado', cuerpo: 'El servicio quedo cerrado. Tu pago entra al proceso de liquidacion.' },
  },
  cancelled: {
    cliente: { titulo: 'Reserva cancelada', cuerpo: 'Tu reserva fue cancelada.' },
    escolta: { titulo: 'Servicio cancelado', cuerpo: 'Se cancelo un servicio que tenias asignado.' },
  },
};

/** Todos los tokens de Expo registrados por un usuario (puede tener varios aparatos). */
async function tokensDe(userId: string): Promise<string[]> {
  if (!userId) return [];
  const snap = await admin.firestore()
    .collection('deviceTokens')
    .where('userId', '==', userId)
    .get();

  const tokens = snap.docs
    .map((d) => d.data().token as string | undefined)
    .filter((t): t is string => typeof t === 'string' && t.startsWith('ExponentPushToken'));

  return Array.from(new Set(tokens));
}

/**
 * Entrega a Expo. Devuelve los tokens que Expo reporta como muertos para que
 * el llamador los limpie: un aparato desinstalado deja un token que falla para
 * siempre y ensucia todos los envios posteriores.
 */
async function enviarAExpo(
  tokens: string[],
  aviso: Aviso,
  datos: Record<string, unknown>
): Promise<{ enviados: number; tokensMuertos: string[] }> {
  if (tokens.length === 0) return { enviados: 0, tokensMuertos: [] };

  const mensajes = tokens.map((to) => ({
    to,
    title: aviso.titulo,
    body: aviso.cuerpo,
    data: datos,
    sound: 'default',
    priority: 'high',
    channelId: 'default',
  }));

  const respuesta = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(mensajes),
  });

  if (!respuesta.ok) {
    console.error('[Avisos] Expo respondio HTTP', respuesta.status);
    return { enviados: 0, tokensMuertos: [] };
  }

  const cuerpo = (await respuesta.json()) as { data?: Array<{ status: string; details?: { error?: string } }> };
  const resultados = cuerpo.data ?? [];
  const tokensMuertos: string[] = [];
  let enviados = 0;

  resultados.forEach((r, i) => {
    if (r.status === 'ok') { enviados++; return; }
    if (r.details?.error === 'DeviceNotRegistered') tokensMuertos.push(tokens[i]);
    console.warn('[Avisos] Expo rechazo un envio:', r.details?.error ?? r.status);
  });

  return { enviados, tokensMuertos };
}

/** Borra los tokens que Expo declaro muertos. */
async function limpiarTokens(tokensMuertos: string[]): Promise<void> {
  if (tokensMuertos.length === 0) return;
  const db = admin.firestore();
  for (const token of tokensMuertos) {
    const snap = await db.collection('deviceTokens').where('token', '==', token).get();
    await Promise.all(snap.docs.map((d) => d.ref.delete()));
  }
  console.log('[Avisos] Tokens muertos eliminados:', tokensMuertos.length);
}

/**
 * Deja constancia en `notifications` para la campana dentro de la app.
 * Se escribe con status 'sent' a proposito: si quedara 'pending', el segundo
 * disparador de este archivo lo tomaria como pendiente y lo mandaria otra vez.
 */
async function registrarEnApp(userId: string, aviso: Aviso, datos: Record<string, unknown>): Promise<void> {
  await admin.firestore().collection('notifications').add({
    userId,
    title: aviso.titulo,
    body: aviso.cuerpo,
    data: datos,
    status: 'sent',
    read: false,
    createdAt: new Date().toISOString(),
  });
}

async function notificarA(userId: string, aviso: Aviso, datos: Record<string, unknown>): Promise<void> {
  if (!userId) return;
  const tokens = await tokensDe(userId);
  const { enviados, tokensMuertos } = await enviarAExpo(tokens, aviso, datos);
  await limpiarTokens(tokensMuertos);
  await registrarEnApp(userId, aviso, datos);
  console.log(`[Avisos] ${userId}: ${enviados} de ${tokens.length} aparatos`);
}

/**
 * 1) El estado de una reserva cambio. Avisa a quien corresponda.
 *
 * Corre en el servidor con Admin SDK, asi que no lo detienen las reglas de
 * Firestore ni depende de que la app del emisor este abierta. Ese era el
 * defecto de fondo del envio anterior, que vivia en el telefono.
 */
export const avisarCambioDeReserva = onDocumentUpdated('bookings/{bookingId}', async (event) => {
  const antes = event.data?.before.data();
  const despues = event.data?.after.data();
  if (!antes || !despues) return;

  const estadoAnterior = antes.status as string | undefined;
  const estadoNuevo = despues.status as string | undefined;
  if (!estadoNuevo || estadoAnterior === estadoNuevo) return;

  const plantilla = MENSAJES[estadoNuevo];
  if (!plantilla) {
    console.log('[Avisos] Estado sin mensaje definido:', estadoNuevo);
    return;
  }

  const datos = {
    tipo: 'booking_status',
    bookingId: event.params.bookingId,
    estado: estadoNuevo,
    estadoAnterior: estadoAnterior ?? null,
  };

  console.log(`[Avisos] Reserva ${event.params.bookingId}: ${estadoAnterior} -> ${estadoNuevo}`);

  const pendientes: Promise<void>[] = [];
  if (plantilla.cliente && despues.clientId) pendientes.push(notificarA(despues.clientId, plantilla.cliente, datos));
  if (plantilla.escolta && despues.guardId) pendientes.push(notificarA(despues.guardId, plantilla.escolta, datos));

  // allSettled: que un aparato falle no debe impedir el aviso a la otra parte.
  const r = await Promise.allSettled(pendientes);
  r.filter((x) => x.status === 'rejected').forEach((x) => console.error('[Avisos] Fallo un envio:', (x as PromiseRejectedResult).reason));
});

/**
 * 2) Vacia la cola que la app ya escribia.
 *
 * `pushNotificationService` tiene once ayudantes (notifyNewMessage,
 * notifyPaymentSuccess, notifyEmergency...) que escriben en `notifications`
 * con status 'pending'. Nunca hubo quien los enviara. Con esto empiezan a
 * funcionar sin tocar el codigo del cliente.
 */
export const enviarAvisoEncolado = onDocumentCreated('notifications/{notificationId}', async (event) => {
  const doc = event.data;
  const datos = doc?.data();
  if (!datos || datos.status !== 'pending') return;

  const userId = datos.userId as string | undefined;
  if (!userId) {
    await doc!.ref.update({ status: 'failed', error: 'sin userId' });
    return;
  }

  const aviso: Aviso = { titulo: datos.title ?? 'Escolta Pro', cuerpo: datos.body ?? '' };

  try {
    const tokens = await tokensDe(userId);
    const { enviados, tokensMuertos } = await enviarAExpo(tokens, aviso, (datos.data ?? {}) as Record<string, unknown>);
    await limpiarTokens(tokensMuertos);
    await doc!.ref.update({
      status: enviados > 0 ? 'sent' : 'no_devices',
      sentAt: new Date().toISOString(),
      deliveredTo: enviados,
    });
  } catch (error: any) {
    console.error('[Avisos] Error vaciando la cola:', error);
    await doc!.ref.update({ status: 'failed', error: String(error?.message ?? error) });
  }
});

/**
 * 3) Alerta de panico: avisa a todos los administradores.
 *
 * `emergencyService` hacia esto desde el telefono, listando los usuarios con
 * rol admin. Esa lista ahora esta cerrada, y con razon: nadie deberia poder
 * descargar el padron. Pero ademas era el peor lugar posible para ponerlo,
 * porque una alerta de panico no puede depender de que la app de quien la
 * dispara siga viva. Aqui corre en el servidor.
 */
export const avisarEmergencia = onDocumentCreated('emergencyAlerts/{alertId}', async (event) => {
  const alerta = event.data?.data();
  if (!alerta) return;

  const admins = await admin.firestore().collection('users').where('role', '==', 'admin').get();
  if (admins.empty) {
    console.error('[Avisos] ALERTA DE EMERGENCIA SIN DESTINATARIO: no hay ningun administrador');
    return;
  }

  const aviso: Aviso = {
    titulo: 'ALERTA DE EMERGENCIA',
    cuerpo: `Se activo una alerta${alerta.type ? ` de tipo ${alerta.type}` : ''}${alerta.location?.address ? ` en ${alerta.location.address}` : ''}.`,
  };
  const datos = {
    tipo: 'emergency',
    alertId: event.params.alertId,
    bookingId: alerta.bookingId ?? null,
    userId: alerta.userId ?? null,
  };

  console.log(`[Avisos] Emergencia ${event.params.alertId}: avisando a ${admins.size} administradores`);
  const r = await Promise.allSettled(admins.docs.map((d) => notificarA(d.id, aviso, datos)));
  r.filter((x) => x.status === 'rejected').forEach((x) => console.error('[Avisos] Fallo avisar a un admin:', (x as PromiseRejectedResult).reason));
});
