const { supabase } = require('./dist/config/supabase');

async function addPhasesColumnDirectly() {
  try {
    console.log('Attempting to add phases column...');
    
    // Try to create a test track with phases to see if column exists
    const testPhases = [
      {"id": "1", "title": "Foundation Phase", "description": "Building your strategy foundation", "startWeek": 1, "endWeek": 3, "color": "#EF8E81"},
      {"id": "2", "title": "Implementation Phase", "description": "Putting strategies into action", "startWeek": 4, "endWeek": 6, "color": "#D4AF37"},
      {"id": "3", "title": "Growth Phase", "description": "Scaling and expanding your reach", "startWeek": 7, "endWeek": 9, "color": "#8B5CF6"},
      {"id": "4", "title": "Optimization Phase", "description": "Refining and optimizing performance", "startWeek": 10, "endWeek": 12, "color": "#10B981"}
    ];

    // First, get an existing track to test with
    const { data: tracks, error: tracksError } = await supabase
      .from('marketing_track_definitions')
      .select('id')
      .limit(1);

    if (tracksError) {
      console.error('Error getting tracks:', tracksError);
      return;
    }

    if (!tracks || tracks.length === 0) {
      console.log('No tracks found to test with');
      return;
    }

    const trackId = tracks[0].id;
    console.log('Testing with track ID:', trackId);

    // Try to update a track with phases
    const { data, error } = await supabase
      .from('marketing_track_definitions')
      .update({ phases: testPhases })
      .eq('id', trackId)
      .select();

    if (error) {
      console.error('Error updating track with phases:', error);
      
      if (error.message.includes('column "phases" does not exist')) {
        console.log('✅ Confirmed: phases column does not exist');
        console.log('You need to manually add the column to the database:');
        console.log('ALTER TABLE public.marketing_track_definitions ADD COLUMN phases JSONB DEFAULT \'[]\'::jsonb;');
      }
    } else {
      console.log('✅ Success! Phases column exists and was updated');
      console.log('Updated track:', data);
    }

  } catch (error) {
    console.error('Failed:', error);
  }
}

addPhasesColumnDirectly();
