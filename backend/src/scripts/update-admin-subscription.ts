import { supabase } from '../config/supabase';

async function updateAdminSubscription() {
  try {
    console.log('Updating admin subscription status...');
    
    // Update the subscription status for the admin email
    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: 'monthly',
        subscription_start_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('email', 'info@hillaryedenmcmullen.com')
      .select();

    if (error) {
      console.error('Error updating subscription:', error);
      return;
    }

    console.log('Successfully updated admin subscription:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
updateAdminSubscription();
