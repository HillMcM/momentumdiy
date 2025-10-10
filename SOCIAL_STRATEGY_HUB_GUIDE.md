# Social Media Strategy Hub - Feature Guide

## Overview

The Social Media Strategy Hub is a comprehensive workspace for planning and managing social media content. It automatically appears in the navigation for users on social media-related marketing tracks.

---

## 🎯 Features

### 1. **Content Pillars Tab** 📋
Define 3-4 core content themes that guide your social media posts:
- Add color-coded pillars with names and descriptions
- Include example post ideas for each pillar
- Customize colors to visually organize your content

### 2. **Brand Voice & Visuals Tab** 🎨
Establish your brand's personality and visual identity:
- **Brand Voice**: Select tone attributes and adjectives
- **Personality Notes**: Write your brand's speaking style
- **Style Guide**: Document writing preferences (I vs we, emoji usage, etc.)
- **Brand Colors**: Add up to 6 brand colors with hex codes
- **Fonts**: Specify heading and body fonts
- **Visual Style**: Describe image style and design guidelines

### 3. **Posting Schedule Tab** 📅
Create a consistent posting routine:
- Set weekly posting frequency (1-7 posts per week)
- Assign specific days for posting
- Choose post types for each day:
  - **Educate**: Tips, how-tos, tutorials
  - **Promote**: Products, services, offers
  - **Connect**: Stories, behind-the-scenes, community building
- View schedule summary

### 4. **Templates Tab** 🖼️
Manage your branded post templates:
- Upload templates by category (Tips, Promotions, Testimonials, etc.)
- Preview templates with full-screen modal
- Integrated with asset management system
- Download templates anytime

### 5. **Metrics Tab** 📊
Track your social media growth:
- **Baseline Metrics**: Record starting numbers
- **Current Metrics**: Update regularly
- **Growth Tracking**: Automatic percentage calculations
- **Weekly Snapshots**: Document progress week by week
- Tracks: Followers, Avg Likes, Avg Comments, Story Views

### 6. **Collaboration Tab** 👥
Share and export your strategy:
- **Team Collaborators**: List team members (for reference)
- **PDF Export**: Download professional formatted PDF
- **Share Links**: Generate secure view-only links
  - Optional expiration dates
  - Track access times
  - Revokable links
  - Copy link with one click

---

## 🔗 PDF Export Feature

### Installation
The PDF export feature uses `jspdf` and `jspdf-autotable` packages (already installed).

### Usage
1. Navigate to the **Collaboration** tab
2. Click the **"Download PDF"** button
3. PDF generates automatically with:
   - Cover page with business name
   - All content pillars
   - Brand voice and visual style guide
   - Posting schedule table
   - Metrics snapshot
   - Team collaborators list

### PDF Contents
- ✅ Professional formatting
- ✅ Color-coded sections
- ✅ Tables for schedules and metrics
- ✅ Growth percentages
- ✅ Automatic pagination

---

## 🔗 Task Action Links Feature

### What Are Action Links?

Action links are quick-access buttons that appear on marketing track tasks. They provide direct navigation from tasks to relevant features in the app.

### How They Work

When a user sees a task like **"Define 3–4 content pillars for your brand"**, an action button appears:

```
[→ Open Strategy Hub]
```

Clicking this button navigates directly to the Social Strategy Hub with the **Content Pillars** tab already open.

### Setting Up Action Links

#### For Existing Tracks

Run the automated script to add action links to tasks:

```bash
cd backend
npm run add-social-strategy-links
```

This script:
- Finds the Social Media Strategy track
- Identifies tasks that should have action links
- Adds appropriate links based on task titles
- Shows progress and results

#### For New Tracks

When creating new tasks programmatically, include the `action_link` field:

```typescript
{
  title: "Define your content pillars",
  description: "...",
  estimatedTime: "30min",
  action_link: {
    url: "/app/social-strategy",
    label: "Open Strategy Hub",
    tab: "pillars"  // Optional: specify which tab to open
  }
}
```

#### Manually in Database

You can also add action links directly in Supabase:

```sql
UPDATE marketing_tasks
SET action_link = '{
  "url": "/app/social-strategy",
  "label": "Open Strategy Hub",
  "tab": "pillars"
}'
WHERE title LIKE '%content pillars%';
```

### Available Tabs

When linking to the Social Strategy Hub, you can specify these tabs:

- `pillars` - Content Pillars
- `voice` - Brand Voice & Visuals
- `schedule` - Posting Schedule
- `templates` - Templates
- `metrics` - Metrics
- `collaboration` - Collaboration & Sharing

### Example Task Mappings

The script automatically maps these tasks:

