import AsyncStorage from '@react-native-async-storage/async-storage';

const AVAILABILITY_KEY = '@escolta_availability';

export interface TimeSlot {
  start: string;
  end: string;
}

export interface DayAvailability {
  date: string;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  bookedSlots: TimeSlot[];
}

export interface GuardAvailability {
  guardId: string;
  schedule: DayAvailability[];
  recurringSchedule?: {
    monday?: TimeSlot[];
    tuesday?: TimeSlot[];
    wednesday?: TimeSlot[];
    thursday?: TimeSlot[];
    friday?: TimeSlot[];
    saturday?: TimeSlot[];
    sunday?: TimeSlot[];
  };
}

function isTimeSlotAvailable(
  slot: TimeSlot,
  bookedSlots: TimeSlot[]
): boolean {
  const slotStart = new Date(`2000-01-01T${slot.start}`).getTime();
  const slotEnd = new Date(`2000-01-01T${slot.end}`).getTime();

  for (const booked of bookedSlots) {
    const bookedStart = new Date(`2000-01-01T${booked.start}`).getTime();
    const bookedEnd = new Date(`2000-01-01T${booked.end}`).getTime();

    if (
      (slotStart >= bookedStart && slotStart < bookedEnd) ||
      (slotEnd > bookedStart && slotEnd <= bookedEnd) ||
      (slotStart <= bookedStart && slotEnd >= bookedEnd)
    ) {
      return false;
    }
  }

  return true;
}

export const availabilityService = {
  async getGuardAvailability(guardId: string): Promise<GuardAvailability | null> {
    try {
      const stored = await AsyncStorage.getItem(`${AVAILABILITY_KEY}_${guardId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('[Availability] Error loading availability:', error);
      return null;
    }
  },

  async setGuardAvailability(availability: GuardAvailability): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${AVAILABILITY_KEY}_${availability.guardId}`,
        JSON.stringify(availability)
      );
      console.log('[Availability] Saved availability for guard:', availability.guardId);
    } catch (error) {
      console.error('[Availability] Error saving availability:', error);
      throw error;
    }
  },

  async getAvailableSlots(
    guardId: string,
    date: string
  ): Promise<TimeSlot[]> {
    try {
      const availability = await this.getGuardAvailability(guardId);
      if (!availability) return [];

      const daySchedule = availability.schedule.find(d => d.date === date);
      if (!daySchedule || !daySchedule.isAvailable) return [];

      return daySchedule.timeSlots.filter(slot =>
        isTimeSlotAvailable(slot, daySchedule.bookedSlots)
      );
    } catch (error) {
      console.error('[Availability] Error getting available slots:', error);
      return [];
    }
  },

  async bookTimeSlot(
    guardId: string,
    date: string,
    slot: TimeSlot
  ): Promise<boolean> {
    try {
      const availability = await this.getGuardAvailability(guardId);
      if (!availability) return false;

      const dayIndex = availability.schedule.findIndex(d => d.date === date);
      if (dayIndex === -1) return false;

      const day = availability.schedule[dayIndex];
      if (!isTimeSlotAvailable(slot, day.bookedSlots)) {
        console.log('[Availability] Time slot not available');
        return false;
      }

      day.bookedSlots.push(slot);
      await this.setGuardAvailability(availability);
      
      console.log('[Availability] Booked time slot:', date, slot);
      return true;
    } catch (error) {
      console.error('[Availability] Error booking time slot:', error);
      return false;
    }
  },

  async cancelTimeSlot(
    guardId: string,
    date: string,
    slot: TimeSlot
  ): Promise<boolean> {
    try {
      const availability = await this.getGuardAvailability(guardId);
      if (!availability) return false;

      const dayIndex = availability.schedule.findIndex(d => d.date === date);
      if (dayIndex === -1) return false;

      const day = availability.schedule[dayIndex];
      day.bookedSlots = day.bookedSlots.filter(
        s => s.start !== slot.start || s.end !== slot.end
      );

      await this.setGuardAvailability(availability);
      
      console.log('[Availability] Cancelled time slot:', date, slot);
      return true;
    } catch (error) {
      console.error('[Availability] Error cancelling time slot:', error);
      return false;
    }
  },

  generateDefaultSchedule(guardId: string, daysAhead: number = 30): GuardAvailability {
    const schedule: DayAvailability[] = [];
    const today = new Date();

    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      schedule.push({
        date: dateStr,
        isAvailable: true,
        timeSlots: [
          { start: '08:00', end: '12:00' },
          { start: '12:00', end: '16:00' },
          { start: '16:00', end: '20:00' },
          { start: '20:00', end: '00:00' },
        ],
        bookedSlots: [],
      });
    }

    return {
      guardId,
      schedule,
      recurringSchedule: {
        monday: [
          { start: '08:00', end: '12:00' },
          { start: '12:00', end: '16:00' },
          { start: '16:00', end: '20:00' },
        ],
        tuesday: [
          { start: '08:00', end: '12:00' },
          { start: '12:00', end: '16:00' },
          { start: '16:00', end: '20:00' },
        ],
        wednesday: [
          { start: '08:00', end: '12:00' },
          { start: '12:00', end: '16:00' },
          { start: '16:00', end: '20:00' },
        ],
        thursday: [
          { start: '08:00', end: '12:00' },
          { start: '12:00', end: '16:00' },
          { start: '16:00', end: '20:00' },
        ],
        friday: [
          { start: '08:00', end: '12:00' },
          { start: '12:00', end: '16:00' },
          { start: '16:00', end: '20:00' },
        ],
        saturday: [
          { start: '10:00', end: '14:00' },
          { start: '14:00', end: '18:00' },
        ],
        sunday: [
          { start: '10:00', end: '14:00' },
          { start: '14:00', end: '18:00' },
        ],
      },
    };
  },

  isGuardAvailableForBooking(
    availability: GuardAvailability,
    date: string,
    startTime: string,
    duration: number
  ): boolean {
    const daySchedule = availability.schedule.find(d => d.date === date);
    if (!daySchedule || !daySchedule.isAvailable) return false;

    const startDate = new Date(`2000-01-01T${startTime}`);
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
    const endTime = endDate.toTimeString().slice(0, 5);

    const requestedSlot: TimeSlot = {
      start: startTime,
      end: endTime,
    };

    return isTimeSlotAvailable(requestedSlot, daySchedule.bookedSlots);
  },
};
