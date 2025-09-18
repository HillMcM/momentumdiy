"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function addSocialMediaTasks() {
    try {
        console.log('🔄 Adding tasks to Social Media track modules...');
        const { data: trackDef, error: trackError } = await supabase_1.supabase
            .from('marketing_track_definitions')
            .select('id')
            .eq('slug', 'social-media-strategy')
            .single();
        if (trackError || !trackDef) {
            console.error('❌ Could not find social media track definition');
            return;
        }
        console.log('📋 Found track definition:', trackDef.id);
        const { data: modules, error: modulesError } = await supabase_1.supabase
            .from('marketing_module_definitions')
            .select('*')
            .eq('track_id', trackDef.id)
            .order('week_number');
        if (modulesError || !modules) {
            console.error('❌ Could not find modules:', modulesError);
            return;
        }
        console.log(`📋 Found ${modules.length} modules`);
        const weeklyTasks = {
            1: [
                {
                    title: 'Run a profile audit',
                    description: 'Check your bio, profile picture, links, and highlights. Your bio should clearly say what you do, your profile pic should be current and professional, and your link should lead to something useful (website, menu, booking, etc.).',
                    estimated_time: '20 min'
                },
                {
                    title: 'Record baseline metrics',
                    description: 'Write down current followers, average likes, average comments, and story views (choose platform tabs).',
                    estimated_time: '15 min'
                },
                {
                    title: 'Publish 3 quick-win posts',
                    description: 'Share your story, one quick tip, and a behind-the-scenes update. These quick wins give you immediate visibility.',
                    estimated_time: '30 min'
                }
            ],
            2: [
                {
                    title: 'Select 3–4 content pillars',
                    description: 'Choose themes that represent your business (e.g., Products, Behind-the-Scenes, Tips, Testimonials).',
                    estimated_time: '20 min'
                },
                {
                    title: 'Brainstorm 15 content ideas',
                    description: 'Write at least 5 ideas per pillar to create your content bank.',
                    estimated_time: '30 min'
                },
                {
                    title: 'Draft 2 sample captions',
                    description: 'Put your pillars into practice immediately with sample posts.',
                    estimated_time: '30 min'
                }
            ],
            3: [
                {
                    title: 'Define brand voice',
                    description: 'Choose 3 words and set tone rules (e.g., friendly, bold, supportive).',
                    estimated_time: '20 min'
                },
                {
                    title: 'Pick brand visuals',
                    description: 'Select 2–3 colors and fonts for consistency.',
                    estimated_time: '20 min'
                },
                {
                    title: 'Design 2–4 Canva templates',
                    description: 'Create templates for tips, promos, or testimonials.',
                    estimated_time: '40 min'
                },
                {
                    title: 'Refresh recent posts',
                    description: 'Update visuals to match your new style.',
                    estimated_time: '20 min'
                }
            ],
            4: [
                {
                    title: 'Identify your 3 core post types',
                    description: 'Focus on Educate, Connect, and Promote.',
                    estimated_time: '15 min'
                },
                {
                    title: 'Draft 1 post idea for each type',
                    description: 'Create sample posts for each category.',
                    estimated_time: '30 min'
                },
                {
                    title: 'Match types to pillars',
                    description: 'Connect your post types to your content pillars.',
                    estimated_time: '20 min'
                },
                {
                    title: 'Create 1 sample Canva design',
                    description: 'Design a template for one post type.',
                    estimated_time: '30 min'
                }
            ],
            5: [
                {
                    title: 'Decide posting frequency',
                    description: 'Choose 3–5 times per week.',
                    estimated_time: '15 min'
                },
                {
                    title: 'Map post types to days',
                    description: 'Assign Educate, Connect, Promote to specific days.',
                    estimated_time: '20 min'
                },
                {
                    title: 'Schedule 1 week of posts',
                    description: 'Plan and schedule a full week in advance.',
                    estimated_time: '45 min'
                },
                {
                    title: 'Create a weekly planning ritual',
                    description: 'Set aside time for content planning.',
                    estimated_time: '15 min'
                }
            ],
            6: [
                {
                    title: 'Create 2–4 Canva templates',
                    description: 'Design reusable branded templates.',
                    estimated_time: '40 min'
                },
                {
                    title: 'Rewrite your bio',
                    description: 'Make it clear and actionable.',
                    estimated_time: '20 min'
                },
                {
                    title: 'Update highlights/pinned posts',
                    description: 'Showcase your best content.',
                    estimated_time: '30 min'
                },
                {
                    title: 'Test your link hub',
                    description: 'Ensure all links work properly.',
                    estimated_time: '15 min'
                }
            ],
            7: [
                {
                    title: 'Reply to all recent comments',
                    description: 'Respond to engagement on your posts.',
                    estimated_time: '10 min'
                },
                {
                    title: 'Respond to DMs',
                    description: 'Keep your direct messages current.',
                    estimated_time: '10 min'
                },
                {
                    title: 'Comment on 3–5 posts',
                    description: 'Engage meaningfully with others\' content.',
                    estimated_time: '15 min'
                },
                {
                    title: 'Start 1 new conversation daily',
                    description: 'Build relationships through interaction.',
                    estimated_time: '15 min'
                }
            ],
            8: [
                {
                    title: 'Create 1 UGC prompt post',
                    description: 'Encourage followers to tag you.',
                    estimated_time: '20 min'
                },
                {
                    title: 'Repost at least 1 customer story',
                    description: 'Share authentic customer content.',
                    estimated_time: '15 min'
                },
                {
                    title: 'Thank/tag contributors',
                    description: 'Show appreciation for user-generated content.',
                    estimated_time: '10 min'
                },
                {
                    title: 'Schedule 1 week of content',
                    description: 'Plan and schedule your next week.',
                    estimated_time: '45 min'
                }
            ],
            9: [
                {
                    title: 'Identify 1 top-performing post',
                    description: 'Find content worth repurposing.',
                    estimated_time: '15 min'
                },
                {
                    title: 'Repurpose into 2 new formats',
                    description: 'Create carousel, reel, or story versions.',
                    estimated_time: '40 min'
                },
                {
                    title: 'Reach out to 1 collaborator',
                    description: 'Connect with local businesses.',
                    estimated_time: '20 min'
                },
                {
                    title: 'Cross-promote at least once',
                    description: 'Share collaborative content.',
                    estimated_time: '30 min'
                }
            ],
            10: [
                {
                    title: 'Draft 3-part post sequence',
                    description: 'Create educate, proof, action sequence.',
                    estimated_time: '45 min'
                },
                {
                    title: 'Design supporting graphics',
                    description: 'Create visuals for your sequence.',
                    estimated_time: '30 min'
                },
                {
                    title: 'Publish a milestone celebration',
                    description: 'Share achievements with your audience.',
                    estimated_time: '20 min'
                },
                {
                    title: 'Thank your audience',
                    description: 'Show appreciation for their support.',
                    estimated_time: '10 min'
                }
            ],
            11: [
                {
                    title: 'Choose a campaign format',
                    description: 'Pick poll, giveaway, or Q&A.',
                    estimated_time: '10 min'
                },
                {
                    title: 'Write clear rules or prompts',
                    description: 'Make participation easy to understand.',
                    estimated_time: '20 min'
                },
                {
                    title: 'Promote it in stories/feed',
                    description: 'Spread the word about your campaign.',
                    estimated_time: '30 min'
                },
                {
                    title: 'Reply to all participants',
                    description: 'Engage with everyone who participates.',
                    estimated_time: '20 min'
                }
            ],
            12: [
                {
                    title: 'Review metrics vs. baseline',
                    description: 'Compare to Week 1 numbers.',
                    estimated_time: '30 min'
                },
                {
                    title: 'List top 3 wins',
                    description: 'Celebrate your achievements.',
                    estimated_time: '15 min'
                },
                {
                    title: 'Choose 1 next-month focus',
                    description: 'Pick your continued growth area.',
                    estimated_time: '15 min'
                },
                {
                    title: 'Pre-schedule 1 week',
                    description: 'Plan ahead for sustained momentum.',
                    estimated_time: '45 min'
                }
            ]
        };
        for (const module of modules) {
            const tasks = weeklyTasks[module.week_number];
            if (!tasks) {
                console.log(`⚠️ No tasks defined for week ${module.week_number}`);
                continue;
            }
            console.log(`📝 Adding ${tasks.length} tasks to Week ${module.week_number}: ${module.title}`);
            for (const task of tasks) {
                const { error: taskError } = await supabase_1.supabase
                    .from('marketing_task_definitions')
                    .insert({
                    module_id: module.id,
                    title: task.title,
                    description: task.description,
                    estimated_time: task.estimated_time,
                    order_index: tasks.indexOf(task)
                });
                if (taskError) {
                    console.error(`❌ Error adding task "${task.title}":`, taskError);
                }
                else {
                    console.log(`✅ Added task: ${task.title}`);
                }
            }
        }
        console.log('🎉 Successfully added tasks to Social Media track!');
    }
    catch (error) {
        console.error('❌ Error adding social media tasks:', error);
    }
}
if (require.main === module) {
    addSocialMediaTasks().then(() => process.exit(0));
}
exports.default = addSocialMediaTasks;
//# sourceMappingURL=add-social-media-tasks.js.map