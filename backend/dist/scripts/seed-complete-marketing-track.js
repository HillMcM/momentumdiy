"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function seedCompleteMarketingTrack() {
    try {
        console.log('🌱 Seeding complete 12-week marketing track...');
        const { data: existingGoals, error: fetchError } = await supabase_1.supabase
            .from('marketing_goals')
            .select('*')
            .eq('title', 'Increase Local Foot Traffic');
        if (fetchError) {
            console.error('❌ Error fetching existing goals:', fetchError);
            return;
        }
        let goalId;
        if (existingGoals && existingGoals.length > 0) {
            goalId = existingGoals[0].id;
            console.log('📊 Using existing goal:', goalId);
        }
        else {
            const { data: newGoal, error: goalError } = await supabase_1.supabase
                .from('marketing_goals')
                .insert([{
                    title: 'Increase Local Foot Traffic',
                    description: 'Build a comprehensive marketing strategy to drive more local customers to your business through targeted campaigns, community engagement, and digital presence optimization. Phase 1 (Weeks 1-3): Foundation & Immediate Impact - Establish your marketing foundation and see your first measurable results. Phase 2 (Weeks 4-6): Grow Visibility - Expand reach beyond your street to make more people in your surrounding area aware of your business. Phase 3 (Weeks 7-9): Create Buzz - Generate excitement that spreads by enhancing customer experience and creating share-worthy moments. Phase 4 (Weeks 10-12): Cement Loyalty - Turn increased traffic into repeatable systems and loyal relationships through strategic partnerships, customer insights, and celebration of success.',
                    industry: 'Local Business',
                    duration: 12,
                    is_active: true,
                    current_week: 12,
                    progress: 100,
                    start_date: new Date().toISOString()
                }])
                .select()
                .single();
            if (goalError) {
                console.error('❌ Error creating goal:', goalError);
                return;
            }
            goalId = newGoal.id;
            console.log('✅ Created new goal:', goalId);
        }
        const modules = [
            {
                week_number: 1,
                title: 'Launch a Simple In-Store Offer + Signage',
                description: 'Kickstart traffic with an irresistible offer and clear signage. This sets the stage for immediate ROI.',
                content: `<h2>Week 1: Launch a Simple In-Store Offer + Signage</h2>
<p>Before you begin, jot down some baseline metrics – for example, how many walk-ins you get in an average week right now. These numbers will help you see how far you've come by Week 12. Remember to keep the tone fun and stay encouraged: you got this!</p>

<p><strong>Theme:</strong> Kickstart traffic with an irresistible offer and clear signage. This sets the stage for immediate ROI (Return on Investment – basically, seeing a quick payoff for your efforts). By the end of this week, you want to see new faces walking in because of your promotion.</p>

<p><strong>Why this matters:</strong> A limited-time in-store offer (like a special discount or freebie) creates urgency and gives people a reason to visit now, not later. Coupled with eye-catching signage (signs in your window, door, or sidewalk), you'll grab the attention of anyone passing by. Signage is often the first impression of your business – make it count! (Fun fact: a study found about 76% of consumers have entered a store they'd never visited before just because a sign caught their eye. That means a good sign can literally pull new customers in off the street.)</p>

<h4>What to do this week:</h4>
<p>This week focuses on creating and promoting a compelling in-store offer that will immediately attract new customers. You'll measure your current baseline, design an irresistible promotion, create eye-catching signage, and actively promote it both in-store and to passersby. The goal is to see a measurable increase in foot traffic by week's end.</p>

<h4>Pro Tip:</h4>
<p>Keep the vibe positive and fun. When promoting the offer, be excited! For example, "We're doing something special: this week all coffee comes with a free cookie! Hope you enjoy it!" Enthusiasm is contagious and makes customers feel like they're part of something exciting. Also, make sure your team (if you have one) is on the same page and equally informed about the offer details. Lastly, plan for a slight increase in traffic – have enough stock of the item on sale or ingredients for that free cookie, etc. Nothing's worse than drawing people in and then disappointing them by running out.</p>`,
                is_unlocked: true,
                is_completed: true
            },
            {
                week_number: 2,
                title: 'Optimize Google & Local Online Posts',
                description: 'Capture nearby searchers while your in-store offer is running. This week is about your online presence – especially your Google listing – to ensure people searching locally find your business and see a reason to visit.',
                content: `<h2>Week 2: Optimize Google & Local Online Posts</h2>
<p><strong>Theme:</strong> Capture nearby searchers while your in-store offer is running.</p>

<p>This week is about your online presence – especially your Google listing – to ensure people searching locally find your business and see a reason to visit. We'll also do a bit of social posting. Essentially, we're translating your physical offer into the digital realm to reach those who aren't walking by (yet).</p>

<p><strong>Why this matters:</strong> Nowadays, when people need something – a cup of coffee, a gift shop, a haircut – they often search online (think "best coffee near me"). If your business info is up-to-date and appealing, you'll show up in those local searches. And guess what: 88% of consumers who do a local search on their smartphone visit or call a store within a day. We want your business to be the one they find and choose. Optimizing your Google Business Profile (formerly Google My Business) is key for this. Plus, posting on local social media or community pages will spread the word to people who might not pass directly by your storefront.</p>

<h4>What to do this week:</h4>
<p>This week focuses on optimizing your online presence to capture local searchers. You'll update your Google Business Profile, refresh your business photos, leverage social media channels, engage with local searchers, and optimize your content for local search keywords. The goal is to ensure anyone searching for your type of business in your area finds you and sees a compelling reason to visit.</p>

<h4>Pro Tip:</h4>
<p>Think like a customer searching on their phone. What would catch your eye in the search results? Probably a business with good reviews, a clear description, and maybe a note about a special deal. So make sure your online description is compelling. If you're not sure how to word it, you can ask a friend for their opinion or even use an AI assistant to draft a friendly blurb ("What's a catchy way to announce a buy-one-get-one offer for my bakery on Google?"). Also, consistency counts: double-check that your info is correct across platforms (Google, Yelp, Facebook, etc.), so no one gets confused with old hours or wrong addresses. By the end of this week, you want someone sitting a mile away on their couch to see your post or listing and say, "Hey, let's go check this place out!"</p>`,
                is_unlocked: true,
                is_completed: true
            }
        ];
        const { error: deleteError } = await supabase_1.supabase
            .from('marketing_modules')
            .delete()
            .eq('goal_id', goalId);
        if (deleteError) {
            console.error('❌ Error deleting existing modules:', deleteError);
            return;
        }
        const modulesWithGoalId = modules.map(module => ({
            ...module,
            goal_id: goalId
        }));
        const { error: modulesError } = await supabase_1.supabase
            .from('marketing_modules')
            .insert(modulesWithGoalId);
        if (modulesError) {
            console.error('❌ Error inserting modules:', modulesError);
            return;
        }
        console.log('✅ Inserted modules for weeks 1-2');
        const { data: insertedModules, error: fetchModulesError } = await supabase_1.supabase
            .from('marketing_modules')
            .select('id, week_number')
            .eq('goal_id', goalId)
            .order('week_number');
        if (fetchModulesError) {
            console.error('❌ Error fetching inserted modules:', fetchModulesError);
            return;
        }
        if (!insertedModules || insertedModules.length < 2) {
            console.error('❌ Not enough modules were inserted');
            return;
        }
        const tasks = [
            {
                module_id: insertedModules[0].id,
                title: 'Measure your starting point',
                description: 'Record your current foot traffic and sales metrics as a baseline for comparison.',
                estimated_time: '15min',
                is_completed: false,
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                module_id: insertedModules[0].id,
                title: 'Create a simple, juicy offer',
                description: 'Design a promotion that will entice people immediately with discounts, freebies, or special deals.',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: insertedModules[0].id,
                title: 'Prepare your signage',
                description: 'Create bold, clear signs advertising your offer for both outside and inside placement.',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: insertedModules[1].id,
                title: 'Claim or update Google Business Profile',
                description: 'Ensure your Google listing is claimed and all information is accurate and up-to-date.',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: insertedModules[1].id,
                title: 'Refresh business photos',
                description: 'Upload recent, appealing photos of your storefront and products.',
                estimated_time: '30min',
                is_completed: false
            }
        ];
        const { error: tasksError } = await supabase_1.supabase
            .from('marketing_tasks')
            .insert(tasks);
        if (tasksError) {
            console.error('❌ Error inserting tasks:', tasksError);
            return;
        }
        console.log('✅ Inserted tasks for weeks 1-2');
        console.log('🎉 Marketing track seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
    }
}
seedCompleteMarketingTrack();
//# sourceMappingURL=seed-complete-marketing-track.js.map