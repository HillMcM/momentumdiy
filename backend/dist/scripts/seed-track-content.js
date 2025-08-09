"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const supabase_1 = require("../config/supabase");
async function main() {
    const goalTitle = 'Improve social media strategy & engagement';
    const weekContent = {
        1: `# Week 1: Social Audit & Baseline Tracking\n\nSubject: Week 1: Let’s Audit Your Socials + Try a Simple Content Flow 👣📱\n\n📍 Momentum Monday\n\nQuarterly Goal: Improve Social Media Strategy & Engagement\nWeek 1 Focus: Social Audit + Baseline Metrics + Easy Week 1 Content Plan\n\nHi [Client First Name],\n\nWelcome to your new quarter of Momentum Marketing! 🎉\n\nOver the next 12 weeks, we’ll strengthen your social media presence by focusing on smart strategy, easy systems, and engaging content that reflects the heart of your business.\n\nThis week we’re kicking off with a full audit of where you are now, plus a simple week-long content plan you can follow to build consistency without stress.\n\n🎯 This Week’s Focus\nAudit your current profile + content, track a few key numbers, and test out a basic 5-day posting rhythm.\n\n✅ Step 1: Quick Social Audit\nProfile\n- Bio clearly says what you do\n- Profile pic is current and professional\n- Link leads to something useful (website, menu, booking, etc.)\n- Highlight covers or pinned posts reflect your top offers\n\nContent\n- You post at least 2x/week (goal is 3–5)\n- Visuals are clear and branded\n- Captions offer value or invite engagement\n\nEngagement Metrics (record):\n- Avg likes per post: _____\n- Avg comments per post: _____\n- Story views (if used): _____\n- Current follower count: _____\n\n🗓️ Step 2: Try This 5-Day Social Content Plan (Week 1)\nMon: Behind-the-Scenes — “Here’s what we’re working on this week…”\nTue: Tip or FAQ — Answer a common question or give a useful tip\nWed: Personal Story — Why you started or something you’re proud of\nThu: Product/Service Feature — Show it, describe it, invite people in\nFri: Fun/Community — Shout out a local business or post something light\n\nHow I can help this week\n- Review your social profile and give you a mini audit\n- Identify your 1–2 strongest post types\n- Polish your bio or link setup\n- Draft a caption or two based on this week’s plan\n\nQuick Tip\n“Social strategy starts with clarity—not just content.”\n`,
        2: `# Week 2: Clarify your content pillars (topics/themes)\n\nSubject: Week 2: What Should You Actually Post About? Let’s Simplify That. 🎯\n\n📍 Momentum Monday\n\nQuarterly Goal: Improve Social Media Strategy & Engagement\nWeek 2 Focus: Define Your Content Pillars + Start a More Strategic Posting Flow\n\nHi [Client First Name],\n\nOne of the hardest parts of showing up consistently is knowing what to say. This week we’ll define your 3–4 Content Pillars—go-to buckets for content creation—then use a refined 5-day plan.\n\n🎯 Focus\nChoose your 3–4 brand-aligned content pillars + post with more intention.\n\n✅ Step 1: Choose Your Pillars\nExamples\n- Products/Services\n- Behind-the-Scenes\n- Customer Stories\n- Tips & Education\n- Promotions / Events\n- Personal Story / Values\n- Local Love / Community\n- Visual Inspiration\n\n✅ Step 2: Refined 5-Day Plan\nMon: Meet the Maker (Behind the Scenes)\nTue: Teach or Tip (Education / Products)\nWed: Testimonial or Win (Customer Love)\nThu: Offer or Product Feature (Promotion)\nFri: Community Boost (Local / Fun)\n\nHow I can help\n- Workshop your pillars\n- Draft post prompts\n- Edit your bio to reflect focus\n- Design 1 branded template per pillar\n\nQuick Tip\n“You don’t need to be everywhere—you just need to be consistent in the right places.”\n`,
        3: `# Week 3: Define your ideal customer voice + visual tone\n\nSubject: Week 3: How Should Your Brand Sound and Look Online? 🎤🎨\n\n📍 Momentum Monday\n\nFocus: Create a simple voice + visual style guide so posts feel cohesive and on brand.\n\n✅ Step 1: Brand Voice\n- Choose 3 words (e.g., Friendly, knowledgeable, clear)\n- Emoji policy, tone, and POV (I/we/brand)\n\n✅ Step 2: Visual Tone\n- Consistent colors, fonts, photo style\n- 1–2 fonts, 2–3 colors\n- Start simple Canva templates\n\nHow I can help\n- Voice/visual suggestions\n- Canva template creation\n- Caption/bio refinement\n\nQuick Tip\n“People follow accounts that feel familiar. Consistency builds trust—even in tone and colors.”\n`,
        4: `# Week 4: Create 3 core post types (educate, promote, connect)\n\nSubject: Week 4: Never Wonder What to Post Again 💡📣❤️\n\n📍 Momentum Monday\n\nFocus: Choose + create your 3 core post types so content always has purpose and variety.\n\nCore Types\n1) Educate — teach something useful\n2) Promote — sell without selling\n3) Connect — humanize your brand\n\nWeekly rhythm example\nMon: Educate\nTue: Connect\nWed: Educate\nThu: Promote\nFri: Connect\n\nQuick Tip\n“You don’t need to reinvent the wheel. You need to rotate between 3 good ones.”\n`,
        5: `# Week 5: Build a simple weekly content plan\n\nSubject: Week 5: Your Weekly Social Plan—Simplified, Systemized, Ready ✅\n\n📍 Momentum Monday\n\nFocus: Create a weekly posting plan you can actually stick to.\n\n✅ Step 1: Posting Frequency\n- Beginner: 3×/week\n- Confident: 4–5×/week\n\n✅ Step 2: Map Post Types to Days\nMon Educate / Tue Connect / Wed Educate / Thu Promote / Fri Connect\n\n✅ Step 3: Choose When You’ll Plan + Post\n- Schedule planning hour\n- Batch graphics/captions\n\nQuick Tip\n“Planning your content doesn’t make you rigid—it makes you free.”\n`,
        6: `# Week 6: Design branded post templates or layouts\n\nSubject: Week 6: Design Your Go-To Social Templates 🎨✨\n\n📍 Momentum Monday\n\nFocus: Create 2–4 reusable Canva templates for your top post types.\n\nTemplate ideas\n- Tip/FAQ\n- Product/Offer Promo\n- Testimonial\n- Local shoutout/quote/event\n\nKeep it simple; editable in under 5 minutes.\n\nQuick Tip\n“Templates make your brand look consistent—and your workflow feel easier.”\n`,
        7: `# Week 7: Improve your profile bios, links, and highlights\n\nSubject: Week 7: Turn Your Social Profile Into a First Impression That Works 💼📲\n\n📍 Momentum Monday\n\nFocus: Clarity in bio, links, and highlights/pinned posts.\n\nBio formula\n- What you do or offer\n- City or neighborhood\n- Clear call to action\n\nClean up links; refresh highlights/pins to reflect current offer.\n\nQuick Tip\n“Your profile is a 24/7 greeter. Make it clear, warm, and confident.”\n`,
        8: `# Week 8: Schedule 1 week of content in advance\n\nSubject: Week 8: Schedule a Full Week of Content 📅✅\n\n📍 Momentum Monday\n\nFocus: Plan, design, write, and schedule one week of posts ahead.\n\nTools: Meta Business Suite, Later, Planoly, Buffer.\n\nQuick Tip\n“Content is easiest when it’s not urgent.”\n`,
        9: `# Week 9: Engage daily for 10 mins using the “comment ladder”\n\nSubject: Week 9: Boost Engagement with 10 Minutes of Daily Connection 💬📈\n\n📍 Momentum Monday\n\nFocus: Build a 10-minute daily engagement habit.\n\nRoutine\n1) Warm up (2m): replies/DMs/tags\n2) Give love (5m): thoughtful comments on 3–5 posts\n3) Start a convo (3m): stories/hashtags/new follows\n\nQuick Tip\n“Don’t just post and ghost. A like is polite, but a comment starts a conversation.”\n`,
        10: `# Week 10: Reuse 1 old post with a fresh spin\n\nSubject: Week 10: Reuse a Past Post—Great Content Deserves a Comeback 🔁✨\n\n📍 Momentum Monday\n\nFocus: Pick a strong post and remix it (carousel, reel, graphic, updated CTA).\n\nQuick Tip\n“If it was valuable once, it’s worth repeating.”\n`,
        11: `# Week 11: Run a mini engagement campaign (giveaway, poll, Q&A)\n\nSubject: Week 11: Create a Mini Engagement Campaign 🎉📲\n\n📍 Momentum Monday\n\nFocus: Spark interaction through polls, giveaways, fun prompts, or Q&A.\n\nMake participation and timing clear. Even 15–20 interactions is a win for local brands.\n`,
        12: `# Week 12: Review insights + set up next 30-day plan\n\nSubject: Week 12: Celebrate + Plan What’s Next 🎉📈\n\n📍 Momentum Monday\n\nFocus: Reflect on results, check metrics vs. Week 1, set a 30-day focus.\n\nQuick Tip\n“Consistency beats perfection. Keep showing up, and you’ll keep growing.”\n`,
    };
    const { data: goals, error: goalsErr } = await supabase_1.supabase
        .from('marketing_goals')
        .select('id, title');
    if (goalsErr)
        throw goalsErr;
    const goal = (goals || []).find(g => g.title?.trim().toLowerCase() === goalTitle.toLowerCase());
    if (!goal) {
        throw new Error(`Goal not found by title: ${goalTitle}`);
    }
    const goalId = goal.id;
    const { data: modules, error: modsErr } = await supabase_1.supabase
        .from('marketing_modules')
        .select('id, week_number')
        .eq('goal_id', goalId)
        .order('week_number', { ascending: true });
    if (modsErr)
        throw modsErr;
    for (const [weekStr, content] of Object.entries(weekContent)) {
        const week = parseInt(weekStr, 10);
        const mod = (modules || []).find(m => m.week_number === week);
        if (!mod)
            continue;
        const { error: updErr } = await supabase_1.supabase
            .from('marketing_modules')
            .update({ content })
            .eq('id', mod.id);
        if (updErr)
            throw updErr;
    }
    console.log('✅ Seeded long-form weekly content for:', goalTitle);
}
main().catch(err => {
    console.error('Seeding failed:', err instanceof Error ? err.message : err);
    process.exit(1);
});
//# sourceMappingURL=seed-track-content.js.map