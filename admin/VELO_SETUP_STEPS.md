
# 🚀 Velo Setup Steps for MomentumDIY

## Step 1: Enable Velo in Your Wix Site

1. **Go to your Wix site dashboard**
2. **Click on "Developer Tools"** in the left sidebar
3. **Click "Velo by Wix"**
4. **Click "Enable Velo"**
5. **Wait for Velo to initialize** (this may take a few minutes)

## Step 2: Create Backend Files

1. **In Velo, click on "Backend"** in the left sidebar
2. **Click the "+" button** to create a new file
3. **Name it `api-functions.js`**
4. **Copy and paste the entire content** from `velo-backend-functions.js` into this file
5. **Save the file**

## Step 3: Create Web Module (Updated)

Since you're using the current Velo interface, we need to create a **Web Module** that can be called from external applications.

### **Option A: Use Your Existing `api-web-module.js` File**

1. **Click on your existing `api-web-module.js` file** in the Backend section
2. **Replace its contents** with this updated code:

```javascript
import { posts } from 'wix-blog-backend';
import { forms } from 'wix-forms.v2';
import { contacts } from 'wix-crm.v2';

// Blog posts endpoint
export async function getBlogPosts() {
  try {
    console.log('Fetching blog posts...');
    
    const blogPosts = await posts.listPosts({
      limit: 50,
      includeDrafts: false
    });
    
    console.log(`Found ${blogPosts.items.length} blog posts`);
    
    const formattedPosts = blogPosts.items.map(post => ({
      id: post._id,
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content || '',
      publishedDate: post.publishedDate,
      viewCount: post.viewCount || 0,
      commentCount: post.commentCount || 0,
      tags: post.tags || [],
      featured: post.featured || false,
      coverImage: post.coverImage || null,
      slug: post.slug || '',
      author: post.author || 'MomentumDIY',
      readingTime: post.readingTime || 0
    }));
    
    return {
      success: true,
      data: formattedPosts,
      totalCount: formattedPosts.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      totalCount: 0
    };
  }
}

// Forms endpoint
export async function getForms() {
  try {
    console.log('Fetching forms...');
    
    const formsList = await forms.listForms();
    console.log(`Found ${formsList.items.length} forms`);
    
    const formsWithSubmissions = await Promise.all(
      formsList.items.map(async (form) => {
        try {
          const submissions = await forms.listFormSubmissions(form._id);
          return {
            formId: form._id,
            formName: form.name,
            submissions: submissions.items.length,
            lastSubmission: submissions.items[0]?.date || null,
            fields: form.fields || [],
            createdDate: form.createdDate,
            updatedDate: form.updatedDate
          };
        } catch (submissionError) {
          console.warn(`Could not fetch submissions for form ${form._id}:`, submissionError.message);
          return {
            formId: form._id,
            formName: form.name,
            submissions: 0,
            lastSubmission: null,
            fields: form.fields || [],
            createdDate: form.createdDate,
            updatedDate: form.updatedDate
          };
        }
      })
    );
    
    return {
      success: true,
      data: formsWithSubmissions,
      totalCount: formsWithSubmissions.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching forms:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      totalCount: 0
    };
  }
}

// Contacts endpoint
export async function getContacts() {
  try {
    console.log('Fetching contacts...');
    
    const contactsList = await contacts.listContacts({
      limit: 100
    });
    
    console.log(`Found ${contactsList.items.length} contacts`);
    
    const formattedContacts = contactsList.items.map(contact => ({
      id: contact._id,
      name: contact.name || 'Unknown',
      email: contact.email || '',
      phone: contact.phone || '',
      createdDate: contact.createdDate,
      lastActivity: contact.lastActivity || contact.createdDate,
      tags: contact.tags || [],
      notes: contact.notes || '',
      source: contact.source || 'Unknown'
    }));
    
    return {
      success: true,
      data: formattedContacts,
      totalCount: formattedContacts.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      totalCount: 0
    };
  }
}

// Test function
export async function testConnection() {
  return {
    success: true,
    message: 'Velo web module is working!',
    timestamp: new Date().toISOString()
  };
}
```