| Task Title | Links To | Tab |
|-----------|----------|-----|
| "Define 3–4 content pillars..." | Strategy Hub | pillars |
| "Craft your brand voice guidelines" | Strategy Hub | voice |
| "Outline your weekly content schedule" | Strategy Hub | schedule |
| "Create your templates..." | Strategy Hub | templates |
| "Record baseline engagement metrics" | Strategy Hub | metrics |

### Customizing Task Links

Edit `/backend/src/scripts/addSocialStrategyActionLinks.ts`:

```typescript
const TASK_ACTION_LINKS: Record<string, ActionLink> = {
  'Your Task Title': {
    url: '/app/social-strategy',
    label: 'Custom Button Text',
    tab: 'pillars'  // Optional
  },
  // Add more mappings...
};
```

Then run: `npm run add-social-strategy-links`

---

## 🚀 Auto-Save Feature

- Changes save automatically after 2 seconds of inactivity
- Visual feedback shows save status:
  - "Saving..." - Currently saving
  - "Unsaved changes" - Waiting to save
  - "✓ Saved" - Successfully saved
- No manual save button needed (it just works!)

---

## 🔒 Security Features

### Share Links
- Unique access codes (8-character UUID)
- Optional expiration dates
- Revokable at any time
- Track last access time
- View-only access (no editing)

### Data Privacy
- User data isolated by Row Level Security (RLS)
- Only strategy owner can edit
- Share links are read-only
- All data encrypted at rest

---

## 📱 Mobile Responsive

- All tabs work on mobile devices
- Touch-friendly buttons and forms
- Collapsible sections for better mobile UX
- Responsive grid layouts

---

## 🛠️ Technical Details

### Database Tables

**`social_media_strategies`**
- Stores all strategy data
- One record per user per track
- JSONB fields for flexibility

**`social_strategy_share_links`**
- Stores secure share links
- Linked to strategies via foreign key
- Supports expiration and revocation

**`marketing_tasks` (updated)**
- New `action_link` JSONB column
- Stores button URL, label, and optional tab

### API Endpoints

```
GET    /api/social-strategy              - Get user's strategy
PUT    /api/social-strategy              - Update strategy
POST   /api/social-strategy/share        - Create share link
GET    /api/social-strategy/share        - List share links
DELETE /api/social-strategy/share/:id    - Delete share link
PATCH  /api/social-strategy/share/:id    - Toggle active status
GET    /api/social-strategy/shared/:code - Public view (no auth)
```

### Frontend Routes

```
/app/social-strategy                     - Main hub (protected)
/app/social-strategy?tab=pillars         - Direct to specific tab
/shared/strategy/:accessCode             - Public shared view
```

---

## 💡 Best Practices

### For Users

1. **Start with Content Pillars**: This guides all other decisions
2. **Be Specific with Brand Voice**: Clear guidelines prevent confusion
3. **Realistic Posting Schedule**: Better to post 3x consistently than 7x sporadically
4. **Track Metrics Weekly**: Weekly snapshots show progress over time
5. **Use Templates**: Saves time and maintains consistency

### For Admins

1. **Add Action Links Early**: When creating tracks, include action links
2. **Test Share Links**: Verify expiration and access work correctly
3. **Monitor Usage**: Check metrics to see which features are used most
4. **Update Script Mappings**: Keep task titles and links in sync

---

## 🐛 Troubleshooting

### Action Links Not Showing?

1. Check task has `action_link` field in database
2. Run the script: `npm run add-social-strategy-links`
3. Verify track is active and user has access
4. Check browser console for JavaScript errors

### PDF Export Not Working?

1. Ensure `jspdf` and `jspdf-autotable` are installed
2. Check browser console for errors
3. Try a different browser (PDF generation uses browser APIs)
4. Ensure strategy has data to export

### Share Link Broken?

1. Check link hasn't expired
2. Verify link is marked as active in database
3. Test access code is correct (case-sensitive)
4. Check RLS policies on `social_strategy_share_links`

### Tab Not Opening from Action Link?

1. Check URL parameter format: `?tab=pillars`
2. Verify tab ID matches available tabs
3. Check browser console for routing errors
4. Ensure SocialStrategyHub properly reads query params

---

## 📝 Future Enhancements

Potential additions for future versions:

- [ ] Direct email sharing from Collaboration tab
- [ ] Advanced analytics charts for metrics
- [ ] Calendar integration for content scheduling
- [ ] AI-powered content idea generation
- [ ] Template editor built into the app
- [ ] Multi-platform metrics (Instagram, Facebook, etc.)
- [ ] Automated posting reminders
- [ ] Team collaboration with edit permissions

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review browser console for errors
3. Check database schema migrations are applied
4. Test with a clean browser session

---

**Happy strategizing! 🎉**

