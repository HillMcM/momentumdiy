/**
 * AI Branding Service
 * Uses Claude AI to provide intelligent branding suggestions
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'] || '',
});

export class AIBrandingService {
  /**
   * Suggest complementary colors based on primary color and optional logo
   */
  static async suggestColors(primaryColor: string, _logoBase64?: string): Promise<{
    secondary: string;
    accent: string;
    background: string;
  }> {
    try {
      const prompt = `You are an expert brand designer. Given a brand with primary color ${primaryColor}, suggest 3 complementary colors that create a cohesive, professional brand palette.

Return your response as valid JSON only, with no additional text:
{
  "secondary": "#hexcolor",
  "accent": "#hexcolor", 
  "background": "#hexcolor"
}

Guidelines:
- Secondary color should harmonize with the primary
- Accent color should provide visual interest and contrast
- Background color should be subtle and support readability
- All colors should work together in a marketing context
- Consider color psychology and professional branding standards`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content?.[0];
      if (content && content.type === 'text') {
        // Extract JSON from response
        const textContent = content.text;
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      throw new Error('Failed to parse AI response');
    } catch (error) {
      logger.error('AI color suggestion error', error);
      // Fallback to complementary colors
      return {
        secondary: '#D4AF37',
        accent: '#8B5CF6',
        background: '#1B1628'
      };
    }
  }

  /**
   * Generate business insights from profile data
   */
  static async generateBusinessInsights(businessData: {
    skillLevels: Record<string, number>;
    businessCategory: string;
    location: string;
    competitors: string[];
  }): Promise<Array<{
    type: 'skill' | 'opportunity' | 'competitive';
    message: string;
    action: string;
  }>> {
    try {
      const prompt = `You are a marketing advisor. Analyze this business profile and provide 3 actionable insights:

Business Category: ${businessData.businessCategory}
Location: ${businessData.location}
Marketing Skill Levels (0-5 scale):
${Object.entries(businessData.skillLevels).map(([skill, level]) => `  - ${skill}: ${level}/5`).join('\n')}
Competitors: ${businessData.competitors.join(', ') || 'None specified'}

Provide exactly 3 insights as valid JSON array with no additional text:
[
  {
    "type": "skill",
    "message": "A brief insight about a skill gap or strength (1-2 sentences)",
    "action": "A specific, actionable next step (1 sentence)"
  },
  {
    "type": "opportunity",
    "message": "A marketing opportunity based on their context (1-2 sentences)",
    "action": "How to capitalize on this opportunity (1 sentence)"
  },
  {
    "type": "competitive",
    "message": "A competitive insight or positioning tip (1-2 sentences)",
    "action": "How to differentiate or compete effectively (1 sentence)"
  }
]

Keep messages encouraging, actionable, and specific to their profile.`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content?.[0];
      if (content && content.type === 'text') {
        // Extract JSON array from response
        const textContent = content.text;
        const jsonMatch = textContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      throw new Error('Failed to parse AI insights');
    } catch (error) {
      logger.error('AI insights generation error', error);
      // Return fallback insights
      return [
        {
          type: 'skill',
          message: 'Your marketing skills show potential for growth. Focus on building consistency.',
          action: 'Complete your current marketing track to level up your skills.'
        },
        {
          type: 'opportunity',
          message: 'Local businesses in your category often see success with community engagement.',
          action: 'Try networking events or local partnerships this week.'
        },
        {
          type: 'competitive',
          message: 'Understanding your competitors helps you stand out in the market.',
          action: 'Add your top 3 competitors to get tailored competitive insights.'
        }
      ];
    }
  }

  /**
   * Recommend next marketing track based on user history and goals
   */
  static async recommendNextTrack(userData: {
    completedTrack: { id: string; title: string };
    businessGoals: string;
    skillLevels: Record<string, number>;
    availableTracks: Array<{ id: string; title: string; description: string }>;
  }): Promise<{
    trackId: string;
    title: string;
    reason: string;
  }> {
    try {
      const prompt = `You are a marketing advisor. The user just completed this track:
"${userData.completedTrack.title}"

Their business goals: ${userData.businessGoals}
Their skill levels (0-5): ${JSON.stringify(userData.skillLevels)}

Available next tracks:
${userData.availableTracks.map((t, i) => `${i + 1}. "${t.title}" - ${t.description}`).join('\n')}

Recommend the BEST next track for them with a compelling reason why. Return as valid JSON only:
{
  "trackId": "the-track-id",
  "title": "The Track Title",
  "reason": "A persuasive 2-3 sentence explanation of why this track is perfect for them next"
}`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content?.[0];
      if (content && content.type === 'text') {
        const textContent = content.text;
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const recommendation = JSON.parse(jsonMatch[0]);
          
          // Validate trackId exists in available tracks
          const validTrack = userData.availableTracks.find(t => 
            t.id === recommendation.trackId || t.title === recommendation.title
          );
          
          if (validTrack) {
            return {
              trackId: validTrack.id,
              title: validTrack.title,
              reason: recommendation.reason
            };
          }
        }
      }

      throw new Error('Failed to parse track recommendation');
    } catch (error) {
      logger.error('Track recommendation error', error);
      // Return first available track as fallback
      const firstTrack = userData.availableTracks[0];
      return {
        trackId: firstTrack?.id || '',
        title: firstTrack?.title || 'Next Track',
        reason: 'Continue building your marketing skills with this comprehensive track.'
      };
    }
  }
}

