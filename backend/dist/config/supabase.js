"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAuth = exports.supabasePublic = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const environment_1 = require("./environment");
dotenv_1.default.config();
const supabaseUrl = environment_1.ENV.supabaseUrl;
const supabaseServiceKey = environment_1.ENV.supabaseServiceRoleKey;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
const supabaseAnonKey = environment_1.ENV.supabaseAnonKey;
exports.supabasePublic = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
exports.supabaseAuth = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
exports.default = exports.supabase;
//# sourceMappingURL=supabase.js.map