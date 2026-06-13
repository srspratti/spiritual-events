import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:3000'),
  ADMIN_TOKEN: z.string().min(12).default('change-me-in-production'),
  CRON_SECRET: z.string().min(12).default('change-me-cron-secret'),
  EVENTBRITE_TOKEN: z.string().optional().default(''),
  MEETUP_ACCESS_TOKEN: z.string().optional().default(''),
  GOOGLE_MAPS_API_KEY: z.string().optional().default('')
});

export const env = envSchema.parse(process.env);
