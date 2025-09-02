"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function addRemainingWeeks() {
    try {
        console.log('🔄 Adding remaining weeks (3-12) to marketing track...');
        const { data: goal, error: goalError } = await supabase_1.supabase
            .from('marketing_goals')
            .select('*')
            .eq('title', 'Increase Local Foot Traffic')
            .single();
        if (goalError || !goal) {
            console.error('❌ Error fetching goal:', goalError);
            return;
        }
        console.log('📊 Found goal:', goal.id);
        const { data: existingModules, error: modulesError } = await supabase_1.supabase
            .from('marketing_modules')
            .select('week_number')
            .eq('goal_id', goal.id)
            .order('week_number');
        if (modulesError) {
            console.error('❌ Error fetching existing modules:', modulesError);
            return;
        }
        const existingWeeks = existingModules?.map(m => m.week_number) || [];
        console.log('📋 Existing weeks:', existingWeeks);
        const allWeeks = [
            {
                week_number: 3,
                title: 'Referral / Bring-a-Friend Boost',
                description: 'Turn your first wave of customers into ambassadors. This week focuses on referrals – encouraging customers to bring a friend or spread the word, effectively multiplying your foot traffic without much extra cost.',
                content: `<h2>Week 3: Referral / Bring-a-Friend Boost</h2>
<p><strong>Theme:</strong> Turn your first wave of customers into ambassadors.</p>

<p>This week focuses on referrals – encouraging customers to bring a friend or spread the word, effectively multiplying your foot traffic without much extra cost. You lit the spark with an offer, caught some eyeballs online, now let's fan the flame by leveraging word-of-mouth (the oldest, most powerful marketing channel).</p>

<p><strong>Why this matters:</strong> People trust recommendations from people they know. In fact, about 92% of consumers trust recommendations from friends and family more than any form of advertising. That's huge! When a happy customer tells a friend, it's like gold. So if you give your current customers a little nudge or reward to refer others, you can get a lot of new visitors at a low cost. Plus, a "bring-a-friend" deal has the bonus of getting your existing customer and their friend in the door together – double traffic!</p>

<h4>What to do this week:</h4>
<p>This week focuses on leveraging word-of-mouth marketing through referrals. You'll design a simple referral offer that rewards both the referrer and new customer, spread the word to all your customers, leverage social proof in-store, track referral activity, and show appreciation to those who bring in referrals. The goal is to turn your satisfied customers into brand ambassadors who actively bring new visitors to your business.</p>

<h4>Pro Tip:</h4>
<p>Word-of-mouth can feel "out of your control," but you can gently steer it. The best way is simply to provide great service (you're working on that!) and to ask for the referral at the right time. For example, after a customer says "I love this place!" you might reply, "Thank you so much! Please tell your friends – we'd love to treat them too." It's casual, friendly, and plants the idea. If you're a bit shy about asking directly, no worries – that's what the referral cards and signs are for. They'll do the talking for you. Finally, keep the barriers low: no complicated signup or forms, just "bring a pal, get reward." The easier and more fun you make it, the more people will participate. And don't forget to enjoy the process – it's actually really rewarding to see your customers become your advocates.</p>

<h4>Milestone Win:</h4>
<p><strong>First measurable bump in walk-ins.</strong> By the end of Week 3, look at the numbers you tracked. You should see an uptick – maybe it's modest, maybe it's big, but it's a visible bump in foot traffic compared to your baseline. That's a huge first win! Pat yourself on the back, because you've successfully sparked some new traffic. Keep that momentum going!</p>`,
                is_unlocked: true,
                is_completed: true
            },
            {
                week_number: 4,
                title: 'Eye-Catching Sidewalk/Window Campaign',
                description: 'Get creative with your curb appeal! This week focuses on making your storefront truly stand out to attract people who might normally walk past.',
                content: `<h2>Week 4: Eye-Catching Sidewalk/Window Campaign</h2>
<p><strong>Theme:</strong> Get creative with your curb appeal!</p>

<p>This week, you'll run a small "campaign" using your sidewalk or window to draw attention. Think of it as taking your signage to the next level – using humor, art, or a catchy message to turn heads and make people stop in their tracks. The goal is to make anyone passing by curious enough to come take a closer look (and then walk in!).</p>

<p><strong>Why this matters:</strong> You've already seen the value of basic signage in Week 1. Now, by making your storefront truly stand out, you can attract people who might normally walk past. A clever sidewalk sign or an attractive window display can become a local talking point. It not only draws foot traffic but can also end up on social media if it's really clever or cute (free advertising!). Plus, it's fun! When you unleash a bit of creativity, you engage your community in a memorable way. Remember that statistic: about 76% of consumers have entered a store for the first time because of a sign. This is our chance to be that sign that lures them in.</p>

<p>One example of a creative sidewalk chalkboard sign reads: "Come in and try the worst meatball sandwich that one guy on Yelp ever had in his life." This humorous approach took a negative review and turned it into a positive marketing tool – it made passersby laugh and piqued their curiosity enough to step inside. Using wit or a playful message on your sign can make your business more approachable and even shareable online, all while drawing in curious new customers.</p>

<h4>What to do this week:</h4>
<p>This week focuses on creative curb appeal that goes beyond basic signage. You'll brainstorm catchy messages or concepts, spruce up your sidewalk signs or window displays, tie content to timely events, observe and adjust based on reactions, and share your creative displays online. The goal is to make your business a local talking point that draws curious new visitors.</p>

<h4>Pro Tip:</h4>
<p>Consistency and personality make a difference. If people start associating your business as "that place with the funny signs" or "the shop that always has the cool window," you're carving out a little niche in their minds. That's branding! Keep the tone consistent with your brand – if you're a playful, quirky store, go wild with humor; if you're a spa or serious business, maybe a calming quote or beautiful imagery fits better. And don't stress about being a professional artist or writer. Authentic, even slightly imperfect, messages can be very endearing. In fact, a hand-drawn cartoon that's a bit silly can make people smile precisely because it's human. Finally, have fun with it! This is one of those marketing tasks where you get to play. Enjoy the creativity – your customers (and future customers) will feel that positive energy and be drawn to it.</p>`,
                is_unlocked: true,
                is_completed: true
            }
        ];
        const newWeeks = allWeeks.filter(week => !existingWeeks.includes(week.week_number));
        if (newWeeks.length === 0) {
            console.log('✅ All weeks already exist');
            return;
        }
        console.log(`📝 Adding ${newWeeks.length} new weeks:`, newWeeks.map(w => w.week_number));
        const modulesWithGoalId = newWeeks.map(week => ({
            ...week,
            goal_id: goal.id
        }));
        const { error: insertError } = await supabase_1.supabase
            .from('marketing_modules')
            .insert(modulesWithGoalId);
        if (insertError) {
            console.error('❌ Error inserting new modules:', insertError);
            return;
        }
        console.log('✅ Successfully added new weeks to marketing track!');
    }
    catch (error) {
        console.error('❌ Error adding remaining weeks:', error);
    }
}
addRemainingWeeks();
//# sourceMappingURL=add-remaining-weeks.js.map