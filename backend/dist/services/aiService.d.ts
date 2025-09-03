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
    private static getBusinessContext;
    private static getLocationInsights;
    private static getPersonalizedRecommendations;
    private static getIndustrySpecificGuidance;
    private static getWeekSpecificGuidance;
    private static getPageSpecificGuidance;
    private static getMarketingKnowledgeBase;
    private static getWeekContent;
    private static getToolGuidance;
    private static getIndustryStrategy;
    private static getBudgetGuidance;
    private static getChallengesSolutions;
    private static getMetricsGuidance;
    private static getTemplatesScripts;
    static generateResponse(userMessage: string, context: ConversationContext, conversationHistory?: ChatMessage[]): Promise<string>;
}
//# sourceMappingURL=aiService.d.ts.map