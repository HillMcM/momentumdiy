"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const supabase_1 = require("../config/supabase");
const taskService_1 = require("./taskService");
class ProjectService {
    static async getProjects(status) {
        try {
            let query = supabase_1.supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });
            if (status) {
                query = query.eq('status', status);
            }
            const { data, error } = await query;
            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
            const projects = await Promise.all(data.map(async (dbProject) => {
                return await this.mapDatabaseProjectToProject(dbProject);
            }));
            return {
                success: true,
                data: projects
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async getProjectById(id) {
        try {
            const { data, error } = await supabase_1.supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
            if (!data) {
                return {
                    success: false,
                    error: 'Project not found'
                };
            }
            const project = await this.mapDatabaseProjectToProject(data);
            return {
                success: true,
                data: project
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async createProject(projectData) {
        try {
            const { data, error } = await supabase_1.supabase
                .from('projects')
                .insert([{
                    name: projectData.name,
                    description: projectData.description || '',
                    deadline: projectData.deadline ? new Date(projectData.deadline).toISOString() : null,
                    status: projectData.status || 'active',
                    progress: 0
                }])
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
            const project = await this.mapDatabaseProjectToProject(data);
            return {
                success: true,
                data: project,
                message: 'Project created successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async updateProject(id, updates) {
        try {
            const updateData = {};
            if (updates.name !== undefined)
                updateData.name = updates.name;
            if (updates.description !== undefined)
                updateData.description = updates.description;
            if (updates.deadline !== undefined) {
                updateData.deadline = updates.deadline ? new Date(updates.deadline).toISOString() : null;
            }
            if (updates.status !== undefined)
                updateData.status = updates.status;
            const { data, error } = await supabase_1.supabase
                .from('projects')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
            if (!data) {
                return {
                    success: false,
                    error: 'Project not found'
                };
            }
            const project = await this.mapDatabaseProjectToProject(data);
            return {
                success: true,
                data: project,
                message: 'Project updated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async deleteProject(id) {
        try {
            const { error } = await supabase_1.supabase
                .from('projects')
                .delete()
                .eq('id', id);
            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
            return {
                success: true,
                message: 'Project deleted successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async getTimelinePhases(projectId) {
        try {
            const { data, error } = await supabase_1.supabase
                .from('timeline_phases')
                .select('*')
                .eq('project_id', projectId)
                .order('order_index', { ascending: true });
            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
            const phases = data.map((phase) => ({
                id: phase.id,
                name: phase.name,
                description: phase.description || '',
                startDate: phase.start_date ? new Date(phase.start_date) : null,
                endDate: phase.end_date ? new Date(phase.end_date) : null,
                status: phase.status,
                tasks: [],
                order: phase.order_index
            }));
            return {
                success: true,
                data: phases
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async createTimelinePhase(phaseData) {
        try {
            const { data, error } = await supabase_1.supabase
                .from('timeline_phases')
                .insert([{
                    project_id: phaseData.projectId,
                    name: phaseData.name,
                    description: phaseData.description,
                    start_date: phaseData.startDate ? new Date(phaseData.startDate).toISOString() : null,
                    end_date: phaseData.endDate ? new Date(phaseData.endDate).toISOString() : null,
                    status: phaseData.status,
                    order_index: phaseData.order
                }])
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
            const phase = {
                id: data.id,
                name: data.name,
                description: data.description || '',
                startDate: data.start_date ? new Date(data.start_date) : null,
                endDate: data.end_date ? new Date(data.end_date) : null,
                status: data.status,
                tasks: [],
                order: data.order_index
            };
            return {
                success: true,
                data: phase,
                message: 'Timeline phase created successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async updateProjectProgress(projectId) {
        try {
            const tasksResponse = await taskService_1.TaskService.getTasksByProject(projectId);
            if (!tasksResponse.success || !tasksResponse.data) {
                return {
                    success: false,
                    error: 'Failed to fetch project tasks'
                };
            }
            const tasks = tasksResponse.data;
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const { error } = await supabase_1.supabase
                .from('projects')
                .update({ progress })
                .eq('id', projectId);
            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
            return {
                success: true,
                message: 'Project progress updated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async mapDatabaseProjectToProject(dbProject) {
        const tasksResponse = await taskService_1.TaskService.getTasksByProject(dbProject.id);
        const tasks = tasksResponse.success ? tasksResponse.data || [] : [];
        const taskIds = tasks.map(task => task.id);
        const phasesResponse = await this.getTimelinePhases(dbProject.id);
        const timeline = phasesResponse.success ? phasesResponse.data || [] : [];
        return {
            id: dbProject.id,
            name: dbProject.name,
            description: dbProject.description || '',
            deadline: dbProject.deadline ? new Date(dbProject.deadline) : null,
            tasks: taskIds,
            progress: dbProject.progress,
            status: dbProject.status,
            timeline
        };
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=projectService.js.map