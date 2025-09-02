"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function restoreCompleteTasks() {
    try {
        console.log('🔄 Restoring complete tasks for all 12 weeks from backup branch...');
        const { data: goal, error: goalError } = await supabase_1.supabase
            .from('marketing_goals')
            .select('*')
            .eq('is_active', true)
            .single();
        if (goalError || !goal) {
            console.error('❌ Error finding active goal:', goalError);
            return;
        }
        const { data: modules, error: modulesError } = await supabase_1.supabase
            .from('marketing_modules')
            .select('*')
            .eq('goal_id', goal.id)
            .order('week_number');
        if (modulesError || !modules) {
            console.error('❌ Error finding modules:', modulesError);
            return;
        }
        console.log('📊 Found active goal:', goal.title);
        console.log('📋 Found', modules.length, 'modules');
        console.log('🗑️  Deleting existing tasks...');
        const { error: deleteError } = await supabase_1.supabase
            .from('marketing_tasks')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (deleteError) {
            console.error('❌ Error deleting existing tasks:', deleteError);
            return;
        }
        console.log('✅ Deleted existing tasks');
        const allTasks = [
            {
                module_id: modules[0].id,
                title: 'Measure your starting point',
                description: 'Before anything else, record your current foot traffic. For example, count how many people come in this week normally. This is your baseline to compare later. Also note any daily sales or other metrics you care about.',
                estimated_time: '15min',
                is_completed: false
            },
            {
                module_id: modules[0].id,
                title: 'Create a simple, juicy offer',
                description: 'Think of a promotion that will entice folks immediately. It could be "Buy one, get one 50% off," "Free dessert with any meal," or "10% off for first-time customers." Make it easy to understand and valuable enough that people feel they shouldn\'t miss it. (Keep your costs in mind, but often a small perk can go a long way.) If you\'re unsure what offer would appeal, brainstorm a few ideas – maybe even ask a couple of regulars what would excite them, or use an AI assistant to suggest popular promotions in your industry.',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: modules[0].id,
                title: 'Prepare your signage',
                description: 'Once your offer is decided, advertise it with a bold sign. For example, a chalkboard on the sidewalk or a bright poster in your window that says "This Week Only: [Your Offer]!" Use big, clear letters. Someone walking or driving by should grasp it in seconds. Include a call to action like "Come in today" or an arrow pointing inside. If designing signs isn\'t your forte, you could ask a crafty friend for help or even get a quick design idea from an AI tool – but a hand-written enthusiastic message works fine too!',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: modules[0].id,
                title: 'Promote in-store',
                description: 'Tell every customer who comes in about the offer. If they buy something, make sure they know about the deal (maybe they\'ll purchase more or tell a friend). You can say, "By the way, we have a special this week…" Also, place the sign where even people just walking by or driving slowly can see it. Consider both outside and inside placement (window, near the entrance, at the register). The goal is that no one in the vicinity misses your special deal.',
                estimated_time: '20min',
                is_completed: false
            },
            {
                module_id: modules[0].id,
                title: 'Run the offer for a limited time',
                description: 'A short timeframe (like one week or two weeks maximum) adds urgency. Let customers know it\'s "for a limited time." This encourages immediate action. At the end of the promo period, you\'ll also be able to clearly see the bump it gave you. (Pro Tip: If the offer is doing really well and you\'re able, you might extend it a bit — but generally, stick to the deadline so customers learn to jump on your deals.)',
                estimated_time: '10min',
                is_completed: false
            },
            {
                module_id: modules[1].id,
                title: 'Claim or update Google Business Profile',
                description: 'If you haven\'t claimed your Google listing, do that first. Make sure all info is accurate: correct address, phone, hours of operation, and website link. Add your logo or a profile image if not there. This week, add a post on your Google profile about your special offer.',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: modules[1].id,
                title: 'Refresh your business photos',
                description: 'Take a few new photos of your business (inside and out) and upload them to your Google profile. Good photos make a huge difference in attracting customers. Show your best angles, maybe a shot of your current offer or signage.',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: modules[1].id,
                title: 'Post on local social media',
                description: 'Share your offer on Facebook, Instagram, or other platforms you use. Use local hashtags (like #[YourCity] or #[YourNeighborhood]) to reach people in your area. Include a photo of your signage or the offer itself.',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: modules[1].id,
                title: 'Engage with local searchers',
                description: 'Respond to any reviews or questions on your Google profile. If someone asks about your hours or services, answer promptly and mention your current offer if relevant.',
                estimated_time: '20min',
                is_completed: false
            },
            {
                module_id: modules[2].id,
                title: 'Create shareable content',
                description: 'Design something that customers will want to share – maybe a fun photo opportunity, a unique product display, or an interesting story about your business. Think about what would make someone want to post about your place on social media.',
                estimated_time: '60min',
                is_completed: false
            },
            {
                module_id: modules[2].id,
                title: 'Encourage customer photos',
                description: 'Set up a photo-friendly area in your store and encourage customers to take pictures. You could have a fun backdrop, interesting props, or just make sure your space is Instagram-worthy. Ask customers to tag you when they post.',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: modules[2].id,
                title: 'Start conversations',
                description: 'Engage more with customers – ask about their day, remember their names, share interesting stories about your products. The more personal connection you create, the more likely they are to talk about you to others.',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: modules[3].id,
                title: 'Implement a loyalty program',
                description: 'Create a simple system to reward repeat customers – punch cards, digital rewards, or special member benefits. Make it easy to understand and valuable enough that customers want to participate.',
                estimated_time: '60min',
                is_completed: false
            },
            {
                module_id: modules[3].id,
                title: 'Collect customer contact info',
                description: 'Start gathering email addresses or phone numbers (with permission) so you can stay in touch with customers. Offer something valuable in exchange, like exclusive deals or early access to new products.',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: modules[3].id,
                title: 'Follow up with new customers',
                description: 'Reach out to customers who visited for the first time this week. Thank them for coming in and invite them back with a special offer or just a friendly message.',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: modules[4].id,
                title: 'Join Nextdoor (or update your Business Page)',
                description: 'If you haven\'t already, get on Nextdoor. Nextdoor has a feature for businesses – you can create a business profile where you list your services, hours, and can post updates. If you prefer, you can also participate as an individual (some neighborhoods prefer recommendations coming from community members rather than self-promotion). First, see if you can claim your business on Nextdoor: search for your business name on Nextdoor\'s business section. If it exists, claim it; if not, create a new profile. Fill out the basics (description, contact info, a nice cover photo). Post a friendly introduction to the neighborhood: e.g., "Hi neighbors! We\'re [Your Business Name], a [type of business] located on Main St. We just wanted to introduce ourselves here. We love being a part of the community and hope you\'ll stop by sometime – we\'re the green storefront next to the post office. Feel free to reach out if you have any questions about [your product/service], we\'re always happy to help!" Keep it neighborly, not salesy. This is about making your name familiar.',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: modules[4].id,
                title: 'Engage in a local Facebook/Community Group',
                description: 'Find one or two popular local groups online. Common ones: "You Know You\'re From [Town] If… (community chat)", "[Town] Community Board", or interest-based ones like "[Town] Foodies" if you\'re a restaurant. Request to join (if closed group) and observe the vibe. Many groups have specific days or threads for business postings – check the rules. This week, make a contribution. It could be: sharing a local tip or event (not directly about your business, to build goodwill), or if allowed, a soft promotion. For instance, in a local parenting group, a kids\' bookstore owner might share "10 Favorite Bedtime Stories – as recommended by our little customers!" with a note like "(Compiled by [Bookstore Name] in town – happy to help if you\'re looking for book ideas!)". The point is to provide value or genuine engagement, rather than just "ad, ad, ad." By doing so, you become known and trusted. Then when someone asks "Any good bookstores around?", group members might tag you or recall your helpful post.',
                estimated_time: '60min',
                is_completed: false
            },
            {
                module_id: modules[4].id,
                title: 'Leverage the local Chamber or community boards',
                description: 'If your town has a Chamber of Commerce, a downtown alliance, or even a local newspaper with an events calendar or local business spotlight – use it. This could mean submitting your business info to a local directory, or asking the Chamber if they\'ll mention your ongoing promotion or event (from last week or upcoming) in their newsletter. Some Chambers have "member news" or will do a shout-out if you\'re a member (if you\'re not a member, consider if joining makes sense – they often help promote local businesses). Also, check physical community boards (library, community center, coffee shops) – do they allow flyers? Pin up a nice flyer about your business or current deal there. It\'s low-tech, but still part of hyper-local presence!',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: modules[4].id,
                title: 'Start your own neighborhood conversation',
                description: 'Consider making a helpful post on Nextdoor or other platforms that isn\'t a direct ad but highlights your expertise. For example, a garden supply store could post "5 Tips to Prep Your Garden for Winter (from a local gardener)" and sign off with your name/business. Or a bakery might post in "Recipes" section with a simple recipe, mentioning people can find the ingredients at your shop. Think of it as content marketing but hyper-local. It builds your reputation as the local expert in your field. When people realize "Oh, that\'s the bakery that shared that recipe, nice!" they feel more inclined to visit.',
                estimated_time: '40min',
                is_completed: false
            },
            {
                module_id: modules[5].id,
                title: 'Identify potential partners',
                description: 'Make a list of 5-10 local businesses that serve similar customers but offer different products or services. Think about businesses that complement yours rather than compete with you.',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: modules[5].id,
                title: 'Reach out to complementary businesses',
                description: 'Contact 2-3 businesses from your list and propose a simple partnership. This could be cross-promotion, joint events, or referral programs. Start with something small and easy to implement.',
                estimated_time: '60min',
                is_completed: false
            },
            {
                module_id: modules[5].id,
                title: 'Create joint promotions',
                description: 'Develop a simple cross-promotion with at least one partner. This could be "Show your receipt from [Partner Business] and get 10% off here" or vice versa.',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: modules[6].id,
                title: 'Take a critical walkthrough',
                description: 'Start by experiencing your store through fresh eyes. Walk in as if you\'re a new customer – what\'s your first impression? Is the entrance inviting? Does the space look and smell clean? Are products easily accessible? Note down anything that feels off or could be improved. Maybe the lighting in one corner is dim, or the signage for sections is unclear, or there\'s a cluttered area that could be tidier. Pick one or two of these and fix them this week. For example, if lighting is an issue, change a bulb or add a lamp for warmth. If layout is confusing, add a cute sign ("Chocolates this way ->") or rearrange slightly. Small tweaks can significantly improve comfort and clarity for customers.',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: modules[6].id,
                title: 'Engage all the senses',
                description: 'Great experiences are multi-sensory. Consider music – do you have appropriate background music playing? The right music can create a mood (calming in a spa, upbeat in a store on a Saturday, etc.). Consider scent – a pleasant smell can uplift (a clothing boutique might use a light vanilla scent; a bakery, well it already smells amazing!). Even tactile elements – are the shopping baskets comfy to carry, are chairs (if any) cozy? This week, implement at least one sensory upgrade. Examples: curate a playlist and have it softly playing. Light a mild-scented candle (if safe and allowed) or use an essential oil diffuser (nothing too overpowering). These touches make your place feel good to be in.',
                estimated_time: '60min',
                is_completed: false
            },
            {
                module_id: modules[6].id,
                title: 'Personalize your service',
                description: 'A huge part of experience is how customers are treated. Aim to make every person who walks in feel genuinely welcome. If you have employees, have a quick huddle to emphasize friendliness: warm greetings, eye contact, a smile. It might sound basic, but a cheerful "Hi there! Let us know if you need anything" can set a positive tone. Throughout this week, make an effort to remember or ask names – "What was your name? Hope to see you again, [Name]!" If someone mentions something (like they\'re shopping for a birthday), make a note and next time you can ask, "How was your friend\'s birthday?" These little things blow people away because it\'s increasingly rare. If remembering details is hard, consider keeping a small notebook behind the counter to jot quick notes (e.g., "Customer in red coat – name John, likes vanilla lattes"). It might feel silly, but it helps build real relationships.',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: modules[6].id,
                title: 'Add a surprise & delight element',
                description: 'Think of a small treat you can give customers this week to make their visit memorable. It could be literal – like a piece of candy at checkout, free samples of a new product, or complimentary gift wrapping. Or experiential – a comfy seating area they didn\'t expect, or a Polaroid photo wall where you snap customers\' pictures (with permission) and pin it up as "Customer of the Week." Even a fun chalkboard where customers can write one word describing their day. The idea is to create a spark of joy. For example, some cafes give a little chocolate with your coffee – costs them pennies, but people remember it. Decide on one "wow" touch and do it all week. Monitor reactions – are people smiling, commenting? Those smiles are what you\'re after.',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: modules[6].id,
                title: 'Ensure consistency and cleanliness',
                description: 'A big part of good experience is simply nothing goes wrong – no bad impressions. So double-check the basics: Is the store clean (floors, counters, restrooms if applicable)? Are all lights working? No weird smells or too much dust? Is staff dressed appropriately and looking neat? Fix any glaring issues. Also consider speed and convenience: if there\'s often a wait, maybe this week prepare a small distraction (like "while you wait, enjoy a free sample" or have a little bowl of mints). By the end of the week, aim for a customer to leave thinking, "That was a really nice visit."',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: modules[7].id,
                title: 'Plan a local event',
                description: 'Design a simple event that showcases your business and brings the community together. This could be a product launch, seasonal celebration, or educational workshop. Keep it manageable and focused on your customers\' interests.',
                estimated_time: '90min',
                is_completed: false
            },
            {
                module_id: modules[7].id,
                title: 'Promote the event',
                description: 'Use multiple channels to spread the word about your event – social media, email list, in-store signage, and word-of-mouth. Make sure the event details are clear and compelling.',
                estimated_time: '60min',
                is_completed: false
            },
            {
                module_id: modules[7].id,
                title: 'Execute the event',
                description: 'Run your event smoothly, engage with attendees, and create memorable experiences. Take photos and collect feedback to use in future marketing.',
                estimated_time: '120min',
                is_completed: false
            },
            {
                module_id: modules[7].id,
                title: 'Follow up with attendees',
                description: 'Reach out to event attendees afterward to thank them for coming and invite them back. Share photos from the event and ask for feedback.',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: modules[8].id,
                title: 'Set up review request system',
                description: 'Create a simple process for asking satisfied customers to leave reviews. This could be a follow-up email, in-store signage, or a quick ask at checkout.',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: modules[8].id,
                title: 'Create referral program',
                description: 'Design a simple referral system that rewards customers for bringing in new business. Make it easy to understand and valuable enough to motivate participation.',
                estimated_time: '60min',
                is_completed: false
            },
            {
                module_id: modules[8].id,
                title: 'Train staff on asking for reviews and referrals',
                description: 'Make sure your team knows how to naturally ask for reviews and referrals without being pushy. Practice the language and timing.',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: modules[8].id,
                title: 'Follow up with customers',
                description: 'Reach out to recent customers to ask for reviews and referrals. Make it personal and show appreciation for their business.',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: modules[9].id,
                title: 'Identify best local advertising channels',
                description: 'Research the most effective local advertising options in your area – local newspapers, radio, community websites, or social media advertising. Focus on channels where your target customers are most likely to see your ads.',
                estimated_time: '60min',
                is_completed: false
            },
            {
                module_id: modules[9].id,
                title: 'Create targeted campaigns',
                description: 'Develop simple, focused advertising campaigns that highlight your unique value proposition and current offers. Keep the message clear and include a strong call to action.',
                estimated_time: '90min',
                is_completed: false
            },
            {
                module_id: modules[9].id,
                title: 'Set up tracking systems',
                description: 'Implement simple ways to track the effectiveness of your advertising – unique phone numbers, special codes, or asking customers how they heard about you.',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: modules[9].id,
                title: 'Optimize ad spend',
                description: 'Monitor your advertising results and adjust your spending based on what\'s working. Focus your budget on the most effective channels and messages.',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: modules[10].id,
                title: 'Ask for feedback (directly)',
                description: 'Prepare a short survey or a few key questions you can ask customers. Keep it super simple – you can do this in-person or via email/online. Example questions: "How was your experience with us? (What did you enjoy, and what could we improve?)", "What prompted you to visit us the first time?" (this could be multiple choice: saw signage, social media, friend referral, etc.), "On a scale of 1-10, how likely are you to recommend us to a friend?" (this is essentially the classic Net Promoter Score question). If you prefer digital, use free tools like Google Forms or SurveyMonkey to create 3-5 questions and share the link. You can email it to customers (if you have an email list) with a note like "We value your opinion! Please let us know how we\'re doing – this 1-minute survey helps us a lot." If you don\'t have emails, do it old-school: print a few questions on a card and have a drop-box in-store, or just verbally chat with customers. This week, try to get at least 10 customers to give some feedback. Incentivize it if needed: "Fill out our short feedback form and get $5 off your next purchase" can boost participation (but if offering that, make sure to follow through!). The goal is to hear from a variety of folks.',
                estimated_time: '60min',
                is_completed: false
            },
            {
                module_id: modules[10].id,
                title: 'Conduct a few brief interviews (for testimonials)',
                description: 'Identify a handful of customers who you know are really happy – maybe those regulars who have been praising you, or someone who just had a visibly great experience at last week\'s event. Reach out to them personally (in person or via message) and say something like, "We\'re gathering testimonials from our customers, and I immediately thought of you because you\'ve been such a wonderful patron. Would you mind sharing a sentence or two about your experience with [Your Business]? It could be how we\'ve helped you, or what you enjoy most. We\'d love to feature your comment on our website/social media. It would mean a lot!" Many will be flattered and willing. If they say yes, you can either have a quick chat and write down what they say (then get their approval on the wording), or have them write an email reply. Guide them if needed: "For example, you might start with \'I love [Your Business] because…\'" but encourage them to use their own words. Collect a few of these. Aim for variety: different points highlighting your strengths (e.g., one about customer service, one about quality, one about atmosphere, etc.). Also get their permission to use their name and maybe a photo. First name and last initial is usually fine if they\'re shy. If someone\'s particularly enthusiastic, you could even do a short video testimonial (maybe them speaking for 20 seconds about you). Video is super engaging – but that\'s bonus, not required.',
                estimated_time: '90min',
                is_completed: false
            },
            {
                module_id: modules[10].id,
                title: 'Check review sites and extract nuggets',
                description: 'Since you\'ve been pushing reviews in Week 9, take a look at new reviews on Google, Yelp, etc. There might be some great lines in there. It\'s generally okay to quote small excerpts from public reviews in your marketing (like "5 stars on Yelp: \'Best in town, hands down!\' – Alice Q."). Just be sure not to alter the meaning. Pull a few positive snippets that really make you smile. You can later compile these as a collage of "What people are saying." This can complement the testimonials you got directly.',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: modules[10].id,
                title: 'Compile and display testimonials',
                description: 'Now that you have this positive feedback, put it to use! Add a Testimonials section on your website\'s front page or your social media. It can be as simple as text quotes, or if you got photos, include a photo of the customer (people love seeing real faces). For example: "⭐⭐⭐⭐⭐ \'Absolutely wonderful experience – the staff went above and beyond to make sure I found exactly what I needed. I\'m a customer for life!\' – Sarah G." You can list a few like that. Also consider making a few social media posts over the coming weeks that highlight one testimonial at a time (maybe with a graphic or just text in a nice format). Sprinkle them in so it\'s not bragging all at once, but it\'s powerful content indeed. In-store, you could print and frame a couple of the best quotes and hang them, or put a poster "Our customers say the nicest things!" with quotes. It shows new visitors that others love you – reassuring them they\'re in the right place.',
                estimated_time: '60min',
                is_completed: false
            },
            {
                module_id: modules[10].id,
                title: 'Act on constructive feedback',
                description: 'Inevitably, you might receive some suggestions or even critiques in the feedback. Don\'t be discouraged – this is good. Take it as free consulting. Maybe someone says "Wish you had more vegan options" or "Music was a bit loud" or "It\'d be great if you opened an hour earlier on weekends." You may not implement everything, but consider which ones are feasible and aligned with your goals. If a particular issue comes up multiple times, definitely address it. Make a short action plan: e.g., "Customers find the store a bit warm – let\'s get a fan" or "A lot of people are asking for XYZ product – let\'s stock a small selection of it as a trial." This shows you listen and evolve. Even if you don\'t change something, you could respond (especially in digital survey, if not anonymous) personally: "Thanks for the suggestion about hours – we\'ll keep that in mind for the future!" People appreciate that their voice was heard. It builds loyalty even if you can\'t do exactly what they asked.',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: modules[11].id,
                title: 'Review your metrics',
                description: 'Pull out those baseline numbers you recorded in the beginning. Compare them to now. For example: Foot traffic: How many walk-ins per day or week were you getting in Week 1 vs Week 12? You might use your own counts, or proxies like sales receipts or visitor log if you have one. Did the average increase? By roughly what percentage or absolute number? Sales: If boosting foot traffic also increased sales (usually does), note the change. Perhaps weekly revenue went from $X to $Y, etc. Online metrics: Check your Google Business insights (they show how many searches led to your listing, etc.) – likely up. Social media followers or engagement – likely up too if you did those tasks. Customer base: How many new customers did you gain? (You might estimate from new faces, new sign-ups for emails, etc.) Other measures: Number of reviews (before vs after), average rating, etc. Summarize this into a little "before vs after" report for yourself. Write it down. For example: "In 3 months, daily foot traffic increased from ~20 people to ~30 people on average, a 50% jump. We added 40 new customers to our loyalty program. Instagram followers grew from 500 to 800. We collected 15 new 5-star reviews, raising our Google rating from 4.2 to 4.5. Revenue this quarter is up 20% over last quarter." If some numbers are not as high as you hoped, that\'s okay – focus on the positive trends. And if some are higher than expected, do a little happy dance! Documenting this is not bragging; it\'s evidence of your hard work paying off and gives you insight into what strategies had impact.',
                estimated_time: '60min',
                is_completed: false
            },
            {
                module_id: modules[11].id,
                title: 'Share the success with your team and supporters',
                description: 'If you have employees or anyone who helped, gather them and go through the highlights. Say "Look what we accomplished together!" It\'s motivating and helps them buy into future initiatives. If it\'s just you, still, take a moment to self-congratulate. Maybe treat yourself to something nice – you\'ve been grinding for 12 weeks, after all. You could even share a bit of your success story with the world: e.g., a candid social media post or blog: "When we started this 12-week challenge, we were getting only a few people a day. Now our store is buzzing, and it\'s all thanks to our amazing customers and community. We\'re so grateful!" People love authentic stories, and it subtly markets your growth ("hey, that place is popular now"). It also publicly thanks your customers for helping you get there.',
                estimated_time: '30min',
                is_completed: false
            },
            {
                module_id: modules[11].id,
                title: 'Celebrate with the community',
                description: 'Host a small celebration or thank-you event for your customers and community. This could be a simple "Thank You" day with special treats, or a more formal event to celebrate your growth. Invite your most loyal customers and local supporters.',
                estimated_time: '90min',
                is_completed: false
            },
            {
                module_id: modules[11].id,
                title: 'Reflect on what worked',
                description: 'Take time to analyze which strategies were most effective. What brought in the most new customers? What created the most buzz? What was easiest to implement? Document these insights for future reference.',
                estimated_time: '45min',
                is_completed: false
            },
            {
                module_id: modules[11].id,
                title: 'Set your next goal',
                description: 'Based on your success and learnings, decide on your next marketing challenge. This could be expanding to new channels, increasing customer lifetime value, or launching new products. Make it specific and measurable.',
                estimated_time: '60min',
                is_completed: false
            }
        ];
        console.log('✅ Creating all tasks for all 12 weeks...');
        const { error: tasksError } = await supabase_1.supabase
            .from('marketing_tasks')
            .insert(allTasks);
        if (tasksError) {
            console.error('❌ Error creating tasks:', tasksError);
            return;
        }
        console.log('🎉 All complete tasks restored successfully!');
        console.log('📊 Summary:');
        console.log('  - Total tasks created:', allTasks.length);
        console.log('  - Week 1: 5 tasks');
        console.log('  - Week 2: 4 tasks');
        console.log('  - Week 3: 3 tasks');
        console.log('  - Week 4: 3 tasks');
        console.log('  - Week 5: 4 tasks');
        console.log('  - Week 6: 3 tasks');
        console.log('  - Week 7: 5 tasks');
        console.log('  - Week 8: 4 tasks');
        console.log('  - Week 9: 4 tasks');
        console.log('  - Week 10: 4 tasks');
        console.log('  - Week 11: 5 tasks');
        console.log('  - Week 12: 5 tasks');
        console.log('  - All tasks from backup branch restored!');
    }
    catch (error) {
        console.error('❌ Error restoring complete tasks:', error);
    }
}
restoreCompleteTasks();
//# sourceMappingURL=restore-complete-tasks.js.map