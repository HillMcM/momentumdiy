"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskService_1 = require("../services/taskService");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { projectId, status } = req.query;
        const result = await taskService_1.TaskService.getTasks(projectId, status);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await taskService_1.TaskService.getTaskById(id);
        if (!result.success) {
            return res.status(404).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const taskData = req.body;
        if (!taskData.title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }
        const result = await taskService_1.TaskService.createTask(taskData);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(201).json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const id = req.params['id'];
        const updates = { ...req.body, id };
        const result = await taskService_1.TaskService.updateTask(id, updates);
        if (!result.success) {
            return res.status(404).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await taskService_1.TaskService.deleteTask(id);
        if (!result.success) {
            return res.status(404).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.patch('/:id/status', async (req, res) => {
    try {
        const id = req.params['id'];
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required'
            });
        }
        const result = await taskService_1.TaskService.updateTaskStatus(id, status);
        if (!result.success) {
            return res.status(404).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.patch('/:id/time-spent', async (req, res) => {
    try {
        const id = req.params['id'];
        const { timeSpent } = req.body;
        if (!timeSpent) {
            return res.status(400).json({
                success: false,
                error: 'Time spent is required'
            });
        }
        const result = await taskService_1.TaskService.updateTaskTimeSpent(id, timeSpent);
        if (!result.success) {
            return res.status(404).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/project/:projectId', async (req, res) => {
    try {
        const projectId = req.params['projectId'];
        const result = await taskService_1.TaskService.getTasksByProject(projectId);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=tasks.js.map