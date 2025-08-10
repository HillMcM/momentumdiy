import 'dotenv/config';
import { supabase } from '../config/supabase';

async function main() {
  try {
    const limitArg = process.argv.find(a => a.startsWith('--limit='));
    const limit = limitArg ? Math.max(1, parseInt(limitArg.split('=')[1] || '5', 10)) : 5;

    // Fetch all goals (alphabetical), then set first N active and the rest inactive
    const { data: goals, error } = await supabase
      .from('marketing_goals')
      .select('id, title, is_active')
      .order('title', { ascending: true });
    if (error) throw error;

    if (!goals || goals.length === 0) {
      console.log('No marketing_goals found. Did you run the Notion import yet?');
      process.exit(0);
    }

    const toActivate = goals.slice(0, limit).map(g => g.id);
    const toDeactivate = goals.slice(limit).map(g => g.id);

    if (toActivate.length > 0) {
      const { error: actErr } = await supabase
        .from('marketing_goals')
        .update({ is_active: true })
        .in('id', toActivate);
      if (actErr) throw actErr;
    }

    if (toDeactivate.length > 0) {
      const { error: deErr } = await supabase
        .from('marketing_goals')
        .update({ is_active: false })
        .in('id', toDeactivate);
      if (deErr) throw deErr;
    }

    console.log(`Activated ${toActivate.length} goals, deactivated ${toDeactivate.length}.`);
    process.exit(0);
  } catch (err) {
    console.error('Activation script failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();


