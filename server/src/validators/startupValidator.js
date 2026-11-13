import { z } from 'zod';

export const createStartupSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Startup name is required' })
      .trim()
      .min(2, 'Startup name must be at least 2 characters')
      .max(150, 'Startup name cannot exceed 150 characters'),
    tagline: z.string().trim().max(255).optional().nullable(),
    industry: z
      .string({ required_error: 'Industry is required' })
      .trim()
      .min(2, 'Industry must be selected')
      .max(100),
    stage: z
      .enum(['Idea', 'Validation', 'Prototype/MVP', 'Early Traction', 'Scaling'])
      .optional()
      .default('Idea'),
    target_customer: z
      .string({ required_error: 'Target customer is required' })
      .trim()
      .min(3, 'Target customer description must be at least 3 characters')
      .max(255),
    problem_statement: z
      .string({ required_error: 'Problem statement is required' })
      .trim()
      .min(10, 'Problem statement must be at least 10 characters'),
    solution_statement: z
      .string({ required_error: 'Solution statement is required' })
      .trim()
      .min(10, 'Solution statement must be at least 10 characters'),
    revenue_model: z.string().trim().max(120).optional().default('SaaS Subscription'),
    pitch_summary: z.string().trim().optional().nullable(),
  }),
});

export const updateStartupSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Startup name is required' })
      .trim()
      .min(2, 'Startup name must be at least 2 characters')
      .max(150, 'Startup name cannot exceed 150 characters'),
    tagline: z.string().trim().max(255).optional().nullable(),
    industry: z
      .string({ required_error: 'Industry is required' })
      .trim()
      .min(2, 'Industry must be selected')
      .max(100),
    stage: z
      .enum(['Idea', 'Validation', 'Prototype/MVP', 'Early Traction', 'Scaling'])
      .optional()
      .default('Idea'),
    target_customer: z
      .string({ required_error: 'Target customer is required' })
      .trim()
      .min(3, 'Target customer description must be at least 3 characters')
      .max(255),
    problem_statement: z
      .string({ required_error: 'Problem statement is required' })
      .trim()
      .min(10, 'Problem statement must be at least 10 characters'),
    solution_statement: z
      .string({ required_error: 'Solution statement is required' })
      .trim()
      .min(10, 'Solution statement must be at least 10 characters'),
    revenue_model: z.string().trim().max(120).optional().default('SaaS Subscription'),
    pitch_summary: z.string().trim().optional().nullable(),
  }),
});
