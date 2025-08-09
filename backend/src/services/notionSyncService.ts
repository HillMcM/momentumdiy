import { Client } from '@notionhq/client';
import { supabase } from '../config/supabase';

export interface NotionSyncConfig {
  databaseId: string;
}

export class NotionSyncService {
  static async syncMarketing(databaseId: string) {
    // Normalize databaseId: accept 32-char ID without hyphens from public URLs
    const normalizedDbId = databaseId.replace(/-/g, '').length === 32
      ? `${databaseId.replace(/-/g, '').slice(0,8)}-${databaseId.replace(/-/g, '').slice(8,12)}-${databaseId.replace(/-/g, '').slice(12,16)}-${databaseId.replace(/-/g, '').slice(16,20)}-${databaseId.replace(/-/g, '').slice(20)}`
      : databaseId;

    const token = process.env['NOTION_API_KEY'] || '';
    if (!token) throw new Error('NOTION_API_KEY not set');
    // No direct client usage in this helper; child methods create their own clients

    const pages: any[] = [];
    let hasMore = true;
    let cursor: string | undefined = undefined;

    try {
      const notion = new Client({ auth: token });
      while (hasMore) {
        const resp: any = await notion.databases.query({ database_id: normalizedDbId, ...(cursor ? { start_cursor: cursor } : {}) } as any);
        pages.push(...(resp.results || []));
        hasMore = !!resp.has_more;
        cursor = resp.next_cursor ?? undefined;
      }
    } catch (err: any) {
      // If it isn't a database, try treating it as a PAGE that contains child pages for each track
      if (err?.code === 'object_not_found') {
        const notion = new Client({ auth: token });
        await this.syncFromPageContainer(notion, normalizedDbId);
        return { success: true } as const;
      }
      throw err;
    }

    for (const page of pages) {
      const props = (page as any).properties || {};
      const title: string = props['Title']?.title?.[0]?.plain_text || 'Untitled';
      const duration = 12;

      // Upsert goal by title
      const { data: existingGoals, error: findErr } = await supabase
        .from('marketing_goals')
        .select('id')
        .eq('title', title);
      if (findErr) throw findErr;

      let goalId: string;
      if ((existingGoals?.length ?? 0) > 0) {
        const existingId = (existingGoals as any)[0].id as string;
        const { error: updErr } = await supabase
          .from('marketing_goals')
          .update({ duration })
          .eq('id', existingId);
        if (updErr) throw updErr;
        goalId = existingId;
      } else {
        const { data: insGoal, error: insErr } = await supabase
          .from('marketing_goals')
          .insert([{ title, duration, description: '', is_active: false, current_week: 1, progress: 0 }])
          .select('*')
          .single();
        if (insErr) throw insErr;
        goalId = (insGoal as any).id as string;
      }

      // Parse weekly lessons from the Notion page content and sync modules/tasks
      const pageIdStr: string = String((page as any).id || '');
      await this.syncModulesFromPage(goalId, pageIdStr);
    }

    return { success: true } as const;
  }

  // Public: treat input as container page URL/ID, and sync each child page as a goal
  static async syncContainer(containerIdOrUrl: string) {
    const token = process.env['NOTION_API_KEY'] || '';
    if (!token) throw new Error('NOTION_API_KEY not set');
    const idMatch = containerIdOrUrl.match(/[0-9a-fA-F]{32}/);
    const id32 = idMatch ? idMatch[0] : containerIdOrUrl;
    const hyphenId = `${id32.slice(0,8)}-${id32.slice(8,12)}-${id32.slice(12,16)}-${id32.slice(16,20)}-${id32.slice(20)}`;
    const notion = new Client({ auth: token });
    await this.syncFromPageContainer(notion, hyphenId);
    return { success: true } as const;
  }

