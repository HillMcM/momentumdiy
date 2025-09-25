const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

async function checkAndPublishTracks() {
  try {
    console.log('🔍 Checking current track definitions...');
    
    // Get all track definitions
    const { data: tracks, error } = await supabase
      .from('marketing_track_definitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching tracks:', error);
      return;
    }

    console.log(`📊 Found ${tracks.length} track definitions:`);
    tracks.forEach(track => {
      console.log(`  - ${track.title} (${track.id}) - Published: ${track.published}`);
      console.log(`    Description: ${track.description || 'No description'}`);
      console.log(`    Industry: ${track.industry_tags?.join(', ') || 'No industry tags'}`);
      console.log(`    Duration: ${track.duration_weeks} weeks`);
      console.log('');
    });

    // Ask which tracks should be published
    console.log('🎯 To publish a track, update its published field to true in the admin panel.');
    console.log('🔧 Or run this command with track IDs to publish specific tracks:');
    console.log('   node check-and-publish-tracks.js publish TRACK_ID_1 TRACK_ID_2');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function publishTracks(trackIds) {
  try {
    console.log(`🚀 Publishing tracks: ${trackIds.join(', ')}`);
    
    const { data, error } = await supabase
      .from('marketing_track_definitions')
      .update({ published: true })
      .in('id', trackIds);

    if (error) {
      console.error('❌ Error publishing tracks:', error);
      return;
    }

    console.log('✅ Tracks published successfully!');
    
    // Show updated status
    const { data: updatedTracks, error: fetchError } = await supabase
      .from('marketing_track_definitions')
      .select('id, title, published')
      .in('id', trackIds);

    if (!fetchError && updatedTracks) {
      console.log('📊 Updated track status:');
      updatedTracks.forEach(track => {
        console.log(`  - ${track.title}: Published = ${track.published}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error publishing tracks:', error);
  }
}

// Main execution
const args = process.argv.slice(2);
if (args[0] === 'publish' && args.length > 1) {
  const trackIds = args.slice(1);
  publishTracks(trackIds);
} else {
  checkAndPublishTracks();
}
