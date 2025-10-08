import type { MarketingGoal, Task } from '../types';
export interface ConversationContext {
    marketingGoals: MarketingGoal[];
    currentTasks: Task[];
    activeTrack: MarketingGoal | null;
    userBusinessType?: string;
    userIndustry?: string;
    userExperienceLevel?: string;
    pagePath?: string;
}
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export interface AIResponse {
    success: boolean;
    message: string;
    error?: string;
}
export declare class AIConfig {
    static readonly MODEL = "claude-3-sonnet-20240229";
    static readonly MAX_TOKENS = 2000;
    static readonly TEMPERATURE = 0.7;
    static readonly MAX_HISTORY_LENGTH = 5;
}
export declare class AIService {
    static generateResponse(userMessage: string, context: ConversationContext, conversationHistory?: ChatMessage[]): Promise<string>;
    static generateResponseWithStatus(userMessage: string, context: ConversationContext, conversationHistory?: ChatMessage[]): Promise<AIResponse>;
    private static prepareMessages;
    private static callAnthropicAPI;
    private static getFallbackResponse;
    static getSystemPrompt(context: ConversationContext): string;
    static testAI(message?: string): Promise<AIResponse>;
    static validateConfiguration(): {
        isValid: boolean;
        errors: string[];
    };
    static createSystemPrompt(context: ConversationContext): Promise<string>;
    static getBusinessContext(context: ConversationContext): Promise<string>;
}
//# sourceMappingURL=aiService.d.ts.map