import { z } from 'zod'

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Security ID is required')
    .max(128, 'Security ID is too long')
    .trim(),
  password: z
    .string()
    .min(1, 'Access Code is required')
    .max(256, 'Access Code is too long'),
})

export const bookingSchema = z.object({
  client_id: z.string().uuid('Invalid client selection'),
  car_id: z.string().uuid('Invalid vehicle selection'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  total_price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(99999999, 'Price exceeds maximum'),
  status: z.enum(['pending', 'confirmed', 'picked_up', 'completed', 'cancelled']),
  payment_status: z.enum(['unpaid', 'paid', 'refunded', 'failed']),
  pickup_location: z.string().max(500, 'Pickup location too long').optional().default(''),
  dropoff_location: z.string().max(500, 'Dropoff location too long').optional().default(''),
  trip_type: z.enum(['round_trip', 'one_way']),
})

export const userDeleteSchema = z.object({
  user_id_param: z.string().uuid('Invalid user ID'),
})

export const kycUpdateSchema = z.object({
  document_status: z.enum(['verified', 'rejected', 'pending', 'submitted']),
  rejection_reason: z.string().max(2000).nullable().optional(),
})

export const searchQuerySchema = z
  .string()
  .max(200, 'Search query too long')
  .optional()
  .default('')

export const partnerSearchSchema = z
  .string()
  .max(200)
  .optional()
  .default('')

export type LoginInput = z.infer<typeof loginSchema>
export type BookingInput = z.infer<typeof bookingSchema>
