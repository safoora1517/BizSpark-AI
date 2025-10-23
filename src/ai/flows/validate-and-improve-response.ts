//ValidateAndImproveResponse Story
'use server';

/**
 * @fileOverview A flow to validate and improve AI-generated responses.
 *
 * This flow takes an initial AI response and validates it based on predefined criteria.
 * It then adds additional details or disclaimers as necessary to ensure the response
 * is relevant, up-to-date, and accurate.
 *
 * - validateAndImproveResponse - The main function that orchestrates the validation and improvement process.
 * - ValidateAndImproveResponseInput - The input type for the validateAndImproveResponse function.
 * - ValidateAndImproveResponseOutput - The output type for the validateAndImproveResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateAndImproveResponseInputSchema = z.object({
  originalResponse: z.string().describe('The original AI-generated response.'),
  topic: z.string().describe('The topic of the original response.'),
});
export type ValidateAndImproveResponseInput = z.infer<typeof ValidateAndImproveResponseInputSchema>;

const ValidateAndImproveResponseOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the original response is valid.'),
  improvedResponse: z.string().describe('The improved AI-generated response with added details or disclaimers.'),
});
export type ValidateAndImproveResponseOutput = z.infer<
  typeof ValidateAndImproveResponseOutputSchema
>;

export async function validateAndImproveResponse(
  input: ValidateAndImproveResponseInput
): Promise<ValidateAndImproveResponseOutput> {
  return validateAndImproveResponseFlow(input);
}

const validateResponsePrompt = ai.definePrompt({
  name: 'validateResponsePrompt',
  input: {schema: ValidateAndImproveResponseInputSchema},
  output: {schema: ValidateAndImproveResponseOutputSchema},
  prompt: `You are an AI assistant that validates and improves AI-generated responses.

  You will be given an original AI response and a topic.
  You will validate the original AI response based on the following criteria:
  - Accuracy: Is the information in the response accurate?
  - Relevance: Is the information in the response relevant to the topic?
  - Up-to-date: Is the information in the response up-to-date?

  If the response is not valid, you will improve it by adding additional details or disclaimers.
  You MUST return the improved response in the improvedResponse field.

  Original Response: {{{originalResponse}}}
  Topic: {{{topic}}}

  Output a JSON object with the following fields:
  - isValid: Whether the original response is valid.
  - improvedResponse: The improved AI-generated response with added details or disclaimers.
  `,
});

const validateAndImproveResponseFlow = ai.defineFlow(
  {
    name: 'validateAndImproveResponseFlow',
    inputSchema: ValidateAndImproveResponseInputSchema,
    outputSchema: ValidateAndImproveResponseOutputSchema,
  },
  async input => {
    const {output} = await validateResponsePrompt(input);
    return output!;
  }
);
