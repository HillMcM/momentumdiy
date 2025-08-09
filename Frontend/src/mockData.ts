import type { Task, Project, MarketingGoal, MarketingModule, MarketingTask } from './types';

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design User Interface',
    description: 'Create wireframes and mockups for the new client portal',
    responsible: 'Hillary',
    deadline: new Date().toISOString(),
    project: 'Website Redesign',
    timeSpent: '',
    notifications: false,
    status: 'completed'
  },
  {
    id: '2',
    title: 'Implement Authentication',
    description: 'Set up user authentication and authorization system',
    responsible: 'Hillary',
    deadline: new Date().toISOString(),
    project: 'Website Redesign',
    timeSpent: '',
    notifications: false,
    status: 'in-progress'
  },
  {
    id: '3',
    title: 'Database Schema',
    description: 'Design and implement the database schema',
    responsible: 'Hillary',
    deadline: new Date().toISOString(),
    project: 'Q3 Marketing Campaign',
    timeSpent: '',
    notifications: false,
    status: 'todo'
  },
  {
    id: '4',
    title: 'API Documentation',
    description: 'Write comprehensive API documentation',
    responsible: 'Hillary',
    deadline: new Date().toISOString(),
    project: 'Q3 Marketing Campaign',
    timeSpent: '',
    notifications: false,
    status: 'todo'
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Refresh the company website with new branding and improved user experience',
    deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    tasks: ['1', '2'],
    progress: 75,
    status: 'active',
    timeline: [
      {
        id: '1',
        name: 'Planning & Discovery',
        description: 'Gather requirements and create project plan',
        startDate: new Date(new Date().setDate(new Date().getDate() - 14)),
        endDate: new Date(new Date().setDate(new Date().getDate() - 7)),
        status: 'completed',
        tasks: [],
        order: 1
      },
      {
        id: '2',
        name: 'Design Phase',
        description: 'Create wireframes, mockups, and design system',
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        status: 'in-progress',
        tasks: ['1'],
        order: 2
      },
      {
        id: '3',
        name: 'Development',
        description: 'Implement the website with new features',
        startDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 21)),
        status: 'not-started',
        tasks: ['2'],
        order: 3
      },
      {
        id: '4',
        name: 'Testing & Launch',
        description: 'Quality assurance and deployment',
        startDate: new Date(new Date().setDate(new Date().getDate() + 21)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        status: 'not-started',
        tasks: [],
        order: 4
      }
    ]
  },
  {
    id: '2',
    name: 'Q3 Marketing Campaign',
    description: 'Plan and execute Q3 marketing initiatives across all channels',
    deadline: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(),
    tasks: ['3', '4'],
    progress: 0,
    status: 'active',
    timeline: [
      {
        id: '5',
        name: 'Strategy Development',
        description: 'Define campaign goals, target audience, and messaging',
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        status: 'in-progress',
        tasks: [],
        order: 1
      },
      {
        id: '6',
        name: 'Content Creation',
        description: 'Develop marketing materials and content',
        startDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 21)),
        status: 'not-started',
        tasks: ['3', '4'],
        order: 2
      },
      {
        id: '7',
        name: 'Campaign Execution',
        description: 'Launch and monitor marketing campaigns',
        startDate: new Date(new Date().setDate(new Date().getDate() + 21)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 45)),
        status: 'not-started',
        tasks: [],
        order: 3
      }
    ]
  }
];

