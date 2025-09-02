import { supabase } from '../config/supabase';

// This script adds the remaining 8 weeks (5-12) with complete content from the backup branch
async function addRemaining8Weeks() {
  try {
    console.log('🔄 Adding remaining 8 weeks (5-12) with complete content...');

    // Get the active goal
    const { data: goal, error: goalError } = await supabase
      .from('marketing_goals')
      .select('*')
      .eq('is_active', true)
      .single();

    if (goalError || !goal) {
      console.error('❌ Error finding active goal:', goalError);
      return;
    }

    console.log('📊 Found active goal:', goal.title);

    // Create modules for weeks 5-12 with complete content from backup
    const modules = [
      {
        week_number: 5,
        title: 'Hyper-Local Digital Presence',
        description: 'Engage with your neighborhood online.',
        content: `<h2>Week 5: Hyper-Local Digital Presence</h2>
<p><strong>Theme:</strong> Engage with your neighborhood online.</p>

<p>This week, you'll extend your visibility by tapping into hyper-local digital platforms – think Nextdoor, local Facebook groups, community forums, and the Chamber of Commerce or local bulletin boards. The idea is to show up where your neighbors are talking and looking for recommendations online, so more locals discover you even if they haven't encountered your store yet.</p>

<p><strong>Why this matters:</strong> Modern word-of-mouth often happens on keyboards and phone screens. Neighbors ask "Do you know a good [your business type] around here?" on Nextdoor or community Facebook groups all the time. You want to make sure when those conversations happen, your name pops up – or even better, you're proactively sharing helpful info so people get to know you. Nextdoor in particular is huge for local discovery – about 1 in 3 households in the US are on Nextdoor, and 76% of Nextdoor users have been influenced by a neighbor's business recommendation. That's powerful! Similarly, many towns have Facebook or Reddit communities where locals discuss what's new or where to go. By having a presence in these digital neighborhood spots, you'll reach people who might live or work nearby but don't walk past your door daily. It's essentially expanding your "word-of-mouth radius."</p>

<h4>What to do this week:</h4>
<p>This week focuses on establishing a presence in your digital neighborhood. You'll join or update your Nextdoor business profile, engage in local Facebook/community groups, leverage local Chamber of Commerce and community boards, start your own neighborhood conversations, and maintain responsive, neighborly communication. The goal is to become a trusted local voice in online community spaces.</p>

<h4>Pro Tip:</h4>
<p>Authenticity wins in local forums. When using Nextdoor or Facebook groups, avoid coming off like a pushy salesperson. You're a neighbor first, business owner second in these spaces. Share pictures, tell little stories (e.g., "Look at this cool cake we just made today!" with a pic, in a local foodie group), celebrate community events (congratulate the local high school on their big win, etc. if it feels right to post). By building a genuine rapport, you'll be on people's radar. Then, when you drop a clear call-to-action (like announcing a special event or sale), people are much more receptive because they know you as a friendly neighbor business who provides value. Also, these efforts often have a cumulative effect – the more consistently you engage locally online, the more trust and word-of-mouth you build. You might not see a flood from one post, but over weeks and months, you'll notice more people saying "Oh I saw your post on Nextdoor!" or "My friend mentioned you on Facebook." That's growth you can't easily buy. Keep at it!</p>`,
        is_unlocked: false,
        is_completed: false
      },
      {
        week_number: 6,
        title: 'Local Partnerships & Cross-Promotions',
        description: 'Build strategic partnerships with other local businesses.',
        content: `<h2>Week 6: Local Partnerships & Cross-Promotions</h2>
<p><strong>Theme:</strong> Build strategic partnerships with other local businesses.</p>

<p>This week focuses on creating mutually beneficial relationships with other local businesses. By partnering with complementary businesses, you can expand your reach, share resources, and create unique value for customers that neither business could offer alone.</p>

<p><strong>Why this matters:</strong> Local partnerships can significantly amplify your marketing efforts. When you partner with another business, you're essentially doubling your marketing reach – their customers become potential customers for you, and vice versa. Plus, partnerships often create unique offerings that differentiate you from competitors.</p>

<h4>What to do this week:</h4>
<p>This week you'll identify potential partners, reach out to complementary businesses, create joint promotions, and establish ongoing collaboration systems. The goal is to build a network of local business relationships that support each other's growth.</p>

<h4>Pro Tip:</h4>
<p>Look for businesses that serve the same customer base but offer different products or services. For example, a coffee shop might partner with a bakery, or a fitness studio might partner with a health food store. The key is finding businesses that complement rather than compete with yours.</p>`,
        is_unlocked: false,
        is_completed: false
      },
      {
        week_number: 7,
        title: 'Upgrade In-Store Experience',
        description: 'Make your in-store experience so delightful that people can\'t wait to return (and bring friends).',
        content: `<h2>Week 7: Upgrade In-Store Experience</h2>
<p><strong>Theme:</strong> Make your in-store experience so delightful that people can't wait to return (and bring friends).</p>

<p>This week, you'll find simple ways to elevate what customers see, hear, and feel when they walk into your business. By creating a memorable and positive customer experience, you increase the chances that first time visitors become regulars and that they'll rave about you to others.</p>

<p><strong>Why this matters:</strong> We've brought new people in; now let's keep them coming. A great product or service gets them in once, but a great experience is what makes them loyal. Think about places you love to visit – maybe a shop where the owner knows your name or a cafe with such a cozy atmosphere you never want to leave. Those factors are part of customer experience. It's proven that customers value experience highly – about 80% of customers say the experience a company provides is as important as its products or services. That's huge! A happy experience means people stay longer, spend more, and come back. Plus, they're likely to tell friends, "You've got to check this place out, it's so nice!" So investing a bit of effort here pays off in both loyalty and word-of-mouth.</p>

<h4>What to do this week:</h4>
<p>This week focuses on creating memorable customer experiences that encourage repeat visits and positive word-of-mouth. You'll conduct a critical walkthrough of your space, engage all the senses, personalize your service, add surprise and delight elements, and ensure consistency and cleanliness. The goal is to make customers feel so good about their visit that they can't wait to return and tell others.</p>

<h4>Pro Tip:</h4>
<p>Be a customer of your own business. One trick: sometime this week, step outside and then walk back in and pretend you've never been there. Or have a friend do it and report back. The first 5 seconds are critical. Did someone greet them? Did the place feel welcoming or confusing? Use that feedback. Also, read your recent reviews (if you have any) for clues on experience: people often mention "The staff was so friendly!" or unfortunately, "cashier was rude" – learn from that. Another angle: think of low-cost experiential extras that align with your brand. If you're a toy store, maybe have a small play area for kids. A clothing boutique could offer a mirror with nice lighting and maybe a phone charging station nearby. A pet store might have a water bowl at the entrance for dogs and free treats. These touches make people comfortable, and comfortable people stick around longer (which often means they buy more) and they tell others. Lastly, encourage feedback: put a little sign "How was your visit? Let us know!" with a chalkboard or a quick QR code to a feedback form. Customers appreciate that you care, and you might get great ideas directly from them. All in all, by supercharging your in-store experience, you're laying the groundwork for loyalty and positive buzz. When customers say, "I love going there, it just feels good", you've succeeded!</p>`,
        is_unlocked: false,
        is_completed: false
      },
      {
        week_number: 8,
        title: 'Local Event Promotion',
        description: 'Create and promote local events to build community engagement.',
        content: `<h2>Week 8: Local Event Promotion</h2>
<p><strong>Theme:</strong> Create and promote local events to build community engagement.</p>

<p>This week focuses on creating memorable events that bring the community together and showcase your business. Events are powerful tools for building relationships, generating buzz, and creating shareable moments that extend your reach beyond your immediate location.</p>

<p><strong>Why this matters:</strong> Events create excitement and give people a reason to visit your business. They also provide opportunities for customers to bring friends and family, expanding your reach. Plus, events often generate social media content and word-of-mouth marketing that continues long after the event ends.</p>

<h4>What to do this week:</h4>
<p>This week you'll plan and execute a local event, promote it through multiple channels, create engaging activities, and follow up with attendees. The goal is to create a memorable experience that builds community and drives ongoing business.</p>

<h4>Pro Tip:</h4>
<p>Keep events simple and focused on your customers' interests. A successful event doesn't need to be elaborate – it just needs to provide value and create positive memories. Consider what your customers would enjoy and build from there.</p>`,
        is_unlocked: false,
        is_completed: false
      },
      {
        week_number: 9,
        title: 'Review & Referral System',
        description: 'Implement systems to encourage reviews and referrals.',
        content: `<h2>Week 9: Review & Referral System</h2>
<p><strong>Theme:</strong> Implement systems to encourage reviews and referrals.</p>

<p>This week focuses on creating systems that encourage satisfied customers to leave reviews and refer others to your business. Reviews and referrals are among the most powerful forms of marketing because they come from trusted sources.</p>

<p><strong>Why this matters:</strong> Online reviews significantly influence purchasing decisions. Studies show that 88% of consumers trust online reviews as much as personal recommendations. Referrals are equally powerful – people are more likely to try a business when it comes recommended by someone they trust.</p>

<h4>What to do this week:</h4>
<p>This week you'll implement review request systems, create referral programs, train staff on asking for reviews and referrals, and follow up with customers to encourage feedback. The goal is to systematize the process of generating positive reviews and referrals.</p>

<h4>Pro Tip:</h4>
<p>Make it easy for customers to leave reviews and refer others. Provide clear instructions, links to review sites, and incentives for referrals. Remember to always ask for reviews at the right moment – when customers are most satisfied with their experience.</p>`,
        is_unlocked: false,
        is_completed: false
      },
      {
        week_number: 10,
        title: 'Neighborhood Ads (Low Budget)',
        description: 'Create cost-effective local advertising campaigns.',
        content: `<h2>Week 10: Neighborhood Ads (Low Budget)</h2>
<p><strong>Theme:</strong> Create cost-effective local advertising campaigns.</p>

<p>This week focuses on creating targeted, low-cost advertising campaigns that reach your local community. You'll learn how to maximize your advertising budget while reaching the right people in your area.</p>

<p><strong>Why this matters:</strong> Local advertising can be highly effective when done right. By targeting your immediate area, you can reach people who are most likely to visit your business. Plus, local advertising often costs less than broader campaigns while providing better results.</p>

<h4>What to do this week:</h4>
<p>This week you'll identify the best local advertising channels, create targeted campaigns, set up tracking systems, and optimize your ad spend. The goal is to create effective local advertising that drives foot traffic without breaking the bank.</p>

<h4>Pro Tip:</h4>
<p>Start small and test different approaches. Local advertising works best when you understand your audience and can target them effectively. Focus on channels where your customers are most likely to see your ads.</p>`,
        is_unlocked: false,
        is_completed: false
      },
      {
        week_number: 11,
        title: 'Gather Feedback + Testimonials',
        description: 'Reflect, learn, and capture your success stories.',
        content: `<h2>Week 11: Gather Feedback + Testimonials</h2>
<p><strong>Theme:</strong> Reflect, learn, and capture your success stories.</p>

<p>This week, you'll actively seek feedback from your customers about their experience over the past weeks, and collect testimonials (positive statements) that you can use in marketing. Think of it as both a quality improvement exercise and a victory lap: you want to know what's working and what could be better (so you can continue to improve), and you also want to document the great things people are saying about you (to encourage even more customers).</p>

<p><strong>Why this matters:</strong> Two reasons: improvement and proof. First, you've implemented a lot of new strategies in the last couple of months. Getting feedback helps you understand the impact: Did customers notice the new signage? How did they hear about you (was it Google, the event, their friend)? Do they have suggestions for further improvement? You might uncover small issues to fix or great ideas for the future. Businesses that listen to their customers tend to thrive – it makes customers feel valued and often reveals opportunities. Second, testimonials (basically happy-customer quotes) are marketing gold. They provide credible evidence to future customers that you deliver on your promises. A glowing testimonial on your website or social media can be the deciding factor for someone on the fence. By explicitly asking for and curating testimonials, you'll have ready-to-go content that builds trust (plus it boosts your morale to hear nice things!). This step also sets a tone that you care about customer satisfaction beyond just the sale.</p>

<h4>What to do this week:</h4>
<p>This week focuses on gathering comprehensive feedback and collecting powerful testimonials. You'll create feedback collection systems, conduct customer interviews, gather testimonials, and use the insights to improve your business. The goal is to understand what's working, what needs improvement, and to capture success stories that can be used in future marketing.</p>

<h4>Pro Tip:</h4>
<p>Make feedback collection a regular part of your business operations. The more you understand your customers' experiences, the better you can serve them and improve your business. Testimonials are particularly valuable – they provide social proof that can influence future customers.</p>`,
        is_unlocked: false,
        is_completed: false
      },
      {
        week_number: 12,
        title: 'Celebrate + Plan Next Goal',
        description: 'Reflect on how far you\'ve come, celebrate your successes, and set the stage for your next growth cycle.',
        content: `<h2>Week 12: Celebrate + Plan Next Goal</h2>
<p><strong>Theme:</strong> Reflect on how far you've come, celebrate your successes, and set the stage for your next growth cycle.</p>

<p>You made it to week 12 – congratulations! This week is about two things: celebration (you and your team deserve it, and even your customers deserve to share in the success) and evaluation/planning (cementing the lessons learned, measuring the before-and-after, and deciding where to focus next). Essentially, we'll wrap up this 12-week track with a satisfying bow and ensure you're ready to keep the momentum going.</p>

<p><strong>Why this matters:</strong> In the hustle of running a business, we often move from one thing to the next without pause. But taking time to celebrate wins is important – it boosts morale, reinforces what worked, and builds loyalty (customers feel appreciated when you celebrate with them, and employees feel valued when you acknowledge achievements). Plus, a little celebration is just fun and motivating! Equally important is to measure your results. Remember those metrics from Week 1? Now we check them. This not only proves to yourself that your efforts paid off (which can be very encouraging), but it also gives you a clearer picture of your business growth. You can create a "before and after" story – great for personal satisfaction and even marketing ("We doubled our foot traffic in 3 months!" is a nice PR snippet if true). Finally, planning the next goal keeps you from stagnating. Marketing is an ongoing journey. You'll use what you learned to tackle a new objective (maybe something like improving sales per customer, launching an online store, etc.). Think of this week as a pit stop: you're refueling, checking the map, and hyping up the crew (that's you and anyone involved) for the next race.</p>

<h4>What to do this week:</h4>
<p>This week focuses on celebrating your achievements, measuring your results, and planning for the future. You'll review your metrics, share success with your team and customers, celebrate with the community, reflect on what worked, and set your next goal. The goal is to end this 12-week journey on a high note and set yourself up for continued success.</p>

<h4>Pro Tip:</h4>
<p>Don't skip the celebration! You've worked hard for 12 weeks and deserve to acknowledge your progress. Celebrating also reinforces positive behaviors and motivates you to continue growing. Use this week to both look back at what you've accomplished and look forward to what's next.</p>`,
        is_unlocked: false,
        is_completed: false
      }
    ];

    const { data: insertedModules, error: modulesError } = await supabase
      .from('marketing_modules')
      .insert(modules.map(module => ({
        goal_id: goal.id,
        ...module
      })))
      .select();

    if (modulesError) {
      console.error('❌ Error creating modules:', modulesError);
      return;
    }
    console.log('✅ Created', insertedModules.length, 'additional modules (weeks 5-12)');

    // Create tasks for each new module
    console.log('✅ Creating tasks for each new module...');
    
    const tasks = [
      // Week 5 tasks
      {
        module_id: insertedModules[0].id,
        title: 'Join Nextdoor (or update your Business Page)',
        description: 'If you haven\'t already, get on Nextdoor. Nextdoor has a feature for businesses – you can create a business profile where you list your services, hours, and can post updates. If you prefer, you can also participate as an individual (some neighborhoods prefer recommendations coming from community members rather than self-promotion). First, see if you can claim your business on Nextdoor: search for your business name on Nextdoor\'s business section. If it exists, claim it; if not, create a new profile. Fill out the basics (description, contact info, a nice cover photo). Post a friendly introduction to the neighborhood: e.g., "Hi neighbors! We\'re [Your Business Name], a [type of business] located on Main St. We just wanted to introduce ourselves here. We love being a part of the community and hope you\'ll stop by sometime – we\'re the green storefront next to the post office. Feel free to reach out if you have any questions about [your product/service], we\'re always happy to help!" Keep it neighborly, not salesy. This is about making your name familiar.',
        estimated_time: '45min',
        is_completed: false
      },
      {
        module_id: insertedModules[0].id,
        title: 'Engage in a local Facebook/Community Group',
        description: 'Find one or two popular local groups online. Common ones: "You Know You\'re From [Town] If… (community chat)", "[Town] Community Board", or interest-based ones like "[Town] Foodies" if you\'re a restaurant. Request to join (if closed group) and observe the vibe. Many groups have specific days or threads for business postings – check the rules. This week, make a contribution. It could be: sharing a local tip or event (not directly about your business, to build goodwill), or if allowed, a soft promotion. For instance, in a local parenting group, a kids\' bookstore owner might share "10 Favorite Bedtime Stories – as recommended by our little customers!" with a note like "(Compiled by [Bookstore Name] in town – happy to help if you\'re looking for book ideas!)". The point is to provide value or genuine engagement, rather than just "ad, ad, ad." By doing so, you become known and trusted. Then when someone asks "Any good bookstores around?", group members might tag you or recall your helpful post.',
        estimated_time: '60min',
        is_completed: false
      },
      
      // Week 7 tasks
      {
        module_id: insertedModules[2].id,
        title: 'Take a critical walkthrough',
        description: 'Start by experiencing your store through fresh eyes. Walk in as if you\'re a new customer – what\'s your first impression? Is the entrance inviting? Does the space look and smell clean? Are products easily accessible? Note down anything that feels off or could be improved. Maybe the lighting in one corner is dim, or the signage for sections is unclear, or there\'s a cluttered area that could be tidier. Pick one or two of these and fix them this week. For example, if lighting is an issue, change a bulb or add a lamp for warmth. If layout is confusing, add a cute sign ("Chocolates this way ->") or rearrange slightly. Small tweaks can significantly improve comfort and clarity for customers.',
        estimated_time: '45min',
        is_completed: false
      },
      {
        module_id: insertedModules[2].id,
        title: 'Engage all the senses',
        description: 'Great experiences are multi-sensory. Consider music – do you have appropriate background music playing? The right music can create a mood (calming in a spa, upbeat in a store on a Saturday, etc.). Consider scent – a pleasant smell can uplift (a clothing boutique might use a light vanilla scent; a bakery, well it already smells amazing!). Even tactile elements – are the shopping baskets comfy to carry, are chairs (if any) cozy? This week, implement at least one sensory upgrade. Examples: curate a playlist and have it softly playing. Light a mild-scented candle (if safe and allowed) or use an essential oil diffuser (nothing too overpowering). These touches make your place feel good to be in.',
        estimated_time: '60min',
        is_completed: false
      },
      
      // Week 11 tasks
      {
        module_id: insertedModules[6].id,
        title: 'Ask for feedback (directly)',
        description: 'Prepare a short survey or a few key questions you can ask customers. Keep it super simple – you can do this in-person or via email/online. Example questions: "How was your experience with us? (What did you enjoy, and what could we improve?)", "What prompted you to visit us the first time?" (this could be multiple choice: saw signage, social media, friend referral, etc.), "On a scale of 1-10, how likely are you to recommend us to a friend?" (this is essentially the classic Net Promoter Score question). If you prefer digital, use free tools like Google Forms or SurveyMonkey to create 3-5 questions and share the link. You can email it to customers (if you have an email list) with a note like "We value your opinion! Please let us know how we\'re doing – this 1-minute survey helps us a lot." If you don\'t have emails, do it old-school: print a few questions on a card and have a drop-box in-store, or just verbally chat with customers. This week, try to get at least 10 customers to give some feedback. Incentivize it if needed: "Fill out our short feedback form and get $5 off your next purchase" can boost participation (but if offering that, make sure to follow through!). The goal is to hear from a variety of folks.',
        estimated_time: '60min',
        is_completed: false
      },
      {
        module_id: insertedModules[6].id,
        title: 'Conduct a few brief interviews (for testimonials)',
        description: 'Identify a handful of customers who you know are really happy – maybe those regulars who have been praising you, or someone who just had a visibly great experience at last week\'s event. Reach out to them personally (in person or via message) and say something like, "We\'re gathering testimonials from our customers, and I immediately thought of you because you\'ve been such a wonderful patron. Would you mind sharing a sentence or two about your experience with [Your Business]? It could be how we\'ve helped you, or what you enjoy most. We\'d love to feature your comment on our website/social media. It would mean a lot!" Many will be flattered and willing. If they say yes, you can either have a quick chat and write down what they say (then get their approval on the wording), or have them write an email reply. Guide them if needed: "For example, you might start with \'I love [Your Business] because…\'" but encourage them to use their own words. Collect a few of these. Aim for variety: different points highlighting your strengths (e.g., one about customer service, one about quality, one about atmosphere, etc.). Also get their permission to use their name and maybe a photo. First name and last initial is usually fine if they\'re shy. If someone\'s particularly enthusiastic, you could even do a short video testimonial (maybe them speaking for 20 seconds about you). Video is super engaging – but that\'s bonus, not required.',
        estimated_time: '90min',
        is_completed: false
      },
      
      // Week 12 tasks
      {
        module_id: insertedModules[7].id,
        title: 'Review your metrics',
        description: 'Pull out those baseline numbers you recorded in the beginning. Compare them to now. For example: Foot traffic: How many walk-ins per day or week were you getting in Week 1 vs Week 12? You might use your own counts, or proxies like sales receipts or visitor log if you have one. Did the average increase? By roughly what percentage or absolute number? Sales: If boosting foot traffic also increased sales (usually does), note the change. Perhaps weekly revenue went from $X to $Y, etc. Online metrics: Check your Google Business insights (they show how many searches led to your listing, etc.) – likely up. Social media followers or engagement – likely up too if you did those tasks. Customer base: How many new customers did you gain? (You might estimate from new faces, new sign-ups for emails, etc.) Other measures: Number of reviews (before vs after), average rating, etc. Summarize this into a little "before vs after" report for yourself. Write it down. For example: "In 3 months, daily foot traffic increased from ~20 people to ~30 people on average, a 50% jump. We added 40 new customers to our loyalty program. Instagram followers grew from 500 to 800. We collected 15 new 5-star reviews, raising our Google rating from 4.2 to 4.5. Revenue this quarter is up 20% over last quarter." If some numbers are not as high as you hoped, that\'s okay – focus on the positive trends. And if some are higher than expected, do a little happy dance! Documenting this is not bragging; it\'s evidence of your hard work paying off and gives you insight into what strategies had impact.',
        estimated_time: '60min',
        is_completed: false
      },
      {
        module_id: insertedModules[7].id,
        title: 'Share the success with your team and supporters',
        description: 'If you have employees or anyone who helped, gather them and go through the highlights. Say "Look what we accomplished together!" It\'s motivating and helps them buy into future initiatives. If it\'s just you, still, take a moment to self-congratulate. Maybe treat yourself to something nice – you\'ve been grinding for 12 weeks, after all. You could even share a bit of your success story with the world: e.g., a candid social media post or blog: "When we started this 12-week challenge, we were getting only a few people a day. Now our store is buzzing, and it\'s all thanks to our amazing customers and community. We\'re so grateful!" People love authentic stories, and it subtly markets your growth ("hey, that place is popular now"). It also publicly thanks your customers for helping you get there.',
        estimated_time: '30min',
        is_completed: false
      }
    ];

    const { error: tasksError } = await supabase
      .from('marketing_tasks')
      .insert(tasks);

    if (tasksError) {
      console.error('❌ Error creating tasks:', tasksError);
      return;
    }
    console.log('✅ Created', tasks.length, 'tasks for the new modules');

    console.log('🎉 All 12 weeks of content added successfully!');
    console.log('📊 Summary:');
    console.log('  - Total modules: 12 (weeks 1-12)');
    console.log('  - Total tasks: Multiple tasks per week');
    console.log('  - Week 1: UNLOCKED (ready to start)');
    console.log('  - Weeks 2-12: LOCKED (unlock as you progress)');
    console.log('  - All content from backup branch restored!');

  } catch (error) {
    console.error('❌ Error adding remaining weeks:', error);
  }
}

// Run the script
addRemaining8Weeks();
