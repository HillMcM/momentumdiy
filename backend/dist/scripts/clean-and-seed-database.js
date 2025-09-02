"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function cleanAndSeedDatabase() {
    try {
        console.log('🧹 Cleaning and reseeding marketing track database...');
        console.log('🗑️  Deleting existing marketing data...');
        const { error: tasksError } = await supabase_1.supabase
            .from('marketing_tasks')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (tasksError) {
            console.error('❌ Error deleting tasks:', tasksError);
            return;
        }
        console.log('✅ Deleted all marketing tasks');
        const { error: modulesError } = await supabase_1.supabase
            .from('marketing_modules')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (modulesError) {
            console.error('❌ Error deleting modules:', modulesError);
            return;
        }
        console.log('✅ Deleted all marketing modules');
        const { error: goalsError } = await supabase_1.supabase
            .from('marketing_goals')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (goalsError) {
            console.error('❌ Error deleting goals:', goalsError);
            return;
        }
        console.log('✅ Deleted all marketing goals');
        console.log('🌱 Creating clean marketing goal...');
        const { data: newGoal, error: goalError } = await supabase_1.supabase
            .from('marketing_goals')
            .insert([{
                title: 'Increase Local Foot Traffic',
                description: 'Build a comprehensive marketing strategy to drive more local customers to your business through targeted campaigns, community engagement, and digital presence optimization.',
                industry: 'Local Business',
                duration: 12,
                is_active: true,
                start_date: new Date().toISOString(),
                current_week: 1,
                progress: 0,
                week_start_dates: [],
                last_week_advancement: null
            }])
            .select()
            .single();
        if (goalError) {
            console.error('❌ Error creating goal:', goalError);
            return;
        }
        console.log('✅ Created marketing goal:', newGoal.id);
        console.log('📋 Creating modules for weeks 1-4...');
        const modules = [
            {
                week_number: 1,
                title: 'Foundation & Assessment',
                description: 'Establish your marketing foundation and assess current visibility',
                content: 'This week focuses on understanding your current marketing position and setting up the basics for tracking success.',
                is_unlocked: true,
                is_completed: false
            },
            {
                week_number: 2,
                title: 'Google Business Profile Optimization',
                description: 'Optimize your Google presence for local discovery',
                content: 'Make sure customers can find you when they search for your business type in your area.',
                is_unlocked: false,
                is_completed: false
            },
            {
                week_number: 3,
                title: 'Local Visibility & Signage',
                description: 'Increase visibility in your immediate area',
                content: 'Focus on making your business more noticeable to people walking or driving by.',
                is_unlocked: false,
                is_completed: false
            },
            {
                week_number: 4,
                title: 'Community Engagement',
                description: 'Start building relationships with your local community',
                content: 'Begin connecting with neighbors, local businesses, and community groups.',
                is_unlocked: false,
                is_completed: false
            }
        ];
        const { data: insertedModules, error: modulesError2 } = await supabase_1.supabase
            .from('marketing_modules')
            .insert(modules.map(module => ({
            goal_id: newGoal.id,
            ...module
        })))
            .select();
        if (modulesError2) {
            console.error('❌ Error creating modules:', modulesError2);
            return;
        }
        console.log('✅ Created', insertedModules.length, 'modules');
        console.log('✅ Creating tasks for each module...');
        const tasks = [
            {
                module_id: insertedModules[0].id,
                title: 'Audit Current Visibility',
                description: 'Review your current online presence and local visibility. Check Google Business Profile, social media accounts, and local directory listings.',
                estimated_time: '45-60 minutes',
                is_completed: false
            },
            {
                module_id: insertedModules[0].id,
                title: 'Set Up Tracking',
                description: 'Establish baseline metrics for foot traffic, online engagement, and customer inquiries.',
                estimated_time: '30 minutes',
                is_completed: false
            },
            {
                module_id: insertedModules[0].id,
                title: 'Create Simple Offer',
                description: 'Design a simple, attractive offer to drive initial foot traffic (e.g., 10% off first visit, free consultation).',
                estimated_time: '30-45 minutes',
                is_completed: false
            },
            {
                module_id: insertedModules[1].id,
                title: 'Complete Google Business Profile',
                description: 'Fill out all sections of your Google Business Profile with accurate information, photos, and business hours.',
                estimated_time: '60-90 minutes',
                is_completed: false
            },
            {
                module_id: insertedModules[1].id,
                title: 'Optimize for Local Keywords',
                description: 'Add location-based keywords to your business description and posts.',
                estimated_time: '30 minutes',
                is_completed: false
            },
            {
                module_id: insertedModules[1].id,
                title: 'Post Weekly Update',
                description: 'Create and post a weekly update about your business, special offers, or community involvement.',
                estimated_time: '20-30 minutes',
                is_completed: false
            },
            {
                module_id: insertedModules[2].id,
                title: 'Create Eye-Catching Signage',
                description: 'Design and install clear, attractive signage that highlights your offer and makes your business stand out.',
                estimated_time: '2-3 hours',
                is_completed: false
            },
            {
                module_id: insertedModules[2].id,
                title: 'Update Window Displays',
                description: 'Refresh your window displays to showcase your best products or services and current offers.',
                estimated_time: '1-2 hours',
                is_completed: false
            },
            {
                module_id: insertedModules[3].id,
                title: 'Connect with Neighboring Businesses',
                description: 'Introduce yourself to nearby business owners and explore cross-promotion opportunities.',
                estimated_time: '1-2 hours',
                is_completed: false
            },
            {
                module_id: insertedModules[3].id,
                title: 'Join Local Community Groups',
                description: 'Find and join local Facebook groups, neighborhood associations, or business networks.',
                estimated_time: '30-45 minutes',
                is_completed: false
            }
        ];
        const { error: tasksError2 } = await supabase_1.supabase
            .from('marketing_tasks')
            .insert(tasks);
        if (tasksError2) {
            console.error('❌ Error creating tasks:', tasksError2);
            return;
        }
        console.log('✅ Created', tasks.length, 'tasks');
        console.log('🎉 Database cleaned and seeded successfully!');
        console.log('📊 Summary:');
        console.log('  - 1 marketing goal (active)');
        console.log('  - 4 modules (weeks 1-4)');
        console.log('  - 10 tasks total');
        console.log('  - Week 1 unlocked, others locked');
    }
    catch (error) {
        console.error('❌ Error cleaning and seeding database:', error);
    }
}
cleanAndSeedDatabase();
//# sourceMappingURL=clean-and-seed-database.js.map