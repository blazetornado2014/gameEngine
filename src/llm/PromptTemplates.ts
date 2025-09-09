export class PromptTemplates {
    static getPhaseRecreationPrompt(phaseNumber: number): string {
        const phaseFiles = {
            1: 'phase1.md',
            2: 'phase2.md', 
            3: 'phase3.md'
        };

        return `You are an AI assistant helping to recreate Phase ${phaseNumber} of a 2D WebGL game engine.

Please follow the instructions in ${phaseFiles[phaseNumber]} exactly to recreate Phase ${phaseNumber}.

Key requirements:
1. Follow the step-by-step instructions precisely
2. Use the exact file structure and naming conventions
3. Implement all features as specified in environment.md
4. Ensure all verification steps pass
5. Do not deviate from the established architecture

Return your response as a structured plan with:
- Files to create/modify
- Code implementations 
- Verification steps to confirm success

Phase ${phaseNumber} Focus: ${this.getPhaseDescription(phaseNumber)}`;
    }

    static getGameVariationPrompt(): string {
        return `You are an AI assistant that generates variations of a 2D top-down survival game.

The base game has:
- A green 50x50 player controlled with WASD
- Red enemies that spawn from edges and chase the player
- Win condition: survive 60 seconds
- Lose condition: collision with enemy
- Score: +1 point per second survived

Generate a creative variation by modifying ONE of these elements:
1. Player mechanics (size, speed, abilities)
2. Enemy behavior (AI, spawning, types)
3. Win/lose conditions (objectives, time limits)
4. Visual style (colors, shapes, effects)
5. Game mechanics (power-ups, obstacles, scoring)

Provide:
1. Brief description of the variation
2. Specific code changes needed
3. Updated environment.md values if applicable
4. Files that need modification

Keep changes focused and implementable within the existing architecture.`;
    }

    static getCodeAnalysisPrompt(codeContext: string): string {
        return `Analyze this TypeScript game engine code and provide insights:

${codeContext}

Please analyze:
1. Code structure and architecture
2. Potential improvements
3. Performance considerations
4. Best practices adherence
5. Suggestions for AI-generated variations

Focus on aspects relevant to AI-powered game generation.`;
    }

    private static getPhaseDescription(phase: number): string {
        switch (phase) {
            case 1: return "Player implementation - controllable green square with WASD movement";
            case 2: return "Enemy implementation - red squares that spawn and chase player";
            case 3: return "Game rules - win/lose conditions, scoring, UI system";
            default: return "Unknown phase";
        }
    }
}

export interface GameVariationRequest {
    type: 'player' | 'enemy' | 'rules' | 'visual' | 'mechanics';
    description: string;
    intensity?: 'minor' | 'moderate' | 'major';
}

export class PromptBuilder {
    static buildVariationPrompt(request: GameVariationRequest): string {
        const basePrompt = PromptTemplates.getGameVariationPrompt();
        const specificGuidance = this.getTypeSpecificGuidance(request.type);
        
        return `${basePrompt}

Specific Focus: ${request.type} modification
Request: ${request.description}
Intensity: ${request.intensity || 'moderate'}

${specificGuidance}

Please ensure the variation maintains game balance and fun gameplay.`;
    }

    private static getTypeSpecificGuidance(type: string): string {
        switch (type) {
            case 'player':
                return "Focus on modifying player movement, size, abilities, or visual appearance. Consider speed changes, size variations, or special movement mechanics.";
            case 'enemy':
                return "Focus on enemy AI behavior, spawning patterns, types, or abilities. Consider different chase algorithms, spawn locations, or enemy varieties.";
            case 'rules':
                return "Focus on win/lose conditions, objectives, or scoring systems. Consider alternative victory conditions, time limits, or point mechanics.";
            case 'visual':
                return "Focus on colors, shapes, effects, or visual style. Consider theme changes, particle effects, or artistic modifications.";
            case 'mechanics':
                return "Focus on new gameplay elements like power-ups, obstacles, or interactive objects. Consider features that add strategic depth.";
            default:
                return "Consider how this modification enhances the core gameplay experience.";
        }
    }
}