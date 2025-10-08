# Import Style Guide

## Overview

This document defines the preferred import patterns for the codebase. Consistent import styles improve code readability and maintainability.

## Preferred Import Pattern

**User Preference:** Use `import * as` syntax for module imports (Memory ID: 4969897)

### Rationale

- **Namespace clarity:** Makes it clear what module exports are being used
- **Prevents naming conflicts:** Avoids collisions with local variables
- **Better for refactoring:** Easier to track usage of module exports
- **IDE support:** Better autocomplete and navigation

## Import Patterns by Type

### 1. External Libraries (Preferred: Named imports or namespace)

**React:**
```typescript
// Preferred: Named imports for commonly used items
import React, { useState, useEffect } from 'react';

// Alternative: Namespace import (less common for React)
import * as React from 'react';
```

**Router:**
```typescript
// Preferred: Named imports
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
```

**Utility Libraries:**
```typescript
// Preferred: Namespace import for clarity
import * as Sentry from '@sentry/node';
import * as dotenv from 'dotenv';
```

### 2. Internal Modules

**Configuration Modules:**
```typescript
// Good: Namespace import for config modules
import * as config from '../config';
import * as branding from '../config/branding';

// Also acceptable: Named imports for specific configs
import { BRANDING, AI_ASSISTANT } from '../config/branding';
import { ENV } from '../config/environment';
```

**Service Modules:**
```typescript
// Preferred: Named imports for service classes
import { EmailService } from '../services/emailService';
import { StripeService } from '../services/stripeService';
import { apiService } from '../services/api';
```

**Utility Modules:**
```typescript
// Preferred: Named imports
import { logger } from '../utils/logger';
import { formatDate, parseDate } from '../utils/date';
```

### 3. Type Imports

**Always use named imports for types:**
```typescript
import type { Task, Project, MarketingGoal } from '../types';
import type { ApiResponse, ErrorResponse } from './types';
```

### 4. Component Imports

**React Components:**
```typescript
// Preferred: Default imports (standard React convention)
import TaskTrackerWidget from './TaskTrackerWidget';
import OnboardingWizard from './components/OnboardingWizard';
```

**Sub-components:**
```typescript
// Named imports for multiple exports from component files
import { Button, Input, Select } from './components/forms';
```

### 5. Asset Imports

**Images and Static Assets:**
```typescript
// Default import for assets
import OctopusLogo from './assets/octopus_icon.png';
import './App.css';
```

## Examples by File Type

### Backend Service File

```typescript
// External libraries - namespace import
import * as Sentry from '@sentry/node';
import * as dotenv from 'dotenv';

// External libraries - named imports
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Internal config - named imports
import { BRANDING } from '../config/branding';
import { ENV } from '../config/environment';
import { logger } from '../utils/logger';

// Types
import type { 
  EmailTemplateData, 
  NotificationEmailData 
} from './types';
```

### Frontend Component File

```typescript
// React - standard named imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Internal components - default imports
import TaskTrackerWidget from './TaskTrackerWidget';
import OnboardingWizard from './components/OnboardingWizard';

// Internal services - named imports
import { apiService } from './services/api';
import { logger } from './utils/logger';
import { BRANDING } from './config/branding';

// Types
import type { Task, Project } from './types';

// Styles
import './App.css';
```

### Configuration File

```typescript
// External - named imports
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Internal - named imports
import { ENV } from './environment';

// Types
import type { BrandingConfig } from './types';
```

## Import Order

Organize imports in the following order (separated by blank lines):

1. **External libraries** (React, third-party packages)
2. **Internal modules** (components, services, utilities)
3. **Types** (type imports)
4. **Assets** (CSS, images)

```typescript
// 1. External libraries
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Sentry from '@sentry/node';

// 2. Internal modules
import TaskTrackerWidget from './TaskTrackerWidget';
import { apiService } from './services/api';
import { logger } from './utils/logger';
import { BRANDING } from './config/branding';

// 3. Types
import type { Task, Project } from './types';

// 4. Assets
import './App.css';
import OctopusLogo from './assets/octopus_icon.png';
```

## Anti-patterns to Avoid

### ❌ Avoid: Mixing import styles inconsistently

```typescript
// Bad: Inconsistent style
import { logger } from '../utils/logger';
import * as logger from '../utils/logger'; // Different file, different style
```

### ❌ Avoid: Overly generic namespace imports

```typescript
// Bad: Too generic, unclear what's being used
import * as utils from '../utils';

// Good: Be specific
import { logger } from '../utils/logger';
import { formatDate } from '../utils/date';
```

### ❌ Avoid: Unnecessary default export renaming

```typescript
// Bad: Confusing renaming
import MyComponent from './SomeOtherComponent';

// Good: Use actual component name
import SomeOtherComponent from './SomeOtherComponent';
```

## Migration Strategy

To update existing code to follow these patterns:

1. **Phase 1:** Update all new files to follow this guide
2. **Phase 2:** Update files as you modify them (opportunistic refactoring)
3. **Phase 3:** Systematic update of high-traffic files
4. **Phase 4:** Update remaining files (lowest priority)

## ESLint Configuration (Future Enhancement)

To enforce these patterns, consider adding ESLint plugins:

```javascript
// Future: Add to .eslintrc.js
rules: {
  // Enforce consistent import style
  'import/no-namespace': 'off', // Allow namespace imports
  'import/order': ['warn', {
    'groups': [
      'builtin',
      'external',
      'internal',
      'parent',
      'sibling',
      'index',
      'type'
    ],
    'newlines-between': 'always',
    'alphabetize': {
      'order': 'asc',
      'caseInsensitive': true
    }
  }],
}
```

## Quick Reference

| Import Type | Pattern | Example |
|-------------|---------|---------|
| React | Named imports | `import React, { useState } from 'react'` |
| Utilities | Namespace | `import * as Sentry from '@sentry/node'` |
| Services | Named imports | `import { EmailService } from './emailService'` |
| Components | Default import | `import TaskWidget from './TaskWidget'` |
| Types | Named type import | `import type { Task } from './types'` |
| Config | Named imports | `import { BRANDING } from './config/branding'` |
| Assets | Default import | `import Logo from './logo.png'` |

## Exceptions

Some patterns have valid exceptions:

1. **React:** Standard to use `import React` rather than `import * as React`
2. **Default exports:** When a module has a clear primary export
3. **Side effects:** Import for side effects only: `import './polyfills'`

## Questions?

When in doubt:
- **For clarity:** Use namespace imports (`import * as`)
- **For brevity:** Use named imports for frequently used exports
- **For consistency:** Match the pattern used in surrounding code

---

**Status:** Documentation complete, implementation ongoing

**Priority:** Medium - Apply to new code immediately, update existing code opportunistically

**Last Updated:** October 8, 2025

