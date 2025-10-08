import { supabase } from '../config/supabase';
import { 
  MarketingGoal, 
  MarketingModule, 
  MarketingTask,
  CreateMarketingGoalRequest, 
  UpdateMarketingGoalRequest, 
  ApiResponse,
  DatabaseMarketingGoal 
} from '../types';
import { logger } from '../utils/logger';

export class MarketingService {
  /**
   * Get all marketing goals
   */
  static async getMarketingGoals(): Promise<ApiResponse<MarketingGoal[]>> {
    try {
      // Get published track definitions only
      const { data, error } = await supabase
        .from('marketing_tracks')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      // Convert track definitions to MarketingGoal format for API consistency
      const trackDefinitions: MarketingGoal[] = (data || []).map(trackDef => ({
        id: trackDef.id,
        title: trackDef.title,
        description: trackDef.description || '',
        industry: trackDef.industry_tags?.[0] || 'General',
        duration: trackDef.duration_weeks,
        isActive: false, // Track definitions are not active by default
        currentWeek: 1,
        progress: 0,
        weekStartDates: [],
        lastWeekAdvancement: null,
        trackDefinitionId: trackDef.id,
        phases: trackDef.phases || [],
        modules: [] // Will be populated when activated
      }));

      return {
        success: true,
        data: trackDefinitions
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get active marketing goal for the authenticated user
   */
  static async getActiveMarketingGoal(userId?: string): Promise<ApiResponse<MarketingGoal | null>> {
    try {
      // Get current user ID from parameter or auth context
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          return {
            success: false,
            error: 'User not authenticated'
          };
        }
        currentUserId = user.id;
      }

      // Get user's profile with track information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (profileError) {
        return {
          success: false,
          error: profileError.message
        };
      }

      // If no active track, return null
      if (!profile.active_track_id) {
        return {
          success: true,
          data: null
        };
      }

      // Get the track definition
      const { data: trackDef, error: trackError } = await supabase
        .from('marketing_tracks')
        .select('*')
        .eq('id', profile.active_track_id)
        .single();

      if (trackError) {
        return {
          success: false,
          error: trackError.message
        };
      }

      // Calculate current week based on start date
      const startDate = new Date(profile.track_start_date);
      const now = new Date();
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const calculatedWeek = Math.min(Math.floor(daysSinceStart / 7) + 1, trackDef.duration_weeks);
      
      // Update profile if week has advanced
      if (calculatedWeek > (profile.track_current_week || 1)) {
        logger.info('Week advanced for user track', {
          userId: currentUserId,
          fromWeek: profile.track_current_week,
          toWeek: calculatedWeek
        });
        const weekStartDates = profile.track_week_start_dates || [];
        weekStartDates.push(now.toISOString());
        
        await supabase
          .from('profiles')
          .update({
            track_current_week: calculatedWeek,
            track_week_start_dates: weekStartDates,
            track_last_week_advancement: now.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', currentUserId);
      }

      // Check if track is completed (12 weeks have passed)
      const isCompleted = calculatedWeek >= trackDef.duration_weeks;
      if (isCompleted && !profile.track_completion_date) {
        logger.info('Track completed', { userId: currentUserId, trackId: trackDef.id });
        await supabase
          .from('profiles')
          .update({
            track_progress: 100,
            track_completion_date: now.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', currentUserId);
      }

      // Get modules for the track (modules are now linked directly to track_id)
      let modules: MarketingModule[] = [];
      
      logger.debug('Loading modules for track', { trackId: trackDef.id });
      const { data: modulesData, error: modulesError } = await supabase
        .from('marketing_modules')
        .select('*')
        .eq('track_id', trackDef.id)
        .order('week_number', { ascending: true });

      if (modulesError) {
        logger.error('Error loading modules for track', modulesError, { trackId: trackDef.id });
      } else if (modulesData && modulesData.length > 0) {
        // Convert to MarketingModule format and load tasks
        // Mark modules as unlocked if their week number <= current week
        for (const moduleData of modulesData) {
          const moduleWithTasks = await this.mapDatabaseModuleToModule(moduleData);
          // Override isUnlocked based on current week
          moduleWithTasks.isUnlocked = moduleData.week_number <= calculatedWeek;
          modules.push(moduleWithTasks);
        }
        logger.debug('Loaded modules for track', { 
          trackId: trackDef.id, 
          totalModules: modules.length, 
          unlockedModules: modules.filter(m => m.isUnlocked).length 
        });
      } else {
        logger.warn('No modules found for track', { trackId: trackDef.id });
      }

      // Parse phases and calculate current phase based on current week
      let phases: any[] = [];
      try {
        if (trackDef.phases) {
          if (typeof trackDef.phases === 'string') {
            phases = JSON.parse(trackDef.phases);
          } else if (Array.isArray(trackDef.phases)) {
            phases = trackDef.phases;
          }
        }
      } catch (error) {
        logger.error('Error parsing phases for track', error, { trackId: trackDef.id });
        phases = [];
      }

      // Find the current phase based on the current week
      const currentPhase = phases.find((phase: any) => 
        calculatedWeek >= phase.startWeek && calculatedWeek <= phase.endWeek
      ) || phases[0] || null;

      logger.debug('Phase calculation for track', {
        trackId: trackDef.id,
        userId: currentUserId,
        currentWeek: calculatedWeek,
        phasesCount: phases.length,
        currentPhaseName: currentPhase?.name
      });

      // Create MarketingGoal object from track definition + user progress
      const goal: MarketingGoal = {
        id: trackDef.id,
        title: trackDef.title,
        description: trackDef.description || '',
        industry: trackDef.industry_tags?.[0] || 'General',
        duration: trackDef.duration_weeks,
        isActive: !isCompleted,
        startDate: profile.track_start_date || new Date().toISOString(),
        currentWeek: calculatedWeek,
        progress: isCompleted ? 100 : Math.floor((calculatedWeek / trackDef.duration_weeks) * 100),
        weekStartDates: profile.track_week_start_dates || [],
        lastWeekAdvancement: profile.track_last_week_advancement,
        trackDefinitionId: trackDef.id,
        phases: phases,
        currentPhase: currentPhase,
        modules: modules
      };

      return {
        success: true,
        data: goal
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a new marketing goal
   */
  static async createMarketingGoal(goalData: CreateMarketingGoalRequest): Promise<ApiResponse<MarketingGoal>> {
    try {
      // If this goal should be active, deactivate all other goals first
      if (goalData.isActive) {
        const { error: deactivateError } = await supabase
          .from('marketing_goals')
          .update({ is_active: false })
          .eq('is_active', true);

        if (deactivateError) {
          logger.error('Error deactivating existing goals', deactivateError);
          // Continue anyway, as this is not critical
        }
      }

      const { data, error } = await supabase
        .from('marketing_goals')
        .insert([{
          title: goalData.title,
          description: goalData.description || '',
          industry: goalData.industry || '',
          duration: goalData.duration,
          is_active: goalData.isActive || false,
          start_date: goalData.startDate ? new Date(goalData.startDate).toISOString() : null,
          current_week: 1,
          progress: 0,
          week_start_dates: [],
          last_week_advancement: null
        }])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const goal = await this.mapDatabaseGoalToGoal(data as DatabaseMarketingGoal);

      return {
        success: true,
        data: goal,
        message: 'Marketing goal created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update a marketing goal
   */
  static async updateMarketingGoal(id: string, updates: UpdateMarketingGoalRequest): Promise<ApiResponse<MarketingGoal>> {
    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.industry !== undefined) updateData.industry = updates.industry;
      if (updates.duration !== undefined) updateData.duration = updates.duration;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.startDate !== undefined) {
        updateData.start_date = updates.startDate ? new Date(updates.startDate).toISOString() : null;
      }

      const { data, error } = await supabase
        .from('marketing_goals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Marketing goal not found'
        };
      }

      const goal = await this.mapDatabaseGoalToGoal(data as DatabaseMarketingGoal);

      return {
        success: true,
        data: goal,
        message: 'Marketing goal updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete a marketing goal
   */
  static async deleteMarketingGoal(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('marketing_goals')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Marketing goal deleted successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Seed a 12-week social-media track curriculum (modules + tasks) for a goal
   */
  static async seedSocialMediaModules(goalId: string): Promise<ApiResponse<void>> {
    try {
      // If modules already exist, do nothing
      const existing = await this.getMarketingModules(goalId);
      if (existing.success && (existing.data?.length || 0) > 0) {
        return { success: true, message: 'Modules already exist; skipping seed' };
      }

      const weekDefs: Array<{ title: string; description: string; content: string; tasks: { title: string; description: string; estimatedTime: string }[] }>= [
        { title: 'Social Audit & Baseline Tracking', description: 'Audit your profile and record baseline metrics', content: 'Audit your profile and feed. Record followers, avg likes/comments, story views. Try a simple 5-day posting rhythm.', tasks: [
          { title: 'Quick Social Audit', description: 'Profile, content cadence, and highlights check', estimatedTime: '30-45m' },
          { title: 'Record Baseline Metrics', description: 'Followers, avg likes, avg comments, story views', estimatedTime: '15-20m' },
          { title: 'Follow 5-Day Plan', description: 'Post M-F using a simple plan', estimatedTime: '2-3h' }
        ]},
        { title: 'Clarify Content Pillars', description: 'Choose 3–4 brand-aligned pillars', content: 'Pick pillars and map a refined 5-day plan.', tasks: [
          { title: 'Choose Pillars', description: 'Select 3–4 content themes', estimatedTime: '20-30m' },
          { title: 'Refine Weekly Plan', description: 'Map your M–F schedule', estimatedTime: '30-45m' }
        ]},
        { title: 'Brand Voice & Visual Tone', description: 'Define voice and visuals', content: 'Create a one-page voice/visual style.', tasks: [
          { title: 'Define Voice', description: 'Pick 3 words + emoji/tone rules', estimatedTime: '20-30m' },
          { title: 'Visual Style', description: 'Choose fonts/colors and example posts', estimatedTime: '30-45m' }
        ]},
        { title: 'Create 3 Core Post Types', description: 'Educate / Promote / Connect', content: 'Set your 3 reusable post types.', tasks: [
          { title: 'Draft Post Type Outlines', description: 'Headlines and examples for each type', estimatedTime: '30-45m' }
        ]},
        { title: 'Weekly Content Plan', description: 'Build a realistic weekly rhythm', content: 'Pick posting frequency and map days → types.', tasks: [
          { title: 'Choose Frequency', description: '3–5 posts/week plan', estimatedTime: '15-20m' },
          { title: 'Calendar Plan', description: 'Assign types to days', estimatedTime: '30-45m' }
        ]},
        { title: 'Design Templates', description: 'Create 2–4 reusable templates', content: 'Design simple Canva templates for speed and consistency.', tasks: [
          { title: 'Design Tip/FAQ Template', description: 'One template for educate posts', estimatedTime: '45-60m' },
          { title: 'Design Promo Template', description: 'One template for offers', estimatedTime: '45-60m' }
        ]},
        { title: 'Improve Profile & Links', description: 'Polish bio, links, and pinned posts', content: 'Clarify who you help, what you offer, and next step.', tasks: [
          { title: 'Rewrite Bio', description: 'Who you help • what you offer • CTA', estimatedTime: '20-30m' },
          { title: 'Update Links', description: 'Clean up link-in-bio', estimatedTime: '15-20m' }
        ]},
        { title: 'Schedule One Week Ahead', description: 'Plan and schedule one week', content: 'Prepare captions, visuals, and schedule posts.', tasks: [
          { title: 'Prep Content', description: 'Captions + visuals for the week', estimatedTime: '2-3h' },
          { title: 'Schedule Posts', description: 'Use Meta Business Suite or tool', estimatedTime: '30-45m' }
        ]},
        { title: 'Daily Engagement Habit', description: 'Engage 10 minutes/day', content: 'Short daily routine to build relationships and reach.', tasks: [
          { title: '10-Minute Routine', description: 'Comment, reply, react, connect', estimatedTime: '10m/day' }
        ]},
        { title: 'Repurpose a Past Post', description: 'Reuse a strong post with a twist', content: 'Pick a past winner and refresh format/CTA.', tasks: [
          { title: 'Find Past Post', description: 'Choose a strong post to refresh', estimatedTime: '20-30m' }
        ]},
        { title: 'Mini Engagement Campaign', description: 'Run a small poll/giveaway/Q&A', content: 'Spark interaction to boost reach.', tasks: [
          { title: 'Plan Campaign', description: 'Pick format and announce rules', estimatedTime: '45-60m' }
        ]},
        { title: 'Review & Next 30-Day Plan', description: 'Reflect metrics and set focus', content: 'Compare to baseline and pick one focus for next month.', tasks: [
          { title: 'Review Insights', description: 'Compare metrics vs. week 1', estimatedTime: '30-45m' }
        ]}
      ];

      // Insert modules then tasks
      weekDefs.forEach((_def, _i) => {}); // no-op to satisfy linter about unused vars in next loop signature change
      for (let i = 0; i < weekDefs.length; i++) {
        const weekNumber = i + 1;
        const def = weekDefs[i]!;
        const { data: moduleRow, error: moduleErr } = await supabase
          .from('marketing_modules')
          .insert([{ goal_id: goalId, week_number: weekNumber, title: def.title, description: def.description, content: def.content, is_unlocked: weekNumber === 1, is_completed: false }])
          .select('*')
          .single();
        if (moduleErr) {
          return { success: false, error: moduleErr.message };
        }
        const moduleId = (moduleRow as any).id as string;
        for (const t of def.tasks) {
          const { error: taskErr } = await supabase
            .from('marketing_tasks')
            .insert([{ module_id: moduleId, title: t.title, description: t.description, estimated_time: t.estimatedTime, is_completed: false }]);
          if (taskErr) {
            return { success: false, error: taskErr.message };
          }
        }
      }

      return { success: true, message: 'Seeded 12-week social media modules' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Seed a 12-week local foot traffic track curriculum (modules + tasks) for a goal
   */
  static async seedLocalFootTrafficModules(goalId: string): Promise<ApiResponse<void>> {
    try {
      // If modules already exist, do nothing
      const existing = await this.getMarketingModules(goalId);
      if (existing.success && (existing.data?.length || 0) > 0) {
        return { success: true, message: 'Modules already exist; skipping seed' };
      }

      const weekDefs: Array<{ title: string; description: string; content: string; tasks: { title: string; description: string; estimatedTime: string }[] }>= [
        { title: 'Business Audit & Local Baseline', description: 'Audit your current visibility and record baseline metrics', content: 'Do a quick audit of your current local presence: Google Business Profile, local directory listings, current foot traffic patterns. Record baseline metrics like daily walk-ins, local search visibility, and existing local partnerships.', tasks: [
          { title: 'Google Business Profile Audit', description: 'Review and optimize your Google Business Profile', estimatedTime: '45-60m' },
          { title: 'Local Directory Check', description: 'Verify listings on Yelp, Yellow Pages, local directories', estimatedTime: '30-45m' },
          { title: 'Record Baseline Metrics', description: 'Track current daily walk-ins and local visibility', estimatedTime: '15-20m' },
          { title: 'Quick Local Competition Scan', description: 'Identify 3-5 local competitors and their tactics', estimatedTime: '30-45m' }
        ]},
        { title: 'Street Appeal & Storefront Optimization', description: 'Make your storefront irresistible to passersby', content: 'Focus on your physical presence: eye-catching signage, window displays, sidewalk appeal. Small changes can dramatically increase walk-ins from existing foot traffic.', tasks: [
          { title: 'Signage Assessment', description: 'Evaluate and improve visibility of your business signs', estimatedTime: '30-45m' },
          { title: 'Window Display Refresh', description: 'Create an engaging window display that draws people in', estimatedTime: '1-2h' },
          { title: 'Sidewalk A-Frame Setup', description: 'Design and deploy daily sidewalk signage', estimatedTime: '45-60m' },
          { title: 'Quick Curb Appeal Fixes', description: 'Clean entrance, add plants, improve lighting', estimatedTime: '1-2h' }
        ]},
        { title: 'Google Business Profile Mastery', description: 'Dominate local search results', content: 'Optimize your Google Business Profile to appear first in local searches. This is your most powerful tool for local visibility.', tasks: [
          { title: 'Complete Profile Optimization', description: 'Fill out all sections, add photos, services, hours', estimatedTime: '45-60m' },
          { title: 'Weekly Photo Updates', description: 'Add fresh photos of products, team, behind-scenes', estimatedTime: '30-45m' },
          { title: 'Google Posts Creation', description: 'Create weekly updates, offers, event announcements', estimatedTime: '30-45m' },
          { title: 'Review Response Strategy', description: 'Respond to all reviews professionally and promptly', estimatedTime: '20-30m' }
        ]},
        { title: 'Local Partnerships Phase 1', description: 'Build relationships with nearby businesses', content: 'Start building relationships with complementary businesses in your area. Cross-promotion with neighbors can significantly boost foot traffic.', tasks: [
          { title: 'Identify 5 Partnership Targets', description: 'List nearby businesses that serve similar customers', estimatedTime: '30-45m' },
          { title: 'Initial Outreach', description: 'Visit or call 2-3 businesses to discuss partnerships', estimatedTime: '1-2h' },
          { title: 'Create Cross-Promotion Offer', description: 'Design a mutually beneficial promotion or referral program', estimatedTime: '30-45m' },
          { title: 'Launch First Partnership', description: 'Execute your first cross-promotion with a neighbor', estimatedTime: '45-60m' }
        ]},
        { title: 'Customer Incentive Campaign', description: 'Create irresistible reasons to visit now', content: 'Design and launch time-sensitive offers that create urgency and drive immediate foot traffic. Focus on new customer acquisition.', tasks: [
          { title: 'Design New Customer Offer', description: 'Create compelling offer for first-time visitors', estimatedTime: '30-45m' },
          { title: 'Create Promotional Materials', description: 'Design flyers, social posts, signage for your offer', estimatedTime: '45-60m' },
          { title: 'Multi-Channel Promotion', description: 'Promote via Google, social media, email, signage', estimatedTime: '1-2h' },
          { title: 'Track Campaign Results', description: 'Monitor redemptions and new customer acquisition', estimatedTime: '15-20m/day' }
        ]},
        { title: 'Community Event Participation', description: 'Get visible in local community events', content: 'Participate in or sponsor local events to increase brand awareness and connect with potential customers in a friendly, community-focused way.', tasks: [
          { title: 'Research Local Events', description: 'Find upcoming farmers markets, fairs, community events', estimatedTime: '45-60m' },
          { title: 'Choose 1-2 Events to Join', description: 'Select events that align with your target customers', estimatedTime: '30-45m' },
          { title: 'Plan Event Presence', description: 'Design booth/table setup, promotional materials, giveaways', estimatedTime: '1-2h' },
          { title: 'Execute Event Participation', description: 'Attend event, engage with community, collect contacts', estimatedTime: '4-6h' }
        ]},
        { title: 'Referral Program Launch', description: 'Turn customers into advocates', content: 'Launch a simple but effective referral program that incentivizes existing customers to bring friends and family.', tasks: [
          { title: 'Design Referral Program', description: 'Create simple rewards for both referrer and new customer', estimatedTime: '45-60m' },
          { title: 'Create Program Materials', description: 'Design referral cards, instructions, tracking system', estimatedTime: '1-2h' },
          { title: 'Train Staff on Program', description: 'Ensure team knows how to explain and track referrals', estimatedTime: '30-45m' },
          { title: 'Launch and Promote', description: 'Announce to existing customers via multiple channels', estimatedTime: '45-60m' }
        ]},
        { title: 'Local Media & PR Push', description: 'Get free publicity in local media', content: 'Reach out to local newspapers, blogs, radio stations with newsworthy stories about your business. Free media coverage can drive significant foot traffic.', tasks: [
          { title: 'Craft Your Story Angle', description: 'Develop newsworthy angle (new location, milestone, community impact)', estimatedTime: '45-60m' },
          { title: 'Create Media Contact List', description: 'Research local journalists, bloggers, radio hosts', estimatedTime: '45-60m' },
          { title: 'Write and Send Press Release', description: 'Compose professional press release and send to contacts', estimatedTime: '1-2h' },
          { title: 'Follow Up and Build Relationships', description: 'Follow up with interested media, offer exclusive access', estimatedTime: '45-60m' }
        ]},
        { title: 'Seasonal Campaign Execution', description: 'Capitalize on seasonal foot traffic patterns', content: 'Design and execute a campaign that takes advantage of seasonal shopping patterns, holidays, or local events to maximize foot traffic during peak times.', tasks: [
          { title: 'Identify Seasonal Opportunities', description: 'Research upcoming holidays, seasons, local events', estimatedTime: '30-45m' },
          { title: 'Design Seasonal Promotion', description: 'Create themed offer or event around seasonal opportunity', estimatedTime: '45-60m' },
          { title: 'Create Campaign Materials', description: 'Design signage, social posts, promotional materials', estimatedTime: '1-2h' },
          { title: 'Execute Multi-Week Campaign', description: 'Launch and maintain campaign with consistent promotion', estimatedTime: '2-3h/week' }
        ]},
        { title: 'Advanced Local SEO', description: 'Dominate local search beyond Google My Business', content: 'Implement advanced local SEO strategies to appear in more local searches and directories. Get found when locals search for what you offer.', tasks: [
          { title: 'Optimize for Local Keywords', description: 'Research and target "near me" and location-based keywords', estimatedTime: '1-2h' },
          { title: 'Build Local Citations', description: 'Ensure consistent business info across 10+ local directories', estimatedTime: '2-3h' },
          { title: 'Create Location-Based Content', description: 'Write blog posts about local topics and events', estimatedTime: '1-2h' },
          { title: 'Get Local Backlinks', description: 'Reach out to local organizations for website mentions', estimatedTime: '1-2h' }
        ]},
        { title: 'Customer Experience Optimization', description: 'Perfect the in-store experience to encourage repeat visits', content: 'Focus on creating such a positive experience that customers naturally return and tell others. Small improvements in customer experience can dramatically increase lifetime value.', tasks: [
          { title: 'Mystery Shop Your Business', description: 'Experience your business as a first-time customer would', estimatedTime: '1-2h' },
          { title: 'Staff Training Session', description: 'Train team on greeting, upselling, creating memorable experiences', estimatedTime: '1-2h' },
          { title: 'Implement Follow-Up System', description: 'Create system to follow up with new customers', estimatedTime: '45-60m' },
          { title: 'Gather Customer Feedback', description: 'Survey recent customers for improvement suggestions', estimatedTime: '30-45m' }
        ]},
        { title: 'Growth Measurement & Future Planning', description: 'Measure success and plan sustainable growth', content: 'Compare your results to baseline metrics and create a sustainable plan for continued local foot traffic growth.', tasks: [
          { title: 'Calculate Traffic Increase', description: 'Compare current metrics to Week 1 baseline', estimatedTime: '30-45m' },
          { title: 'Identify Top Performing Tactics', description: 'Determine which strategies drove the most traffic', estimatedTime: '45-60m' },
          { title: 'Create Maintenance Plan', description: 'Design ongoing activities to sustain traffic levels', estimatedTime: '45-60m' },
          { title: 'Plan Next Growth Phase', description: 'Set goals and strategies for next 3-6 months', estimatedTime: '1-2h' }
        ]}
      ];

      // Insert modules then tasks
      weekDefs.forEach((_def, _i) => {}); // no-op to satisfy linter about unused vars in next loop signature change
      for (let i = 0; i < weekDefs.length; i++) {
        const weekNumber = i + 1;
        const def = weekDefs[i]!;
        const { data: moduleRow, error: moduleErr } = await supabase
          .from('marketing_modules')
          .insert([{ goal_id: goalId, week_number: weekNumber, title: def.title, description: def.description, content: def.content, is_unlocked: weekNumber === 1, is_completed: false }])
          .select('*')
          .single();
        if (moduleErr) {
          return { success: false, error: moduleErr.message };
        }
        const moduleId = (moduleRow as any).id as string;
        for (const t of def.tasks) {
          const { error: taskErr } = await supabase
            .from('marketing_tasks')
            .insert([{ module_id: moduleId, title: t.title, description: t.description, estimated_time: t.estimatedTime, is_completed: false }]);
          if (taskErr) {
            return { success: false, error: taskErr.message };
          }
        }
      }

      return { success: true, message: 'Seeded 12-week local foot traffic modules' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Get track definition by ID
   * @deprecated - Use direct supabase query instead
   */
  // private static async getTrackDefinition(trackDefinitionId: string): Promise<ApiResponse<any>> {
  //   const { data: trackDef, error: trackError } = await supabase
  //     .from('marketing_tracks')
  //     .select('*')
  //     .eq('id', trackDefinitionId)
  //     .single();

  //   if (trackError) {
  //     return {
  //       success: false,
  //       error: trackError.message
  //     };
  //   }

  //   return {
  //     success: true,
  //     data: trackDef
  //   };
  // }

  /**
   * Get current user ID from parameter or auth context
   */
  private static async getCurrentUserId(userId?: string): Promise<ApiResponse<string>> {
    if (userId) {
      return {
        success: true,
        data: userId
      };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    return {
      success: true,
      data: user.id
    };
  }

  /**
   * Create marketing goal from track definition
   * @deprecated - No longer needed, track progress stored in profiles table
   */
  // private static async createMarketingGoalFromTrack(trackDef: any, userId: string): Promise<ApiResponse<any>> {
  //   // DEPRECATED: marketing_goals table removed
  //   return { success: false, error: 'Method deprecated' };
  // }

  /**
   * Update user profile with track information
   * @deprecated - Logic moved into activateTrackForUser
   */
  // private static async updateUserProfileForTrack(userId: string, trackDefinitionId: string, goalId: string): Promise<ApiResponse<void>> {
  //   // DEPRECATED: Logic moved into activateTrackForUser
  //   return { success: false, error: 'Method deprecated' };
  // }

  /**
   * Load modules with their associated tasks
   * @deprecated - Logic moved into getActiveMarketingGoal and activateTrackForUser
   */
  // private static async loadModulesWithTasks(goalId: string): Promise<MarketingModule[]> {
  //   // DEPRECATED: Logic moved into other methods
  //   return [];
  // }

  /**
   * Load a single module with its tasks
   * @deprecated - Logic moved into mapDatabaseModuleToModule
   */
  // private static async loadModuleWithTasks(module: any): Promise<MarketingModule> {
  //   // DEPRECATED: Logic moved into mapDatabaseModuleToModule
  //   return {} as MarketingModule;
  // }

  /**
   * Create MarketingGoal object from track definition and goal data
   * @deprecated - Logic moved into getActiveMarketingGoal and activateTrackForUser
   */
  // private static createMarketingGoalObject(trackDef: any, goalData: any, modules: MarketingModule[]): MarketingGoal {
  //   // DEPRECATED: Logic moved into other methods
  //   return {} as MarketingGoal;
  // }


  /**
   * Activate a track definition for the authenticated user
   * This stores track progress in the user's profile
   * New schema: No marketing_goals table, progress stored in profiles
   */
  static async activateTrackForUser(trackDefinitionId: string, userId?: string): Promise<ApiResponse<MarketingGoal>> {
    try {
      // Step 1: Get and validate track definition
      const { data: trackDef, error: trackError } = await supabase
        .from('marketing_tracks')
        .select('*')
        .eq('id', trackDefinitionId)
        .single();

      if (trackError || !trackDef) {
        return {
          success: false,
          error: trackError?.message || 'Track not found'
        };
      }

      // Step 2: Get and validate user ID
      const userIdResult = await this.getCurrentUserId(userId);
      if (!userIdResult.success) {
        return {
          success: false,
          error: userIdResult.error || 'Failed to get user ID'
        };
      }
      const currentUserId = userIdResult.data!;

      // Step 3: Update user profile with track activation
      const now = new Date();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          active_track_id: trackDefinitionId,
          track_start_date: now.toISOString(),
          track_current_week: 1,
          track_progress: 0,
          track_week_start_dates: [now.toISOString()],
          track_last_week_advancement: null,
          track_completion_date: null,
          updated_at: now.toISOString()
        })
        .eq('id', currentUserId);

      if (updateError) {
        return {
          success: false,
          error: updateError.message
        };
      }

      // Step 4: Load modules and tasks for the track
      const { data: modulesData, error: modulesError } = await supabase
        .from('marketing_modules')
        .select('*')
        .eq('track_id', trackDefinitionId)
        .order('week_number', { ascending: true });

      if (modulesError) {
        logger.error('Error loading modules for goal', modulesError);
      }

      const modules: MarketingModule[] = [];
      if (modulesData && modulesData.length > 0) {
        for (const moduleData of modulesData) {
          const moduleWithTasks = await this.mapDatabaseModuleToModule(moduleData);
          modules.push(moduleWithTasks);
        }
      }

      // Step 5: Create and return MarketingGoal object
      const goal: MarketingGoal = {
        id: trackDefinitionId, // Use track ID as goal ID
        title: trackDef.title,
        description: trackDef.description || '',
        industry: trackDef.industry_tags?.[0] || 'General',
        duration: trackDef.duration_weeks,
        isActive: true,
        startDate: now.toISOString(),
        currentWeek: 1,
        progress: 0,
        weekStartDates: [now.toISOString()],
        lastWeekAdvancement: null,
        trackDefinitionId: trackDefinitionId,
        phases: trackDef.phases || [],
        modules: modules
      };

      return {
        success: true,
        data: goal,
        message: 'Track activated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Clear active track from user profile (after completion or manual deactivation)
   */
  static async clearActiveTrack(userId?: string): Promise<ApiResponse<void>> {
    try {
      const userIdResult = await this.getCurrentUserId(userId);
      if (!userIdResult.success) {
        return {
          success: false,
          error: userIdResult.error || 'Failed to get user ID'
        };
      }
      const currentUserId = userIdResult.data!;

      const { error } = await supabase
        .from('profiles')
        .update({
          active_track_id: null,
          track_start_date: null,
          track_current_week: 1,
          track_progress: 0,
          track_week_start_dates: [],
          track_last_week_advancement: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUserId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Active track cleared successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Set active marketing goal for the authenticated user
   * @deprecated This method is deprecated. Use activateTrackForUser instead.
   */
  static async setActiveMarketingGoal(goalId: string): Promise<ApiResponse<void>> {
    try {
      // First, get the goal and its track definition to copy phases
      const { data: goalData, error: goalError } = await supabase
        .from('marketing_goals')
        .select(`
          *,
          marketing_track_definitions!inner(
            id,
            phases
          )
        `)
        .eq('id', goalId)
        .single();

      if (goalError) {
        return {
          success: false,
          error: goalError.message
        };
      }

      // Deactivate all goals for this user (RLS will handle user filtering)
      const { error: deactivateError } = await supabase
        .from('marketing_goals')
        .update({ is_active: false });

      if (deactivateError) {
        return {
          success: false,
          error: deactivateError.message
        };
      }

      // Prepare update data with phases from track definition
      const now = new Date();
      const updateData: any = { 
        is_active: true,
        start_date: now.toISOString(),
        current_week: 1,
        progress: 0,
        week_start_dates: [now.toISOString()], // Week 1 starts now
        last_week_advancement: null
      };
      
      // Copy phases from track definition to marketing goal if available
      if (goalData.marketing_track_definitions?.phases) {
        updateData.phases = goalData.marketing_track_definitions.phases;
        logger.debug('Copying phases from track definition', { goalId });
      }

      // Then activate the specified goal with updated phases
      const { error: activateError } = await supabase
        .from('marketing_goals')
        .update(updateData)
        .eq('id', goalId);

      if (activateError) {
        return {
          success: false,
          error: activateError.message
        };
      }

      return {
        success: true,
        message: 'Active marketing goal updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Sync phases from track definition to marketing goal
   */
  static async syncPhasesFromTrackDefinition(goalId: string): Promise<ApiResponse<void>> {
    try {
      // Get the goal and its track definition
      const { data: goalData, error: goalError } = await supabase
        .from('marketing_goals')
        .select(`
          *,
          marketing_track_definitions!inner(
            id,
            phases
          )
        `)
        .eq('id', goalId)
        .single();

      if (goalError) {
        return {
          success: false,
          error: goalError.message
        };
      }

      // Update the marketing goal with phases from track definition
      if (goalData.marketing_track_definitions?.phases) {
        const { error: updateError } = await supabase
          .from('marketing_goals')
          .update({ phases: goalData.marketing_track_definitions.phases })
          .eq('id', goalId);

        if (updateError) {
          return {
            success: false,
            error: updateError.message
          };
        }

        logger.info('Synced phases from track definition', { goalId });
      }

      return {
        success: true,
        message: 'Phases synced successfully from track definition'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update marketing goal progress
   */
  static async updateMarketingGoalProgress(goalId: string, progress: number): Promise<ApiResponse<MarketingGoal>> {
    try {
      const { data, error } = await supabase
        .from('marketing_goals')
        .update({ progress: progress })
        .eq('id', goalId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const goal = await this.mapDatabaseGoalToGoal(data as DatabaseMarketingGoal);

      return {
        success: true,
        data: goal,
        message: 'Marketing goal progress updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get marketing modules for a track
   */
  static async getMarketingModules(trackId: string): Promise<ApiResponse<MarketingModule[]>> {
    try {
      const { data, error } = await supabase
        .from('marketing_modules')
        .select('*')
        .eq('track_id', trackId)
        .order('week_number', { ascending: true });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      logger.debug('Raw modules from database', { 
        totalModules: data?.length || 0, 
        firstModuleHasProTip: !!data?.[0]?.pro_tip 
      });
      
      // Debug: Check if any modules have pro_tip
      const modulesWithProTip = data?.filter(m => m.pro_tip && m.pro_tip.trim() !== '');
      logger.debug('Modules with pro_tip count', { modulesWithProTip: modulesWithProTip?.length || 0 });

      const modules: MarketingModule[] = await Promise.all(
        data.map(async (module: any) => {
          return await this.mapDatabaseModuleToModule(module);
        })
      );

      return {
        success: true,
        data: modules
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a marketing module
   */
  static async createMarketingModule(moduleData: Omit<MarketingModule, 'id' | 'tasks'> & { trackId: string }): Promise<ApiResponse<MarketingModule>> {
    try {
      const { data, error } = await supabase
        .from('marketing_modules')
        .insert([{
          track_id: moduleData.trackId,
          week_number: moduleData.weekNumber,
          title: moduleData.title,
          description: moduleData.description,
          content: moduleData.content,
          is_unlocked: moduleData.isUnlocked,
          is_completed: moduleData.isCompleted
        }])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const module = await this.mapDatabaseModuleToModule(data);

      return {
        success: true,
        data: module,
        message: 'Marketing module created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get marketing tasks for a module
   */
  static async getMarketingTasks(moduleId: string): Promise<ApiResponse<MarketingTask[]>> {
    try {
      const { data, error } = await supabase
        .from('marketing_tasks')
        .select('*')
        .eq('module_id', moduleId)
        .order('created_at', { ascending: true });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const tasks: MarketingTask[] = data.map((task: any) => {
        const mapped: MarketingTask = {
          id: task.id,
          title: task.title,
          description: task.description || '',
          estimatedTime: task.estimated_time || '',
          isCompleted: task.is_completed,
        };
        if (task.due_date) mapped.dueDate = new Date(task.due_date);
        if (task.task_id) mapped.taskId = task.task_id;
        return mapped;
      });

      return {
        success: true,
        data: tasks
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a marketing task
   */
  static async createMarketingTask(taskData: Omit<MarketingTask, 'id'> & { moduleId: string }): Promise<ApiResponse<MarketingTask>> {
    try {
      const { data, error } = await supabase
        .from('marketing_tasks')
        .insert([{
          module_id: taskData.moduleId,
          title: taskData.title,
          description: taskData.description,
          estimated_time: taskData.estimatedTime,
          is_completed: taskData.isCompleted,
          due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
          task_id: taskData.taskId || null
        }])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const task: MarketingTask = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        estimatedTime: data.estimated_time || '',
        isCompleted: data.is_completed,
      };
      if (data.due_date) task.dueDate = new Date(data.due_date);
      if (data.task_id) task.taskId = data.task_id;

      return {
        success: true,
        data: task,
        message: 'Marketing task created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update marketing task completion status
   */
  static async updateMarketingTaskCompletion(taskId: string, isCompleted: boolean): Promise<ApiResponse<MarketingTask>> {
    try {
      const { data, error } = await supabase
        .from('marketing_tasks')
        .update({ is_completed: isCompleted })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const task: MarketingTask = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        estimatedTime: data.estimated_time || '',
        isCompleted: data.is_completed,
      };
      if (data.due_date) task.dueDate = new Date(data.due_date);
      if (data.task_id) task.taskId = data.task_id;

      return {
        success: true,
        data: task,
        message: 'Marketing task updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Map database goal to frontend goal format
   */
  private static async mapDatabaseGoalToGoal(dbGoal: any): Promise<MarketingGoal> {
    // Get modules for this goal
    const modulesResponse = await this.getMarketingModules(dbGoal.id);
    const modules = modulesResponse.success ? modulesResponse.data || [] : [];

    // Load phases from track definition (source of truth)
    let phases = [];
    try {
      if (dbGoal.track_definition_id) {
        // Get phases from track definition
        const { data: trackDef, error: trackError } = await supabase
          .from('marketing_track_definitions')
          .select('phases')
          .eq('id', dbGoal.track_definition_id)
          .single();

        if (!trackError && trackDef?.phases) {
          if (typeof trackDef.phases === 'string') {
            phases = JSON.parse(trackDef.phases);
          } else if (Array.isArray(trackDef.phases)) {
            phases = trackDef.phases;
          }
        }
      }
      
      // Fallback to phases stored in marketing goal if no track definition
      if (phases.length === 0 && dbGoal.phases) {
        if (typeof dbGoal.phases === 'string') {
          phases = JSON.parse(dbGoal.phases);
        } else if (Array.isArray(dbGoal.phases)) {
          phases = dbGoal.phases;
        }
      }
    } catch (error) {
      logger.error('Error loading phases for track', error);
      phases = [];
    }
    
    const currentPhase = phases.find((phase: any) => 
      dbGoal.current_week >= phase.startWeek && dbGoal.current_week <= phase.endWeek
    ) || phases[0] || { title: 'Phase 1: Spark Traffic', description: 'Get people in the door immediately' };

    const goal: MarketingGoal = {
      id: dbGoal.id,
      title: dbGoal.title,
      description: dbGoal.description || '',
      industry: dbGoal.industry || '',
      duration: dbGoal.duration,
      modules,
      isActive: dbGoal.is_active,
      currentWeek: dbGoal.current_week,
      progress: dbGoal.progress,
      phases: phases,
      currentPhase: currentPhase,
    };
    if (dbGoal.start_date) goal.startDate = dbGoal.start_date;
    if (dbGoal.week_start_dates) goal.weekStartDates = dbGoal.week_start_dates;
    if (dbGoal.last_week_advancement) goal.lastWeekAdvancement = dbGoal.last_week_advancement;
    return goal;
  }

  /**
   * Map database module to frontend module format
   */
  private static async mapDatabaseModuleToModule(dbModule: any): Promise<MarketingModule> {
    // Get tasks for this module
    const tasksResponse = await this.getMarketingTasks(dbModule.id);
    const tasks = tasksResponse.success ? tasksResponse.data || [] : [];

    // Debug pro_tip mapping
    if (dbModule.pro_tip) {
      logger.debug('Mapping pro_tip for module', { moduleId: dbModule.id, hasProTip: true });
    }

    return {
      id: dbModule.id,
      weekNumber: dbModule.week_number,
      title: dbModule.title,
      description: dbModule.description || '',
      content: dbModule.content || '',
      proTip: dbModule.pro_tip, // Include pro_tip field
      tasks,
      isUnlocked: dbModule.is_unlocked,
      isCompleted: dbModule.is_completed
    };
  }

  /**
   * Update phases for a marketing goal
   */
  static async updateMarketingGoalPhases(goalId: string, phases: any[]): Promise<ApiResponse<MarketingGoal>> {
    try {
      logger.info('Updating phases for goal', { goalId, phasesCount: phases.length });

      // Validate phases
      if (!Array.isArray(phases) || phases.length === 0) {
        return {
          success: false,
          error: 'Phases must be a non-empty array'
        };
      }

      // Validate each phase
      for (const phase of phases) {
        if (!phase.title || !phase.description) {
          return {
            success: false,
            error: 'Each phase must have a title and description'
          };
        }
        if (typeof phase.startWeek !== 'number' || typeof phase.endWeek !== 'number') {
          return {
            success: false,
            error: 'Each phase must have valid startWeek and endWeek numbers'
          };
        }
        if (phase.startWeek > phase.endWeek) {
          return {
            success: false,
            error: 'Phase startWeek must be <= endWeek'
          };
        }
      }

      // Convert phases to JSON string for database storage
      const phasesString = JSON.stringify(phases);
      logger.debug('Converting phases to JSON string', { goalId });

      // Update the goal with new phases
      const { data, error } = await supabase
        .from('marketing_goals')
        .update({ phases: phasesString })
        .eq('id', goalId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating phases for goal', error, { goalId });
        return {
          success: false,
          error: error.message
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Goal not found'
        };
      }

      logger.info('Successfully updated phases for goal', { goalId });

      // Return the updated goal
      const updatedGoal = await this.mapDatabaseGoalToGoal(data);
      return {
        success: true,
        data: updatedGoal,
        message: 'Phases updated successfully'
      };

    } catch (error) {
      logger.error('Error updating marketing goal phases', error, { goalId });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      };
    }
  }
} 