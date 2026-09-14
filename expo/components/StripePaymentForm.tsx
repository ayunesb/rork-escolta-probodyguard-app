/**
 * Respaldo para iOS y Android.
 *
 * El pago con Stripe en nativo necesita @stripe/stripe-react-native, que
 * obliga a una compilacion nativa y a configurar Apple Pay y Google Pay. Queda
 * para cuando se publiquen las apps de tienda; hoy el cobro vive en la web.
 *
 * Acepta las mismas props que la version web a proposito: TypeScript resuelve
 * este archivo al comprobar tipos, asi que si las firmas no coincidieran, el
 * uso correcto en web se reportaria como error.
 */
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

type Props = {
  bookingId: string;
  onExito: (intentoId: string) => void;
  onError?: (mensaje: string) => void;
};

export default function StripePaymentForm(_props: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.texto}>
        El pago con tarjeta esta disponible por ahora en la version web.
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 24, alignItems: 'center' },
  texto: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
});
