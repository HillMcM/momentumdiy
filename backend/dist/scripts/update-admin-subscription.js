"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function updateAdminSubscription() {
    try {
        console.log('Updating admin subscription status...');
        const { data, error } = await supabase_1.supabase
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
    }
    catch (error) {
        console.error('Error:', error);
    }
}
updateAdminSubscription();
//# sourceMappingURL=update-admin-subscription.js.map