  // Public: sync a single goal from a specific Notion page URL/ID
  static async syncGoalFromPage(goalTitle: string, pageIdOrUrl: string) {
    const token = process.env['NOTION_API_KEY'] || '';
    if (!token) throw new Error('NOTION_API_KEY not set');
    const idMatch = pageIdOrUrl.match(/[0-9a-fA-F]{32}/);
    const id32 = idMatch ? idMatch[0] : pageIdOrUrl;
    const hyphenId = `${id32.slice(0,8)}-${id32.slice(8,12)}-${id32.slice(12,16)}-${id32.slice(16,20)}-${id32.slice(20)}`;

    // Upsert goal
    const { data: existing, error: findErr } = await supabase
      .from('marketing_goals')
      .select('id')
      .eq('title', goalTitle);
    if (findErr) throw findErr;
    let goalId: string;
    if ((existing?.length ?? 0) > 0) {
      goalId = (existing as any)[0].id as string;
    } else {
      const { data: ins, error: insErr } = await supabase
        .from('marketing_goals')
        .insert([{ title: goalTitle, duration: 12, description: '', is_active: false, current_week: 1, progress: 0 }])
        .select('*')
        .single();
      if (insErr) throw insErr;
      goalId = (ins as any).id as string;
    }

    await this.syncModulesFromPage(goalId, hyphenId);
    return { success: true } as const;
  }

  // Debug helper: return a summary of the immediate blocks in a page
  static async debugPageBlocks(pageIdOrUrl: string) {
    const token = process.env['NOTION_API_KEY'] || '';
    if (!token) throw new Error('NOTION_API_KEY not set');
    const notion = new Client({ auth: token });
    const idMatch = pageIdOrUrl.match(/[0-9a-fA-F]{32}/);
    const id32 = idMatch ? idMatch[0] : pageIdOrUrl;
    const hyphenId = `${id32.slice(0,8)}-${id32.slice(8,12)}-${id32.slice(12,16)}-${id32.slice(16,20)}-${id32.slice(20)}`;
    const blocks = await this.listBlockChildren(notion, hyphenId);
    const summary = blocks.slice(0, 100).map((b: any) => ({
      id: b.id,
      type: b.type,
      has_children: !!b.has_children,
      text: this.getPlainText(b)
    }));
    return { success: true, blocks: summary } as const;
  }

  private static async syncFromPageContainer(notion: Client, containerPageId: string) {
    // The container page hosts child pages, each is a marketing track
    const children = await this.listBlockChildren(notion, containerPageId);
    for (const child of children) {
      if (child.type !== 'child_page') continue;
      const title: string = child.child_page?.title || 'Untitled';

      // Upsert goal by title
      const { data: existing, error: findErr } = await supabase
        .from('marketing_goals')
        .select('id')
        .eq('title', title);
      if (findErr) throw findErr;
      let goalId: string;
      if ((existing?.length ?? 0) > 0) {
        goalId = (existing as any)[0].id as string;
      } else {
        const { data: ins, error: insErr } = await supabase
          .from('marketing_goals')
          .insert([{ title, duration: 12, description: '', is_active: false, current_week: 1, progress: 0 }])
          .select('*')
          .single();
        if (insErr) throw insErr;
        goalId = (ins as any).id as string;
      }

      // Parse the child page content into weeks and tasks
      await this.syncModulesFromBlocks(goalId, await this.listBlockChildren(notion, child.id));
    }
  }

  private static async listBlockChildren(notion: Client, blockId: string): Promise<any[]> {
    const out: any[] = [];
    let cursor: string | undefined;
    let hasMore = true;
    while (hasMore) {
      const resp: any = await notion.blocks.children.list({ block_id: blockId, page_size: 100, start_cursor: cursor } as any);
      out.push(...(resp.results || []));
      hasMore = !!resp.has_more;
      cursor = resp.next_cursor ?? undefined;
    }
    return out;
  }

  private static getPlainText(block: any): string {
    const rich = block?.[block.type]?.rich_text || [];
    return rich.map((r: any) => r.plain_text || '').join('').trim();
  }

