import { supabase } from '../config/supabase';

/**
 * Migrate Social Media track with the new comprehensive content
 * This creates the proper week-by-week content structure
 */
async function migrateSocialMediaTrack() {
  try {
    console.log('🔄 Migrating Social Media track with new content...');

    // Find the social media track definition
    const { data: trackDef, error: trackError } = await supabase
      .from('marketing_track_definitions')
      .select('id')
      .eq('slug', 'social-media-strategy')
      .single();

    if (trackError || !trackDef) {
      console.error('❌ Could not find social media track definition');
      return;
    }

    console.log('📋 Found track definition:', trackDef.id);

    // Define the new 12-week content structure
    const moduleContent = [
      {
        week_number: 1,
        title: 'Social Audit & Baseline Tracking',
        description: 'Laying your foundation.',
        content_markdown: `## Week 1: Social Audit & Baseline Tracking
**Theme:** Laying your foundation.

**Why this matters:** Businesses that measure starting points grow faster because they can see progress. An audit highlights what's working (and what's not), while posting right away creates a sense of momentum and signals to your audience that you're active. Plus, the algorithm favors accounts that post consistently, so getting started immediately helps your visibility.

### What to do this week:

- **Measure your starting point:** Before anything else, record your current social media metrics. For example, count your followers, average likes per post, average comments, and story views. This is your baseline to compare later. Also note your current posting frequency and engagement rate.

- **Run a profile audit:** Check your bio, profile picture, links, and highlights. Your bio should clearly say what you do, your profile pic should be current and professional, and your link should lead to something useful (website, menu, booking, etc.). Pin or highlight your best content that reflects your top offers.

- **Publish 3 quick-win posts:** Share your story, one quick tip, and a behind-the-scenes update. These quick wins give you immediate visibility and help establish your presence. Use a simple 5-day posting rhythm: Monday (Behind-the-Scenes), Tuesday (Tip/FAQ), Wednesday (Personal Story), Thursday (Product Feature), Friday (Fun/Community).

## Pro Tip
End your captions with a question—comments weigh more than likes in algorithms. Also, don't overthink your first posts. The goal is to start showing up consistently, not to create perfect content. You can always refine and improve as you go!`
      },
      {
        week_number: 2,
        title: 'Define Your Content Pillars',
        description: 'Clarity and consistency.',
        content_markdown: `## Week 2: Define Your Content Pillars
**Theme:** Clarity and consistency.

**Why this matters:** Content pillars simplify planning and ensure your posts always feel on-brand. They provide variety and structure so you're never scrambling for ideas. Businesses that define them maintain consistency and see higher engagement.

### What to do this week:

- **Select 3–4 content pillars:** Choose themes that represent your business (Products, Behind-the-Scenes, Tips, Testimonials, etc.).

- **Brainstorm 15 content ideas:** Write at least 5 ideas per pillar to create your content bank.

- **Draft 2 sample captions:** Put your pillars into practice immediately with sample posts.

## Pro Tip
Think of your pillars as conversation starters you revisit weekly.`
      },
      {
        week_number: 3,
        title: 'Brand Voice & Visual Style',
        description: 'Consistency in tone and design.',
        content_markdown: `## Week 3: Brand Voice & Visual Style
**Theme:** Consistency in tone and design.

**Why this matters:** People connect with brands that feel familiar. A clear voice and cohesive visuals build recognition and trust. Even simple style rules make your posts stand out and feel professional.

### What to do this week:

- **Define brand voice:** Choose 3 words and set tone rules.

- **Pick brand visuals:** Select 2–3 colors and fonts.

- **Design 2–4 Canva templates:** Create templates for tips, promos, or testimonials.

- **Refresh recent posts:** Update visuals to match your new style.

## Pro Tip
Simple + consistent beats fancy + inconsistent every time.`
      },
      {
        week_number: 4,
        title: 'Core Post Types (Educate, Connect, Promote)',
        description: 'Rhythm and balance.',
        content_markdown: `## Week 4: Core Post Types (Educate, Connect, Promote)
**Theme:** Rhythm and balance.

**Why this matters:** Audiences love predictability. By focusing on three post types—Educate, Connect, Promote—you'll maintain balance between teaching, building relationships, and selling. It prevents "random posting" and ensures variety without burnout.

### What to do this week:

- **Identify your 3 core post types:** Focus on Educate, Connect, and Promote.

- **Draft 1 post idea for each type:** Create sample posts for each category.

- **Match types to pillars:** Connect your post types to your content pillars.

- **Create 1 sample Canva design:** Design a template for one post type.

## Pro Tip
You don't need 30 ideas—you just need to rotate the same three good ones.`
      },
      {
        week_number: 5,
        title: 'Weekly Content Plan',
        description: 'Planning for consistency.',
        content_markdown: `## Week 5: Weekly Content Plan
**Theme:** Planning for consistency.

**Why this matters:** Consistency drives trust and visibility. Planning ahead removes stress and saves time. A weekly rhythm makes it easy to stay on track without scrambling.

### What to do this week:

- **Decide posting frequency:** Choose 3–5 times per week.

- **Map post types to days:** Assign Educate, Connect, Promote to specific days.

- **Schedule 1 week of posts:** Plan and schedule a full week in advance.

- **Create a weekly planning ritual:** Set aside time for content planning.

## Pro Tip
Planning doesn't make you rigid—it frees you to focus on running your business.`
      },
      {
        week_number: 6,
        title: 'Branded Templates & Profile Polish',
        description: 'Professional polish.',
        content_markdown: `## Week 6: Branded Templates & Profile Polish
**Theme:** Professional polish.

**Why this matters:** Templates save time and keep your feed visually consistent. A polished profile converts casual visitors into followers or customers.

### What to do this week:

- **Create 2–4 Canva templates:** Design reusable branded templates.

- **Rewrite your bio:** Make it clear and actionable.

- **Update highlights/pinned posts:** Showcase your best content.

- **Test your link hub:** Ensure all links work properly.

## Pro Tip
Your profile is your storefront—make it obvious what you offer and how to buy.`
      },
      {
        week_number: 7,
        title: 'Daily Engagement Ritual',
        description: 'Conversations over broadcasting.',
        content_markdown: `## Week 7: Daily Engagement Ritual
**Theme:** Conversations over broadcasting.

**Why this matters:** Engagement drives visibility. The more you interact, the more people see your content. Daily habits compound over time.

### What to do this week:

- **Reply to all recent comments:** Respond to engagement on your posts.

- **Respond to DMs:** Keep your direct messages current.

- **Comment on 3–5 posts:** Engage meaningfully with others' content.

- **Start 1 new conversation daily:** Build relationships through interaction.

## Pro Tip
Likes are polite—comments start relationships.`
      },
      {
        week_number: 8,
        title: 'User-Generated Content & Scheduling',
        description: 'Featuring your community.',
        content_markdown: `## Week 8: User-Generated Content & Scheduling
**Theme:** Featuring your community.

**Why this matters:** When you share customer stories, you deepen loyalty and extend reach. UGC feels more authentic than brand posts.

### What to do this week:

- **Create 1 UGC prompt post:** Encourage followers to tag you.

- **Repost at least 1 customer story:** Share authentic customer content.

- **Thank/tag contributors:** Show appreciation for user-generated content.

- **Schedule 1 week of content:** Plan and schedule your next week.

## Pro Tip
Featuring customers creates superfans who share your business with pride.`
      },
      {
        week_number: 9,
        title: 'Repurpose & Collaborate',
        description: 'Work smarter with content.',
        content_markdown: `## Week 9: Repurpose & Collaborate
**Theme:** Work smarter with content.

**Why this matters:** Repurposing lets you multiply impact without doubling effort. Collaboration extends reach into new networks.

### What to do this week:

- **Identify 1 top-performing post:** Find content worth repurposing.

- **Repurpose into 2 new formats:** Create carousel, reel, or story versions.

- **Reach out to 1 collaborator:** Connect with local businesses.

- **Cross-promote at least once:** Share collaborative content.

## Pro Tip
Your best content deserves a second life.`
      },
      {
        week_number: 10,
        title: 'Offer Ladder & Milestone Celebration',
        description: 'Driving action.',
        content_markdown: `## Week 10: Offer Ladder & Milestone Celebration
**Theme:** Driving action.

**Why this matters:** Clear calls to action increase conversions. Celebrating milestones humanizes your brand and builds community pride.

### What to do this week:

- **Draft 3-part post sequence:** Create educate, proof, action sequence.

- **Design supporting graphics:** Create visuals for your sequence.

- **Publish a milestone celebration:** Share achievements with your audience.

- **Thank your audience:** Show appreciation for their support.

## Pro Tip
Inviting your followers to celebrate makes them invested in your growth.`
      },
      {
        week_number: 11,
        title: 'Mini Engagement Campaign',
        description: 'Spark interaction.',
        content_markdown: `## Week 11: Mini Engagement Campaign
**Theme:** Spark interaction.

**Why this matters:** Small campaigns (polls, giveaways, Q&As) create fun reasons for people to engage. More engagement = more reach.

### What to do this week:

- **Choose a campaign format:** Pick poll, giveaway, or Q&A.

- **Write clear rules or prompts:** Make participation easy to understand.

- **Promote it in stories/feed:** Spread the word about your campaign.

- **Reply to all participants:** Engage with everyone who participates.

## Pro Tip
Fun, low-pressure campaigns train your audience to interact consistently.`
      },
      {
        week_number: 12,
        title: 'Review & Next 30-Day Plan',
        description: 'Reflection and momentum.',
        content_markdown: `## Week 12: Review & Next 30-Day Plan
**Theme:** Reflection and momentum.

**Why this matters:** Looking back helps you see progress and refine strategy. A 30-day plan ensures you keep momentum after the track.

### What to do this week:

- **Review metrics vs. baseline:** Compare to Week 1 numbers.

- **List top 3 wins:** Celebrate your achievements.

- **Choose 1 next-month focus:** Pick your continued growth area.

- **Pre-schedule 1 week:** Plan ahead for sustained momentum.

## Pro Tip
Consistency beats perfection—showing up regularly is what drives growth long term.`
      }
    ];

    // Update each module definition
    for (const module of moduleContent) {
      console.log(`📝 Updating Week ${module.week_number}: ${module.title}`);
      
      const { error: updateError } = await supabase
        .from('marketing_module_definitions')
        .update({
          title: module.title,
          description: module.description,
          content_markdown: module.content_markdown
        })
        .eq('track_id', trackDef.id)
        .eq('week_number', module.week_number);

      if (updateError) {
        console.error(`❌ Error updating Week ${module.week_number}:`, updateError);
      } else {
        console.log(`✅ Updated Week ${module.week_number}`);
      }
    }

    console.log('🎉 Successfully migrated Social Media track with new content!');

  } catch (error) {
    console.error('❌ Error migrating social media track:', error);
  }
}

// Run the script if called directly
if (require.main === module) {
  migrateSocialMediaTrack().then(() => process.exit(0));
}

export default migrateSocialMediaTrack;
