"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectService_1 = require("../services/projectService");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const result = await projectService_1.ProjectService.getProjects(status);
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
        const result = await projectService_1.ProjectService.getProjectById(id);
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
        const projectData = req.body;
        if (!projectData.name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
            });
        }
        const result = await projectService_1.ProjectService.createProject(projectData);
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
        const result = await projectService_1.ProjectService.updateProject(id, updates);
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
        const result = await projectService_1.ProjectService.deleteProject(id);
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
router.get('/:id/timeline', async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await projectService_1.ProjectService.getTimelinePhases(id);
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
router.post('/:id/timeline', async (req, res) => {
    try {
        const id = req.params['id'];
        const phaseData = req.body;
        if (!phaseData.name) {
            return res.status(400).json({
                success: false,
                error: 'Phase name is required'
            });
        }
        const result = await projectService_1.ProjectService.createTimelinePhase({
            ...phaseData,
            projectId: id
        });
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
router.patch('/:id/progress', async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await projectService_1.ProjectService.updateProjectProgress(id);
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
//# sourceMappingURL=projects.js.map