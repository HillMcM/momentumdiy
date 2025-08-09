"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionSyncService = void 0;
const client_1 = require("@notionhq/client");
const supabase_1 = require("../config/supabase");
class NotionSyncService {
    static async syncMarketing(databaseId) {
        const normalizedDbId = databaseId.replace(/-/g, '').length === 32
            ? `${databaseId.replace(/-/g, '').slice(0, 8)}-${databaseId.replace(/-/g, '').slice(8, 12)}-${databaseId.replace(/-/g, '').slice(12, 16)}-${databaseId.replace(/-/g, '').slice(16, 20)}-${databaseId.replace(/-/g, '').slice(20)}`
            : databaseId;
        const token = process.env['NOTION_API_KEY'] || '';
        if (!token)
            throw new Error('NOTION_API_KEY not set');
        const pages = [];
        let hasMore = true;
        let cursor = undefined;
        try {
            const notion = new client_1.Client({ auth: token });
            while (hasMore) {
                const resp = await notion.databases.query({ database_id: normalizedDbId, ...(cursor ? { start_cursor: cursor } : {}) });
                pages.push(...(resp.results || []));
                hasMore = !!resp.has_more;
                cursor = resp.next_cursor ?? undefined;
            }
        }
        catch (err) {
            if (err?.code === 'object_not_found') {
                const notion = new client_1.Client({ auth: token });
                await this.syncFromPageContainer(notion, normalizedDbId);
                return { success: true };
            }
            throw err;
        }
        for (const page of pages) {
            const props = page.properties || {};
            const title = props['Title']?.title?.[0]?.plain_text || 'Untitled';
            const duration = 12;
            const { data: existingGoals, error: findErr } = await supabase_1.supabase
                .from('marketing_goals')
                .select('id')
                .eq('title', title);
            if (findErr)
                throw findErr;
            let goalId;
            if ((existingGoals?.length ?? 0) > 0) {
                const existingId = existingGoals[0].id;
                const { error: updErr } = await supabase_1.supabase
                    .from('marketing_goals')
                    .update({ duration })
                    .eq('id', existingId);
                if (updErr)
                    throw updErr;
                goalId = existingId;
            }
            else {
                const { data: insGoal, error: insErr } = await supabase_1.supabase
                    .from('marketing_goals')
                    .insert([{ title, duration, description: '', is_active: false, current_week: 1, progress: 0 }])
                    .select('*')
                    .single();
                if (insErr)
                    throw insErr;
                goalId = insGoal.id;
            }
            const pageIdStr = String(page.id || '');
            await this.syncModulesFromPage(goalId, pageIdStr);
        }
        return { success: true };
    }
    static async syncContainer(containerIdOrUrl) {
        const token = process.env['NOTION_API_KEY'] || '';
        if (!token)
            throw new Error('NOTION_API_KEY not set');
        const idMatch = containerIdOrUrl.match(/[0-9a-fA-F]{32}/);
        const id32 = idMatch ? idMatch[0] : containerIdOrUrl;
        const hyphenId = `${id32.slice(0, 8)}-${id32.slice(8, 12)}-${id32.slice(12, 16)}-${id32.slice(16, 20)}-${id32.slice(20)}`;
        const notion = new client_1.Client({ auth: token });
        await this.syncFromPageContainer(notion, hyphenId);
        return { success: true };
    }
    static async syncGoalFromPage(goalTitle, pageIdOrUrl) {
        const token = process.env['NOTION_API_KEY'] || '';
        if (!token)
            throw new Error('NOTION_API_KEY not set');
        const idMatch = pageIdOrUrl.match(/[0-9a-fA-F]{32}/);
        const id32 = idMatch ? idMatch[0] : pageIdOrUrl;
        const hyphenId = `${id32.slice(0, 8)}-${id32.slice(8, 12)}-${id32.slice(12, 16)}-${id32.slice(16, 20)}-${id32.slice(20)}`;
        const { data: existing, error: findErr } = await supabase_1.supabase
            .from('marketing_goals')
            .select('id')
            .eq('title', goalTitle);
        if (findErr)
            throw findErr;
        let goalId;
        if ((existing?.length ?? 0) > 0) {
            goalId = existing[0].id;
        }
        else {
            const { data: ins, error: insErr } = await supabase_1.supabase
                .from('marketing_goals')
                .insert([{ title: goalTitle, duration: 12, description: '', is_active: false, current_week: 1, progress: 0 }])
                .select('*')
                .single();
            if (insErr)
                throw insErr;
            goalId = ins.id;
        }
        await this.syncModulesFromPage(goalId, hyphenId);
        return { success: true };
    }
    static async debugPageBlocks(pageIdOrUrl) {
        const token = process.env['NOTION_API_KEY'] || '';
        if (!token)
            throw new Error('NOTION_API_KEY not set');
        const notion = new client_1.Client({ auth: token });
        const idMatch = pageIdOrUrl.match(/[0-9a-fA-F]{32}/);
        const id32 = idMatch ? idMatch[0] : pageIdOrUrl;
        const hyphenId = `${id32.slice(0, 8)}-${id32.slice(8, 12)}-${id32.slice(12, 16)}-${id32.slice(16, 20)}-${id32.slice(20)}`;
        const blocks = await this.listBlockChildren(notion, hyphenId);
        const summary = blocks.slice(0, 100).map((b) => ({
            id: b.id,
            type: b.type,
            has_children: !!b.has_children,
            text: this.getPlainText(b)
        }));
        return { success: true, blocks: summary };
    }
    static async syncFromPageContainer(notion, containerPageId) {
        const children = await this.listBlockChildren(notion, containerPageId);
        for (const child of children) {
            if (child.type !== 'child_page')
                continue;
            const title = child.child_page?.title || 'Untitled';
            const { data: existing, error: findErr } = await supabase_1.supabase
                .from('marketing_goals')
                .select('id')
                .eq('title', title);
            if (findErr)
                throw findErr;
            let goalId;
            if ((existing?.length ?? 0) > 0) {
                goalId = existing[0].id;
            }
            else {
                const { data: ins, error: insErr } = await supabase_1.supabase
                    .from('marketing_goals')
                    .insert([{ title, duration: 12, description: '', is_active: false, current_week: 1, progress: 0 }])
                    .select('*')
                    .single();
                if (insErr)
                    throw insErr;
                goalId = ins.id;
            }
            await this.syncModulesFromBlocks(goalId, await this.listBlockChildren(notion, child.id));
        }
    }
    static async listBlockChildren(notion, blockId) {
        const out = [];
        let cursor;
        let hasMore = true;
        while (hasMore) {
            const resp = await notion.blocks.children.list({ block_id: blockId, page_size: 100, start_cursor: cursor });
            out.push(...(resp.results || []));
            hasMore = !!resp.has_more;
            cursor = resp.next_cursor ?? undefined;
        }
        return out;
    }
    static getPlainText(block) {
        const rich = block?.[block.type]?.rich_text || [];
        return rich.map((r) => r.plain_text || '').join('').trim();
    }
    static parseWeekHeading(text) {
        const lower = String(text || '').toLowerCase();
        const m = lower.match(/^[^a-z0-9]*week\s*(\d+)\s*[:\-–]?\s*(.*)$/);
        if (!m)
            return null;
        const week = parseInt(String(m[1]), 10);
        const suffixStart = lower.indexOf(m[0]) + m[0].length - (m[2]?.length || 0);
        const originalSuffix = text.slice(Math.max(0, suffixStart));
        const title = (originalSuffix || `Week ${week}`).trim() || `Week ${week}`;
        return { week, title };
    }
    static async syncModulesFromPage(goalId, pageId) {
        const token = process.env['NOTION_API_KEY'] || '';
        const notion = new client_1.Client({ auth: token });
        const topBlocks = await this.listBlockChildren(notion, (pageId ?? '').toString());
        await this.syncModulesFromBlocks(goalId, topBlocks);
    }
    static async syncModulesFromBlocks(goalId, topBlocks) {
        const weeks = {};
        const token = process.env['NOTION_API_KEY'] || '';
        const notion = new client_1.Client({ auth: token });
        let currentWeekNum = null;
        const visit = async (blocks) => {
            var _a;
            for (const b of blocks) {
                const type = b.type;
                const text = this.getPlainText(b);
                const heading = this.parseWeekHeading(text);
                if (heading) {
                    currentWeekNum = heading.week;
                    weeks[_a = heading.week] || (weeks[_a] = { week: heading.week, title: heading.title, contentLines: [], tasks: [] });
                }
                else if (currentWeekNum !== null) {
                    if (type === 'bulleted_list_item' || type === 'numbered_list_item' || type === 'to_do') {
                        if (text)
                            weeks[currentWeekNum]?.tasks.push(text);
                    }
                    else if (type === 'paragraph' || type === 'quote' || type === 'callout' || type === 'toggle') {
                        if (text)
                            weeks[currentWeekNum]?.contentLines.push(text);
                    }
                }
                if (b.has_children) {
                    const children = await this.listBlockChildren(notion, b.id);
                    await visit(children);
                }
            }
        };
        await visit(topBlocks);
        const { data: existingMods } = await supabase_1.supabase
            .from('marketing_modules')
            .select('*')
            .eq('goal_id', goalId);
        const byWeek = {};
        (existingMods || []).forEach((m) => { byWeek[m.week_number] = m; });
        const weekNumbers = Object.keys(weeks).map(n => parseInt(n, 10)).sort((a, b) => a - b);
        for (const week of weekNumbers) {
            const w = weeks[week];
            if (byWeek[w.week]) {
                const { error: updErr } = await supabase_1.supabase
                    .from('marketing_modules')
                    .update({ title: w.title || byWeek[w.week].title, description: w.title || byWeek[w.week].description, content: w.contentLines.join('\n') || byWeek[w.week].content })
                    .eq('id', byWeek[w.week].id);
                if (updErr)
                    throw updErr;
            }
            else {
                const { data: moduleRow, error: moduleErr } = await supabase_1.supabase
                    .from('marketing_modules')
                    .insert([{ goal_id: goalId, week_number: w.week, title: w.title, description: w.title, content: w.contentLines.join('\n'), is_unlocked: w.week === 1, is_completed: false }])
                    .select('*')
                    .single();
                if (moduleErr)
                    throw moduleErr;
                byWeek[w.week] = moduleRow;
            }
            const moduleId = byWeek[w.week].id;
            await supabase_1.supabase.from('marketing_tasks').delete().eq('module_id', moduleId);
            for (const taskTitle of w.tasks) {
                const { error: taskErr } = await supabase_1.supabase
                    .from('marketing_tasks')
                    .insert([{ module_id: moduleId, title: taskTitle, description: '', estimated_time: '', is_completed: false }]);
                if (taskErr)
                    throw taskErr;
            }
        }
    }
}
exports.NotionSyncService = NotionSyncService;
//# sourceMappingURL=notionSyncService.js.map