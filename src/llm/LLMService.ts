import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

export interface LLMProvider {
    generateText(prompt: string): Promise<string>;
    generateGameVariation(basePrompt: string, variation: string): Promise<string>;
}

export class GoogleAIService implements LLMProvider {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_AI_API_KEY not found in environment variables');
        }
        
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ 
            model: process.env.GOOGLE_AI_MODEL || 'gemini-pro' 
        });
    }

    async generateText(prompt: string): Promise<string> {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating text with Google AI:', error);
            throw new Error('Failed to generate text');
        }
    }

    async generateGameVariation(basePrompt: string, variation: string): Promise<string> {
        const fullPrompt = `${basePrompt}\n\nVariation Request: ${variation}\n\nPlease provide specific code modifications and configuration changes.`;
        return this.generateText(fullPrompt);
    }
}

export class LLMServiceFactory {
    static createService(): LLMProvider {
        const provider = process.env.LLM_PROVIDER || 'google';
        
        switch (provider) {
            case 'google':
                return new GoogleAIService();
            default:
                throw new Error(`Unsupported LLM provider: ${provider}`);
        }
    }
}

export const llmService = LLMServiceFactory.createService();