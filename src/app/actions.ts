'use server';

import { generateBusinessPlan } from '@/ai/flows/generate-business-plan';
import { validateAndImproveResponse } from '@/ai/flows/validate-and-improve-response';

export async function getAIResponse(prompt: string): Promise<string> {
  if (!prompt) {
    return 'Please provide a prompt.';
  }

  try {
    const initialResponse = await generateBusinessPlan({ prompt });
    
    if (!initialResponse.businessPlan) {
      throw new Error('AI failed to generate an initial response.');
    }
    
    const validatedResponse = await validateAndImproveResponse({
      originalResponse: initialResponse.businessPlan,
      topic: prompt,
    });

    if (!validatedResponse.improvedResponse) {
      return initialResponse.businessPlan;
    }

    return validatedResponse.improvedResponse;
  } catch (error) {
    console.error('Error getting AI response:', error);
    return 'Sorry, I encountered an error while processing your request. Please try again.';
  }
}
