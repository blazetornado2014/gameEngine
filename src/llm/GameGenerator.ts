import { llmService } from './LLMService';
import { PromptTemplates, PromptBuilder, GameVariationRequest } from './PromptTemplates';
import { promises as fs } from 'fs';
import path from 'path';

export interface GenerationResult {
    success: boolean;
    description?: string;
    codeChanges?: CodeChange[];
    environmentUpdates?: Record<string, any>;
    error?: string;
}

export interface CodeChange {
    filePath: string;
    action: 'create' | 'modify' | 'delete';
    content?: string;
    modifications?: { oldCode: string; newCode: string; }[];
}

export class GameGenerator {
    private basePath: string;

    constructor(basePath: string = process.cwd()) {
        this.basePath = basePath;
    }

    async recreatePhase(phaseNumber: 1 | 2 | 3): Promise<GenerationResult> {
        try {
            const prompt = PromptTemplates.getPhaseRecreationPrompt(phaseNumber);
            const response = await llmService.generateText(prompt);
            
            return {
                success: true,
                description: `Phase ${phaseNumber} recreation instructions generated`,
                codeChanges: this.parseCodeChanges(response)
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to recreate phase ${phaseNumber}: ${error.message}`
            };
        }
    }

    async generateGameVariation(request: GameVariationRequest): Promise<GenerationResult> {
        try {
            const prompt = PromptBuilder.buildVariationPrompt(request);
            const response = await llmService.generateGameVariation(prompt, request.description);
            
            const parsed = this.parseVariationResponse(response);
            
            return {
                success: true,
                description: parsed.description,
                codeChanges: parsed.codeChanges,
                environmentUpdates: parsed.environmentUpdates
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to generate variation: ${error.message}`
            };
        }
    }

    async analyzeCodebase(): Promise<string> {
        try {
            const codeContext = await this.gatherCodeContext();
            const prompt = PromptTemplates.getCodeAnalysisPrompt(codeContext);
            return await llmService.generateText(prompt);
        } catch (error) {
            throw new Error(`Failed to analyze codebase: ${error.message}`);
        }
    }

    private async gatherCodeContext(): Promise<string> {
        const important_files = [
            'src/main.ts',
            'src/core/GameState.ts',
            'src/core/Player.ts',
            'src/core/Enemy.ts',
            'environment.md'
        ];

        let context = "=== GAME ENGINE CODEBASE CONTEXT ===\n\n";
        
        for (const file of important_files) {
            try {
                const filePath = path.join(this.basePath, file);
                const content = await fs.readFile(filePath, 'utf-8');
                context += `\n--- ${file} ---\n${content}\n`;
            } catch (error) {
                context += `\n--- ${file} (not found) ---\n`;
            }
        }

        return context;
    }

    private parseCodeChanges(response: string): CodeChange[] {
        const changes: CodeChange[] = [];
        
        const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
        let match;
        
        while ((match = codeBlockRegex.exec(response)) !== null) {
            const language = match[1];
            const code = match[2];
            
            if (language === 'typescript' || language === 'ts') {
                const filePathMatch = code.match(/\/\/ File: (.+)/);
                if (filePathMatch) {
                    changes.push({
                        filePath: filePathMatch[1],
                        action: 'modify',
                        content: code
                    });
                }
            }
        }
        
        return changes;
    }

    private parseVariationResponse(response: string): {
        description: string;
        codeChanges: CodeChange[];
        environmentUpdates: Record<string, any>;
    } {
        const descriptionMatch = response.match(/Description:\s*(.+)/i);
        const description = descriptionMatch ? descriptionMatch[1] : 'Game variation generated';
        
        const codeChanges = this.parseCodeChanges(response);
        
        const envMatch = response.match(/Environment Updates:\s*([\s\S]*?)(?=\n#|\n```|$)/i);
        let environmentUpdates = {};
        
        if (envMatch) {
            try {
                const envText = envMatch[1];
                const envLines = envText.split('\n').filter(line => line.includes('='));
                environmentUpdates = envLines.reduce((acc, line) => {
                    const [key, value] = line.split('=');
                    if (key && value) {
                        acc[key.trim()] = value.trim();
                    }
                    return acc;
                }, {});
            } catch (error) {
                console.warn('Failed to parse environment updates:', error);
            }
        }
        
        return { description, codeChanges, environmentUpdates };
    }

    async testGeneration(): Promise<boolean> {
        try {
            console.log('Testing LLM connection...');
            const testResponse = await llmService.generateText('Say "Hello, Game Engine!" to confirm the connection.');
            console.log('LLM Response:', testResponse);
            return testResponse.toLowerCase().includes('hello');
        } catch (error) {
            console.error('LLM test failed:', error);
            return false;
        }
    }
}

export const gameGenerator = new GameGenerator();