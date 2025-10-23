import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-financial-report.ts';
import '@/ai/flows/generate-business-plan.ts';
import '@/ai/flows/validate-and-improve-response.ts';