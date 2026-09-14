/**
 * Formulario de pago de Stripe para web, con el Payment Element.
 *
 * Usa Stripe.js directamente en lugar de @stripe/react-stripe-js para no
 * meter otra dependencia de React en un proyecto que ya tuvo conflictos de
 * pares con React 19.
 *
 * Los datos de la tarjeta NUNCA pasan por este codigo ni por el servidor:
 * el Payment Element los envia directo a Stripe desde un iframe suyo. Eso es
 * lo que mantiene la app fuera del alcance completo de PCI.
 */
import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { loadStripe } from '@stripe/stripe-js';
import Colors from '@/constants/colors';
import { stripeService } from '@/services/stripeService';
import { logger } from '@/utils/logger';

type Props = {
  bookingId: string;
  onExito: (intentoId: string) => void;
  onError?: (mensaje: string) => void;
};

export default function StripePaymentForm({ bookingId, onExito, onError }: Props) {
  const contenedor = useRef<HTMLDivElement | null>(null);
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [pagando, setPagando] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [importe, setImporte] = useState<number | null>(null);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        if (!stripeService.estaConfigurado()) {
          throw new Error('Los pagos con Stripe no estan configurados todavia');
        }

        const intento = await stripeService.crearIntento(bookingId);
        if (cancelado) return;
        setImporte(intento.amount);

        const stripe = await loadStripe(stripeService.llavePublicable());
        if (cancelado || !stripe) throw new Error('No se pudo cargar Stripe');
        stripeRef.current = stripe;

        const elements = stripe.elements({
          clientSecret: intento.clientSecret,
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: Colors.gold,
              colorBackground: Colors.surface,
              colorText: Colors.textPrimary,
              borderRadius: '12px',
            },
          },
        });
        elementsRef.current = elements;

        const paymentElement = elements.create('payment');
        if (contenedor.current) paymentElement.mount(contenedor.current);
        if (!cancelado) setCargando(false);
      } catch (e: any) {
        if (cancelado) return;
        const mensaje = e?.message ?? 'No se pudo preparar el pago';
        logger.error('[Stripe] Error preparando el formulario', { mensaje });
        setError(mensaje);
        setCargando(false);
        onError?.(mensaje);
      }
    })();

    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const pagar = async () => {
    if (!stripeRef.current || !elementsRef.current) return;
    setPagando(true);
    setError('');

    const { error: fallo, paymentIntent } = await stripeRef.current.confirmPayment({
      elements: elementsRef.current,
      redirect: 'if_required',
    });

    if (fallo) {
      const mensaje = fallo.message ?? 'El pago no se pudo completar';
      logger.error('[Stripe] Pago rechazado', { mensaje });
      setError(mensaje);
      setPagando(false);
      onError?.(mensaje);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      logger.log('[Stripe] Pago aceptado', { id: paymentIntent.id });
      onExito(paymentIntent.id);
      return;
    }

    // Algunos metodos (OXXO, SPEI) quedan pendientes a proposito: el cliente
    // todavia tiene que ir a pagar. No es un error.
    logger.log('[Stripe] Pago pendiente de confirmacion', { estado: paymentIntent?.status });
    setError('El pago quedo pendiente. Te avisaremos cuando se confirme.');
    setPagando(false);
  };

  if (error && cargando === false && !elementsRef.current) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      {cargando && (
        <View style={estilos.centro}>
          <ActivityIndicator color={Colors.gold} />
          <Text style={estilos.tenue}>Preparando el pago seguro…</Text>
        </View>
      )}

      <div ref={contenedor} style={{ minHeight: cargando ? 0 : 220 }} />

      {!!error && !cargando && <Text style={estilos.error}>{error}</Text>}

      {!cargando && (
        <TouchableOpacity
          style={[estilos.boton, pagando && estilos.botonInactivo]}
          onPress={pagar}
          disabled={pagando}
        >
          {pagando ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text style={estilos.botonTexto}>
              Pagar{importe != null ? ` $${importe.toFixed(2)} MXN` : ''}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { width: '100%' },
  centro: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8 },
  tenue: { color: Colors.textSecondary, fontSize: 13 },
  error: { color: Colors.error, fontSize: 14, marginTop: 12, textAlign: 'center' },
  boton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  botonInactivo: { opacity: 0.6 },
  botonTexto: { color: Colors.background, fontSize: 16, fontWeight: '700' as const },
});
