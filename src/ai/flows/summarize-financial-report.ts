'use server';

/**
 * @fileOverview Summarizes key insights from a financial report.
 *
 * - summarizeFinancialReport - A function that summarizes a financial report.
 * - SummarizeFinancialReportInput - The input type for the summarizeFinancialReport function.
 * - SummarizeFinancialReportOutput - The return type for the summarizeFinancialReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFinancialReportInputSchema = z.object({
  reportDataUri: z
    .string()
    .describe(
      "A financial report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeFinancialReportInput = z.infer<
  typeof SummarizeFinancialReportInputSchema
>;

const SummarizeFinancialReportOutputSchema = z.object({
  summary: z.string().describe('A summary of the key insights from the report.'),
  validationResult: z
    .string()
    .optional()
    .describe(
      'Result of the validation, including warnings and suggestions for improvement.'
    ),
});
export type SummarizeFinancialReportOutput = z.infer<
  typeof SummarizeFinancialReportOutputSchema
>;

export async function summarizeFinancialReport(
  input: SummarizeFinancialReportInput
): Promise<SummarizeFinancialReportOutput> {
  return summarizeFinancialReportFlow(input);
}

const summarizeFinancialReportPrompt = ai.definePrompt({
  name: 'summarizeFinancialReportPrompt',
  input: {schema: SummarizeFinancialReportInputSchema},
  output: {schema: SummarizeFinancialReportOutputSchema},
  prompt: `You are an expert financial analyst. Please summarize the key insights from the following financial report. Focus on key metrics, trends, and potential risks and opportunities.

Financial Report: {{media url=reportDataUri}}

Response:
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const validateSummaryTool = ai.defineTool({
  name: 'validateSummaryTool',
  description: 'Validates a financial report summary for accuracy and completeness.',
  inputSchema: z.object({
    summary: z.string().describe('The financial report summary to validate.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
  // TODO: Implement the validation logic here.
  // Consider criteria relevant to the subject matter (such as recent news) to decide whether the generated response should incorporate additional details or disclaimers.
  return `Summary validation not implemented yet. Input summary: ${input.summary}`;
});

const summarizeFinancialReportFlow = ai.defineFlow(
  {
    name: 'summarizeFinancialReportFlow',
    inputSchema: SummarizeFinancialReportInputSchema,
    outputSchema: SummarizeFinancialReportOutputSchema,
  },
  async input => {
    const {output} = await summarizeFinancialReportPrompt(input);

    // Attempt to validate the financial report. If validation identifies
    // shortcomings, then report these in the output.
    try {
      const validationResult = await validateSummaryTool({
        summary: output!.summary,
      });
      return {
        ...output!,
        validationResult,
      };
    } catch (e: any) {
      return {
        ...output!,
        validationResult: `Summary validation failed: ${e.message}`,
      };
    }
  }
);
