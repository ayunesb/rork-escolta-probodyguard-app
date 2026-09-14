/**
 * Cliente de pagos con Stripe.
 *
 * Habla con la funcion serverless de Vercel (api/stripe/payment-intent), que
 * es quien tiene la llave secreta. Aqui solo vive la llave publicable, que
 * esta pensada para ir en el navegador.
 *
 * El importe NO se envia desde aqui: lo recalcula el servidor leyendo la
 * reserva guardada. Si se mandara desde el cliente, cualquiera podria pagar
 * diez pesos por un servicio de novecientos.
 */
import { Platform } from 'react-native';
import { getAuth } from 'firebase/auth';
import { logger } from '@/utils/logger';

const BASE = process.env.EXPO_PUBLIC_PAYMENTS_API_URL ?? '';

export type IntentoDePago = {
  clientSecret: string;
  amount: number;
  currency: string;
};

export const stripeService = {
  /** Verdadero si Stripe esta configurado para usarse. */
  estaConfigurado(): boolean {
    return Boolean(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY && BASE);
  },

  llavePublicable(): string {
    return process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
  },

  /**
   * Pide al servidor que abra un intento de pago para esta reserva.
   * Devuelve el clientSecret que necesita el formulario de Stripe.
   */
  async crearIntento(bookingId: string): Promise<IntentoDePago> {
    if (!BASE) {
      throw new Error('Falta EXPO_PUBLIC_PAYMENTS_API_URL: no se sabe a que servidor pedir el pago');
    }

    const usuario = getAuth().currentUser;
    if (!usuario) throw new Error('Hay que iniciar sesion para pagar');
    const idToken = await usuario.getIdToken();

    logger.log('[Stripe] Pidiendo intento de pago para la reserva', { bookingId });

    const respuesta = await fetch(`${BASE}/api/stripe/payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ bookingId }),
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.json().catch(() => ({}));
      const mensaje = (detalle as any)?.error ?? `HTTP ${respuesta.status}`;
      logger.error('[Stripe] El servidor rechazo el intento de pago', { mensaje });
      throw new Error(mensaje);
    }

    return (await respuesta.json()) as IntentoDePago;
  },

  /**
   * Confirma el pago con el formulario de Stripe. Solo web por ahora.
   *
   * En iOS y Android hace falta @stripe/stripe-react-native, que obliga a una
   * compilacion nativa; queda para cuando se publiquen las apps de tienda.
   */
  soportadoEnEstaPlataforma(): boolean {
    return Platform.OS === 'web';
  },
};

export default stripeService;