// Helper function to create marketing tasks for specific weeks
const createMarketingTasksForWeek = (weekNumber: number): MarketingTask[] => {
  const weekTasks: { [key: number]: MarketingTask[] } = {
    1: [
      {
        id: '101',
        title: 'Complete Social Media Audit',
        description: 'Review your current profile, content, and engagement metrics to establish a baseline',
        estimatedTime: '30-45 minutes',
        isCompleted: false
      },
      {
        id: '102',
        title: 'Record Baseline Metrics',
        description: 'Document your current follower count, average likes/comments, and story views',
        estimatedTime: '15-20 minutes',
        isCompleted: false
      },
      {
        id: '103',
        title: 'Follow 5-Day Content Plan',
        description: 'Post Monday (Behind-the-Scenes), Tuesday (Tip/FAQ), Wednesday (Personal Story), Thursday (Product Feature), Friday (Fun/Community)',
        estimatedTime: '2-3 hours',
        isCompleted: false
      }
    ],
    2: [
      {
        id: '201',
        title: 'Choose Your Content Pillars',
        description: 'Select 3-4 themes that represent your brand (e.g., Behind-the-Scenes, Tips, Customer Stories, Local Love)',
        estimatedTime: '20-30 minutes',
        isCompleted: false
      },
      {
        id: '202',
        title: 'Create Refined Weekly Plan',
        description: 'Map out your 5-day posting schedule using your chosen content pillars',
        estimatedTime: '30-45 minutes',
        isCompleted: false
      },
      {
        id: '203',
        title: 'Post Using New Structure',
        description: 'Create and publish 3-5 posts following your refined content plan',
        estimatedTime: '2-3 hours',
        isCompleted: false
      }
    ],
    3: [
      {
        id: '301',
        title: 'Define Brand Voice',
        description: 'Choose 3 words to describe your brand voice and decide on emoji usage and tone',
        estimatedTime: '20-30 minutes',
        isCompleted: false
      },
      {
        id: '302',
        title: 'Establish Visual Style',
        description: 'Choose 1-2 fonts and 2-3 colors to use consistently in your posts',
        estimatedTime: '30-45 minutes',
        isCompleted: false
      },
      {
        id: '303',
        title: 'Create Brand Style Guide',
        description: 'Document your voice and visual choices in a simple reference guide',
        estimatedTime: '15-20 minutes',
        isCompleted: false
      }
    ],
    4: [
      {
        id: '401',
        title: 'Create Educate Post Template',
        description: 'Design a template for teaching/FAQ posts that you can reuse',
        estimatedTime: '30-45 minutes',
        isCompleted: false
      },
      {
        id: '402',
        title: 'Create Promote Post Template',
        description: 'Design a template for product/service spotlight posts',
        estimatedTime: '30-45 minutes',
        isCompleted: false
      },
      {
        id: '403',
        title: 'Create Connect Post Template',
        description: 'Design a template for behind-the-scenes and personal story posts',
        estimatedTime: '30-45 minutes',
        isCompleted: false
      }
    ],
    5: [
      {
        id: '501',
        title: 'Choose Posting Frequency',
        description: 'Decide on your realistic weekly posting schedule (3-5 posts per week)',
        estimatedTime: '15-20 minutes',
        isCompleted: false
      },
      {
        id: '502',
        title: 'Create Weekly Content Calendar',
        description: 'Map out which post types go on which days using your 3 core types',
        estimatedTime: '30-45 minutes',
        isCompleted: false
      },
      {
        id: '503',
        title: 'Set Content Planning Time',
        description: 'Choose a specific time each week to plan and create your content',
        estimatedTime: '15-20 minutes',
        isCompleted: false
      }
    ],
    6: [
      {
        id: '601',
        title: 'Design Tip/FAQ Template',
        description: 'Create a Canva template for educational posts with your brand elements',
        estimatedTime: '45-60 minutes',
        isCompleted: false
      },
      {
        id: '602',
        title: 'Design Product Promo Template',
        description: 'Create a Canva template for promotional posts',
        estimatedTime: '45-60 minutes',
        isCompleted: false
      },
      {
        id: '603',
        title: 'Design Testimonial Template',
        description: 'Create a Canva template for customer highlights and testimonials',
        estimatedTime: '45-60 minutes',
        isCompleted: false
      }
    ],
    7: [
      {
        id: '701',
        title: 'Rewrite Instagram Bio',
        description: 'Update your bio to clearly state who you help, what you offer, and your location',
        estimatedTime: '20-30 minutes',
        isCompleted: false
      },
      {
        id: '702',
        title: 'Update Profile Links',
        description: 'Clean up your link in bio and ensure it leads to something useful',
        estimatedTime: '15-20 minutes',
        isCompleted: false
      },
      {
        id: '703',
        title: 'Update Highlights/Pinned Posts',
        description: 'Pin your top 3-4 posts and organize story highlights',
        estimatedTime: '30-45 minutes',
        isCompleted: false
      }
    ],
    8: [
      {
        id: '801',
        title: 'Plan Week of Content',
        description: 'Write captions and choose visuals for 3-5 posts using your templates',
        estimatedTime: '2-3 hours',
        isCompleted: false
      },
      {
        id: '802',
        title: 'Schedule Posts in Advance',
        description: 'Use Meta Business Suite or another scheduler to queue up your week',
        estimatedTime: '30-45 minutes',
        isCompleted: false
      },
      {
        id: '803',
        title: 'Create Story Content',
        description: 'Plan 1-2 stories or story prompts to complement your feed posts',
        estimatedTime: '30-45 minutes',
        isCompleted: false
      }
    ],
    9: [
      {
        id: '901',
        title: 'Set Up Daily Engagement Time',
        description: 'Choose a 10-minute window each day for social engagement',
        estimatedTime: '10 minutes',
        isCompleted: false
      },
      {
        id: '902',
        title: 'Create Engagement List',
        description: 'Identify 5-10 local businesses and customers to engage with regularly',
        estimatedTime: '20-30 minutes',
        isCompleted: false
      },
      {
        id: '903',
        title: 'Practice Daily Engagement',
        description: 'Spend 10 minutes daily liking, commenting, and connecting with your community',
        estimatedTime: '10 minutes daily',
        isCompleted: false
      }
    ],
    10: [
      {
        id: '1001',
        title: 'Find Strong Past Post',
        description: 'Review your last 1-3 months and identify a post with good engagement',
        estimatedTime: '20-30 minutes',
        isCompleted: false
      },
      {
        id: '1002',
        title: 'Repurpose Content',
        description: 'Recreate the post with a new angle, format, or call to action',
        estimatedTime: '45-60 minutes',
        isCompleted: false
      },
      {
        id: '1003',
        title: 'Share Repurposed Post',
        description: 'Post with a fresh caption explaining why you\'re sharing it again',
        estimatedTime: '15-20 minutes',
        isCompleted: false
      }
    ],
    11: [
      {
        id: '1101',
        title: 'Choose Campaign Type',
        description: 'Decide between poll, giveaway, Q&A, or fun question campaign',
        estimatedTime: '20-30 minutes',
        isCompleted: false
      },
      {
        id: '1102',
        title: 'Create Campaign Graphics',
        description: 'Design visuals for your engagement campaign',
        estimatedTime: '45-60 minutes',
        isCompleted: false
      },
      {
        id: '1103',
        title: 'Launch and Promote Campaign',
        description: 'Post your campaign and promote it across stories and feed',
        estimatedTime: '30-45 minutes',
        isCompleted: false
      }
    ],
    12: [
      {
        id: '1201',
        title: 'Review Progress',
        description: 'Compare your Week 1 baseline metrics to current performance',
        estimatedTime: '30-45 minutes',
        isCompleted: false
      },
      {
        id: '1202',
        title: 'Reflect on What Worked',
        description: 'Journal about what strategies felt easiest and most effective',
        estimatedTime: '20-30 minutes',
        isCompleted: false
      },
      {
        id: '1203',
        title: 'Plan Next 30 Days',
        description: 'Choose one focus area for continued growth and consistency',
        estimatedTime: '30-45 minutes',
        isCompleted: false
      }
    ]
  };

  return weekTasks[weekNumber] || [];
};

