'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a draft business plan based on a user-provided prompt.
 *
 * The flow takes a prompt as input and returns a generated business plan.
 * - generateBusinessPlan - The function to call to generate a business plan.
 * - GenerateBusinessPlanInput - The input type for the generateBusinessPlan function.
 * - GenerateBusinessPlanOutput - The output type for the generateBusinessPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBusinessPlanInputSchema = z.object({
  prompt: z.string().describe('A prompt describing the business venture.'),
});

export type GenerateBusinessPlanInput = z.infer<typeof GenerateBusinessPlanInputSchema>;

const GenerateBusinessPlanOutputSchema = z.object({
  businessPlan: z.string().describe('The generated business plan.'),
});

export type GenerateBusinessPlanOutput = z.infer<typeof GenerateBusinessPlanOutputSchema>;

export async function generateBusinessPlan(input: GenerateBusinessPlanInput): Promise<GenerateBusinessPlanOutput> {
  return generateBusinessPlanFlow(input);
}

const generateBusinessPlanPrompt = ai.definePrompt({
  name: 'generateBusinessPlanPrompt',
  input: {schema: GenerateBusinessPlanInputSchema},
  output: {schema: GenerateBusinessPlanOutputSchema},
  prompt: `You are an AI assistant designed to generate business plans.
  Based on the prompt provided, generate a comprehensive business plan.
  Prompt: {{{prompt}}}`, 
});

const generateBusinessPlanFlow = ai.defineFlow(
  {
    name: 'generateBusinessPlanFlow',
    inputSchema: GenerateBusinessPlanInputSchema,
    outputSchema: GenerateBusinessPlanOutputSchema,
  },
  async input => {
    const {output} = await generateBusinessPlanPrompt(input);
    return output!;
  }
);
