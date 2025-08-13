import React, { useState } from 'react';

const SimpleTest: React.FC = () => {
  const [results, setResults] = useState<Record<string, { success: boolean; data: unknown; status: number }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testEndpoint = async (name: string, url: string, options?: RequestInit) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      const data = await response.json();
      
      setResults((prev) => ({ 
        ...prev, 
        [name]: { 
          success: response.ok, 
          data: data,
          status: response.status 
        } 
      }));
      
      console.log(`${name} result:`, data);
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

    // Test GET endpoints
    const { API_BASE_URL } = await import('./services/api');
    await testEndpoint('Get Tasks', `${API_BASE_URL}/tasks`);
    await testEndpoint('Get Projects', `${API_BASE_URL}/projects`);
    await testEndpoint('Get Marketing Goals', `${API_BASE_URL}/marketing/goals`);
    await testEndpoint('Get Calendar Events', `${API_BASE_URL}/calendar/events`);
    
    // Test POST endpoints
    await testEndpoint('Create Task', `${API_BASE_URL}/tasks`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Simple Test Task',
        description: 'Testing from simple test component',
        responsible: 'Test User',
        status: 'todo'
      })
    });
    
    await testEndpoint('Create Project', `${API_BASE_URL}/projects`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Simple Test Project',
        description: 'Testing project creation',
        status: 'active'
      })
    });
    
    await testEndpoint('Create Calendar Event', `${API_BASE_URL}/calendar/events`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Simple Test Event',
        description: 'Testing calendar event creation',
        start: new Date().toISOString(),
        type: 'custom',
        category: 'meeting'
      })
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: '#0f0f0f', minHeight: '100vh', color: '#ffffff' }}>
      <h1 style={{ color: '#ffffff' }}>🧪 Simple Full Stack Test</h1>
      <p style={{ color: '#e5e5e5' }}>Testing frontend-backend communication without complex dependencies.</p>
      
      <div style={{ margin: '2rem 0' }}>
        <button 
          onClick={runAllTests} 
          disabled={loading}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '6px',
          margin: '1rem 0',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#ffffff' }}>Test Results</h3>
        {Object.entries(results).map(([name, result]) => (
          <div key={name} style={{
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            background: '#1a1a1a',
            color: '#ffffff'
          }}>
            <h4 style={{ color: '#ffffff', margin: '0 0 0.5rem 0' }}>{name}</h4>
            <div style={{
              fontWeight: 'bold',
              margin: '0.5rem 0',
              color: result.success ? '#4ade80' : '#f87171'
            }}>
              {result.success ? '✅ Success' : '❌ Failed'} (Status: {result.status})
            </div>
            {result.success && result.data && (
              <div style={{ margin: '0.5rem 0' }}>
                <strong style={{ color: '#ffffff' }}>Data Preview:</strong>
                <pre style={{
                  background: '#2d2d2d',
                  color: '#e5e5e5',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflowX: 'auto',
                  maxHeight: '200px',
                  border: '1px solid #444',
                  fontFamily: 'monospace'
                }}>
                  {JSON.stringify(result.data, null, 2).substring(0, 300)}...
                </pre>
              </div>
            )}
            {!result.success && (result.data as any)?.error && (
              <div style={{ margin: '0.5rem 0', color: '#f87171' }}>
                <strong>Error:</strong> {(result.data as any).error}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        background: '#1a1a1a',
        padding: '1rem',
        borderRadius: '6px',
        marginTop: '2rem',
        border: '1px solid #444'
      }}>
        <h3 style={{ color: '#ffffff' }}>API Information</h3>
        <p style={{ color: '#e5e5e5' }}><strong>Backend URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}</p>
        <p style={{ color: '#e5e5e5' }}><strong>Frontend URL:</strong> http://localhost:5173</p>
        <p style={{ color: '#e5e5e5' }}><strong>Supabase URL:</strong> http://127.0.0.1:54321</p>
      </div>
    </div>
  );
};

export default SimpleTest; 