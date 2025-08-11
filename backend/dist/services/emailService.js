"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendWelcomeEmail = sendWelcomeEmail;
const postmark_1 = __importDefault(require("postmark"));
function createClient() {
    const token = process.env['POSTMARK_API_TOKEN'];
    if (!token)
        return null;
    try {
        return new postmark_1.default.ServerClient(token);
    }
    catch {
        return null;
    }
}
async function sendEmail(params) {
    const from = process.env['POSTMARK_FROM'];
    const stream = params.messageStream || process.env['POSTMARK_MESSAGE_STREAM'] || 'outbound';
    const client = createClient();
    if (!client || !from) {
        console.warn('Postmark not configured. Skipping email send.');
        return { success: false, error: 'Postmark not configured' };
    }
    try {
        await client.sendEmail({
            From: from,
            To: params.to,
            Subject: params.subject,
            HtmlBody: params.htmlBody || '',
            TextBody: params.textBody || '',
            MessageStream: stream,
        });
        return { success: true };
    }
    catch (err) {
        return { success: false, error: err?.message || 'Failed to send email' };
    }
}
async function sendWelcomeEmail(to) {
    return sendEmail({
        to,
        subject: 'Welcome to MomentumDIY',
        htmlBody: '<p>Welcome! Your account is ready.</p>',
        textBody: 'Welcome! Your account is ready.',
    });
}
//# sourceMappingURL=emailService.js.map