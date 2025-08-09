export interface ConversationContext {
    marketingGoals: any[];
    currentTasks: any[];
    activeTrack: any | null;
    userBusinessType?: string;
    userIndustry?: string;
    userExperienceLevel?: string;
    pagePath?: string;
}
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export declare class AIService {
    private static createSystemPrompt;
    static generateResponse(userMessage: string, context: ConversationContext, conversationHistory?: ChatMessage[]): Promise<string>;
}
//# sourceMappingURL=aiService.d.ts.map