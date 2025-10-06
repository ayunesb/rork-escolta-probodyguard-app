import { Booking } from '../types/booking';

export interface TrackingVisibilityResult {
  shouldShowLiveLocation: boolean;
  reason: 'not_started' | 'awaiting_start_code' | 'within_t10' | 'active' | 'completed';
  minutesUntilVisible?: number;
  estimatedArrival?: Date;
}

export function shouldShowGuardLocation(booking: Booking): TrackingVisibilityResult {
  const now = new Date();
  const startTime = new Date(booking.startTime);
  const minutesUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60);

  if (booking.status === 'completed' || booking.status === 'cancelled') {
    return {
      shouldShowLiveLocation: false,
      reason: 'completed',
    };
  }

  if (booking.status === 'active' && booking.startCodeVerified) {
    return {
      shouldShowLiveLocation: true,
      reason: 'active',
    };
  }

  if (booking.type === 'instant') {
    if ((booking.status === 'assigned' || booking.status === 'en_route') && !booking.startCodeVerified) {
      return {
        shouldShowLiveLocation: false,
        reason: 'awaiting_start_code',
      };
    }
  }

  if (booking.type === 'scheduled' || booking.crossCity) {
    if (minutesUntilStart > 10) {
      return {
        shouldShowLiveLocation: false,
        reason: 'not_started',
        minutesUntilVisible: Math.ceil(minutesUntilStart - 10),
        estimatedArrival: startTime,
      };
    }

    if (minutesUntilStart <= 10 && minutesUntilStart > 0) {
      return {
        shouldShowLiveLocation: true,
        reason: 'within_t10',
        estimatedArrival: startTime,
      };
    }

    if (minutesUntilStart <= 0 && !booking.startCodeVerified) {
      return {
        shouldShowLiveLocation: true,
        reason: 'within_t10',
      };
    }
  }

  return {
    shouldShowLiveLocation: false,
    reason: 'not_started',
  };
}

export function getTrackingMessage(result: TrackingVisibilityResult, language: string = 'en'): string {
  const messages = {
    en: {
      not_started: result.minutesUntilVisible
        ? `Guard location will be visible in ${result.minutesUntilVisible} minutes (T-10 rule)`
        : 'Guard location not yet available',
      awaiting_start_code: 'Waiting for guard to enter start code',
      within_t10: 'Guard is on the way (within 10 minutes)',
      active: 'Service is active - Live tracking',
      completed: 'Service completed',
    },
    es: {
      not_started: result.minutesUntilVisible
        ? `La ubicación del guardia será visible en ${result.minutesUntilVisible} minutos (regla T-10)`
        : 'Ubicación del guardia aún no disponible',
      awaiting_start_code: 'Esperando que el guardia ingrese el código de inicio',
      within_t10: 'El guardia está en camino (dentro de 10 minutos)',
      active: 'Servicio activo - Seguimiento en vivo',
      completed: 'Servicio completado',
    },
    fr: {
      not_started: result.minutesUntilVisible
        ? `L'emplacement du garde sera visible dans ${result.minutesUntilVisible} minutes (règle T-10)`
        : 'Emplacement du garde pas encore disponible',
      awaiting_start_code: 'En attente que le garde entre le code de démarrage',
      within_t10: 'Le garde est en route (dans 10 minutes)',
      active: 'Service actif - Suivi en direct',
      completed: 'Service terminé',
    },
    de: {
      not_started: result.minutesUntilVisible
        ? `Standort des Wachmanns wird in ${result.minutesUntilVisible} Minuten sichtbar (T-10-Regel)`
        : 'Standort des Wachmanns noch nicht verfügbar',
      awaiting_start_code: 'Warten auf Eingabe des Startcodes durch den Wachmann',
      within_t10: 'Wachmann ist unterwegs (innerhalb von 10 Minuten)',
      active: 'Service aktiv - Live-Tracking',
      completed: 'Service abgeschlossen',
    },
  };

  const lang = language as keyof typeof messages;
  return messages[lang]?.[result.reason] || messages.en[result.reason];
}
