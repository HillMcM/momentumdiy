"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateEmail = validateEmail;
exports.validateUUID = validateUUID;
exports.sanitizeString = sanitizeString;
exports.validateRequiredFields = validateRequiredFields;
exports.sanitizeBody = sanitizeBody;
const logger_1 = require("../utils/logger");
function validate(validator) {
    return (req, res, next) => {
        const error = validator(req);
        if (error) {
            logger_1.logger.warn('Validation failed', { error, path: req.path });
            res.status(400).json({ success: false, error });
            return;
        }
        next();
    };
}
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function validateUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}
function sanitizeString(input, maxLength = 1000) {
    return input
        .trim()
        .slice(0, maxLength)
        .replace(/[<>]/g, '');
}
function validateRequiredFields(data, requiredFields) {
    const missing = requiredFields.filter(field => !data[field]);
    if (missing.length > 0) {
        return `Missing required fields: ${missing.join(', ')}`;
    }
    return undefined;
}
function sanitizeBody(req, _res, next) {
    if (req.body && typeof req.body === 'object') {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .trim();
            }
        });
    }
    next();
}
//# sourceMappingURL=validate.js.map