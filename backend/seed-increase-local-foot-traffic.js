const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3003;

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    try {
      const url = new URL(origin);
      const isLocalHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      const isLocalNetwork = url.hostname === '10.0.0.53';
      const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
      if ((isLocalHost || isLocalNetwork) && isHttp) {
        return callback(null, true);
      }
    } catch (e) {}
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

// In-memory store for marketing goals
let marketingGoals = [];

// Seed data function for Increase Local Foot Traffic
function seedMarketingData() {
  const increaseLocalFootTraffic = {
    id: 'increase-local-foot-traffic',
    title: 'Increase Local Foot Traffic',
    description: 'Strategic marketing plan to boost local visibility and drive foot traffic to your business.',
    industry: 'Local Business',
    duration: 12,
    isActive: true,
    startDate: new Date(),
    currentWeek: 1,
    progress: 75,
    modules: []
  };

  // Create 12 weeks of modules with the actual content you created
  for (let week = 1; week <= 12; week++) {
    const isUnlocked = week <= increaseLocalFootTraffic.currentWeek;
    const isCompleted = week < increaseLocalFootTraffic.currentWeek;
    
    let module;
    
    if (week === 1) {
      // Week 1: Audit Visibility
      module = {
        id: `week-1`,
        weekNumber: week,
        title: 'Week 1: Audit Visibility',
        description: 'Assess your current marketing presence and identify opportunities for improvement.',
        content: `<h2>Week 1: Audit Visibility</h2>
<p>Before you begin, jot down some baseline metrics – for example, how many walk-ins you get in an average week right now. These numbers will help you see how far you've come by Week 12. Remember to keep the tone fun and stay encouraged: you got this!</p>

<p><strong>Theme:</strong> Kickstart traffic with an irresistible offer and clear signage. This sets the stage for immediate ROI (Return on Investment – basically, seeing a quick payoff for your efforts). By the end of this week, you want to see new faces walking in because of your promotion.</p>

<p><strong>Why this matters:</strong> A limited-time in-store offer (like a special discount or freebie) creates urgency and gives people a reason to visit now, not later. Coupled with eye-catching signage (signs in your window, door, or sidewalk), you'll grab the attention of anyone passing by. Signage is often the first impression of your business – make it count! (Fun fact: a study found about 76% of consumers have entered a store they'd never visited before just because a sign caught their eye. That means a good sign can literally pull new customers in off the street.)</p>

<h4>Pro Tip:</h4>
<p>Keep the vibe positive and fun. When promoting the offer, be excited! For example, "We're doing something special: this week all coffee comes with a free cookie! Hope you enjoy it!" Enthusiasm is contagious and makes customers feel like they're part of something exciting. Also, make sure your team (if you have one) is on the same page and equally informed about the offer details. Lastly, plan for a slight increase in traffic – have enough stock of the item on sale or ingredients for that free cookie, etc. Nothing's worse than drawing people in and then disappointing them by running out.</p>`,
        isUnlocked,
        isCompleted,
        tasks: [
          {
            id: 'task-1-1',
            taskId: 'week-1',
            title: 'Measure your starting point',
            shortDescription: 'Record your current foot traffic and sales metrics as a baseline for comparison.',
            description: 'Before anything else, record your current foot traffic. For example, count how many people come in this week normally. This is your baseline to compare later. Also note any daily sales or other metrics you care about.',
            estimatedTime: '15min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-1-2',
            taskId: 'week-1',
            title: 'Create a simple, juicy offer',
            shortDescription: 'Design a promotion that will entice people immediately with discounts, freebies, or special deals.',
            description: 'Think of a promotion that will entice folks immediately. It could be "Buy one, get one 50% off," "Free dessert with any meal," or "10% off for first-time customers." Make it easy to understand and valuable enough that people feel they shouldn\'t miss it. (Keep your costs in mind, but often a small perk can go a long way.) If you\'re unsure what offer would appeal, brainstorm a few ideas – maybe even ask a couple of regulars what would excite them, or use an AI assistant to suggest popular promotions in your industry.',
            estimatedTime: '30min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-1-3',
            taskId: 'week-1',
            title: 'Prepare your signage',
            shortDescription: 'Create bold, clear signs advertising your offer for both outside and inside placement.',
            description: 'Once your offer is decided, advertise it with a bold sign. For example, a chalkboard on the sidewalk or a bright poster in your window that says "This Week Only: [Your Offer]!" Use big, clear letters. Someone walking or driving by should grasp it in seconds. Include a call to action like "Come in today" or an arrow pointing inside. If designing signs isn\'t your forte, you could ask a crafty friend for help or even get a quick design idea from an AI tool – but a hand-written enthusiastic message works fine too!',
            estimatedTime: '45min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-1-4',
            taskId: 'week-1',
            title: 'Promote in-store',
            shortDescription: 'Tell every customer about the offer and ensure signs are visible to passersby.',
            description: 'Tell every customer who comes in about the offer. If they buy something, make sure they know about the deal (maybe they\'ll purchase more or tell a friend). You can say, "By the way, we have a special this week…" Also, place the sign where even people just walking by or driving slowly can see it. Consider both outside and inside placement (window, near the entrance, at the register). The goal is that no one in the vicinity misses your special deal.',
            estimatedTime: '20min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-1-5',
            taskId: 'week-1',
            title: 'Run the offer for a limited time',
            shortDescription: 'Set a deadline (1-2 weeks) and communicate urgency to encourage immediate action.',
            description: 'A short timeframe (like one week or two weeks maximum) adds urgency. Let customers know it\'s "for a limited time." This encourages immediate action. At the end of the promo period, you\'ll also be able to clearly see the bump it gave you. (Pro Tip: If the offer is doing really well and you\'re able, you might extend it a bit — but generally, stick to the deadline so customers learn to jump on your deals.)',
            estimatedTime: '10min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
          }
        ]
      };
    } else if (week === 2) {
      // Week 2: Google Business Profile Optimization
      module = {
        id: `week-2`,
        weekNumber: week,
        title: 'Week 2: Google Business Profile Optimization',
        description: 'Optimize your Google Business Profile to improve local search visibility and attract more customers.',
        content: `<h2>Week 2: Google Business Profile Optimization</h2>
<p>This week focuses on making sure your business shows up when people search for what you offer in your area. Google Business Profile is often the first thing potential customers see about your business.</p>

<p><strong>Why this matters:</strong> 92% of local searches happen on mobile devices, and 78% of these searches result in offline purchases. Optimizing for local search is essential for increasing foot traffic.</p>

<p><strong>Pro Tip:</strong> Consistency across all platforms (Google My Business, Facebook, Yelp, etc.) is key for local SEO success.</p>`,
        isUnlocked,
        isCompleted,
        tasks: [
          {
            id: 'task-2-1',
            taskId: 'week-2',
            title: 'Claim and Optimize Google My Business',
            description: 'Set up and fully optimize your Google My Business listing with complete information, photos, and business hours.',
            estimatedTime: '60min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-2-2',
            taskId: 'week-2',
            title: 'Local Keyword Research',
            description: 'Research and identify local search terms your customers use to find businesses like yours.',
            estimatedTime: '45min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-2-3',
            taskId: 'week-2',
            title: 'Review Response Strategy',
            description: 'Create a system for managing and responding to customer reviews promptly and professionally.',
            estimatedTime: '30min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
          }
        ]
      };
    } else if (week === 3) {
      // Week 3: Social Media Strategy
      module = {
        id: `week-3`,
        weekNumber: week,
        title: 'Week 3: Social Media Strategy',
        description: 'Build a social media presence that drives local engagement and community connections.',
        content: `<h2>Week 3: Social Media Strategy</h2>
<p>Social media isn't just about posting content - it's about building relationships with your local community and creating authentic engagement.</p>

<p><strong>Why this matters:</strong> Local businesses that actively engage on social media see 2x more foot traffic than those who don't. Social media helps you stay top-of-mind with local customers.</p>

<p><strong>Pro Tip:</strong> Focus on quality engagement over quantity of posts. Meaningful interactions with your community build stronger customer relationships.</p>`,
        isUnlocked,
        isCompleted,
        tasks: [
          {
            id: 'task-3-1',
            taskId: 'week-3',
            title: 'Choose Primary Platforms',
            description: 'Select 2-3 social platforms where your target customers are most active and engaged.',
            estimatedTime: '30min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 2 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-3-2',
            taskId: 'week-3',
            title: 'Create Content Calendar',
            description: 'Plan 2 weeks of social media content focused on local engagement and community building.',
            estimatedTime: '60min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 2 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-3-3',
            taskId: 'week-3',
            title: 'Engagement Strategy',
            description: 'Develop a plan for responding to comments and messages within 24 hours to maintain active community engagement.',
            estimatedTime: '25min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 2 * 7 * 24 * 60 * 60 * 1000)
          }
        ]
      };
    } else {
      // Generic content for weeks 4-12 (to be developed)
      module = {
        id: `week-${week}`,
        weekNumber: week,
        title: `Week ${week}: Advanced Local Marketing`,
        description: `Continue building on your foundation with advanced strategies to drive more local foot traffic.`,
        content: `<h2>Week ${week}: Advanced Local Marketing</h2>
<p>Continue building on your foundation with advanced strategies to drive more local foot traffic.</p>

<p>This week focuses on:</p>
<ul>
<li>Advanced local marketing tactics</li>
<li>Partnership development</li>
<li>Customer retention strategies</li>
<li>Performance measurement</li>
</ul>

<p><em>Detailed content for this week will be developed as part of the complete 12-week program.</em></p>`,
        isUnlocked,
        isCompleted,
        tasks: [
          {
            id: `task-${week}-1`,
            taskId: `week-${week}`,
            title: `Week ${week} Primary Task`,
            description: `Complete the main marketing activity for week ${week} to continue building your local presence.`,
            estimatedTime: '45min',
            isCompleted: false,
            dueDate: new Date(Date.now() + (week - 1) * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: `task-${week}-2`,
            taskId: `week-${week}`,
            title: `Week ${week} Secondary Task`,
            description: `Supporting activity to reinforce your marketing efforts and maintain momentum.`,
            estimatedTime: '30min',
            isCompleted: false,
            dueDate: new Date(Date.now() + (week - 1) * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: `task-${week}-3`,
            taskId: `week-${week}`,
            title: `Week ${week} Review & Plan`,
            description: `Review your progress and plan for the following week to maintain consistent growth.`,
            estimatedTime: '20min',
            isCompleted: false,
            dueDate: new Date(Date.now() + (week - 1) * 7 * 24 * 60 * 60 * 1000)
          }
        ]
      };
    }

    increaseLocalFootTraffic.modules.push(module);
  }

  marketingGoals = [increaseLocalFootTraffic];
  console.log('✅ Increase Local Foot Traffic marketing data seeded successfully');
  console.log(`📊 Created ${marketingGoals.length} marketing goal(s)`);
  console.log(`📋 Total modules: ${marketingGoals[0].modules.length}`);
  console.log(`✅ Total tasks: ${marketingGoals[0].modules.reduce((sum, m) => sum + m.tasks.length, 0)}`);
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Increase Local Foot Traffic Seed Server is running',
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

// Marketing API endpoints
app.get('/api/marketing/goals/active', (req, res) => {
  const activeGoal = marketingGoals.find(goal => goal.isActive);
  if (activeGoal) {
    res.json({ success: true, data: activeGoal });
  } else {
    res.json({ success: true, data: null, message: 'No active marketing goal' });
  }
});

app.get('/api/marketing/goals', (req, res) => {
  res.json({ success: true, data: marketingGoals });
});

app.put('/api/marketing/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { isCompleted } = req.body;
  
  // Find the task in any module of any goal
  let taskFound = false;
  marketingGoals.forEach(goal => {
    goal.modules.forEach(module => {
      const task = module.tasks.find(t => t.id === id);
      if (task) {
        task.isCompleted = isCompleted;
        taskFound = true;
      }
    });
  });

  if (taskFound) {
    res.json({ success: true, message: 'Task updated' });
  } else {
    res.status(404).json({ success: false, error: 'Task not found' });
  }
});

app.put('/api/marketing/goals/:id', (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;
  
  const goal = marketingGoals.find(g => g.id === id);
  if (goal) {
    goal.progress = progress;
    res.json({ success: true, data: goal });
  } else {
    res.status(404).json({ success: false, error: 'Goal not found' });
  }
});

// Seed data on startup
seedMarketingData();

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Increase Local Foot Traffic Seed Server running on port ${PORT}`);
  console.log(`📊 Environment: development`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Network accessible: http://10.0.0.53:${PORT}/health`);
  console.log(`📋 Marketing API: http://localhost:${PORT}/api/marketing/goals/active`);
});
