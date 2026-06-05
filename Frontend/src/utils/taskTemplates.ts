import type { Task } from '../types';

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  title: string;
  taskDescription: string;
  estimatedTime?: string;
  category: string;
}

export const taskTemplates: TaskTemplate[] = [
  {
    id: 'social-post',
    name: 'Social Media Post',
    description: 'Create and schedule a social media post',
    title: 'Create Social Media Post',
    taskDescription: 'Draft content, select images, and schedule post across platforms',
    estimatedTime: '30min',
    category: 'Content'
  },
  {
    id: 'email-campaign',
    name: 'Email Campaign',
    description: 'Plan and send an email campaign',
    title: 'Plan Email Campaign',
    taskDescription: 'Design email, write copy, build email list, and schedule send',
    estimatedTime: '2h',
    category: 'Marketing'
  },
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'Write and publish a blog post',
    title: 'Write Blog Post',
    taskDescription: 'Research topic, write content, add images, optimize SEO, and publish',
    estimatedTime: '3h',
    category: 'Content'
  },
  {
    id: 'follow-up',
    name: 'Client Follow-up',
    description: 'Follow up with a client or prospect',
    title: 'Follow Up with Client',
    taskDescription: 'Reach out to check in, answer questions, or provide updates',
    estimatedTime: '15min',
    category: 'Sales'
  },
  {
    id: 'meeting',
    name: 'Team Meeting',
    description: 'Schedule and prepare for a meeting',
    title: 'Prepare for Meeting',
    taskDescription: 'Set agenda, gather materials, and schedule meeting',
    estimatedTime: '30min',
    category: 'Operations'
  },
  {
    id: 'content-audit',
    name: 'Content Audit',
    description: 'Review and audit existing content',
    title: 'Content Audit',
    taskDescription: 'Review existing content, identify gaps, and plan improvements',
    estimatedTime: '2h',
    category: 'Content'
  },
  {
    id: 'website-update',
    name: 'Website Update',
    description: 'Update website content or features',
    title: 'Update Website',
    taskDescription: 'Make updates to website content, design, or functionality',
    estimatedTime: '1h',
    category: 'Operations'
  },
  {
    id: 'research',
    name: 'Market Research',
    description: 'Research market trends or competitors',
    title: 'Market Research',
    taskDescription: 'Research industry trends, competitor analysis, or customer insights',
    estimatedTime: '2h',
    category: 'Strategy'
  }
];

export function createTaskFromTemplate(template: TaskTemplate, project?: string, projectId?: string): Partial<Task> {
  return {
    title: template.title,
    description: template.taskDescription,
    project: project || '',
    projectId: projectId,
    status: 'todo',
    responsible: '',
    deadline: null,
    timeSpent: '',
    notifications: true,
    priority: 'medium' as const
  };
}
