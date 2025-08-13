import React, { useState } from 'react';
import apiService from './services/api';

const TestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, { success?: boolean; data?: unknown; message?: string; error?: string }>>({});
  const [error, setError] = useState<string>('');

  const testEndpoint = async (name: string, testFn: () => Promise<unknown>) => {
    setLoading(true);
    setError('');
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [name]: result as { success?: boolean; data?: unknown; message?: string; error?: string } }));
      console.log(`${name} result:`, result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`${name} failed: ${errorMsg}`);
      console.error(`${name} error:`, err);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setResults({});
    setError('');

    // Test Tasks API
    await testEndpoint('Get Tasks', () => apiService.getTasks());
    await testEndpoint('Get Tasks by Status', () => apiService.getTasks(undefined, 'todo'));
    
    // Test Projects API
    await testEndpoint('Get Projects', () => apiService.getProjects());
    await testEndpoint('Get Active Projects', () => apiService.getProjects('active'));
    
    // Test Marketing API
    await testEndpoint('Get Marketing Goals', () => apiService.getMarketingGoals());
    await testEndpoint('Get Active Marketing Goal', () => apiService.getActiveMarketingGoal());
    
    // Test Calendar API
    await testEndpoint('Get Calendar Events', () => apiService.getCalendarEvents());
    
    // Test Create Operations
    const testTask = {
      title: 'Test Task from Frontend',
      description: 'This task was created from the frontend test page',
      responsible: 'Test User',
      status: 'todo' as const
    };
    
    await testEndpoint('Create Task', () => apiService.createTask(testTask));
    
    const testProject = {
      name: 'Test Project from Frontend',
      description: 'This project was created from the frontend test page',
      status: 'active' as const
    };
    
    await testEndpoint('Create Project', () => apiService.createProject(testProject));
    
    const testEvent = {
      title: 'Test Event from Frontend',
      description: 'This event was created from the frontend test page',
      start: new Date().toISOString(),
      type: 'custom' as const,
      category: 'meeting' as const
    };
    
    await testEndpoint('Create Calendar Event', () => apiService.createCalendarEvent(testEvent));
  };

  const renderResult = (name: string, result: unknown) => {
    if (!result) return null;
    
    return (
      <div key={name} className="test-result">
        <h4>{name}</h4>
        <div className={`status ${(result as any).success ? 'success' : 'error'}`}>
          {(result as any).success ? '✅ Success' : '❌ Failed'}
        </div>
        {(result as any).success && (result as any).data && (
          <div className="data-preview">
            <strong>Data Preview:</strong>
            <pre>{JSON.stringify((result as any).data, null, 2).substring(0, 200)}...</pre>
          </div>
        )}
        {(result as any).message && (
          <div className="message">
            <strong>Message:</strong> {(result as any).message}
          </div>
        )}
        {!(result as any).success && (result as any).error && (
          <div className="error-message">
            <strong>Error:</strong> {(result as any).error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="test-page">
      <h1>🧪 Full Stack Test Page</h1>
      <p>This page tests the communication between frontend and backend.</p>
      
      <div className="test-controls">
        <button 
          onClick={runAllTests} 
          disabled={loading}
          className="test-button"
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      {error && (
        <div className="global-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="test-results">
        <h3>Test Results</h3>
        {Object.entries(results).map(([name, result]) => renderResult(name, result))}
      </div>

      <div className="api-info">
        <h3>API Information</h3>
        <p><strong>Backend URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}</p>
        <p><strong>Frontend URL:</strong> http://localhost:5173</p>
        <p><strong>Supabase URL:</strong> http://127.0.0.1:54321</p>
      </div>

      <style>{`
        .test-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .test-controls {
          margin: 2rem 0;
        }
        
        .test-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
        }
        
        .test-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .test-results {
          margin-top: 2rem;
        }
        
        .test-result {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          background: #f8f9fa;
        }
        
        .status {
          font-weight: bold;
          margin: 0.5rem 0;
        }
        
        .status.success {
          color: #28a745;
        }
        
        .status.error {
          color: #dc3545;
        }
        
        .data-preview {
          margin: 0.5rem 0;
        }
        
        .data-preview pre {
          background: #f1f3f4;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 12px;
          overflow-x: auto;
        }
        
        .message {
          margin: 0.5rem 0;
          color: #0066cc;
        }
        
        .error-message {
          margin: 0.5rem 0;
          color: #dc3545;
        }
        
        .global-error {
          background: #f8d7da;
          color: #721c24;
          padding: 1rem;
          border-radius: 6px;
          margin: 1rem 0;
          border: 1px solid #f5c6cb;
        }
        
        .api-info {
          background: #e9ecef;
          padding: 1rem;
          border-radius: 6px;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
};

export default TestPage; 