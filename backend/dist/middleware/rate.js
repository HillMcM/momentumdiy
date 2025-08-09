"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeRateLimit = routeRateLimit;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
function routeRateLimit(maxPerMinute) {
    return (0, express_rate_limit_1.default)({
        windowMs: 60000,
        max: maxPerMinute,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, error: 'Rate limit exceeded' },
    });
}
//# sourceMappingURL=rate.js.map