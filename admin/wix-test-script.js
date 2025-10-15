// Test script to run within Wix environment
// Add this to your Wix site's backend code or run it in the Wix console

import * as blogBackend from 'wix-blog-backend';
import * as ecommData from 'wix-ecom-backend';
import * as forms from 'wix-forms.v2';
import * as crm from 'wix-crm-backend';

// Test function to run in Wix environment
export async function testWixAPIs() {
  console.log('🧪 Testing Wix APIs from within Wix environment...');
  
  const results = {};
  
  // Test Blog Posts
  try {
    console.log('\n📝 Testing Blog Posts...');
    const blogPosts = await blogBackend.posts.listPosts();
    console.log('✅ Blog Posts Structure:', JSON.stringify(blogPosts.posts[0], null, 2));
    results.blogPosts = { success: true, data: blogPosts.posts };
  } catch (error) {
    console.error('❌ Blog Posts Error:', error);
    results.blogPosts = { success: false, error: error.message };
  }
  
  // Test Forms
  try {
    console.log('\n📋 Testing Forms...');
    const submissions = await forms.submissions.querySubmission({});
    console.log('✅ Forms Structure:', JSON.stringify(submissions.submissions[0], null, 2));
    results.forms = { success: true, data: submissions.submissions };
  } catch (error) {
    console.error('❌ Forms Error:', error);
    results.forms = { success: false, error: error.message };
  }
  
  // Test Contacts
  try {
    console.log('\n👥 Testing Contacts...');
    const contacts = await crm.contacts.queryContacts().find();
    console.log('✅ Contacts Structure:', JSON.stringify(contacts.items[0], null, 2));
    results.contacts = { success: true, data: contacts.items };
  } catch (error) {
    console.error('❌ Contacts Error:', error);
    results.contacts = { success: false, error: error.message };
  }
  
  // Test Ecommerce
  try {
    console.log('\n🛒 Testing Ecommerce...');
    const currentCart = await ecommData.currentCart.getCurrentCart();
    console.log('✅ Cart Structure:', JSON.stringify(currentCart, null, 2));
    
    let orders = [];
    try {
      orders = await ecommData.orders.queryOrders().find();
      console.log('✅ Orders Structure:', JSON.stringify(orders, null, 2));
    } catch (orderError) {
      console.log('⚠️ Orders not available:', orderError.message);
    }
    
    results.ecommerce = { success: true, cart: currentCart, orders: orders };
  } catch (error) {
    console.error('❌ Ecommerce Error:', error);
    results.ecommerce = { success: false, error: error.message };
  }
  
  console.log('\n📊 FINAL RESULTS:');
  console.log('=' .repeat(50));
  console.log(JSON.stringify(results, null, 2));
  
  return results;
}

// Instructions for running this test:
// 1. Copy this code to your Wix backend
// 2. Call testWixAPIs() from your Wix console or another function
// 3. Check the console output to see the actual data structures
// 4. Use the structures to fix the TypeScript errors in api-web-module.web.js 