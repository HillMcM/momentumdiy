import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env['antropic_api_key'] || '',
});

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

export class AIService {
  private static createSystemPrompt(context: ConversationContext): string {
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

  static async generateResponse(
    userMessage: string,
    context: ConversationContext,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      const systemPrompt = this.createSystemPrompt(context);
      
      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: `${systemPrompt}

User's message: ${userMessage}

Please respond as Hillary, keeping in mind the user's current marketing track progress and business context.`
        }
      ];

      // Add conversation history for context (last 5 messages to stay within limits)
      const recentHistory = conversationHistory.slice(-5);
      if (recentHistory.length > 0) {
        messages.unshift(...recentHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })));
      }

      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages,
        temperature: 0.7, // Balanced creativity and consistency
      });

      // Handle the response content properly
      if (response.content && response.content.length > 0) {
        const firstContent = response.content[0];
        if (firstContent && firstContent.type === 'text') {
          return (firstContent as any).text;
        }
      }
      
      return 'I apologize, but I encountered an error processing your request.';
    } catch (error) {
      console.error('AI Service Error:', error);
      return 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.';
    }
  }
}
