/**
 * Mapa real para web, con Leaflet y teselas de OpenStreetMap.
 *
 * Antes este archivo era un cartel que decia "Map view not available on web".
 * En iOS y Android el mapa siempre funciono (MapView.native.tsx usa
 * react-native-maps); el unico sin mapa era el navegador, que es justo donde
 * esta publicada la app.
 *
 * Leaflet va empaquetado como dependencia, no traido de un CDN, para no tener
 * que abrirle un hueco a la Content-Security-Policy de la app ni depender de
 * un tercero en tiempo de ejecucion. Las teselas de OpenStreetMap son
 * gratuitas y no piden llave.
 *
 * Expone la misma forma que react-native-maps en lo que esta app usa:
 * initialRegion, onPress con e.nativeEvent.coordinate, y Marker/Polyline como
 * componentes vacios para que el codigo compartido no cambie.
 */
import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import 'leaflet/dist/leaflet.css';

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
};

type Props = {
  initialRegion?: Region;
  region?: Region;
  onPress?: (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => void;
  style?: any;
  children?: any;
  [key: string]: any;
};

// Convierte el "delta" de react-native-maps al nivel de zoom de Leaflet.
function zoomDesdeDelta(delta?: number): number {
  if (!delta || delta <= 0) return 15;
  return Math.max(3, Math.min(18, Math.round(Math.log2(360 / delta))));
}

const MapView = ({ initialRegion, region, onPress, style, children }: Props) => {
  const contenedor = useRef<HTMLDivElement | null>(null);
  const mapa = useRef<any>(null);
  const marcador = useRef<any>(null);

  const centro = region ?? initialRegion ?? { latitude: 20.6296, longitude: -87.0739 };

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelado || !contenedor.current || mapa.current) return;

      mapa.current = L.map(contenedor.current, {
        center: [centro.latitude, centro.longitude],
        zoom: zoomDesdeDelta(centro.latitudeDelta),
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(mapa.current);

      // Circulo en vez de icono con imagen: el icono por defecto de Leaflet
      // apunta a archivos PNG que los empaquetadores rompen.
      marcador.current = L.circleMarker([centro.latitude, centro.longitude], {
        radius: 9,
        color: Colors.gold,
        fillColor: Colors.gold,
        fillOpacity: 0.9,
        weight: 3,
      }).addTo(mapa.current);

      mapa.current.on('click', (evento: any) => {
        const { lat, lng } = evento.latlng;
        marcador.current?.setLatLng([lat, lng]);
        onPress?.({ nativeEvent: { coordinate: { latitude: lat, longitude: lng } } });
      });

      // El contenedor suele montarse con alto 0; sin esto el mapa sale gris.
      setTimeout(() => mapa.current?.invalidateSize(), 0);
    })();

    return () => {
      cancelado = true;
      mapa.current?.remove();
      mapa.current = null;
      marcador.current = null;
    };
    // Solo al montar: el centro posterior se sigue en el efecto de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si el centro cambia desde fuera (por ejemplo al obtener la ubicacion real),
  // se mueve el mapa y el marcador.
  useEffect(() => {
    if (!mapa.current || !marcador.current) return;
    mapa.current.setView([centro.latitude, centro.longitude], mapa.current.getZoom());
    marcador.current.setLatLng([centro.latitude, centro.longitude]);
  }, [centro.latitude, centro.longitude]);

  return (
    <View style={[styles.contenedor, style]}>
      <div ref={contenedor} style={{ width: '100%', height: '100%' }} />
      {children}
    </View>
  );
};

export const Marker = (_props: any) => null;
export const Polyline = (_props: any) => null;
export const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: Colors.surfaceLight,
    overflow: 'hidden',
  },
});

export default MapView;
