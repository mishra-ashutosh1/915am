import { z } from 'zod';
import { HOLDING_TYPES } from '../types';

export const holdingSchema = z.object({
  id: z.string().optional(),
  name: z.string().max(100, 'Name too long').default(''),
  value: z.coerce.number().min(0, 'Value must be positive').default(0),
  add: z.coerce.number().min(0, 'Addition must be positive').default(0),
  target: z.coerce.number().min(0, 'Target must be positive').max(100, 'Target cannot exceed 100%').default(0),
  type: z.enum(HOLDING_TYPES as [string, ...string[]]).default('Stock'),
  nowPct: z.number().optional(),
  afterPct: z.number().optional(),
  need: z.string().optional(),
  needClass: z.enum(['warn', 'bad', 'ok', 'mute']).optional(),
  overLimit: z.boolean().optional(),
  color: z.string().optional(),
});

export const portfolioSchema = z.object({
  holdings: z.array(holdingSchema),
  freshMoney: z.coerce.number().min(0, 'Fresh money must be positive').default(0),
  singleStockCap: z.coerce.number().min(0, 'Cap must be positive').max(100, 'Cap cannot exceed 100%').default(10),
});

export type HoldingFormData = z.infer<typeof holdingSchema>;
export type PortfolioFormData = z.infer<typeof portfolioSchema>;
