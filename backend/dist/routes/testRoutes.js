"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/test', (_req, res) => {
    res.json({ success: true, message: 'Test GET endpoint working!' });
});
router.put('/test-put', (req, res) => {
    res.json({ success: true, message: 'Test PUT endpoint working!', body: req.body });
});
router.put('/test-put/:id', (req, res) => {
    res.json({ success: true, message: 'Test PUT with param working!', id: req.params.id, body: req.body });
});
exports.default = router;
//# sourceMappingURL=testRoutes.js.map