// Helper function to create marketing modules with real content
export const createMarketingModules = (goalId: string, isActive: boolean, currentWeek: number): MarketingModule[] => {
  const modules: MarketingModule[] = [];
  
  const weekContent = {
    1: {
      title: 'Social Audit & Baseline Tracking',
      description: 'Audit your current profile + content, track key numbers, and test out a basic 5-day posting rhythm.',
      content: `This week we're kicking off with a full audit of where you are now, plus a simple week-long content plan you can follow to build consistency without stress.

🎯 This Week's Focus:
Audit your current profile + content, track a few key numbers, and test out a basic 5-day posting rhythm.

✅ Step 1: Quick Social Audit
Choose your main platform (Instagram or Facebook) and check:
• Your Profile: Bio clearly says what you do, profile pic is current and professional
• Your Content: You post at least 2x/week (goal is 3–5), visuals are clear and branded
• Your Engagement Metrics: Record these so we can track growth over time

✅ Step 2: Try This 5-Day Social Content Plan
Monday: Behind-the-Scenes - "Here's what we're working on this week..."
Tuesday: Tip or FAQ - Answer a common customer question or give a useful tip
Wednesday: Personal Story - Share why you started your business, or something you're proud of
Thursday: Product/Service Feature - Highlight 1 offer you love
Friday: Fun or Community Post - Shout out a local business, share a favorite spot, or post something light-hearted

💡 Pro Tip: Use stories for casual check-ins, polls, or behind-the-scenes moments throughout the week.`
    },
    2: {
      title: 'Clarify Your Content Pillars',
      description: 'Choose your 3–4 brand-aligned content pillars + post with more intention using a refined 5-day plan.',
      content: `One of the hardest parts of showing up consistently on social media is knowing what to say. This week, we're solving that by defining your Content Pillars—the 3–4 themes that represent your brand and connect with your audience.

🎯 This Week's Focus:
Choose your 3–4 brand-aligned content pillars + post with more intention using a refined 5-day plan.

✅ Step 1: Choose Your 3–4 Content Pillars
Pick from this list (or make your own):
• Your Products/Services
• Behind-the-Scenes / Business Life
• Customer Stories / Testimonials
• Tips & Education
• Promotions / Sales / Events
• Personal Story / Values / Why You Started
• Local Love / Community / Shoutouts
• Visual Inspiration (Moodboards, Design, Process)

✅ Step 2: Try This Week's Refined 5-Day Content Plan
Monday: Meet the Maker - Show yourself or your team
Tuesday: Teach or Tip - Share a common misconception, how-to, or product usage tip
Wednesday: Testimonial or Win - Share a quote, review, or story from a happy customer
Thursday: Offer or Product Feature - Highlight 1 product or service and why it matters
Friday: Community Boost - Shout out a local event, business, or something light + fun

This schedule can flex based on your energy and posting frequency—but aim for 3–5 posts if you can.`
    },
    3: {
      title: 'Define Your Brand Voice & Visual Tone',
      description: 'Create a simple voice + visual style guide for your brand, so your posts feel cohesive and on brand.',
      content: `Now that you've picked your content pillars, it's time to define the style and personality you'll use to bring those themes to life. This week we're focusing on brand voice (how you sound) and visual tone (how your posts look and feel).

🎯 This Week's Focus:
Create a simple voice + visual style guide for your brand, so your posts feel cohesive and on brand.

✅ Step 1: Define Your Brand Voice
Choose 3 words that describe how you want to sound online:
• Friendly, knowledgeable, clear
• Bold, passionate, witty
• Calm, supportive, nurturing
• Playful, smart, approachable

Then decide:
• Do you use emojis? (🙌 or ❌)
• Do you write like you're texting a friend—or a bit more formal?
• Do you use "I," "we," or brand name in your captions?

✅ Step 2: Define Your Visual Tone
Look at your current posts and ask:
• Are my colors and fonts consistent?
• Do my photos feel on-brand (style, lighting, composition)?
• Do I use a consistent layout, border, or background style?

Try choosing 1–2 fonts and 2–3 colors to stick with for now. If you're using Canva, create a few reusable templates that reflect your style.

💡 Quick Tip: "People follow accounts that feel familiar. Consistency builds trust—even in tone and colors."`
    },
    4: {
      title: 'Create 3 Core Post Types',
      description: 'Choose + create your 3 core post types so your social content always has purpose, value, and variety.',
      content: `This week we're answering one of the most common questions I hear: "What kind of stuff should I even be posting?" Now that you've clarified your content pillars and your brand voice/visuals, we're going to build your 3 go-to post types.

🎯 This Week's Focus:
Choose + create your 3 core post types so your social content always has purpose, value, and variety.

✅ Your 3 Core Post Types:

💡 1. Educate (Teach Something Useful)
Helps your audience learn something relevant to your product or service.
Examples:
• "3 ways to use [your product] this season"
• "Why your [problem] keeps happening—and how to fix it"
• "FAQ: What's the difference between ___ and ___?"
Goal: Position yourself as a helpful, trustworthy expert.

📣 2. Promote (Sell Without Selling)
Shine a spotlight on something you offer—but in a way that's about them, not just you.
Examples:
• "Need a quick gift this week? We've got you."
• "This just arrived → available in-store while it lasts!"
• "Here's why our [service] is a community favorite"
Goal: Keep your audience aware of what you offer without feeling salesy.

❤️ 3. Connect (Humanize Your Brand)
Let people in. Make them feel something. Remind them there's a person behind the business.
Examples:
• A photo of you with your "why" story
• A behind-the-scenes of a workday or prep session
• A customer moment or shoutout
Goal: Build trust, warmth, and loyalty through authenticity.

💡 Pro Tip: You can rotate pillars within each post type. For example, "Educate" might mean product tips this week, and industry tips next week.`
    },
    5: {
      title: 'Build a Simple Weekly Content Plan',
      description: 'Create a weekly posting plan you can realistically stick to and repeat.',
      content: `You've clarified your voice, visual style, core post types, and content pillars—now it's time to connect the dots into a weekly rhythm you can repeat. This week is all about turning your strategy into a simple weekly content plan that fits your schedule, your energy, and your audience.

🎯 This Week's Focus:
Create a weekly posting plan you can realistically stick to and repeat.

✅ Step 1: Pick Your Weekly Posting Frequency
Ask yourself: How many times can I post per week consistently?
• Beginner Flow: 3x/week (Mon-Wed-Fri)
• Confident Flow: 4–5x/week (Mon–Fri)

✅ Step 2: Match Post Types to Days
Use this table to create your personalized weekly plan:
• Monday: Educate 💡 - Tip, FAQ, or "how-to" based on your product or service
• Tuesday: Connect ❤️ - Behind-the-scenes or business journey
• Wednesday: Educate 💡 - Customer Q&A or myth-busting post
• Thursday: Promote 📣 - Offer, product, or service spotlight
• Friday: Connect ❤️ - Community story, light/fun moment, or staff shoutout

✅ Step 3: Choose When You'll Plan + Post Each Week
Pick your content planning hour (even 30 minutes helps):
• Will you plan posts on Fridays for the next week?
• Schedule them on Sundays?
• Create graphics all at once in Canva?

💡 Quick Tip: "Planning your content doesn't make you rigid—it makes you free to focus on running your business."`
    },
    6: {
      title: 'Design Branded Post Templates',
      description: 'Create 2–4 reusable Canva templates for your top post types—so your feed stays consistent and quick to manage.',
      content: `This week, we make your social media life a lot easier—and more polished. You've already nailed your content strategy. Now let's make sure your visuals reflect that clarity with branded post templates that save time and create consistency.

🎯 This Week's Focus:
Create 2–4 reusable Canva templates for your top post types—so your feed stays consistent and quick to manage.

✅ Step 1: Choose 2–4 Post Types to Template
Pick the types of content you share most. For example:
• 💡 Tip or FAQ Template
• 📣 Product/Offer Promo Template
• ❤️ Testimonial or Customer Highlight
• 📍 Local Shoutout / Quote / Event Feature

Bonus: Include your brand elements like:
• Logo or icon
• Fonts and brand colors
• Handle or website (small text in corner)
• Photo placeholder or product mockup

✅ Step 2: Keep It Simple
Design with ease and repetition in mind:
• Use Canva (Pro or free) and save as "Brand Templates"
• Choose square or vertical format
• Leave space for headlines or short captions
• Don't try to design for every post—just the most common ones

Templates should:
✔ Be editable in under 5 minutes
✔ Match your overall visual tone
✔ Feel like you—not a stock account

💡 Quick Tip: "Templates make your brand look consistent—and your workflow feel 10x easier."`
    },
    7: {
      title: 'Improve Your Profile Bios, Links & Highlights',
      description: 'Polish your bio, links, and profile layout so visitors immediately know who you are, what you do, and how to take the next step.',
      content: `This week, we focus on the front door of your digital presence: your profile. When someone stumbles across your Instagram or Facebook page, you have about 5 seconds to make it clear, appealing, and actionable. If your bio is vague, your links are broken, or your highlights are outdated… you might be losing customers before they ever engage.

🎯 This Week's Focus:
Polish your bio, links, and profile layout so visitors immediately know who you are, what you do, and how to take the next step.

✅ Step 1: Refresh Your Bio
Make sure it clearly answers:
• Who you help
• What you offer
• Where you're located (if local)
• What action they should take (book, shop, DM, etc.)

Instagram Bio Formula:
👉 [What you do or offer]
📍 [Your city or neighborhood]
📅 [Call to action—"Book now," "Shop online," etc.]
🔗 Link below (to site, menu, scheduler, etc.)

✅ Step 2: Clean Up Your Links
• Use a tool like Linktree, Stan, or Later to organize links
• Remove broken or irrelevant links
• Make sure your top call-to-action is visible at the top

✅ Step 3: Update Highlights or Pinned Posts (Instagram)
Pin your top 3–4 most important posts (about, testimonial, new offer, FAQ)
Use Highlights to showcase:
• About / Welcome
• Services or Menu
• Behind-the-Scenes
• Testimonials / Reviews
• Events / Community / Promotions

💡 Quick Tip: "Your profile is a 24/7 greeter. Make it clear, warm, and confident."`
    },
    8: {
      title: 'Schedule 1 Week of Content in Advance',
      description: 'Plan, design, write, and schedule one week of posts in advance—using the content structure we\'ve built together.',
      content: `This week we flip the switch from planning to publishing. You've got the systems. Now it's time to take the pressure off by scheduling an entire week of content ahead of time—so you can stay consistent without having to show up every single day. This is where you go from "trying to post" to running your content like a real brand.

🎯 This Week's Focus:
Plan, design, write, and schedule one week of posts in advance—using the content structure we've built together.

✅ Step 1: Pick Your Post Days (Based on Your Weekly Plan)
Choose your 3–5 post days based on your customized schedule.
Example:
• Monday – Educate
• Wednesday – Connect
• Friday – Promote

✅ Step 2: Prep Your Content
Using your templates + weekly plan:
• Write your captions (keep it simple, clear, and friendly)
• Plug in your photos or graphics
• Use your 3 core post types to stay focused (Educate, Promote, Connect)

💡 Not everything needs to be designed—raw photos + well-written captions = great content.

✅ Step 3: Schedule Your Posts
Use one of these tools (free or low-cost):
• Meta Business Suite (for Facebook/Instagram)
• Later, Planoly, or Buffer
• Or: set a recurring reminder and post manually

Bonus: Schedule 1–2 stories or story prompts too!

💡 Quick Tip: "Content is easiest when it's not urgent."`
    },
    9: {
      title: 'Engage Daily for 10 Minutes',
      description: 'Create a daily 10-minute social engagement routine to grow your reach and build loyalty.',
      content: `Posting is half the strategy—engaging is the other half. This week is about connecting, not just broadcasting. A consistent, small habit of engagement can help you show up in more feeds (thanks, algorithm!), build real relationships with followers, and get more likes, comments, shares, and visibility.

🎯 This Week's Focus:
Create a daily 10-minute social engagement routine to grow your reach and build loyalty.

✅ Your 10-Minute Daily Engagement Routine
Do this once a day—morning, midday, or right after you post.

1. Warm Up (2 min):
• Like and reply to comments on your posts
• Respond to DMs or mentions
• React to any recent story replies or tags

2. Give Some Love (5 min):
• Leave thoughtful comments (not just emojis) on 3–5 posts from:
  - Customers
  - Local businesses
  - Partners or industry friends
• Bonus: Share a story from another local brand and tag them

3. Start a Conversation (3 min):
• Comment on 1–2 relevant local hashtags
• Vote on stories, drop a reaction, or ask a question
• Follow or reconnect with 1 new potential customer

💡 That's it! 10 minutes a day, 5x/week = major momentum.

💡 Quick Tip: "Don't just post and ghost. A like is polite, but a comment starts a conversation."`
    },
    10: {
      title: 'Reuse 1 Old Post with a Fresh Spin',
      description: 'Choose a strong post from your archive and recreate it with a new angle, format, or call to action.',
      content: `Not everything you post has to be brand new. This week, we're making social media easier by taking one of your past posts—and reworking it into something new. You've already done the hard part (creating the idea)—now let's give it new life for people who missed it the first time. This is what smart brands do: repeat, remix, and stay visible without burning out.

🎯 This Week's Focus:
Choose a strong post from your archive and recreate it with a new angle, format, or call to action.

✅ Step 1: Find a Strong Post to Repurpose
Look back over the last 1–3 months and pick a post that:
• Got solid engagement (likes, comments, shares)
• Had a message or story that's still relevant
• Felt like it connected with your audience or represented your brand well

✅ Step 2: Choose How to Refresh It
Here are 5 simple ways to remix a post:
• A photo with a tip → Turn the tip into a carousel with 3 quick ideas
• A caption with a story → Record it as a reel or voice-over
• A promo post → Re-share the product with a behind-the-scenes video
• A long caption → Pull out 1 quote or stat and make it a graphic
• A testimonial quote → Share it again with a photo of the customer or product

✅ Step 3: Repost with a Slightly Different CTA
Use a fresh call to action like:
• "Did you miss this the first time?"
• "This has been coming up a lot lately…"
• "We've had new followers since we last shared this—here's a tip worth repeating."

💡 Quick Tip: "If it was valuable once, it's worth repeating. People need to see things 7+ times before they act."`
    },
    11: {
      title: 'Run a Mini Engagement Campaign',
      description: 'Run a small campaign that boosts engagement through polls, giveaways, Q&As, or audience interaction.',
      content: `This week, we're going to spark interaction and increase your visibility with a small but mighty campaign designed to get people talking, clicking, voting, or tagging. Think of it like a social nudge—a lightweight event or prompt that gives your audience a reason to engage right now. The result? More reach, more conversation, and often, more new followers too.

🎯 This Week's Focus:
Run a small campaign that boosts engagement through polls, giveaways, Q&As, or audience interaction.

✅ Step 1: Pick Your Campaign Type
Choose one based on your time and energy this week:

🗳️ Option 1: Run a Story Poll or Quiz
• Ask 3–5 quick questions in Instagram Stories
• Use stickers like polls, quizzes, sliders
• Topic ideas: This or that, product preferences, holiday favorites, "would you rather?"

🎁 Option 2: Host a Simple Giveaway
• Prize: $10–25 gift card, free product, or a partner's item
• Entry: "Follow + tag 1 friend," "Comment to win," or "Vote in our story"
• Bonus: Collaborate with another biz to boost exposure

💬 Option 3: Ask a Fun Question in Your Feed
Prompt your followers to comment:
• "What's your favorite [product category] right now?"
• "Finish the sentence: I always visit [your biz] when…"
• "Tag a friend you'd bring to our next event!"

🤔 Option 4: Host a Q&A
• Post a story with the Question sticker
• Or go live and answer FAQs about your biz, services, or process

✅ Step 2: Promote It Clearly
Whatever you choose—make sure you:
• Tell people how to participate
• Mention when you'll close voting or announce results
• Use Stories, feed, or pinned posts to spread the word

Even 15–20 interactions is a great result for most local businesses!

💡 Quick Tip: "When you ask people to interact for fun, they're more likely to engage when it matters."`
    },
    12: {
      title: 'Review Insights & Set Up Next 30-Day Plan',
      description: 'Review your last 12 weeks, gather insights, and choose your next social goal or strategy track.',
      content: `You've made it through 12 weeks of intentional, strategic, and community-driven content—and I hope you can feel the difference it's made. This week isn't about pushing a new post. It's about celebrating the progress, reflecting on what worked, and deciding how you want to grow from here. You don't need to overhaul your strategy. You just need to double down on what's working—and stay consistent.

🎯 This Week's Focus:
Review your last 12 weeks, gather insights, and choose your next social goal or strategy track.

✅ Step 1: Reflect on Your Progress
Take a few minutes to journal or jot down your answers to these questions:
• What changed? (Did engagement go up? Did content feel easier? Did you gain clarity?)
• What worked best for you? (Was it batching? Polls? Storytelling? Simpler templates?)
• What do you want to keep doing—or stop doing? (Any habits that helped? Any strategies that drained you?)
• What's your next social goal?
  → Grow engagement?
  → Start video content?
  → Increase local visibility?
  → Drive sales for a specific offer?

This reflection is how we stay intentional—not reactive.

✅ Step 2: Check Your Metrics (Optional)
Go into Instagram/Facebook insights and compare your baseline (from Week 1) to now:
• Followers
• Engagement rate (likes, comments, shares)
• Story views
• Reach or profile visits

You'll likely see a bump—not just in numbers, but in confidence and consistency.

✅ Step 3: Set a 30-Day Plan
Pick one focus for the next month:
• Continue your current rhythm
• Try a mini series or recurring post (e.g. "Tuesday Tips")
• Show up in Stories 3x/week
• Run another engagement campaign

Small, sustainable goals > big burnout energy.

💡 Quick Tip: "Consistency beats perfection. Keep showing up, and you'll keep growing."`
    }
  };
  
  for (let week = 1; week <= 12; week++) {
    const isUnlocked = isActive && week <= currentWeek;
    const isCompleted = isActive && week < currentWeek;
    
    modules.push({
      id: `${goalId}${week.toString().padStart(2, '0')}`,
      weekNumber: week,
      title: weekContent[week as keyof typeof weekContent].title,
      description: weekContent[week as keyof typeof weekContent].description,
      content: weekContent[week as keyof typeof weekContent].content,
      tasks: createMarketingTasksForWeek(week),
      isUnlocked,
      isCompleted
    });
  }
  
  return modules;
};

