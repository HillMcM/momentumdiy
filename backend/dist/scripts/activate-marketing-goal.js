"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function activateMarketingGoal() {
    try {
        console.log('🔄 Activating marketing goal in Supabase...');
        const { data: goals, error: fetchError } = await supabase_1.supabase
            .from('marketing_goals')
            .select('*')
            .eq('title', 'Increase Local Foot Traffic');
        if (fetchError) {
            console.error('❌ Error fetching goals:', fetchError);
            return;
        }
        if (!goals || goals.length === 0) {
            console.error('❌ No marketing goal found with title "Increase Local Foot Traffic"');
            return;
        }
        const goal = goals[0];
        console.log('📊 Found goal:', goal.id, goal.title);
        const { error: updateError } = await supabase_1.supabase
            .from('marketing_goals')
            .update({ is_active: true })
            .eq('id', goal.id);
        if (updateError) {
            console.error('❌ Error activating goal:', updateError);
            return;
        }
        console.log('✅ Marketing goal activated successfully!');
        console.log('🎯 Goal ID:', goal.id);
        console.log('📋 Title:', goal.title);
    }
    catch (error) {
        console.error('❌ Error activating marketing goal:', error);
    }
}
activateMarketingGoal();
//# sourceMappingURL=activate-marketing-goal.js.map