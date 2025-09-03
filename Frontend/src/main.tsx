// Note: StrictMode intentionally disabled to reduce duplicate dev-only effects/logs
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'

// Suppress React Router v7 deprecation warnings
if (typeof window !== 'undefined') {
  (window as any).__ROUTER_FUTURE_FLAGS__ = {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  };
}

// Reduce noisy console logs in development unless explicitly enabled
const debugLogs = (import.meta as { env?: { VITE_DEBUG_LOGS?: string; DEV?: boolean } }).env?.VITE_DEBUG_LOGS === '1' || (typeof localStorage !== 'undefined' && localStorage.getItem('debugLogs') === '1')
if ((import.meta as { env?: { VITE_DEBUG_LOGS?: string; DEV?: boolean } }).env?.DEV && !debugLogs) {
  const originalLog = console.log.bind(console)
  const suppressedPatterns = [
    /App component rendering/i,
    /App state initialized/i,
    /App: Current marketing goals details/i,
    /App component about to render JSX/i,
    /Loading data from API/i,
    /Testing backend connectivity/i,
    /Fetching (tasks|projects|marketing goals|calendar events) from API/i,
    /✅ Loaded/i,
    /Assets API response/i,
    /Loaded assets/i,
    /App: handleTasksChange/i,
    /App: handleProjectsChange/i,
    /App: handleMarketingGoalsChange/i,
    /App: marketingGoals state changed/i,
    /App: Syncing marketing track tasks/i,
    /App: Auto-synced dashboard tasks/i,
    /Creating new task:/i,
    /Updating task:/i,
    /Creating tasks from marketing module/i,
    /Creating\/updating tasks/i,
    /New task list/i,
    /Auto-sync useEffect running/i,
    /Unlocked modules/i,
    /toggleTaskCompletion/i,
  ]
  console.log = (...args: unknown[]) => {
    try {
      const first = args[0]
      if (typeof first === 'string' && suppressedPatterns.some((re) => re.test(first))) {
        return
      }
    } catch {
      // Ignore errors in console log suppression
    }
    originalLog(...args)
  }
}

createRoot(document.getElementById('root')!).render(
  // Disable StrictMode to avoid intentional double-invocation of effects in dev (reduces duplicate logs)
  // Re-enable if you specifically want React’s dev checks
  <AuthProvider>
    <App />
  </AuthProvider>,
)
// Force deployment Wed Sep  3 10:23:54 EDT 2025
