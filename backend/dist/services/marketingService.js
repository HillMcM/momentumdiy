"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingService = void 0;
const supabase_1 = require("../config/supabase");
class MarketingService {
    static async getMarketingGoals() {
        try {
            const { data, error } = await supabase_1.supabase
                .from('marketing_goals')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
            const goals = await Promise.all(data.map(async (dbGoal) => {
                return await this.mapDatabaseGoalToGoal(dbGoal);
            }));
            return {
                success: true,
                data: goals
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async getActiveMarketingGoal() {
        try {
            const { data, error } = await supabase_1.supabase
                .from('marketing_goals')
                .select(`
          *,
          marketing_track_definitions!inner(
            phases,
            title as track_title,
            description as track_description
          )
        `)
                .eq('is_active', true)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return {
                        success: true,
                        data: null
                    };
                }
                return {
                    success: false,
                    error: error.message
                };
            }
            const goal = await this.mapDatabaseGoalToGoal(data);
            return {
                success: true,
                data: goal
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async createMarketingGoal(goalData) {
        try {
            if (goalData.isActive) {
                const { error: deactivateError } = await supabase_1.supabase
                    .from('marketing_goals')
                    .update({ is_active: false })
                    .eq('is_active', true);
                if (deactivateError) {
                    console.error('Error deactivating existing goals:', deactivateError);
                }
            }
            const { data, error } = await supabase_1.supabase
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
            const goal = await this.mapDatabaseGoalToGoal(data);
            return {
                success: true,
                data: goal,
                message: 'Marketing goal created successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async updateMarketingGoal(id, updates) {
        try {
            const updateData = {};
            if (updates.title !== undefined)
                updateData.title = updates.title;
            if (updates.description !== undefined)
                updateData.description = updates.description;
            if (updates.industry !== undefined)
                updateData.industry = updates.industry;
            if (updates.duration !== undefined)
                updateData.duration = updates.duration;
            if (updates.isActive !== undefined)
                updateData.is_active = updates.isActive;
            if (updates.startDate !== undefined) {
                updateData.start_date = updates.startDate ? new Date(updates.startDate).toISOString() : null;
            }
            const { data, error } = await supabase_1.supabase
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
            const goal = await this.mapDatabaseGoalToGoal(data);
            return {
                success: true,
                data: goal,
                message: 'Marketing goal updated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async deleteMarketingGoal(id) {
        try {
            const { error } = await supabase_1.supabase
                .from('marketing_goals')
                .delete()
                .eq('id', id);
            if (error) {
                return { success: false, error: error.message };
            }
            return { success: true, message: 'Marketing goal deleted successfully' };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
        }
    }
    static async seedSocialMediaModules(goalId) {
        try {
            const existing = await this.getMarketingModules(goalId);
            if (existing.success && (existing.data?.length || 0) > 0) {
                return { success: true, message: 'Modules already exist; skipping seed' };
            }
            const weekDefs = [
                { title: 'Social Audit & Baseline Tracking', description: 'Audit your profile and record baseline metrics', content: 'Audit your profile and feed. Record followers, avg likes/comments, story views. Try a simple 5-day posting rhythm.', tasks: [
                        { title: 'Quick Social Audit', description: 'Profile, content cadence, and highlights check', estimatedTime: '30-45m' },
                        { title: 'Record Baseline Metrics', description: 'Followers, avg likes, avg comments, story views', estimatedTime: '15-20m' },
                        { title: 'Follow 5-Day Plan', description: 'Post M-F using a simple plan', estimatedTime: '2-3h' }
                    ] },
                { title: 'Clarify Content Pillars', description: 'Choose 3–4 brand-aligned pillars', content: 'Pick pillars and map a refined 5-day plan.', tasks: [
                        { title: 'Choose Pillars', description: 'Select 3–4 content themes', estimatedTime: '20-30m' },
                        { title: 'Refine Weekly Plan', description: 'Map your M–F schedule', estimatedTime: '30-45m' }
                    ] },
                { title: 'Brand Voice & Visual Tone', description: 'Define voice and visuals', content: 'Create a one-page voice/visual style.', tasks: [
                        { title: 'Define Voice', description: 'Pick 3 words + emoji/tone rules', estimatedTime: '20-30m' },
                        { title: 'Visual Style', description: 'Choose fonts/colors and example posts', estimatedTime: '30-45m' }
                    ] },
                { title: 'Create 3 Core Post Types', description: 'Educate / Promote / Connect', content: 'Set your 3 reusable post types.', tasks: [
                        { title: 'Draft Post Type Outlines', description: 'Headlines and examples for each type', estimatedTime: '30-45m' }
                    ] },
                { title: 'Weekly Content Plan', description: 'Build a realistic weekly rhythm', content: 'Pick posting frequency and map days → types.', tasks: [
                        { title: 'Choose Frequency', description: '3–5 posts/week plan', estimatedTime: '15-20m' },
                        { title: 'Calendar Plan', description: 'Assign types to days', estimatedTime: '30-45m' }
                    ] },
                { title: 'Design Templates', description: 'Create 2–4 reusable templates', content: 'Design simple Canva templates for speed and consistency.', tasks: [
                        { title: 'Design Tip/FAQ Template', description: 'One template for educate posts', estimatedTime: '45-60m' },
                        { title: 'Design Promo Template', description: 'One template for offers', estimatedTime: '45-60m' }
                    ] },
                { title: 'Improve Profile & Links', description: 'Polish bio, links, and pinned posts', content: 'Clarify who you help, what you offer, and next step.', tasks: [
                        { title: 'Rewrite Bio', description: 'Who you help • what you offer • CTA', estimatedTime: '20-30m' },
                        { title: 'Update Links', description: 'Clean up link-in-bio', estimatedTime: '15-20m' }
                    ] },
                { title: 'Schedule One Week Ahead', description: 'Plan and schedule one week', content: 'Prepare captions, visuals, and schedule posts.', tasks: [
                        { title: 'Prep Content', description: 'Captions + visuals for the week', estimatedTime: '2-3h' },
                        { title: 'Schedule Posts', description: 'Use Meta Business Suite or tool', estimatedTime: '30-45m' }
                    ] },
                { title: 'Daily Engagement Habit', description: 'Engage 10 minutes/day', content: 'Short daily routine to build relationships and reach.', tasks: [
                        { title: '10-Minute Routine', description: 'Comment, reply, react, connect', estimatedTime: '10m/day' }
                    ] },
                { title: 'Repurpose a Past Post', description: 'Reuse a strong post with a twist', content: 'Pick a past winner and refresh format/CTA.', tasks: [
                        { title: 'Find Past Post', description: 'Choose a strong post to refresh', estimatedTime: '20-30m' }
                    ] },
                { title: 'Mini Engagement Campaign', description: 'Run a small poll/giveaway/Q&A', content: 'Spark interaction to boost reach.', tasks: [
                        { title: 'Plan Campaign', description: 'Pick format and announce rules', estimatedTime: '45-60m' }
                    ] },
                { title: 'Review & Next 30-Day Plan', description: 'Reflect metrics and set focus', content: 'Compare to baseline and pick one focus for next month.', tasks: [
                        { title: 'Review Insights', description: 'Compare metrics vs. week 1', estimatedTime: '30-45m' }
                    ] }
            ];
            weekDefs.forEach((_def, _i) => { });
            for (let i = 0; i < weekDefs.length; i++) {
                const weekNumber = i + 1;
                const def = weekDefs[i];
                const { data: moduleRow, error: moduleErr } = await supabase_1.supabase
                    .from('marketing_modules')
                    .insert([{ goal_id: goalId, week_number: weekNumber, title: def.title, description: def.description, content: def.content, is_unlocked: weekNumber === 1, is_completed: false }])
                    .select('*')
                    .single();
                if (moduleErr) {
                    return { success: false, error: moduleErr.message };
                }
                const moduleId = moduleRow.id;
                for (const t of def.tasks) {
                    const { error: taskErr } = await supabase_1.supabase
                        .from('marketing_tasks')
                        .insert([{ module_id: moduleId, title: t.title, description: t.description, estimated_time: t.estimatedTime, is_completed: false }]);
                    if (taskErr) {
                        return { success: false, error: taskErr.message };
                    }
                }
            }
            return { success: true, message: 'Seeded 12-week social media modules' };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
        }
    }
    static async setActiveMarketingGoal(goalId) {
        try {
            const { error: deactivateError } = await supabase_1.supabase
                .from('marketing_goals')
                .update({ is_active: false })
                .neq('id', '00000000-0000-0000-0000-000000000000');
            if (deactivateError) {
                return {
                    success: false,
                    error: deactivateError.message
                };
            }
            const { error: activateError } = await supabase_1.supabase
                .from('marketing_goals')
                .update({ is_active: true })
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async updateMarketingGoalProgress(goalId, progress) {
        try {
            const { data, error } = await supabase_1.supabase
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
            const goal = await this.mapDatabaseGoalToGoal(data);
            return {
                success: true,
                data: goal,
                message: 'Marketing goal progress updated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async getMarketingModules(goalId) {
        try {
            const { data, error } = await supabase_1.supabase
                .from('marketing_modules')
                .select('*')
                .eq('goal_id', goalId)
                .order('week_number', { ascending: true });
            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
            const modules = await Promise.all(data.map(async (module) => {
                return await this.mapDatabaseModuleToModule(module);
            }));
            return {
                success: true,
                data: modules
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async createMarketingModule(moduleData) {
        try {
            const { data, error } = await supabase_1.supabase
                .from('marketing_modules')
                .insert([{
                    goal_id: moduleData.goalId,
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async getMarketingTasks(moduleId) {
        try {
            const { data, error } = await supabase_1.supabase
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
            const tasks = data.map((task) => {
                const mapped = {
                    id: task.id,
                    title: task.title,
                    description: task.description || '',
                    estimatedTime: task.estimated_time || '',
                    isCompleted: task.is_completed,
                };
                if (task.due_date)
                    mapped.dueDate = new Date(task.due_date);
                if (task.task_id)
                    mapped.taskId = task.task_id;
                return mapped;
            });
            return {
                success: true,
                data: tasks
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async createMarketingTask(taskData) {
        try {
            const { data, error } = await supabase_1.supabase
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
            const task = {
                id: data.id,
                title: data.title,
                description: data.description || '',
                estimatedTime: data.estimated_time || '',
                isCompleted: data.is_completed,
            };
            if (data.due_date)
                task.dueDate = new Date(data.due_date);
            if (data.task_id)
                task.taskId = data.task_id;
            return {
                success: true,
                data: task,
                message: 'Marketing task created successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async updateMarketingTaskCompletion(taskId, isCompleted) {
        try {
            const { data, error } = await supabase_1.supabase
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
            const task = {
                id: data.id,
                title: data.title,
                description: data.description || '',
                estimatedTime: data.estimated_time || '',
                isCompleted: data.is_completed,
            };
            if (data.due_date)
                task.dueDate = new Date(data.due_date);
            if (data.task_id)
                task.taskId = data.task_id;
            return {
                success: true,
                data: task,
                message: 'Marketing task updated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async mapDatabaseGoalToGoal(dbGoal) {
        const modulesResponse = await this.getMarketingModules(dbGoal.id);
        const modules = modulesResponse.success ? modulesResponse.data || [] : [];
        const phases = dbGoal.marketing_track_definitions?.phases || [];
        const currentPhase = phases.find((phase) => dbGoal.current_week >= phase.startWeek && dbGoal.current_week <= phase.endWeek) || phases[0] || { title: 'Phase 1: Spark Traffic', description: 'Get people in the door immediately' };
        const goal = {
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
        if (dbGoal.start_date)
            goal.startDate = new Date(dbGoal.start_date);
        if (dbGoal.week_start_dates)
            goal.weekStartDates = dbGoal.week_start_dates.map((date) => new Date(date));
        if (dbGoal.last_week_advancement)
            goal.lastWeekAdvancement = new Date(dbGoal.last_week_advancement);
        return goal;
    }
    static async mapDatabaseModuleToModule(dbModule) {
        const tasksResponse = await this.getMarketingTasks(dbModule.id);
        const tasks = tasksResponse.success ? tasksResponse.data || [] : [];
        return {
            id: dbModule.id,
            weekNumber: dbModule.week_number,
            title: dbModule.title,
            description: dbModule.description || '',
            content: dbModule.content || '',
            tasks,
            isUnlocked: dbModule.is_unlocked,
            isCompleted: dbModule.is_completed
        };
    }
}
exports.MarketingService = MarketingService;
//# sourceMappingURL=marketingService.js.map