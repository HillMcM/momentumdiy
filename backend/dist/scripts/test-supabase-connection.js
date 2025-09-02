"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
async function testSupabaseConnection() {
    try {
        console.log('🔍 Testing Supabase connection...');
        console.log('📍 Supabase URL:', process.env['SUPABASE_URL'] || 'http://127.0.0.1:54321');
        const { error } = await supabase_1.supabase
            .from('marketing_goals')
            .select('count')
            .limit(1);
        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
            console.error('🔧 Please check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
            return;
        }
        console.log('✅ Supabase connection successful!');
        const { data: activeGoal, error: goalError } = await supabase_1.supabase
            .from('marketing_goals')
            .select('*')
            .eq('is_active', true)
            .single();
        if (goalError) {
            if (goalError.code === 'PGRST116') {
                console.log('⚠️  No active marketing goal found');
                console.log('💡 Run: npm run seed-marketing-track to create content');
            }
            else {
                console.error('❌ Error checking for active goal:', goalError.message);
            }
        }
        else {
            console.log('🎯 Active goal found:', activeGoal.title);
            console.log('📊 Goal ID:', activeGoal.id);
        }
    }
    catch (error) {
        console.error('❌ Connection test failed:', error);
    }
}
testSupabaseConnection();
//# sourceMappingURL=test-supabase-connection.js.map