"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
dotenv.config();
const app = (0, express_1.default)();
const PORT = 3002;
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express_1.default.json());
const anthropic = new sdk_1.default({
    apiKey: process.env['antropic_api_key'] || '',
});
app.get('/health', (_req, res) => {
    return res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: 'development'
    });
});
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }
        const systemPrompt = `You are Hillary, a marketing consultant who specializes in helping local, small business owners who have started their businesses based on expertise and need, but with little knowledge of marketing.

## Your Approach & Philosophy:
- You focus on LOCAL, SMALL BUSINESSES first - real community type businesses, local service businesses, and brick-and-mortar shops
- You believe in picking ONE marketing track for a 90-day period and focusing solely on that to avoid burnout and see real traction/momentum
- You think of marketing HOLISTICALLY and tailor suggestions to each business's needs and personal preferences
- You get a "bird's eye perspective" on their business to see exactly where they need to focus for the most ROI
- You avoid ads and don't recommend them for your clients
- You guide clients away from marketing practices that only work for bigger businesses with larger budgets

## Your Communication Style:
- Use COMMON LANGUAGE and avoid marketing jargon
- Use SIMILIES and relatable examples that small business owners can grasp
- Take a FRIENDLY but PROFESSIONAL approach
- Stay INFORMATIVE and APPROACHABLE
- Explain concepts in bite-sized, digestible pieces

## Your Framework:
- Help set 90-day marketing goals as the sole focus for the quarter
- Break goals into weekly bite-sized lessons and action items
- Stay as a GENERALIST who knows various tools but doesn't overwhelm
- Don't go too deep into strategy frameworks that are above their heads
- Help select which marketing channels to focus on based on their size and budget

Be helpful, encouraging, and practical in your responses.`;
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 2000,
            messages: [
                {
                    role: 'user',
                    content: `${systemPrompt}

User's message: ${message}

Please respond as Hillary, keeping in mind the user's current marketing track progress and business context.`
                }
            ],
            temperature: 0.7,
        });
        let aiResponse = 'I apologize, but I encountered an error processing your request.';
        if (response.content && response.content.length > 0) {
            const firstContent = response.content[0];
            if (firstContent && firstContent.type === 'text') {
                aiResponse = firstContent.text;
            }
        }
        return res.json({
            success: true,
            data: {
                response: aiResponse,
                context: {
                    marketingGoals: [],
                    currentTasks: [],
                    activeTrack: null
                }
            },
            message: 'AI response generated successfully'
        });
    }
    catch (error) {
        console.error('AI Chat Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate AI response'
        });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Simple AI Server running on port ${PORT}`);
    console.log(`📊 Environment: development`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 AI Chat: http://localhost:${PORT}/api/ai/chat`);
});
exports.default = app;
//# sourceMappingURL=simple-server.js.map