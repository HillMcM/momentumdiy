"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const rate_1 = require("../middleware/rate");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
router.get('/', (0, rate_1.routeRateLimit)(30), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const token = authHeader.substring(7);
        const { data: { user }, error: authError } = await supabase_1.supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid authentication token'
            });
        }
        const { data: profile, error: profileError } = await supabase_1.supabase
            .from('profiles')
            .select('email_preferences')
            .eq('id', user.id)
            .single();
        if (profileError) {
            console.error('Error fetching email preferences:', profileError);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch email preferences'
            });
        }
        const defaultPreferences = {
            weekly_progress: true,
            task_reminders: true,
            marketing_emails: true,
            trial_emails: true
        };
        const emailPreferences = profile?.email_preferences || defaultPreferences;
        return res.json({
            success: true,
            data: emailPreferences
        });
    }
    catch (error) {
        console.error('Error getting email preferences:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.put('/', (0, rate_1.routeRateLimit)(20), (0, validate_1.validate)((req) => {
    const body = req.body || {};
    if (typeof body !== 'object') {
        return 'Email preferences must be an object';
    }
    const validKeys = ['weekly_progress', 'task_reminders', 'marketing_emails', 'trial_emails'];
    const receivedKeys = Object.keys(body);
    for (const key of receivedKeys) {
        if (!validKeys.includes(key)) {
            return `Invalid email preference key: ${key}`;
        }
        if (typeof body[key] !== 'boolean') {
            return `Email preference ${key} must be a boolean`;
        }
    }
    if (body.trial_emails === false) {
        return 'Trial emails cannot be disabled';
    }
    return undefined;
}), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const token = authHeader.substring(7);
        const { data: { user }, error: authError } = await supabase_1.supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid authentication token'
            });
        }
        const preferences = req.body;
        const updatedPreferences = {
            ...preferences,
            trial_emails: true
        };
        const { error: updateError } = await supabase_1.supabase
            .from('profiles')
            .update({ email_preferences: updatedPreferences })
            .eq('id', user.id);
        if (updateError) {
            console.error('Error updating email preferences:', updateError);
            return res.status(500).json({
                success: false,
                error: 'Failed to update email preferences'
            });
        }
        return res.json({
            success: true,
            data: updatedPreferences,
            message: 'Email preferences updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating email preferences:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/reset', (0, rate_1.routeRateLimit)(10), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const token = authHeader.substring(7);
        const { data: { user }, error: authError } = await supabase_1.supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid authentication token'
            });
        }
        const defaultPreferences = {
            weekly_progress: true,
            task_reminders: true,
            marketing_emails: true,
            trial_emails: true
        };
        const { error: updateError } = await supabase_1.supabase
            .from('profiles')
            .update({ email_preferences: defaultPreferences })
            .eq('id', user.id);
        if (updateError) {
            console.error('Error resetting email preferences:', updateError);
            return res.status(500).json({
                success: false,
                error: 'Failed to reset email preferences'
            });
        }
        return res.json({
            success: true,
            data: defaultPreferences,
            message: 'Email preferences reset to defaults'
        });
    }
    catch (error) {
        console.error('Error resetting email preferences:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=emailPreferences.js.map