"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const supabase_1 = require("../config/supabase");
class TaskService {
    static async getTasks(projectId, status) {
        try {
            let query = supabase_1.supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });
            if (projectId) {
                query = query.eq('project_id', projectId);
            }
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
            const tasks = data.map(this.mapDatabaseTaskToTask);
            return {
                success: true,
                data: tasks
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async getTaskById(id) {
        try {
            const { data, error } = await supabase_1.supabase
                .from('tasks')
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
                    error: 'Task not found'
                };
            }
            const task = this.mapDatabaseTaskToTask(data);
            return {
                success: true,
                data: task
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async createTask(taskData) {
        try {
            const { data, error } = await supabase_1.supabase
                .from('tasks')
                .insert([{
                    title: taskData.title,
                    description: taskData.description || '',
                    responsible: taskData.responsible || '',
                    deadline: taskData.deadline ? new Date(taskData.deadline).toISOString() : null,
                    project_id: taskData.projectId || null,
                    time_spent: taskData.timeSpent || '0h',
                    notifications: taskData.notifications ?? true,
                    status: taskData.status || 'todo',
                    marketing_track: taskData.marketingTrack || null
                }])
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
            const task = this.mapDatabaseTaskToTask(data);
            return {
                success: true,
                data: task,
                message: 'Task created successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async updateTask(id, updates) {
        try {
            const updateData = {};
            if (updates.title !== undefined)
                updateData.title = updates.title;
            if (updates.description !== undefined)
                updateData.description = updates.description;
            if (updates.responsible !== undefined)
                updateData.responsible = updates.responsible;
            if (updates.deadline !== undefined) {
                updateData.deadline = updates.deadline ? new Date(updates.deadline).toISOString() : null;
            }
            if (updates.projectId !== undefined)
                updateData.project_id = updates.projectId;
            if (updates.timeSpent !== undefined)
                updateData.time_spent = updates.timeSpent;
            if (updates.notifications !== undefined)
                updateData.notifications = updates.notifications;
            if (updates.status !== undefined)
                updateData.status = updates.status;
            if (updates.marketingTrack !== undefined)
                updateData.marketing_track = updates.marketingTrack;
            const { data, error } = await supabase_1.supabase
                .from('tasks')
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
                    error: 'Task not found'
                };
            }
            const task = this.mapDatabaseTaskToTask(data);
            return {
                success: true,
                data: task,
                message: 'Task updated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async deleteTask(id) {
        try {
            const { error } = await supabase_1.supabase
                .from('tasks')
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
                message: 'Task deleted successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async getTasksByProject(projectId) {
        return this.getTasks(projectId);
    }
    static async updateTaskStatus(id, status) {
        return this.updateTask(id, { id, status: status });
    }
    static async updateTaskTimeSpent(id, timeSpent) {
        return this.updateTask(id, { id, timeSpent });
    }
    static mapDatabaseTaskToTask(dbTask) {
        const task = {
            id: dbTask.id,
            title: dbTask.title,
            description: dbTask.description || '',
            responsible: dbTask.responsible || '',
            deadline: dbTask.deadline ? new Date(dbTask.deadline) : null,
            project: '',
            timeSpent: dbTask.time_spent,
            notifications: dbTask.notifications,
            status: dbTask.status,
        };
        if (dbTask.project_id)
            task.projectId = dbTask.project_id;
        if (dbTask.marketing_track)
            task.marketingTrack = dbTask.marketing_track;
        if (dbTask.is_archived !== undefined)
            task.isArchived = dbTask.is_archived;
        return task;
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=taskService.js.map