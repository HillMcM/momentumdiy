import React from 'react';

export default function EnvTest() {
  console.log('🔍 EnvTest - Environment variables:');
  console.log('VITE_DISABLE_AUTH:', import.meta.env.VITE_DISABLE_AUTH);
  console.log('VITE_DISABLE_AUTH type:', typeof import.meta.env.VITE_DISABLE_AUTH);
  console.log('VITE_DISABLE_AUTH === "true":', import.meta.env.VITE_DISABLE_AUTH === 'true');
  console.log('All env vars:', import.meta.env);

  return (
    <div style={{ padding: '20px', backgroundColor: 'yellow', color: 'black' }}>
      <h2>Environment Variable Test</h2>
      <p>VITE_DISABLE_AUTH: {import.meta.env.VITE_DISABLE_AUTH}</p>
      <p>Type: {typeof import.meta.env.VITE_DISABLE_AUTH}</p>
      <p>Equals "true": {import.meta.env.VITE_DISABLE_AUTH === 'true' ? 'YES' : 'NO'}</p>
    </div>
  );
}