export const mockMarketingGoals: MarketingGoal[] = [
  {
    id: '1',
    title: 'Improve Social Media Strategy & Engagement',
    description: 'Build a consistent social presence that reflects your brand and encourages community connection.',
    industry: 'General',
    duration: 12,
    modules: createMarketingModules('1', false, 0), // Not active, no weeks completed
    isActive: false,
    currentWeek: 0,
    progress: 0
  },
  {
    id: '2',
    title: 'Email Marketing Mastery',
    description: 'Create high-converting email campaigns that drive sales',
    industry: 'E-commerce',
    duration: 12,
    modules: createMarketingModules('2', false, 0),
    isActive: false,
    currentWeek: 0,
    progress: 0
  },
  {
    id: '3',
    title: 'Content Marketing Strategy',
    description: 'Develop a comprehensive content marketing plan',
    industry: 'B2B',
    duration: 12,
    modules: createMarketingModules('3', false, 0),
    isActive: false,
    currentWeek: 0,
    progress: 0
  },
  {
    id: '4',
    title: 'Local SEO Optimization',
    description: 'Dominate local search results and drive foot traffic',
    industry: 'Local Business',
    duration: 12,
    modules: createMarketingModules('4', false, 0),
    isActive: false,
    currentWeek: 0,
    progress: 0
  },
  {
    id: '5',
    title: 'Influencer Marketing Campaign',
    description: 'Leverage influencer partnerships to expand your reach',
    industry: 'Fashion & Beauty',
    duration: 12,
    modules: createMarketingModules('5', false, 0),
    isActive: false,
    currentWeek: 0,
    progress: 0
  }
]; 