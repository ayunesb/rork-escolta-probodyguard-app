import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password is too long');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters');

export const addressSchema = z
  .string()
  .min(5, 'Address is too short')
  .max(200, 'Address is too long');

export const coordinateSchema = z
  .number()
  .min(-180, 'Invalid coordinate')
  .max(180, 'Invalid coordinate');

export const dateSchema = z.string().refine(
  (date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  },
  { message: 'Invalid date format' }
);

export const futureDateSchema = dateSchema.refine(
  (date) => {
    const parsed = new Date(date);
    return parsed > new Date();
  },
  { message: 'Date must be in the future' }
);

export const urlSchema = z.string().url('Invalid URL');

export const positiveNumberSchema = z
  .number()
  .positive('Must be a positive number');

export const integerSchema = z.number().int('Must be an integer');

export const ratingSchema = z
  .number()
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must be at most 5');

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

export const validateBookingData = z.object({
  vehicleType: z.enum(['standard', 'armored']),
  protectionType: z.enum(['armed', 'unarmed']),
  dressCode: z.enum(['suit', 'business_casual', 'tactical', 'casual']),
  numberOfProtectees: positiveNumberSchema.int(),
  numberOfProtectors: positiveNumberSchema.int(),
  scheduledDate: futureDateSchema,
  scheduledTime: z.string(),
  duration: positiveNumberSchema,
  pickupAddress: addressSchema,
  pickupLatitude: coordinateSchema,
  pickupLongitude: coordinateSchema,
  pickupCity: z.string().min(1),
  destinationAddress: addressSchema.optional(),
  destinationLatitude: coordinateSchema.optional(),
  destinationLongitude: coordinateSchema.optional(),
});

export const validateUserData = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  role: z.enum(['client', 'guard', 'company', 'admin']),
});

export const validatePaymentData = z.object({
  bookingId: z.string().min(1),
  amount: positiveNumberSchema,
});

export const validateMessageData = z.object({
  bookingId: z.string().min(1),
  senderId: z.string().min(1),
  senderRole: z.enum(['client', 'guard', 'company', 'admin']),
  text: z.string().min(1).max(1000),
  originalLanguage: z.enum(['en', 'es', 'fr', 'de']),
});
