import { z } from 'zod';

// ----------------------------------------------------
// Trip Validators
// ----------------------------------------------------
export const CreateTripSchema = z.object({
  title: z
    .string()
    .min(2, 'Trip title must be at least 2 characters')
    .max(100, 'Trip title cannot exceed 100 characters')
    .trim(),
  destinationId: z
    .string()
    .min(1, 'Destination ID cannot be empty'),
  destinationName: z.string().optional(),
  destinationCategory: z.string().optional(),
  coverImage: z.string().url('Invalid cover image URL').optional(),
  location: z.string().optional(),
  startDate: z
    .string()
    .min(4, 'Please provide a valid start date'),
  endDate: z.string().optional(),
  budget: z.string().optional(),
  currency: z.string().default('JPY'),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

export const UpdateTripSchema = CreateTripSchema.partial().extend({
  status: z.enum(['planning', 'confirmed', 'completed']).optional(),
});

// ----------------------------------------------------
// Activity Validators
// ----------------------------------------------------
export const ChecklistItemInputSchema = z.object({
  id: z.string().default(() => 'chk-' + Date.now() + Math.random().toString(36).substring(2, 6)),
  text: z.string().min(1, 'Checklist item cannot be empty').trim(),
  completed: z.boolean().default(false),
  category: z.string().optional(),
});

export const CreateActivitySchema = z.object({
  title: z
    .string()
    .min(2, 'Activity title must be at least 2 characters')
    .max(120, 'Activity title cannot exceed 120 characters')
    .trim(),
  category: z
    .enum(['Sightseeing', 'Hiking', 'Dining', 'Transport', 'Culture', 'Relaxation', 'Adventure'])
    .default('Sightseeing'),
  date: z
    .string()
    .min(4, 'Please specify an activity date'),
  timeSlot: z
    .string()
    .min(1, 'Please select a time slot'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().max(150, 'Location too long').optional(),
  cost: z.string().max(50, 'Cost format too long').optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  checklist: z.array(ChecklistItemInputSchema).default([]),
  status: z.enum(['planned', 'completed', 'cancelled']).default('planned'),
  destinationId: z.string().optional(),
});

export const UpdateActivitySchema = CreateActivitySchema.partial();

// ----------------------------------------------------
// Review Validators
// ----------------------------------------------------
export const CreateReviewSchema = z.object({
  author: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name cannot exceed 60 characters')
    .trim(),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  content: z
    .string()
    .min(5, 'Review content must be at least 5 characters')
    .max(2000, 'Review content cannot exceed 2000 characters')
    .trim(),
  tags: z.array(z.string()).optional().default([]),
});

// ----------------------------------------------------
// User Profile Validators
// ----------------------------------------------------
export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(80).trim().optional(),
  email: z.string().email('Invalid email address').optional(),
  avatar: z.string().url().optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      currency: z.string().optional(),
      notificationsEnabled: z.boolean().optional(),
      travelStyle: z.enum(['Backpacker', 'Balanced', 'Luxury', 'Nature & Hiking']).optional(),
    })
    .optional(),
});

// Helper for validator formatting
export function formatZodError(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'general';
    fieldErrors[key] = issue.message;
  }
  return {
    message: error.issues[0]?.message || 'Validation failed',
    fieldErrors,
  };
}
