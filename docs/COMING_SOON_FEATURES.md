# Coming Soon Features

This document tracks all planned features that are not yet publicly available but are in the development pipeline.

## Overview

This document serves as a roadmap for features that have been identified for future implementation. Features listed here have been removed from public-facing UI to maintain a polished user experience, but are documented here for planning and development purposes.

---

## Feature Categories

### 1. AI & Automation Features

#### AI Campaign Generator
**Status:** Planned  
**Location:** Profile Page (removed from UI)  
**Description:**  
An AI-powered campaign idea generator that integrates with the AI assistant. Users will be able to generate complete marketing campaign ideas based on their business profile, goals, and current marketing context.

**Key Features:**
- Generate campaign ideas tailored to user's business profile
- Integration with existing AI assistant
- Campaign templates and suggestions
- Export campaign ideas to task tracker

**Technical Notes:**
- TODO: Integrate with AI assistant
- Should leverage existing brand settings and marketing goals
- Consider integration with marketing tracks

---

### 2. Template & Asset Management

#### Visual Template Library with Drag-and-Drop Organization
**Status:** Planned  
**Location:** Profile Page - Favorite Templates section (removed from UI)  
**Description:**  
A visual, drag-and-drop interface for organizing and managing marketing templates. Users will be able to visually browse, organize, and manage their favorite templates in a more intuitive way.

**Key Features:**
- Visual template gallery
- Drag-and-drop organization
- Template categorization and tagging
- Quick access to frequently used templates
- Template preview and selection

**Technical Notes:**
- Should integrate with existing `favorite_templates` profile field
- Consider using a library like `react-beautiful-dnd` or `@dnd-kit/core`
- May require template metadata storage

---

### 3. Marketing Track Enhancements

#### Week Details View
**Status:** Planned  
**Location:** Marketing Tracks Page (removed placeholder from UI)  
**Description:**  
An expanded, detailed view for individual weeks within marketing tracks. Users will be able to see comprehensive information about each week's content, tasks, and progress.

**Key Features:**
- Detailed week-by-week breakdown
- Task lists and progress tracking per week
- Week-specific content and resources
- Navigation between weeks
- Week completion tracking

**Technical Notes:**
- Currently shows placeholder "Week details coming soon..."
- Should integrate with existing module and task structure
- Consider adding week-specific analytics

---

### 4. Dashboard Widgets

#### Project Tracker Widget
**Status:** Commented Out (Non-Core Feature)  
**Location:** Dashboard (commented out in App.tsx)  
**Description:**  
A widget for tracking and managing projects within the dashboard. Provides quick access to project information and status.

**Key Features:**
- Project overview and status
- Quick project navigation
- Project progress tracking
- Integration with task tracker

**Technical Notes:**
- Currently commented out as non-core feature
- Component exists: `ProjectTrackerWidget`
- Requires projects data structure

#### Asset Library Widget
**Status:** Commented Out (Non-Core Feature)  
**Location:** Dashboard (commented out in App.tsx)  
**Description:**  
A dashboard widget providing quick access to the asset library, branding kits, and shareable links.

**Key Features:**
- Quick asset access from dashboard
- Branding kit management
- Share link management
- Asset preview

**Technical Notes:**
- Currently commented out as non-core feature
- Component exists: `AssetLibraryWidget`
- Requires assets, brandingKits, and shareLinks data
- Full Asset Library page exists at `/app/asset-library`
- Handler functions (`handleAssetsChange`, `handleBrandingKitsChange`, `handleShareLinksChange`, `handleNavigateToAssetLibrary`) are commented out in App.tsx

---

### 5. Additional Non-Core Features

#### Marketing Calendar
**Status:** Temporarily Hidden (Non-Core Feature)  
**Location:** Sidebar navigation (commented out in App.tsx)  
**Description:**  
A calendar view for marketing activities, campaigns, and scheduled content.

**Key Features:**
- Calendar view for marketing activities
- Campaign scheduling
- Event management

**Technical Notes:**
- Mentioned in sidebar comments as temporarily hidden
- Non-core feature, may be re-evaluated
- Handler functions (`handleEventEdit`, `handleEventSave`, `handleEventCancel`, `handleEventDelete`) are commented out in App.tsx

#### Project Management
**Status:** Temporarily Hidden (Non-Core Feature)  
**Location:** Sidebar navigation (commented out in App.tsx)  
**Description:**  
Dedicated project management functionality beyond the task tracker.

**Technical Notes:**
- Mentioned in sidebar comments as temporarily hidden
- Non-core feature, may be re-evaluated
- May overlap with Project Tracker Widget functionality

---

## Implementation Priority

### High Priority
1. **Week Details View** - Enhances core marketing track experience
2. **AI Campaign Generator** - Differentiates product with AI capabilities

### Medium Priority
3. **Visual Template Library** - Improves user experience for template management

### Low Priority / Future Consideration
4. **Project Tracker Widget** - Non-core feature, may be re-evaluated
5. **Asset Library Widget** - Non-core feature, full page exists
6. **Marketing Calendar** - Non-core feature, temporarily hidden
7. **Project Management** - Non-core feature, temporarily hidden

---

## Notes

- All "coming soon" UI elements have been removed from public-facing pages to maintain a polished user experience
- Features are documented here for planning and development tracking
- Priority levels may change based on user feedback and business needs
- Some features may be re-evaluated or removed from the roadmap based on usage data

---

## Related Documentation

- [API.md](./API.md) - API documentation for backend features
- [WHITE_LABEL.md](./WHITE_LABEL.md) - White label and branding features
- [README.md](./README.md) - General project documentation

---

*Last Updated: 2024*
*This document should be updated as features are implemented or removed from the roadmap.*

