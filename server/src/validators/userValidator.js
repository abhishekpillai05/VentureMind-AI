import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    full_name: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    headline: z.string().trim().max(150, 'Headline cannot exceed 150 characters').nullable().optional(),
    bio: z.string().trim().max(1000, 'Bio cannot exceed 1000 characters').nullable().optional(),
    phone: z.string().trim().max(50, 'Phone cannot exceed 50 characters').nullable().optional(),
    location: z.string().trim().max(120, 'Location cannot exceed 120 characters').nullable().optional(),
    avatar_url: z.string().nullable().optional(),
  }),
});

export const updatePreferencesSchema = z.object({
  body: z.object({
    email_notifications: z.boolean().optional(),
    analysis_completed: z.boolean().optional(),
    investor_activity: z.boolean().optional(),
    pitch_evaluated: z.boolean().optional(),
    monthly_summary: z.boolean().optional(),
    currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
    currency_symbol: z.string().max(5).optional(),
    number_format: z.enum(['indian', 'international']).optional(),
    date_format: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).optional(),
    theme: z.enum(['dark', 'system', 'light']).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      current_password: z.string({ required_error: 'Current password is required' }).min(1),
      new_password: z
        .string({ required_error: 'New password is required' })
        .min(8, 'New password must be at least 8 characters')
        .max(72, 'Password cannot exceed 72 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Must contain at least one number'),
      confirm_password: z.string({ required_error: 'Please confirm your new password' }),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: 'New password and confirmation do not match',
      path: ['confirm_password'],
    }),
});

export const deleteAccountSchema = z.object({
  body: z.object({
    password: z.string({ required_error: 'Current password is required to delete account' }).min(1),
    confirmation_text: z
      .string({ required_error: 'Please type DELETE to confirm' })
      .refine((val) => val === 'DELETE', { message: 'Confirmation text must be exact: DELETE' }),
  }),
});
