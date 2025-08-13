import { useState } from 'react';
import type { Project, Task, TimelinePhase } from './types';
import { apiService } from './services/api';

interface ProjectTrackerPageProps {
  projects: Project[];
  tasks: Task[];
  onProjectsChange: (projects: Project[]) => void;
}

export default function ProjectTrackerPage({ projects, tasks, onProjectsChange }: ProjectTrackerPageProps) {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTimeline, setEditingTimeline] = useState<string | null>(null);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseDescription, setNewPhaseDescription] = useState('');
  const [newPhaseStartDate, setNewPhaseStartDate] = useState('');
  const [newPhaseEndDate, setNewPhaseEndDate] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const toggleExpanded = (projectId: string) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
    setEditingProject(null);
  };

  const startEditing = (project: Project) => {
    setEditingProject({ ...project });
  };

  const saveProject = () => {
    if (editingProject) {
      onProjectsChange(projects.map(p => p.id === editingProject.id ? editingProject : p));
      setEditingProject(null);
    }
  };

  const cancelEditing = () => {
    setEditingProject(null);
  };

  const deleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      setIsDeleting(projectId);
      try {
        // Remove from local state first for immediate UI feedback
        onProjectsChange(projects.filter(p => p.id !== projectId));
        setExpandedProjectId(null);
        setEditingProject(null);
      } catch (error) {
        console.error('Error deleting project:', error);
        // Revert the change if deletion failed
        // Note: In a real app, you'd want to reload the projects from the server
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const updateProjectField = (field: keyof Project, value: string | Date | null) => {
    if (editingProject) {
      setEditingProject({
        ...editingProject,
        [field]: field === 'deadline' && value ? value.toISOString() : value
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#5ECD7D';
      case 'in-progress': return '#EF8E81';
      case 'not-started': return '#95A5A6';
      default: return '#95A5A6';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'not-started': return 'Not Started';
      default: return 'Unknown';
    }
  };

  const addTimelinePhase = (projectId: string) => {
    if (!newPhaseName.trim()) return;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newPhase: TimelinePhase = {
      id: Date.now().toString(),
      name: newPhaseName,
      description: newPhaseDescription,
      startDate: newPhaseStartDate ? new Date(newPhaseStartDate) : null,
      endDate: newPhaseEndDate ? new Date(newPhaseEndDate) : null,
      status: 'not-started',
      tasks: [],
      order: (project.timeline?.length || 0) + 1
    };

    const updatedProject = {
      ...project,
      timeline: [...(project.timeline || []), newPhase]
    };

    const updatedProjects = projects.map(p => p.id === projectId ? updatedProject : p);
    onProjectsChange(updatedProjects);

    // Reset form
    setNewPhaseName('');
    setNewPhaseDescription('');
    setNewPhaseStartDate('');
    setNewPhaseEndDate('');
    setEditingTimeline(null);
  };

  const updatePhaseStatus = (projectId: string, phaseId: string, status: TimelinePhase['status']) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTimeline = project.timeline?.map(phase => 
      phase.id === phaseId ? { ...phase, status } : phase
    ) || [];

    const updatedProject = { ...project, timeline: updatedTimeline };
    const updatedProjects = projects.map(p => p.id === projectId ? updatedProject : p);
    onProjectsChange(updatedProjects);
  };

  const assignTaskToPhase = (projectId: string, phaseId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTimeline = project.timeline?.map(phase => {
      if (phase.id === phaseId) {
        return { ...phase, tasks: [...phase.tasks, taskId] };
      }
      // Remove task from other phases
      return { ...phase, tasks: phase.tasks.filter(id => id !== taskId) };
    }) || [];

    const updatedProject = { ...project, timeline: updatedTimeline };
    const updatedProjects = projects.map(p => p.id === projectId ? updatedProject : p);
    onProjectsChange(updatedProjects);
  };

  const removeTaskFromPhase = (projectId: string, phaseId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTimeline = project.timeline?.map(phase => 
      phase.id === phaseId ? { ...phase, tasks: phase.tasks.filter(id => id !== taskId) } : phase
    ) || [];

    const updatedProject = { ...project, timeline: updatedTimeline };
    const updatedProjects = projects.map(p => p.id === projectId ? updatedProject : p);
    onProjectsChange(updatedProjects);
  };

  const deletePhase = (projectId: string, phaseId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTimeline = project.timeline?.filter(phase => phase.id !== phaseId) || [];
    const updatedProject = { ...project, timeline: updatedTimeline };
    const updatedProjects = projects.map(p => p.id === projectId ? updatedProject : p);
    onProjectsChange(updatedProjects);
  };

  return (
    <div className="widget" style={{ 
      padding: '2rem',
      minHeight: '100vh',
      color: '#FFF1E7'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: '#FFF1E7', marginBottom: '0.5rem' }}>
              Project Management
            </h1>
            <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.7, fontSize: '1.1rem' }}>
              Track and manage your marketing projects with detailed insights and analytics
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                const response = await apiService.createProject({
                  name: 'New Project',
                  description: '',
                  deadline: null,
                  status: 'active'
                });
                
                if (response.success && response.data) {
                  onProjectsChange([response.data, ...projects]);
                } else {
                  console.error('Failed to create project:', response.error);
                }
              } catch (error) {
                console.error('Error creating project:', error);
              }
            }}
            style={{
              background: '#EF8E81',
              color: '#FFF1E7',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add Project
          </button>
        </div>
      </div>

      {/* Project Cards with Expandable Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {projects.map(project => {
          const projectTasks = tasks.filter(task => project.tasks.includes(task.id));
          const tasksGrouped = {
            todo: projectTasks.filter(t => t.status === 'todo'),
            'in-progress': projectTasks.filter(t => t.status === 'in-progress'),
            completed: projectTasks.filter(t => t.status === 'completed'),
          };

          const isExpanded = expandedProjectId === project.id;

          return (
            <div key={project.id} style={{ width: '100%' }}>
              {/* Project Card */}
              <div
                onClick={() => toggleExpanded(project.id)}
                style={{
                  background: '#22202F',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  opacity: project.status === 'completed' ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: `0 0 10px 1px #EF8E81`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#FFF1E7' }}>{project.name}</h3>
                    <span style={{ 
                      color: '#FFF1E7', 
                      opacity: 0.7,
                      fontSize: '0.875rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                    }}>
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {project.status === 'completed' && (
                      <span style={{
                        background: '#5ECD7D',
                        color: '#22202F',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}>
                        Completed
                      </span>
                    )}
                    <div style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      fontSize: '1.5rem',
                      color: '#EF8E81'
                    }}>
                      ▼
                    </div>
                  </div>
                </div>
                
                <p style={{ 
                  margin: 0, 
                  fontSize: '1rem', 
                  color: '#FFF1E7', 
                  opacity: 0.7,
                  textAlign: 'left'
                }}>
                  {project.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}>
                    <div
                      style={{
                        width: `${project.progress}%`,
                        height: '100%',
                        background: project.status === 'completed' ? '#5ECD7D' : '#EF8E81',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease, background-color 0.3s ease',
                      }}
                    />
                  </div>
                  <span style={{ color: '#FFF1E7', fontSize: '1rem', fontWeight: 600 }}>{project.progress}%</span>
                </div>

                <div style={{ 
                  display: 'flex',
                  gap: '2rem',
                  fontSize: '1rem',
                  color: '#FFF1E7',
                  opacity: 0.7
                }}>
                  <span>{tasksGrouped.todo.length} to-do</span>
                  <span>{tasksGrouped['in-progress'].length} in progress</span>
                  <span>{tasksGrouped.completed.length} completed</span>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{
                  background: '#191628',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginTop: '1rem',
                  border: '1px solid rgba(239, 142, 129, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Left Column - Project Details */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, color: '#FFF1E7', fontSize: '1.25rem' }}>
                          Project Details
                        </h4>
                        {editingProject?.id === project.id ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={saveProject}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#5ECD7D',
                                color: '#22202F',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: '#FFF1E7',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(project)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#EF8E81',
                              color: '#FFF1E7',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.875rem'
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFF1E7', fontWeight: 600 }}>
                            Project Name
                          </label>
                          {editingProject?.id === project.id ? (
                            <input
                              value={editingProject.name}
                              onChange={(e) => updateProjectField('name', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: '#191628',
                                color: '#FFF1E7',
                                fontSize: '1rem'
                              }}
                            />
                          ) : (
                            <div style={{
                              padding: '0.75rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              color: '#FFF1E7'
                            }}>
                              {project.name}
                            </div>
                          )}
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFF1E7', fontWeight: 600 }}>
                            Description
                          </label>
                          {editingProject?.id === project.id ? (
                            <textarea
                              value={editingProject.description}
                              onChange={(e) => updateProjectField('description', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: '#191628',
                                color: '#FFF1E7',
                                minHeight: '80px',
                                resize: 'vertical',
                                fontSize: '1rem'
                              }}
                            />
                          ) : (
                            <div style={{
                              padding: '0.75rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              color: '#FFF1E7',
                              minHeight: '80px'
                            }}>
                              {project.description || 'No description provided'}
                            </div>
                          )}
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFF1E7', fontWeight: 600 }}>
                            Deadline
                          </label>
                          {editingProject?.id === project.id ? (
                            <input
                              type="date"
                              value={editingProject.deadline ? new Date(editingProject.deadline).toISOString().split('T')[0] : ''}
                              onChange={(e) => updateProjectField('deadline', e.target.value ? new Date(e.target.value) : null)}
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: '#191628',
                                color: '#FFF1E7',
                                fontSize: '1rem'
                              }}
                            />
                          ) : (
                            <div style={{
                              padding: '0.75rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              color: '#FFF1E7'
                            }}>
                              {project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 'No deadline set'}
                            </div>
                          )}
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFF1E7', fontWeight: 600 }}>
                            Status
                          </label>
                          {editingProject?.id === project.id ? (
                            <select
                              value={editingProject.status}
                              onChange={(e) => updateProjectField('status', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: '#191628',
                                color: '#FFF1E7',
                                fontSize: '1rem'
                              }}
                            >
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                            </select>
                          ) : (
                            <div style={{
                              padding: '0.75rem',
                              background: project.status === 'completed' ? 'rgba(94, 205, 125, 0.2)' : 'rgba(239, 142, 129, 0.2)',
                              borderRadius: '8px',
                              color: project.status === 'completed' ? '#5ECD7D' : '#EF8E81',
                              fontWeight: 600
                            }}>
                              {project.status === 'completed' ? 'Completed' : 'Active'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Task Management */}
                    <div>
                      <h4 style={{ margin: 0, marginBottom: '1rem', color: '#FFF1E7', fontSize: '1.25rem' }}>
                        Task Management
                      </h4>

                      {/* Task Statistics */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '1rem', 
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px'
                      }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#686DCA' }}>
                            {tasksGrouped.todo.length}
                          </div>
                          <div style={{ color: '#FFF1E7', opacity: 0.7, fontSize: '0.875rem' }}>To Do</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EF8E81' }}>
                            {tasksGrouped['in-progress'].length}
                          </div>
                          <div style={{ color: '#FFF1E7', opacity: 0.7, fontSize: '0.875rem' }}>In Progress</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#5ECD7D' }}>
                            {tasksGrouped.completed.length}
                          </div>
                          <div style={{ color: '#FFF1E7', opacity: 0.7, fontSize: '0.875rem' }}>Completed</div>
                        </div>
                      </div>

                      {/* Assigned Tasks List */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFF1E7', fontWeight: 600 }}>
                          Assigned Tasks ({projectTasks.length})
                        </label>
                        <div style={{ 
                          maxHeight: '200px', 
                          overflow: 'auto',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          padding: '0.5rem'
                        }}>
                          {projectTasks.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {projectTasks.map(task => (
                                <div
                                  key={task.id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '6px',
                                    border: `1px solid ${getStatusColor(task.status)}`
                                  }}
                                >
                                  <div>
                                    <div style={{ color: '#FFF1E7', fontWeight: 600 }}>{task.title}</div>
                                    <div style={{ color: '#FFF1E7', opacity: 0.7, fontSize: '0.875rem' }}>
                                      {task.description}
                                    </div>
                                  </div>
                                  <span style={{ 
                                    background: getStatusColor(task.status), 
                                    color: '#22202F',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '10px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                  }}>
                                    {getStatusLabel(task.status)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ 
                              padding: '1rem', 
                              textAlign: 'center', 
                              color: '#FFF1E7', 
                              opacity: 0.5,
                              fontStyle: 'italic'
                            }}>
                              No tasks assigned to this project
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Management Section */}
                  <div style={{ 
                    marginTop: '2rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h4 style={{ margin: 0, color: '#FFF1E7', fontSize: '1.25rem' }}>
                        Project Timeline
                      </h4>
                      <button
                        onClick={() => setEditingTimeline(editingTimeline === project.id ? null : project.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#EF8E81',
                          color: '#FFF1E7',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#ffb09e'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#EF8E81'}
                      >
                        {editingTimeline === project.id ? 'Cancel' : 'Add Phase'}
                      </button>
                    </div>

                    {/* Add New Phase Form */}
                    {editingTimeline === project.id && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(239, 142, 129, 0.3)'
                      }}>
                        <h5 style={{ margin: 0, marginBottom: '1rem', color: '#FFF1E7' }}>Add New Phase</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFF1E7', fontSize: '0.875rem' }}>
                              Phase Name *
                            </label>
                            <input
                              type="text"
                              value={newPhaseName}
                              onChange={(e) => setNewPhaseName(e.target.value)}
                              placeholder="e.g., Planning, Development, Testing"
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '6px',
                                color: '#FFF1E7',
                                fontSize: '0.875rem'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFF1E7', fontSize: '0.875rem' }}>
                              Description
                            </label>
                            <input
                              type="text"
                              value={newPhaseDescription}
                              onChange={(e) => setNewPhaseDescription(e.target.value)}
                              placeholder="Brief description of this phase"
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '6px',
                                color: '#FFF1E7',
                                fontSize: '0.875rem'
                              }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFF1E7', fontSize: '0.875rem' }}>
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={newPhaseStartDate}
                              onChange={(e) => setNewPhaseStartDate(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '6px',
                                color: '#FFF1E7',
                                fontSize: '0.875rem'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFF1E7', fontSize: '0.875rem' }}>
                              End Date
                            </label>
                            <input
                              type="date"
                              value={newPhaseEndDate}
                              onChange={(e) => setNewPhaseEndDate(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '6px',
                                color: '#FFF1E7',
                                fontSize: '0.875rem'
                              }}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => addTimelinePhase(project.id)}
                          disabled={!newPhaseName.trim()}
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: newPhaseName.trim() ? '#686DCA' : 'rgba(255, 255, 255, 0.2)',
                            color: '#FFF1E7',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: newPhaseName.trim() ? 'pointer' : 'not-allowed',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (newPhaseName.trim()) {
                              e.currentTarget.style.background = '#7a7fd8';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (newPhaseName.trim()) {
                              e.currentTarget.style.background = '#686DCA';
                            }
                          }}
                        >
                          Add Phase
                        </button>
                      </div>
                    )}

                    {/* Timeline Phases */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {(project.timeline || []).length > 0 ? (
                        [...(project.timeline || [])].sort((a, b) => a.order - b.order).map(phase => {
                          const phaseTasks = tasks.filter(task => phase.tasks.includes(task.id));
                          const unassignedTasks = projectTasks.filter(task => !project.timeline?.some(p => p.tasks.includes(task.id)));
                          
                          return (
                            <div
                              key={phase.id}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                border: `1px solid ${getStatusColor(phase.status)}`
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <h5 style={{ margin: 0, color: '#FFF1E7', fontSize: '1.1rem' }}>{phase.name}</h5>
                                    <span style={{
                                      background: getStatusColor(phase.status),
                                      color: '#22202F',
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '10px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600
                                    }}>
                                      {getStatusLabel(phase.status)}
                                    </span>
                                  </div>
                                  {phase.description && (
                                    <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.7, fontSize: '0.875rem' }}>
                                      {phase.description}
                                    </p>
                                  )}
                                  {(phase.startDate || phase.endDate) && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#FFF1E7', opacity: 0.7 }}>
                                      {phase.startDate && `Start: ${new Date(phase.startDate).toLocaleDateString()}`}
                                      {phase.startDate && phase.endDate && ' - '}
                                      {phase.endDate && `End: ${new Date(phase.endDate).toLocaleDateString()}`}
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <select
                                    value={phase.status}
                                    onChange={(e) => updatePhaseStatus(project.id, phase.id, e.target.value as TimelinePhase['status'])}
                                    style={{
                                      padding: '0.5rem',
                                      background: 'rgba(255, 255, 255, 0.1)',
                                      border: '1px solid rgba(255, 255, 255, 0.2)',
                                      borderRadius: '4px',
                                      color: '#FFF1E7',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    <option value="not-started">Not Started</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                  <button
                                    onClick={() => deletePhase(project.id, phase.id)}
                                    style={{
                                      padding: '0.5rem',
                                      background: '#686DCA',
                                      color: '#FFF1E7',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#7a7fd8'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#686DCA'}
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>

                              {/* Phase Tasks */}
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                  <label style={{ color: '#FFF1E7', fontWeight: 600, fontSize: '0.875rem' }}>
                                    Phase Tasks ({phaseTasks.length})
                                  </label>
                                  {unassignedTasks.length > 0 && (
                                    <select
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          assignTaskToPhase(project.id, phase.id, e.target.value);
                                          e.target.value = '';
                                        }
                                      }}
                                      style={{
                                        padding: '0.25rem 0.5rem',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '4px',
                                        color: '#FFF1E7',
                                        fontSize: '0.75rem'
                                      }}
                                    >
                                      <option value="">Add Task</option>
                                      {unassignedTasks.map(task => (
                                        <option key={task.id} value={task.id}>
                                          {task.title}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                                
                                {phaseTasks.length > 0 ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {phaseTasks.map(task => (
                                      <div
                                        key={task.id}
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          padding: '0.75rem',
                                          background: 'rgba(255, 255, 255, 0.05)',
                                          borderRadius: '6px',
                                          border: `1px solid ${getStatusColor(task.status)}`
                                        }}
                                      >
                                        <div>
                                          <div style={{ color: '#FFF1E7', fontWeight: 600, fontSize: '0.875rem' }}>{task.title}</div>
                                          <div style={{ color: '#FFF1E7', opacity: 0.7, fontSize: '0.75rem' }}>
                                            {task.description}
                                          </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <span style={{ 
                                            background: getStatusColor(task.status), 
                                            color: '#22202F',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '10px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                          }}>
                                            {getStatusLabel(task.status)}
                                          </span>
                                                                            <button
                                    onClick={() => removeTaskFromPhase(project.id, phase.id, task.id)}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: '#EF8E81',
                                      color: '#FFF1E7',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#ffb09e'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#EF8E81'}
                                  >
                                    Remove
                                  </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div style={{ 
                                    padding: '1rem', 
                                    textAlign: 'center', 
                                    color: '#FFF1E7', 
                                    opacity: 0.5,
                                    fontStyle: 'italic',
                                    fontSize: '0.875rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '6px'
                                  }}>
                                    No tasks assigned to this phase
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ 
                          padding: '2rem', 
                          textAlign: 'center', 
                          color: '#FFF1E7', 
                          opacity: 0.5,
                          fontStyle: 'italic',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          border: '1px dashed rgba(255, 255, 255, 0.2)'
                        }}>
                          <h5 style={{ margin: 0, marginBottom: '0.5rem' }}>No Timeline Phases</h5>
                          <p style={{ margin: 0, fontSize: '0.875rem' }}>
                            Add phases to organize your project timeline and assign tasks to each phase
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    marginTop: '2rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <button
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#EF8E81',
                        color: '#FFF1E7',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '1rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#ffb09e'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#EF8E81'}
                    >
                      Edit Project
                    </button>
                    <button
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#FFF1E7',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '1rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    >
                      View Tasks
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      disabled={isDeleting === project.id}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: isDeleting === project.id ? 'rgba(220, 53, 69, 0.5)' : 'rgba(220, 53, 69, 0.8)',
                        color: '#FFF1E7',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isDeleting === project.id ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: '1rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (isDeleting !== project.id) {
                          e.currentTarget.style.background = 'rgba(220, 53, 69, 1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isDeleting !== project.id) {
                          e.currentTarget.style.background = 'rgba(220, 53, 69, 0.8)';
                        }
                      }}
                    >
                      {isDeleting === project.id ? 'Deleting...' : 'Delete Project'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show message if no projects */}
      {projects.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ margin: 0, marginBottom: '1rem', color: '#FFF1E7' }}>
            No Projects Yet
          </h3>
          <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.7 }}>
            Create your first project to get started with project management
          </p>
        </div>
      )}
    </div>
  );
} 