import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import { useState } from 'react';
import type { Project, Task, MarketingGoal } from './types';
// Removed mock data
import OctopusLogo from './assets/octopus_icon.png';
import AIMarketingAssistant from './AIMarketingAssistant';

function Header() {
  return (
    <header className="main-header">
      <div className="header-left">
        <img src={OctopusLogo} alt="MomentumDIY Logo" className="header-logo" />
        <span className="header-app-name">MomentumDIY</span>
      </div>
      <button className="upgrade-btn">Upgrade</button>
    </header>
  );
}

function Sidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-header">Business Name</div>
      <ul>
        <li>
          <Link 
            to="/" 
            className={isActive('/') ? 'active' : ''}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link 
            to="/marketing-track" 
            className={isActive('/marketing-track') ? 'active' : ''}
          >
            Marketing Track
          </Link>
        </li>
        <li>
          <Link 
            to="/task-tracker" 
            className={isActive('/task-tracker') ? 'active' : ''}
          >
            Task Tracker
          </Link>
        </li>
        <li>
          <Link 
            to="/ai-marketing-assistant" 
            className={isActive('/ai-marketing-assistant') ? 'active' : ''}
          >
            AI Marketing Assistant
          </Link>
        </li>
      </ul>
      <div className="sidebar-footer">
        <Link 
          to="/feedback" 
          className={isActive('/feedback') ? 'active' : ''}
        >
          Feedback
        </Link>
        <Link 
          to="/terms" 
          className={isActive('/terms') ? 'active' : ''}
        >
          Terms & Conditions
        </Link>
      </div>
    </nav>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{title}</h1>
      <p>This page is coming soon!</p>
    </div>
  );
}

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  marketingGoals: MarketingGoal[];
}

function Dashboard({ projects, tasks, marketingGoals }: DashboardProps) {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your Client Portal!</p>
      <div style={{ marginTop: '2rem' }}>
        <h2>Quick Stats</h2>
        <p>Tasks: {tasks.length}</p>
        <p>Projects: {projects.length}</p>
        <p>Marketing Goals: {marketingGoals.length}</p>
      </div>
    </div>
  );
}

function SimpleApp() {
  console.log('SimpleApp component rendering...');
  
  // Use mock data instead of API calls
  const [tasks] = useState<Task[]>([]);
  const [projects] = useState<Project[]>([]);
  const [marketingGoals] = useState<MarketingGoal[]>([]);

  console.log('SimpleApp state initialized:', { tasks: tasks.length, projects: projects.length, marketingGoals: marketingGoals.length });

  return (
    <Router>
      <Header />
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <Dashboard 
                projects={projects}
                tasks={tasks}
                marketingGoals={marketingGoals}
              />
            } />
            <Route path="/marketing-track" element={<Placeholder title="Marketing Track" />} />
            <Route path="/task-tracker" element={<Placeholder title="Task Tracker" />} />
            <Route path="/ai-marketing-assistant" element={<AIMarketingAssistant />} />
            <Route path="/feedback" element={<Placeholder title="Feedback" />} />
            <Route path="/terms" element={<Placeholder title="Terms & Conditions" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default SimpleApp;
