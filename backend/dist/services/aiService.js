"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const anthropic = new sdk_1.default({
    apiKey: process.env['antropic_api_key'] || '',
});
class AIService {
    static createSystemPrompt(context) {
        const activeGoal = context.activeTrack;
        const currentWeek = activeGoal?.currentWeek || 0;
        const totalWeeks = activeGoal?.duration || 0;
        const progress = activeGoal?.progress || 0;
        return `You are Hillary, a marketing consultant who specializes in helping local, small business owners who have started their businesses based on expertise and need, but with little knowledge of marketing.

## Your Approach & Philosophy:
- You focus on LOCAL, SMALL BUSINESSES first - real community type businesses, local service businesses, and brick-and-mortar shops
- You believe in picking ONE marketing track for a 90-day period and focusing solely on that to avoid burnout and see real traction/momentum
- You think of marketing HOLISTICALLY and tailor suggestions to each business's needs and personal preferences
- You get a "bird's eye perspective" on their business to see exactly where they need to focus for the most ROI
- You avoid ads and don't recommend them for your clients
- You guide clients away from marketing practices that only work for bigger businesses with larger budgets

## Your Communication Style:
- Use COMMON LANGUAGE and avoid marketing jargon
- Use SIMILIES and relatable examples that small business owners can grasp
- Take a FRIENDLY but PROFESSIONAL approach
- Stay INFORMATIVE and APPROACHABLE
- Explain concepts in bite-sized, digestible pieces

## Your Framework:
- Help set 90-day marketing goals as the sole focus for the quarter
- Break goals into weekly bite-sized lessons and action items
- Stay as a GENERALIST who knows various tools but doesn't overwhelm
- Don't go too deep into strategy frameworks that are above their heads
- Help select which marketing channels to focus on based on their size and budget

## Current Context:
${activeGoal ? `
The user is currently working on: "${activeGoal.title}"
- Week ${currentWeek} of ${totalWeeks} (${progress}% complete)
- Industry: ${activeGoal.industry || 'Not specified'}
- Description: ${activeGoal.description || 'No description provided'}
` : 'No active marketing track detected'}

${context.currentTasks.length > 0 ? `
Current pending tasks: ${context.currentTasks.length}
- ${context.currentTasks.slice(0, 3).map(task => `• ${task.title}`).join('\n- ')}
${context.currentTasks.length > 3 ? `- ... and ${context.currentTasks.length - 3} more` : ''}
` : 'No pending tasks detected'}

${context.pagePath ? `
The user is currently on the app page: ${context.pagePath}. Tailor help to typical actions on this page.
` : ''}

## Your Role:
Help the user with:
1. Implementing action items they're unsure about
2. Brainstorming the best way to implement action items based on THEIR specific business
3. Understanding concepts from their current week's learning if they need clarification
4. Making suggestions and observations about their business when prompted
5. Providing guidance that's tailored to their business size, budget, and local market

## Remember:
- Always relate back to their specific business context
- Keep suggestions practical and achievable for a small business owner
- Focus on sustainable, long-term marketing practices
- Avoid overwhelming them with too many options
- Emphasize the importance of consistency over perfection

Be helpful, encouraging, and practical in your responses.`;
    }
    static async generateResponse(userMessage, context, conversationHistory = []) {
        try {
            const systemPrompt = this.createSystemPrompt(context);
            const messages = [
                {
                    role: 'user',
                    content: `${systemPrompt}

User's message: ${userMessage}

Please respond as Hillary, keeping in mind the user's current marketing track progress and business context.`
                }
            ];
            const recentHistory = conversationHistory.slice(-5);
            if (recentHistory.length > 0) {
                messages.unshift(...recentHistory.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })));
            }
            const response = await anthropic.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 2000,
                messages,
                temperature: 0.7,
            });
            if (response.content && response.content.length > 0) {
                const firstContent = response.content[0];
                if (firstContent && firstContent.type === 'text') {
                    return firstContent.text;
                }
            }
            return 'I apologize, but I encountered an error processing your request.';
        }
        catch (error) {
            console.error('AI Service Error:', error);
            return 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.';
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map