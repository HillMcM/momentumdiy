"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const notionSyncService_1 = require("../services/notionSyncService");
async function main() {
    try {
        const arg = process.argv.slice(2).join(' ').trim();
        if (!arg) {
            console.log('Usage: tsx src/scripts/notion-export.ts <databaseId|containerUrl|pageUrl> [--goal "Goal Title"]');
            console.log(' - If a Notion database ID or URL is provided, all pages in the database will be imported as goals.');
            console.log(' - If a container page URL is provided, each child page will be imported as a goal.');
            console.log(' - If a single page URL is provided, pass --goal to name the goal to upsert.');
            process.exit(1);
        }
        const isPage = /https?:\/\/.+/.test(arg) && !/notion\.so\/.+\?v=/.test(arg);
        const isDatabase = /[0-9a-fA-F]{32}/.test(arg) || /\?v=/.test(arg);
        const goalFlagIndex = process.argv.indexOf('--goal');
        const goalTitle = goalFlagIndex !== -1 ? (process.argv[goalFlagIndex + 1] || '').trim() : '';
        if (goalTitle && !isPage) {
            console.error('The --goal option can only be used with a single page URL/ID.');
            process.exit(1);
        }
        if (goalTitle) {
            console.log(`Syncing single goal "${goalTitle}" from Notion page...`);
            await notionSyncService_1.NotionSyncService.syncGoalFromPage(goalTitle, arg);
            console.log('Done.');
            process.exit(0);
        }
        if (isDatabase) {
            console.log('Syncing marketing content from Notion database...');
            await notionSyncService_1.NotionSyncService.syncMarketing(arg);
            console.log('Done.');
            process.exit(0);
        }
        if (isPage) {
            console.log('Syncing marketing content from Notion container page (child pages → goals)...');
            await notionSyncService_1.NotionSyncService.syncContainer(arg);
            console.log('Done.');
            process.exit(0);
        }
        console.log('Treating input as database ID...');
        await notionSyncService_1.NotionSyncService.syncMarketing(arg);
        console.log('Done.');
        process.exit(0);
    }
    catch (err) {
        console.error('Notion export failed:', err instanceof Error ? err.message : err);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=notion-export.js.map