  private static parseWeekHeading(text: string): { week: number; title: string } | null {
    const lower = String(text || '').toLowerCase();
    // Allow leading emojis/symbols before "week"
    const m = lower.match(/^[^a-z0-9]*week\s*(\d+)\s*[:\-–]?\s*(.*)$/);
    if (!m) return null;
    const week = parseInt(String(m[1]), 10);
    // Extract original-cased suffix from the original text by re-slicing length of match on lower string
    const suffixStart = lower.indexOf(m[0]) + m[0].length - (m[2]?.length || 0);
    const originalSuffix = text.slice(Math.max(0, suffixStart));
    const title = (originalSuffix || `Week ${week}`).trim() || `Week ${week}`;
    return { week, title };
  }

  private static async syncModulesFromPage(goalId: string, pageId: string | undefined): Promise<void> {
    const token = process.env['NOTION_API_KEY'] || '';
    const notion = new Client({ auth: token });

    const topBlocks = await this.listBlockChildren(notion, (pageId ?? '').toString());

    await this.syncModulesFromBlocks(goalId, topBlocks);
  }

  private static async syncModulesFromBlocks(goalId: string, topBlocks: any[]): Promise<void> {
    type WeekData = { week: number; title: string; contentLines: string[]; tasks: string[] };
    const weeks: Record<number, WeekData> = {};

    const token = process.env['NOTION_API_KEY'] || '';
    const notion = new Client({ auth: token });

    let currentWeekNum: number | null = null;

    const visit = async (blocks: any[]) => {
      for (const b of blocks) {
        const type = b.type;
        const text = this.getPlainText(b);

        // Treat any block that starts with "Week N" as the start of a module, not only heading blocks
        const heading = this.parseWeekHeading(text);
        if (heading) {
          currentWeekNum = heading.week;
          weeks[heading.week] ||= { week: heading.week, title: heading.title, contentLines: [], tasks: [] };
        } else if (currentWeekNum !== null) {
          if (type === 'bulleted_list_item' || type === 'numbered_list_item' || type === 'to_do') {
            if (text) weeks[currentWeekNum]?.tasks.push(text);
          } else if (type === 'paragraph' || type === 'quote' || type === 'callout' || type === 'toggle') {
            if (text) weeks[currentWeekNum]?.contentLines.push(text);
          }
        }

        if (b.has_children) {
          const children = await this.listBlockChildren(notion, b.id);
          await visit(children);
        }
      }
    };

    await visit(topBlocks);

    // Non-destructive upsert of modules/tasks (one-time import)
    const { data: existingMods } = await supabase
      .from('marketing_modules')
      .select('*')
      .eq('goal_id', goalId);
    const byWeek: Record<number, any> = {};
    (existingMods || []).forEach((m: any) => { byWeek[m.week_number] = m; });

    const weekNumbers = Object.keys(weeks).map(n => parseInt(n, 10)).sort((a, b) => a - b);
    for (const week of weekNumbers) {
      const w = weeks[week]!;
      if (byWeek[w.week]) {
        // update existing module
        const { error: updErr } = await supabase
          .from('marketing_modules')
          .update({ title: w.title || byWeek[w.week].title, description: w.title || byWeek[w.week].description, content: w.contentLines.join('\n') || byWeek[w.week].content })
          .eq('id', byWeek[w.week].id);
        if (updErr) throw updErr;
      } else {
        // insert new module
        const { data: moduleRow, error: moduleErr } = await supabase
          .from('marketing_modules')
          .insert([{ goal_id: goalId, week_number: w.week, title: w.title, description: w.title, content: w.contentLines.join('\n'), is_unlocked: w.week === 1, is_completed: false }])
          .select('*')
          .single();
        if (moduleErr) throw moduleErr;
        byWeek[w.week] = moduleRow;
      }

      // Upsert tasks: clear and insert fresh for this module for simplicity
      const moduleId = (byWeek[w.week] as any).id as string;
      await supabase.from('marketing_tasks').delete().eq('module_id', moduleId);
      for (const taskTitle of w.tasks) {
        const { error: taskErr } = await supabase
          .from('marketing_tasks')
          .insert([{ module_id: moduleId, title: taskTitle, description: '', estimated_time: '', is_completed: false }]);
        if (taskErr) throw taskErr;
      }
    }
  }
}