### **Option B: Create a New Web Module**

1. **In Velo, click the "+" button** in the Backend section
2. **Name it `momentum-api.jsw`** (note the `.jsw` extension for web modules)
3. **Copy the code above** into this new file

### **Step 4: Delete the Old File**

1. **Delete the `velo-backend-functions.js` file** (right-click and select delete)
2. **Keep only the web module file** (`api-web-module.js` or `momentum-api.jsw`)

## Step 4: Deploy Your Web Module

1. **Click "Publish"** in the top right of Velo
2. **Wait for deployment to complete**
3. **Note your site URL** (e.g., `https://your-site.wixsite.com/your-site`)

## Step 5: Test Your Web Module

Since web modules are called from within your Wix site, we'll need to test them differently. Let's create a simple test page:

### **Create a Test Page:**

1. **Go back to your Wix site editor** (not Velo)
2. **Add a new page** called "API Test"
3. **Add a button** to the page
4. **In the button settings, add this code** to the "Click" action:

```javascript
import { getBlogPosts, getForms, getContacts, testConnection } from 'api-web-module.js';

// Test the connection
testConnection().then(result => {
  console.log('Test result:', result);
  alert('Check console for results!');
});

// Test blog posts
getBlogPosts().then(result => {
  console.log('Blog posts:', result);
});

// Test forms
getForms().then(result => {
  console.log('Forms:', result);
});

// Test contacts
getContacts().then(result => {
  console.log('Contacts:', result);
});
```

5. **Publish your site**
6. **Visit the test page** and click the button
7. **Open browser console** (F12) to see the results

## Step 6: Update Your Application

Once the endpoints are working, update your `WixClient` with your actual site URL:

```javascript
class WixClient {
  constructor() {
    // Replace with your actual Wix site URL
    this.baseUrl = 'https://your-site.wixsite.com/your-site';
  }

  async getBlogPosts() {
    try {
      const response = await fetch(`${this.baseUrl}/api/blog-posts`);
      const data = await response.json();
      
      if (data.success) {
        return {
          items: data.data,
          totalCount: data.totalCount
        };
      } else {
        return {
          items: [],
          totalCount: 0,
          error: data.error
        };
      }
    } catch (error) {
      return {
        items: [],
        totalCount: 0,
        error: error.message
      };
    }
  }

  async getForms() {
    try {
      const response = await fetch(`${this.baseUrl}/api/forms`);
      const data = await response.json();
      
      if (data.success) {
        return {
          items: data.data,
          totalCount: data.totalCount
        };
      } else {
        return {
          items: [],
          totalCount: 0,
          error: data.error
        };
      }
    } catch (error) {
      return {
        items: [],
        totalCount: 0,
        error: error.message
      };
    }
  }
}
```

## Troubleshooting

### If you get errors:

1. **Check Velo Console**: Look for error messages in the Velo console
2. **Verify Permissions**: Make sure your Wix plan supports Velo
3. **Check API Limits**: Some Wix plans have API call limits
4. **Test Individual Functions**: Try running functions individually in Velo

### Common Issues:

- **"Function not found"**: Make sure you selected the correct function in HTTP Functions
- **"Permission denied"**: Check your Wix plan permissions
- **"CORS errors"**: The functions include CORS headers, but you might need to adjust them

## What You'll Get

Once set up, your system will have access to:

✅ **Real blog posts** with view counts and engagement data
✅ **Form submissions** and contact information  
✅ **User analytics** and site performance data
✅ **Dynamic content** based on actual user behavior
✅ **Automated workflows** that respond to real data

## Next Steps

After Velo is set up:
1. **Test the endpoints** to make sure they work
2. **Update your application** with the new URLs
3. **Run your workflow** to see real data in action!
4. **Monitor the Velo console** for any issues

This will transform your business automation from using mock data to real, actionable insights from your actual Wix site! 🎉 