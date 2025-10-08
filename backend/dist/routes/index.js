"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailService_1 = require("../services/emailService");
const billingService_1 = require("../services/billingService");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
let baselineMetrics = null;
let contentPillars = [];
router.get('/baseline-metrics', (_req, res) => {
    return res.json({ success: true, data: baselineMetrics });
});
router.post('/baseline-metrics', (req, res) => {
    const body = req.body || {};
    if (body && typeof body === 'object' && body.platforms && typeof body.platforms === 'object') {
        const out = { platforms: {}, recordedAt: new Date().toISOString() };
        const platforms = body.platforms || {};
        for (const [key, val] of Object.entries(platforms)) {
            const v = val || {};
            out.platforms[key] = {
                followers: Number(v.followers || 0),
                avgLikes: Number(v.avgLikes || 0),
                avgComments: Number(v.avgComments || 0),
                avgStoryViews: Number(v.avgStoryViews || 0)
            };
        }
        baselineMetrics = out;
        return res.json({ success: true, data: baselineMetrics, message: 'Baseline metrics saved' });
    }
    const { platform = 'instagram', followers, avgLikes, avgComments, avgStoryViews } = body;
    if (followers === undefined || avgLikes === undefined || avgComments === undefined || avgStoryViews === undefined) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    baselineMetrics = {
        platform,
        followers: Number(followers),
        avgLikes: Number(avgLikes),
        avgComments: Number(avgComments),
        avgStoryViews: Number(avgStoryViews),
        recordedAt: new Date().toISOString(),
    };
    return res.json({ success: true, data: baselineMetrics, message: 'Baseline metrics saved' });
});
router.get('/content-pillars', (_req, res) => {
    return res.json({ success: true, data: contentPillars });
});
router.post('/content-pillars', (req, res) => {
    const { pillars } = (req.body || {});
    if (!Array.isArray(pillars) || pillars.length === 0) {
        return res.status(400).json({ success: false, error: 'pillars must be a non-empty array of strings' });
    }
    contentPillars = pillars.map(p => String(p)).slice(0, 8);
    return res.json({ success: true, data: contentPillars, message: 'Content pillars saved' });
});
router.post('/email/test', async (_req, res) => {
    try {
        const result = await emailService_1.EmailService.sendTestEmail();
        return res.status(result.success ? 200 : 500).json(result);
    }
    catch (error) {
        logger_1.logger.error('Email test error', error);
        return res.status(500).json({ success: false, error: 'Email test failed' });
    }
});
router.post('/notifications/send', async (req, res) => {
    try {
        const { name, email, type, data } = req.body;
        if (!name || !email || !type) {
            return res.status(400).json({
                success: false,
                error: 'name, email, and type are required'
            });
        }
        const result = await emailService_1.EmailService.sendNotificationEmail({
            name,
            email,
            type,
            data
        });
        return res.status(result.success ? 200 : 500).json(result);
    }
    catch (error) {
        logger_1.logger.error('Notification test error', error, { userId: req.body.userId });
        return res.status(500).json({
            success: false,
            error: 'Failed to send notification'
        });
    }
});
exports.default = router;
router.post('/billing/checkout', async (req, res) => {
    try {
        const { priceId, successUrl, cancelUrl, email } = (req.body || {});
        if (!priceId || !successUrl || !cancelUrl) {
            return res.status(400).json({ success: false, error: 'priceId, successUrl, cancelUrl are required' });
        }
        const session = await billingService_1.BillingService.createCheckoutSession({
            priceId,
            successUrl,
            cancelUrl,
            customerEmail: email,
        });
        return res.json({ success: true, data: { id: session.id, url: session.url } });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: err?.message || 'Failed to create session' });
    }
});
//# sourceMappingURL=index.js.map