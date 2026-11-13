import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    full_name: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please enter a valid email address')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters')
      .max(72, 'Password cannot exceed 72 characters'),
    confirm_password: z
      .string({ required_error: 'Please confirm your password' }),
    terms: z
      .boolean({ required_error: 'You must accept the terms' })
      .refine((val) => val === true, { message: 'You must accept the terms and conditions' }),
  }).refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please enter a valid email address')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required'),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address')
      .toLowerCase(),
    otp: z
      .string({ required_error: 'Verification code is required' })
      .length(6, 'Verification code must be 6 digits')
      .regex(/^\d{6}$/, 'Verification code must contain only digits'),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address')
      .toLowerCase(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .email('Please enter a valid email address')
      .toLowerCase(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      email: z
        .string({ required_error: 'Email address is required' })
        .trim()
        .email('Invalid email address')
        .toLowerCase(),
      otp: z
        .string({ required_error: 'Verification code is required' })
        .length(6, 'Verification code must be 6 digits')
        .regex(/^\d{6}$/, 'Verification code must contain only digits'),
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
