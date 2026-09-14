/**
 * Crea el PaymentIntent de Stripe. Funcion serverless de Vercel.
 *
 * Vive aqui y no en Cloud Functions a proposito: el plan gratuito de Vercel
 * cubre este endpoint, asi que se puede cobrar sin subir Firebase a Blaze.
 *
 * La llave secreta de Stripe vive SOLO en las variables de entorno de Vercel.
 * Nunca puede ir en el bundle del navegador: cualquiera la leeria del codigo
 * publicado, igual que pasaba con las contrasenas demo.
 *
 * Variables que hay que configurar en Vercel:
 *   STRIPE_SECRET_KEY            sk_test_... o sk_live_...
 *   EXPO_PUBLIC_FIREBASE_PROJECT_ID
 *   EXPO_PUBLIC_FIREBASE_API_KEY
 */
import Stripe from 'stripe';

const ORIGENES_PERMITIDOS = [
  'https://escolta-pro-fe90e.web.app',
  'https://escolta-pro-fe90e.firebaseapp.com',
  'http://localhost:8081',
];

/** Comprueba que el token de Firebase sea valido y devuelve el uid. */
async function uidDesdeToken(idToken: string): Promise<string | null> {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey || !idToken) return null;
  const r = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!r.ok) return null;
  const datos = (await r.json()) as { users?: Array<{ localId: string }> };
  return datos.users?.[0]?.localId ?? null;
}

/**
 * Lee la reserva de Realtime Database CON EL TOKEN DEL PROPIO USUARIO, para
 * que las reglas sigan aplicando. No hace falta ninguna cuenta de servicio.
 */
async function leerReserva(bookingId: string, idToken: string) {
  const proyecto = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const url = `https://${proyecto}-default-rtdb.firebaseio.com/bookings/${encodeURIComponent(bookingId)}.json?auth=${encodeURIComponent(idToken)}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  return (await r.json()) as Record<string, any> | null;
}

export default async function handler(req: any, res: any) {
  const origen = req.headers.origin;
  if (origen && ORIGENES_PERMITIDOS.includes(origen)) {
    res.setHeader('Access-Control-Allow-Origin', origen);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo no permitido' });

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[Stripe] Falta STRIPE_SECRET_KEY en el entorno');
    return res.status(503).json({ error: 'Pagos no configurados' });
  }

  try {
    const idToken = String(req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
    const uid = await uidDesdeToken(idToken);
    if (!uid) return res.status(401).json({ error: 'Sesion no valida' });

    const bookingId = String(req.body?.bookingId ?? '');
    if (!bookingId) return res.status(400).json({ error: 'Falta bookingId' });

    // El importe NO se toma del cliente. Se recalcula desde la reserva
    // guardada en el servidor: si viniera del navegador, cualquiera podria
    // pagar diez pesos por un servicio de novecientos.
    const reserva = await leerReserva(bookingId, idToken);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });
    if (reserva.clientId !== uid) return res.status(403).json({ error: 'Esa reserva no es tuya' });

    const servicio = Number(reserva.guardPayout ?? 0) + Number(reserva.platformCut ?? 0);
    const cargo = Number(reserva.processingFee ?? 0);
    const totalMXN = servicio + cargo;
    if (!Number.isFinite(totalMXN) || totalMXN <= 0) {
      return res.status(422).json({ error: 'La reserva no tiene un importe valido' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const intento = await stripe.paymentIntents.create(
      {
        amount: Math.round(totalMXN * 100), // Stripe trabaja en centavos
        currency: 'mxn',
        automatic_payment_methods: { enabled: true },
        metadata: { bookingId, clientId: uid, guardId: String(reserva.guardId ?? '') },
        description: `Escolta Pro - reserva ${bookingId}`,
      },
      // Evita cobrar dos veces si el usuario da doble clic o se reintenta.
      { idempotencyKey: `booking_${bookingId}` }
    );

    console.log('[Stripe] PaymentIntent creado para la reserva', bookingId);
    return res.status(200).json({
      clientSecret: intento.client_secret,
      amount: totalMXN,
      currency: 'MXN',
    });
  } catch (error: any) {
    console.error('[Stripe] Error creando el PaymentIntent:', error?.message);
    return res.status(500).json({ error: 'No se pudo iniciar el pago' });
  }
}
