

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface RouteInfo {
  distance: number;
  duration: number;
  polyline: RoutePoint[];
  eta: Date;
  trafficDelay?: number;
}

export interface RouteCalculationOptions {
  origin: RoutePoint;
  destination: RoutePoint;
  mode?: 'driving' | 'walking';
  avoidTolls?: boolean;
  avoidHighways?: boolean;
}

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const AVERAGE_SPEED_KMH = 40;
const TRAFFIC_MULTIPLIER = 1.3;

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateDistance(point1: RoutePoint, point2: RoutePoint): number {
  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(point2.latitude - point1.latitude);
  const dLon = degreesToRadians(point2.longitude - point1.longitude);

  const lat1 = degreesToRadians(point1.latitude);
  const lat2 = degreesToRadians(point2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function calculateBearing(point1: RoutePoint, point2: RoutePoint): number {
  const lat1 = degreesToRadians(point1.latitude);
  const lat2 = degreesToRadians(point2.latitude);
  const dLon = degreesToRadians(point2.longitude - point1.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = Math.atan2(y, x);
  return ((bearing * 180) / Math.PI + 360) % 360;
}

export function estimateETA(distanceKm: number, currentSpeed?: number): Date {
  const speedKmh = currentSpeed && currentSpeed > 5 ? currentSpeed : AVERAGE_SPEED_KMH;
  const durationHours = distanceKm / speedKmh;
  const durationMinutes = durationHours * 60 * TRAFFIC_MULTIPLIER;
  
  return new Date(Date.now() + durationMinutes * 60 * 1000);
}

function decodePolyline(encoded: string): RoutePoint[] {
  const points: RoutePoint[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}

export async function calculateRoute(
  options: RouteCalculationOptions
): Promise<RouteInfo> {
  const { origin, destination, mode = 'driving', avoidTolls = false, avoidHighways = false } = options;

  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured, using fallback calculation');
      return calculateFallbackRoute(origin, destination);
    }

    const params = new URLSearchParams({
      origin: `${origin.latitude},${origin.longitude}`,
      destination: `${destination.latitude},${destination.longitude}`,
      mode,
      key: GOOGLE_MAPS_API_KEY,
      ...(avoidTolls && { avoid: 'tolls' }),
      ...(avoidHighways && { avoid: 'highways' }),
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch route from Google Maps');
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      console.warn('No routes found, using fallback');
      return calculateFallbackRoute(origin, destination);
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    const polyline = decodePolyline(route.overview_polyline.points);
    const distanceKm = leg.distance.value / 1000;
    const durationMinutes = leg.duration.value / 60;
    const trafficDurationMinutes = leg.duration_in_traffic?.value
      ? leg.duration_in_traffic.value / 60
      : durationMinutes;

    const eta = new Date(Date.now() + trafficDurationMinutes * 60 * 1000);
    const trafficDelay = trafficDurationMinutes - durationMinutes;

    return {
      distance: distanceKm,
      duration: trafficDurationMinutes,
      polyline,
      eta,
      trafficDelay: trafficDelay > 0 ? trafficDelay : undefined,
    };
  } catch (error) {
    console.error('Error calculating route:', error);
    return calculateFallbackRoute(origin, destination);
  }
}

function calculateFallbackRoute(origin: RoutePoint, destination: RoutePoint): RouteInfo {
  const distance = calculateDistance(origin, destination);
  const durationMinutes = (distance / AVERAGE_SPEED_KMH) * 60 * TRAFFIC_MULTIPLIER;
  const eta = new Date(Date.now() + durationMinutes * 60 * 1000);

  const polyline: RoutePoint[] = [origin, destination];

  return {
    distance,
    duration: durationMinutes,
    polyline,
    eta,
  };
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function formatDuration(durationMinutes: number): string {
  if (durationMinutes < 60) {
    return `${Math.round(durationMinutes)} min`;
  }
  const hours = Math.floor(durationMinutes / 60);
  const minutes = Math.round(durationMinutes % 60);
  return `${hours}h ${minutes}m`;
}

export function formatETA(eta: Date): string {
  return eta.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function isNearDestination(
  currentLocation: RoutePoint,
  destination: RoutePoint,
  thresholdKm: number = 0.1
): boolean {
  const distance = calculateDistance(currentLocation, destination);
  return distance <= thresholdKm;
}

export function calculateRouteProgress(
  currentLocation: RoutePoint,
  origin: RoutePoint,
  destination: RoutePoint
): number {
  const totalDistance = calculateDistance(origin, destination);
  const remainingDistance = calculateDistance(currentLocation, destination);
  const progress = ((totalDistance - remainingDistance) / totalDistance) * 100;
  return Math.max(0, Math.min(100, progress));
}

export interface RouteDeviation {
  isOffRoute: boolean;
  deviationDistance: number;
  suggestReroute: boolean;
}

export function checkRouteDeviation(
  currentLocation: RoutePoint,
  polyline: RoutePoint[],
  thresholdKm: number = 0.5
): RouteDeviation {
  if (polyline.length < 2) {
    return {
      isOffRoute: false,
      deviationDistance: 0,
      suggestReroute: false,
    };
  }

  let minDistance = Infinity;

  for (let i = 0; i < polyline.length - 1; i++) {
    const segmentStart = polyline[i];
    const segmentEnd = polyline[i + 1];
    
    const distance = pointToSegmentDistance(currentLocation, segmentStart, segmentEnd);
    minDistance = Math.min(minDistance, distance);
  }

  const isOffRoute = minDistance > thresholdKm;
  const suggestReroute = minDistance > thresholdKm * 2;

  return {
    isOffRoute,
    deviationDistance: minDistance,
    suggestReroute,
  };
}

function pointToSegmentDistance(
  point: RoutePoint,
  segmentStart: RoutePoint,
  segmentEnd: RoutePoint
): number {
  const segmentLength = calculateDistance(segmentStart, segmentEnd);

  if (segmentLength === 0) return calculateDistance(point, segmentStart);

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.latitude - segmentStart.latitude) * (segmentEnd.latitude - segmentStart.latitude) +
        (point.longitude - segmentStart.longitude) * (segmentEnd.longitude - segmentStart.longitude)) /
        (segmentLength * segmentLength)
    )
  );

  const projection = {
    latitude: segmentStart.latitude + t * (segmentEnd.latitude - segmentStart.latitude),
    longitude: segmentStart.longitude + t * (segmentEnd.longitude - segmentStart.longitude),
  };

  return calculateDistance(point, projection);
}

export async function getAlternativeRoutes(
  options: RouteCalculationOptions
): Promise<RouteInfo[]> {
  const { origin, destination } = options;

  try {
    const [mainRoute, tollFreeRoute, highwayFreeRoute] = await Promise.all([
      calculateRoute(options),
      calculateRoute({ ...options, avoidTolls: true }),
      calculateRoute({ ...options, avoidHighways: true }),
    ]);

    const routes = [mainRoute];
    
    if (tollFreeRoute.distance !== mainRoute.distance) {
      routes.push(tollFreeRoute);
    }
    
    if (highwayFreeRoute.distance !== mainRoute.distance && 
        highwayFreeRoute.distance !== tollFreeRoute.distance) {
      routes.push(highwayFreeRoute);
    }

    return routes.sort((a, b) => a.duration - b.duration);
  } catch (error) {
    console.error('Error getting alternative routes:', error);
    return [calculateFallbackRoute(origin, destination)];
  }
}
