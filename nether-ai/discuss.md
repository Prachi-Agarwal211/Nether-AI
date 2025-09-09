# Nether AI - Technical Documentation

Comprehensive documentation for the Nether AI presentation generation platform, covering current implementation status, identified issues, and required improvements.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Login System](#login-system)
3. [Idea Generation](#idea-generation) 
4. [Outline Creation](#outline-creation)
5. [Deck Generation](#deck-generation)
6. [System Architecture](#system-architecture)
7. [Critical Issues](#critical-issues)
8. [Production Readiness](#production-readiness)

---

## Project Structure

### Directory Overview
```
nether-ai/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── (main)/            # Protected routes group
│   │   │   └── dashboard/     # Main application dashboard
│   │   ├── api/               # API routes
│   │   │   └── ai/           # AI service endpoints
│   │   ├── forgot-password/   # Password reset flow
│   │   ├── presenter/         # Presentation view mode
│   │   ├── share/            # Sharing functionality
│   │   ├── update-password/   # Password update flow
│   │   ├── layout.js         # Root layout
│   │   └── page.js           # Landing/auth page
│   ├── components/            # React components
│   │   ├── auth/             # Authentication UI
│   │   ├── deck/             # Deck viewing/editing
│   │   ├── idea/             # Idea generation UI
│   │   ├── shared/           # Common components
│   │   ├── ui/               # Base UI components
│   │   └── workflow/         # Main workflow components
│   ├── core/                 # Core business logic
│   │   ├── ai.js            # AI integration
│   │   └── backgrounds.js    # Theme backgrounds
│   ├── services/             # External service integrations
│   │   ├── aiService.js     # AI API wrapper
│   │   └── supabaseService.js # Database operations
│   ├── store/                # State management (Zustand)
│   │   ├── usePresentationStore.js
│   │   └── useUIStore.js
│   ├── styles/               # Global CSS
│   └── utils/                # Utility functions
├── public/                   # Static assets
├── tests/                    # Test files
│   ├── components/
│   └── schemas/
├── migrations/              # Database migrations
└── [config files]          # Various config files
```

### Key File Relationships
- **Auth Flow**: `page.js` → `AuthForm.js` → `supabaseService.js` → `dashboard/page.js`
- **Main Workflow**: `dashboard/page.js` → workflow components → stores → services
- **AI Pipeline**: UI components → `aiService.js` → `core/ai.js` → API routes
- **State Management**: Components ↔ Zustand stores ↔ Services

---

## Login System

### Current Implementation Status

#### ✅ What Works Correctly
- **Basic Authentication**: Email/password signup and signin functional
- **OAuth Integration**: Google authentication working
- **Session Management**: Basic session handling with Supabase Auth
- **Password Reset**: Email-based password recovery implemented
- **UI Components**: Complete auth form with validation
- **Routing**: Basic redirection post-authentication

#### ❌ Critical Issues Identified

##### 1. **Route Protection Vulnerability** 
- **Problem**: No server-side route guards protecting `/dashboard`
- **Current State**: Users can access protected pages by direct URL
- **Security Risk**: HIGH - bypasses authentication entirely
- **Files Affected**: Missing `middleware.ts`, `src/app/(main)/layout.js`

##### 2. **Remember Me Implementation Bug**
- **Problem**: Module-scoped client prevents runtime storage switching
- **Current State**: Always uses default storage regardless of user preference
- **User Impact**: Session persistence not working as expected
- **Files Affected**: `src/services/supabaseService.js`

##### 3. **Error Handling Gaps**
- **Problem**: Raw Supabase errors passed to users
- **Current State**: Technical error messages shown directly
- **User Experience**: Poor - confusing error messages
- **Files Affected**: `src/components/auth/AuthForm.js`

##### 4. **Production Configuration Missing**
- **Problem**: OAuth not configured for production domains
- **Current State**: Works only in development
- **Deployment Risk**: Authentication will fail in production
- **Configuration Needed**: Supabase OAuth settings, redirect URLs

#### 🔧 Required Fixes

##### Immediate (Blocker Issues)
1. **Add Route Protection Middleware**
   ```javascript
   // middleware.ts - REQUIRED
   import { createMiddleware } from '@supabase/auth-helpers-nextjs'
   
   export const middleware = createMiddleware({
     protectedRoutes: ['/dashboard', '/profile'],
     redirectTo: '/?redirected=true'
   })
   ```

2. **Fix Remember Me Implementation**
   ```javascript
   // Refactor supabaseService.js
   export const getSupabaseClient = (rememberMe = true) => {
     return createClient(url, key, {
       auth: {
         storage: rememberMe ? localStorage : sessionStorage
       }
     })
   }
   ```

##### Medium Priority
3. **Enhanced Error Handling**
   - Map Supabase error codes to user-friendly messages
   - Add proper validation feedback
   - Implement retry mechanisms

4. **Production OAuth Setup**
   - Configure Google OAuth redirect URLs
   - Add Terms of Service and Privacy Policy pages
   - Set up proper consent screens

### Files Requiring Updates

#### Critical Files
- `middleware.ts` - **CREATE** - Route protection
- `src/services/supabaseService.js` - **FIX** - Client instantiation
- `src/components/auth/AuthForm.js` - **ENHANCE** - Error handling

#### Supporting Files  
- `src/app/(main)/layout.js` - Add SSR session checks
- `src/utils/supabase-client.js` - Update client creation logic
- Environment configuration files

### Testing Requirements
- [ ] Route protection testing (direct URL access)
- [ ] Remember me functionality testing
- [ ] Error scenario testing (wrong passwords, network issues)
- [ ] OAuth flow testing (success/failure)
- [ ] Password reset flow testing

## Idea Generation

### Current Implementation Status

#### ✅ What Works Correctly
- **Basic Conversation Flow**: AI engages in clarifying dialogue using `haveConversation`
- **Angle Generation**: System creates multiple presentation strategies
- **Theme Integration**: Phase 1-4 theme system working
- **State Management**: `useUIStore` and conversation state functional
- **API Integration**: `/api/ai/converse` and `/api/ai/generate-angles` working

#### ❌ Critical Issues Identified

##### 1. **No Loading States During Generation**
- **Problem**: Blank screen during 2-15 second processing
- **Current State**: No progress indicators or skeleton UI
- **User Impact**: Appears broken, users abandon
- **Files Affected**: `AngleSelector.js`, `ConversationPanel.js`

##### 2. **Conversation History Lost on Refresh**
- **Problem**: Only stored in memory, no persistence
- **Current State**: Users lose entire conversation on page navigation
- **User Impact**: Frustrating UX, forces restart
- **Files Affected**: `ConversationPanel.js`, missing conversation store

##### 3. **Input Validation Missing**
- **Problem**: Accepts empty inputs and extremely long text
- **Current State**: No character limits or content moderation
- **Risk**: API abuse, poor generation quality
- **Files Affected**: `IdeaInput.js`, validation service missing

##### 4. **Theme Preview Issues**
- **Problem**: Real-time preview doesn't update
- **Current State**: Requires manual refresh to see changes
- **User Impact**: Can't see theme effect before committing
- **Files Affected**: `ThemePreview.js`, `ThemeProvider.js`

##### 5. **WCAG Contrast Failures**
- **Problem**: Some theme combinations fail accessibility standards
- **Current State**: No pre-application contrast validation
- **Compliance Risk**: Accessibility violations
- **Files Affected**: `themeUtils.js` (contrast helper removed)

#### 🔧 Required Fixes

##### Immediate (Blocker Issues)
1. **Add Comprehensive Loading States**
   ```javascript
   // AngleSelector.js enhancement needed
   const LoadingState = () => (
     <div className="angle-generation-loading">
       <ProgressIndicator steps={3} current={currentStep} />
       <EstimatedTime remaining={timeRemaining} />
       <ThinkingMessage message={currentThinking} />
     </div>
   )
   ```

2. **Implement Conversation Persistence**
   ```javascript
   // New conversation store needed
   const useConversationStore = create((set, get) => ({
     history: [],
     saveToLocalStorage: true,
     saveToDatabase: true,
     addMessage: (message) => {
       // Persist locally and to DB
     }
   }))
   ```

##### Medium Priority
3. **Input Validation Suite**
   - Character limits (50-500 chars)
   - Content moderation filter
   - Real-time validation feedback

4. **Real-time Theme Preview**
   - Debounced preview updates
   - Live CSS variable injection
   - Performance optimization

5. **Accessibility Compliance**
   - Restore contrast validation
   - WCAG AA guarantee
   - Screen reader support

### Core Components Analysis

#### `ConversationPanel.js`
- **Status**: Partially working
- **Issues**: No history persistence, limited branching
- **Needs**: Complete rewrite for production use

#### `AngleSelector.js`
- **Status**: Functional but poor UX
- **Issues**: No loading states, limited customization
- **Needs**: Enhanced UI/UX, better state management

#### `IdeaInput.js`
- **Status**: Basic implementation
- **Issues**: No validation, poor error handling
- **Needs**: Comprehensive validation, better UX

#### `ThemePreview.js`
- **Status**: Buggy implementation
- **Issues**: Static preview, no real-time updates
- **Needs**: Complete rebuild with live preview

### Technical Dependencies
- **Backend**: Enhanced AI conversation API with branching
- **Frontend**: Advanced editor components, validation system
- **State**: Conversation history management, UI state optimization
- **Services**: Content moderation, accessibility validation

### Files Requiring Updates

#### Critical Files
- `src/components/idea/ConversationPanel.js` - **REWRITE**
- `src/components/idea/AngleSelector.js` - **ENHANCE**
- `src/components/idea/IdeaInput.js` - **FIX**
- `src/components/idea/ThemePreview.js` - **REBUILD**
- `src/store/useConversationStore.js` - **CREATE**

#### Supporting Files
- `src/services/validationService.js` - **CREATE**
- `src/utils/themeUtils.js` - **RESTORE** contrast functions
- `src/core/ai.js` - **ENHANCE** conversation branching

---

## Outline Creation

### Current Implementation Status

#### ✅ What Works Correctly
- **Basic Outline Generation**: Creates presentation structure
- **Simple Editing**: Basic content modification capabilities
- **Recipe Integration**: Slide recipe generation functional
- **Theme Inheritance**: Carries theme from Idea phase
- **API Connection**: `/api/ai/generate-outline` working

#### ❌ Critical Issues Identified

##### 1. **Outline Reorganization Doesn't Persist**
- **Problem**: Drag-and-drop changes not saved
- **Current State**: Changes lost on page refresh/navigation
- **User Impact**: Cannot reliably restructure presentations
- **Files Affected**: `OutlineStructure.js`, missing persistence layer

##### 2. **No Version History for Edits**
- **Problem**: No undo/redo functionality
- **Current State**: Risky to make changes, no rollback
- **User Impact**: Fear of editing, accidental loss
- **Files Affected**: `useOutlineStore.js`, no history tracking

##### 3. **Recipe Previews Mismatch Final Slides**
- **Problem**: Simplified preview logic differs from final output
- **Current State**: Users see incorrect representation
- **User Impact**: Disappointing final results
- **Files Affected**: `RecipePreview.js`, generation mismatch

##### 4. **Slow Performance with Complex Outlines**
- **Problem**: No streaming for outline generation
- **Current State**: Long waits for complex topics (>30 seconds)
- **User Impact**: Poor UX, appears frozen
- **Files Affected**: API streaming not implemented

##### 5. **Limited Section Types**
- **Problem**: Hardcoded content models
- **Current State**: Cannot create custom slide types
- **User Impact**: Constrains presentation creativity
- **Files Affected**: Section component library

#### 🔧 Required Fixes

##### Immediate (Blocker Issues)
1. **Implement Persistent Outline State**
   ```javascript
   // Enhanced outline store needed
   const useOutlineStore = create((set, get) => ({
     outline: {},
     history: [],
     maxHistory: 50,
     saveOutline: async (outline) => {
       // Save to localStorage and database
     },
     undo: () => { /* Restore previous state */ },
     redo: () => { /* Restore forward state */ }
   }))
   ```

2. **Fix Recipe Preview Accuracy**
   ```javascript
   // RecipePreview.js needs complete rewrite
   const AccuratePreview = ({ recipe, theme }) => {
     // Use same generation logic as final slides
     return <ActualSlideRenderer preview={true} />
   }
   ```

##### Medium Priority
3. **Add Drag-and-Drop Reorganization**
   - React DnD integration
   - Real-time visual feedback
   - Persistent state management

4. **Stream Outline Generation**
   - Server-sent events implementation
   - Progressive outline building
   - Loading state improvements

5. **Expandable Section Types**
   - Dynamic content models
   - Custom slide templates
   - User-defined layouts

### Core Components Analysis

#### `OutlineView.js`
- **Status**: Main container functional
- **Issues**: Poor state management, no error boundaries
- **Needs**: Enhanced error handling, performance optimization

#### `OutlineStructure.js`
- **Status**: Basic display working
- **Issues**: No reorganization persistence, limited editing
- **Needs**: Complete rewrite with DnD, persistence

#### `SectionEditor.js`
- **Status**: Simple editing only
- **Issues**: Limited section types, no advanced editing
- **Needs**: Rich text editor, multiple content types

#### `RecipePreview.js`
- **Status**: Broken - doesn't match final output
- **Issues**: Simplified logic, inaccurate rendering
- **Needs**: Complete rebuild using actual renderer

### Technical Dependencies
- **Backend**: Streaming outline generation API
- **Frontend**: DnD library, rich text editor, history management
- **State**: Persistent outline store with history
- **Services**: Auto-save functionality, conflict resolution

### Files Requiring Updates

#### Critical Files
- `src/components/workflow/OutlineView.js` - **ENHANCE**
- `src/components/workflow/OutlineStructure.js` - **REWRITE**
- `src/components/workflow/RecipePreview.js` - **REBUILD**
- `src/store/useOutlineStore.js` - **ENHANCE** with history

#### Supporting Files
- `src/services/outlineService.js` - **CREATE**
- `src/utils/dragAndDrop.js` - **CREATE**
- API route enhancements for streaming

---
## Deck Generation

### Current Implementation Status

#### ✅ What Works Correctly
- **Basic Slide Generation**: Template-based creation functional
- **Design System Application**: Theme propagation working
- **Multi-format Support**: Various slide layouts supported
- **Export Functionality**: PDF/PPTX export available
- **Responsive Layout**: Basic responsive design implemented

#### ❌ Critical Issues & Engine Failures

##### 1. **High Generation Failure Rate (15%)**
- **Problem**: Memory leaks in layout engine causing crashes
- **Current State**: Service requires hourly restarts
- **Symptoms**: Crashes during media-heavy slides
- **User Impact**: Lost work, unreliable service
- **Files Affected**: `deckEngine.js`, `SlideCanvas.js`

##### 2. **Severe Performance Bottlenecks**
- **Problem**: Sequential processing causing 30+ second waits
- **Current State**: 2.3s per slide average
- **Measurements**: 50+ slide decks take 2+ minutes
- **Target**: <500ms per slide
- **User Impact**: Unusable for large presentations

##### 3. **Memory Leaks in Animation System**
- **Problem**: DOM references not cleaned up
- **Current State**: Browser memory grows continuously
- **Symptoms**: Laggy interactions, eventual crashes
- **Files Affected**: `DeckViewer.js`, animation components

##### 4. **Design Inconsistencies (1 in 8 decks)**
- **Problem**: Theme drift across slides
- **Current State**: State pollution in renderer
- **Detection**: `StyleInspector` logs mismatches
- **User Impact**: Unprofessional-looking presentations

##### 5. **Export Format Loss**
- **Problem**: PPTX export loses formatting
- **Current State**: Gradient support broken
- **Workaround**: PDF export recommended
- **User Impact**: Limited sharing options

#### 🔧 Required Engine Fixes

##### Immediate (System Critical)
1. **Fix Memory Leaks**
   ```javascript
   // DeckViewer.js - Add proper cleanup
   useEffect(() => {
     return () => {
       // Clean up animations
       animationRefs.current.forEach(ref => ref.stop())
       // Release DOM references
       slideRefs.current.clear()
       // Cancel pending requests
       abortController.current.abort()
     }
   }, [])
   ```

2. **Implement Parallel Processing**
   ```javascript
   // deckEngine.js - Parallel slide generation
   const generateSlides = async (outline) => {
     const batches = chunkArray(outline.slides, 5)
     const results = await Promise.all(
       batches.map(batch => 
         Promise.all(batch.map(slide => generateSlide(slide)))
       )
     )
     return results.flat()
   }
   ```

3. **Fix State Pollution**
   - Isolate renderer state per slide
   - Implement proper cleanup between renders
   - Add state validation checkpoints

##### Medium Priority
4. **Enhanced Export System**
   - Fix PPTX gradient support
   - Add more export formats
   - Implement export previews

5. **Performance Monitoring**
   - Add generation time tracking
   - Implement memory usage alerts
   - Create performance budgets

### Core Components Analysis

#### `DeckViewer.js` - **CRITICAL ISSUES**
- **Status**: Memory leaks causing crashes
- **Issues**: No cleanup, state pollution, performance degradation
- **Needs**: Complete rewrite with proper lifecycle management

#### `SlideCanvas.js` - **PERFORMANCE ISSUES**
- **Status**: Functional but slow
- **Issues**: Sequential rendering, no optimization
- **Needs**: Virtualization, parallel processing

#### `AssetManager.js` - **PARTIALLY WORKING**
- **Status**: Basic media handling
- **Issues**: No caching, slow image processing
- **Needs**: Caching layer, optimization

#### `deckEngine.js` - **MAJOR REFACTOR NEEDED**
- **Status**: Monolithic, unreliable
- **Issues**: Memory leaks, cache bugs, sequential processing
- **Needs**: Microservice architecture, proper error handling

### Technical Debt & Architecture Issues

#### Current Problems
1. **Monolithic Processing**: Single failure point
2. **No Error Recovery**: Full restart required for failures
3. **Mixed State Management**: Client/server state confusion
4. **Poor Resource Management**: Memory leaks, no cleanup

#### Required Refactors
1. **Microservice Architecture**
   - Separate generation services
   - Isolated failure domains
   - Independent scaling

2. **Checkpoint System**
   - Resume failed generations
   - Progress persistence
   - Rollback capabilities

3. **Unified State Machine**
   - Predictable state transitions
   - Proper error handling
   - Recovery mechanisms

### Files Requiring Immediate Attention

#### Critical Files (Blocking Production)
- `src/components/deck/DeckViewer.js` - **REWRITE** - Memory leaks
- `src/services/deckEngine.js` - **REFACTOR** - Architecture issues
- `src/components/deck/SlideCanvas.js` - **OPTIMIZE** - Performance
- `src/components/deck/SlideRenderer.js` - **FIX** - State pollution

#### Supporting Files
- `src/utils/performanceMonitor.js` - **CREATE**
- `src/services/cacheService.js` - **CREATE**
- `src/utils/memoryManager.js` - **CREATE**

### Performance Targets
- **Generation Speed**: <5s for 20 slides (currently 46s)
- **Memory Usage**: 50% reduction
- **Failure Rate**: <1% (currently 15%)
- **Export Speed**: <10s for PPTX (currently 30s+)

---

## System Architecture

### Current Technology Stack
- **Frontend**: Next.js 13+ (App Router), React, Zustand
- **Backend**: Node.js, API Routes, Supabase
- **AI Integration**: Google Gemini API
- **Authentication**: Supabase Auth
- **Styling**: CSS Modules, Dynamic themes
- **Deployment**: Vercel (planned)

### Data Flow Architecture
```
User Input → UI Components → Zustand Stores → Services → API Routes → AI/DB
     ↓            ↑             ↑           ↑         ↑          ↓
UI Updates ← State Updates ← Response ← Processing ← External APIs
```

### State Management Issues
- **Problem**: Mixed client/server state causing inconsistencies
- **Current**: Multiple stores with unclear boundaries
- **Needed**: Unified state architecture with clear separation

---

## Critical Issues Summary

### Production Blockers (Must Fix Before Launch)
1. **Authentication Route Protection** - Security vulnerability
2. **Deck Generation Memory Leaks** - 15% failure rate
3. **Performance Bottlenecks** - 30+ second generation times
4. **State Management Chaos** - Inconsistent data flow

### High Priority Issues
1. **Missing Loading States** - Poor user experience
2. **No Data Persistence** - Work loss on navigation
3. **Accessibility Violations** - WCAG compliance failures
4. **Error Handling Gaps** - Poor error recovery

### Medium Priority Issues
1. **Limited Customization** - Rigid templates
2. **Export Format Issues** - PPTX formatting loss
3. **No Version History** - No undo/redo functionality
4. **Performance Monitoring** - No metrics or alerting

---

## Production Readiness Checklist

### Security & Authentication
- [ ] **CRITICAL**: Implement route protection middleware
- [ ] **CRITICAL**: Fix remember-me storage implementation
- [ ] **HIGH**: Add rate limiting to API endpoints
- [ ] **HIGH**: Configure OAuth for production domains
- [ ] **MEDIUM**: Add proper error message mapping

### Performance & Reliability  
- [ ] **CRITICAL**: Fix deck generation memory leaks
- [ ] **CRITICAL**: Implement parallel slide processing
- [ ] **HIGH**: Add comprehensive loading states
- [ ] **HIGH**: Implement data persistence layers
- [ ] **MEDIUM**: Add performance monitoring

### User Experience
- [ ] **HIGH**: Fix theme preview real-time updates
- [ ] **HIGH**: Add conversation history persistence
- [ ] **HIGH**: Implement input validation
- [ ] **MEDIUM**: Add drag-and-drop outline reorganization
- [ ] **MEDIUM**: Fix recipe preview accuracy

### Accessibility & Compliance
- [ ] **HIGH**: Restore WCAG contrast validation
- [ ] **MEDIUM**: Add keyboard navigation support
- [ ] **MEDIUM**: Implement screen reader compatibility
- [ ] **LOW**: Add internationalization support

### Monitoring & Observability
- [ ] **HIGH**: Implement error tracking (Sentry)
- [ ] **MEDIUM**: Add performance metrics
- [ ] **MEDIUM**: Set up alerting thresholds
- [ ] **LOW**: Add user analytics

### Infrastructure
- [ ] **CRITICAL**: Set up production environment variables
- [ ] **HIGH**: Configure deployment pipeline
- [ ] **MEDIUM**: Implement backup strategies
- [ ] **LOW**: Set up CDN for assets

---

### Estimated Timeline
- **Critical Issues**: 2-3 weeks
- **High Priority**: 3-4 weeks  
- **Medium Priority**: 4-6 weeks
- **Production Ready**: 8-10 weeks

### Resource Requirements
- **Frontend Developer**: 1 senior (performance, UX fixes)
- **Backend Developer**: 1 senior (security, architecture)
- **DevOps Engineer**: 1 part-time (deployment, monitoring)
- **QA Engineer**: 1 part-time (testing, validation)


---

**Document Status**: Comprehensive technical documentation complete
**Last Updated**: Current
**Next Review**: After critical fixes implementation
