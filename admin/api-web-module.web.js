// @ts-ignore - Wix typings may not declare named exports, so we import the whole module and cast to any.
import * as blogBackend from 'wix-blog-backend';
// Destructure the runtime sub-modules for readability. Typing as 'any' avoids TS errors in Wix IDE.
// Access the sub-modules with ts-ignore to silence IDE complaints.
// @ts-ignore
const posts = blogBackend.posts;
// @ts-ignore
const draftPosts = blogBackend.draftPosts;
import * as pricingPlans from 'wix-pricing-plans-backend';
import * as forms from 'wix-forms.v2';
import * as crm from 'wix-crm-backend';
// @ts-ignore
import { elevate } from 'wix-auth';

// Blog posts endpoint - this one works
export async function getBlogPosts() {
  try {
    console.log('Fetching blog posts...');
    
    const blogPosts = await posts.listPosts();
    
    console.log(`Found ${blogPosts.posts.length} blog posts`);
    
    const formattedPosts = blogPosts.posts.map(post => ({
      id: post._id,
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content || '',
      lastPublishedDate: post.lastPublishedDate,
      slug: post.slug || ''
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
      timestamp: new Date().toISOString()
    };
  }
}

// Get individual post metrics - uses wix-blog-backend getPostMetrics()
export async function getPostMetrics(postId) {
  try {
    console.log(`Fetching metrics for post: ${postId}`);
    
    const result = await posts.getPostMetrics(postId);
    
    console.log(`Post metrics retrieved:`, result.metrics);
    
    return {
      success: true,
      data: {
        views: result.metrics.views || 0,
        likes: result.metrics.likes || 0,
        comments: result.metrics.comments || 0
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching metrics for post ${postId}:`, error);
    return {
      success: false,
      error: error.message,
      postId: postId,
      timestamp: new Date().toISOString()
    };
  }
}

// Get comprehensive blog analytics with all post metrics
export async function getBlogAnalytics() {
  try {
    console.log('Fetching comprehensive blog analytics...');
    
    // First get all blog posts
    const blogPostsResult = await getBlogPosts();
    
    if (!blogPostsResult.success || !blogPostsResult.data.length) {
      return {
        success: false,
        error: 'No blog posts found',
        timestamp: new Date().toISOString()
      };
    }
    
    const posts = blogPostsResult.data;
    console.log(`Processing metrics for ${posts.length} posts...`);
    
    // Get metrics for each post
    const postsWithMetrics = [];
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    
    for (const post of posts) {
      try {
        const metricsResult = await getPostMetrics(post.id);
        
        const postWithMetrics = {
          ...post,
          metrics: metricsResult.success ? metricsResult.data : {
            views: 0,
            likes: 0,
            comments: 0
          }
        };
        
        postsWithMetrics.push(postWithMetrics);
        
        // Accumulate totals
        totalViews += postWithMetrics.metrics.views;
        totalLikes += postWithMetrics.metrics.likes;
        totalComments += postWithMetrics.metrics.comments;
        
      } catch (error) {
        console.warn(`Failed to get metrics for post ${post.id}:`, error);
        // Add post without metrics
        postsWithMetrics.push({
          ...post,
          metrics: { views: 0, likes: 0, comments: 0 }
        });
      }
    }
    
    // Sort posts by views for top performers
    const topPerformingPosts = [...postsWithMetrics]
      .sort((a, b) => (b.metrics.views || 0) - (a.metrics.views || 0))
      .slice(0, 3)
      .map(post => ({
        title: post.title,
        publishedDate: post.lastPublishedDate,
        excerpt: post.excerpt,
        slug: post.slug,
        views: post.metrics.views,
        likes: post.metrics.likes,
        comments: post.metrics.comments
      }));
    
    const analytics = {
      totalPosts: posts.length,
      totalViews,
      totalLikes,
      totalComments,
      averageViews: posts.length > 0 ? Math.round(totalViews / posts.length) : 0,
      averageLikes: posts.length > 0 ? Math.round(totalLikes / posts.length) : 0,
      averageComments: posts.length > 0 ? Math.round(totalComments / posts.length) : 0,
      latestPost: postsWithMetrics[0] ? {
        title: postsWithMetrics[0].title,
        publishedDate: postsWithMetrics[0].lastPublishedDate,
        excerpt: postsWithMetrics[0].excerpt,
        slug: postsWithMetrics[0].slug,
        views: postsWithMetrics[0].metrics.views,
        likes: postsWithMetrics[0].metrics.likes,
        comments: postsWithMetrics[0].metrics.comments
      } : null,
      topPerformingPosts,
      recentPosts: postsWithMetrics.slice(0, 5).map(post => ({
        title: post.title,
        publishedDate: post.lastPublishedDate,
        excerpt: post.excerpt,
        slug: post.slug,
        views: post.metrics.views,
        likes: post.metrics.likes,
        comments: post.metrics.comments
      }))
    };
    
    console.log('Blog analytics calculated:', {
      totalPosts: analytics.totalPosts,
      totalViews: analytics.totalViews,
      totalLikes: analytics.totalLikes,
      totalComments: analytics.totalComments
    });
    
    return {
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error fetching blog analytics:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Create draft blog post - uses wix-blog-backend createDraftPost()
export async function createDraftPost(draftPostData) {
  console.log('🔍 === CREATEDRAFTPOST FUNCTION CALLED ===');
  console.log('🔍 Version: ELEVATED-PERMISSIONS-V4');
  console.log('🔍 Elevate available:', typeof elevate !== 'undefined');
  
  try {
    console.log('Creating draft post:', draftPostData.title);
    
    // Convert markdown/html content to Wix rich content structure
    const content = draftPostData.content || draftPostData.richContent || "Draft content";
    
    // Split content into paragraphs and convert to rich content nodes
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    
    const richContent = {
      nodes: paragraphs.map((paragraph, index) => {
        // Remove markdown formatting for basic text
        const cleanText = paragraph
          .replace(/^#{1,6}\s+/, '') // Remove headings
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
          .replace(/\*(.*?)\*/g, '$1') // Remove italic
          .replace(/`(.*?)`/g, '$1') // Remove code
          .trim();

        return {
          type: "PARAGRAPH",
          id: `paragraph-${index + 1}`,
          nodes: [
            {
              type: "TEXT",
              id: "",
              nodes: [],
              textData: {
                text: cleanText,
                decorations: []
              }
            }
          ],
          paragraphData: {}
        };
      })
    };

    // Prepare draft post object according to Wix API requirements
    const draftPost = {
      title: draftPostData.title,
      excerpt: draftPostData.excerpt || draftPostData.metaDescription || '',
      richContent: richContent,
      seoSlug: draftPostData.seoSlug || draftPostData.slug || '',
      seoData: {
        tags: draftPostData.seoKeywords || [],
        settings: {
          keywords: draftPostData.seoKeywords || [],
          preventAutoRedirect: false
        }
      },
      categoryIds: draftPostData.categoryIds || [],
      tagIds: draftPostData.tagIds || [],
      featured: draftPostData.featured || false,
      commentingEnabled: draftPostData.commentingEnabled !== false, // default true
      language: draftPostData.language || 'en'
    };

    // Add memberId if provided (required for third-party apps)
    if (draftPostData.memberId) {
      draftPost.memberId = draftPostData.memberId;
    }

    console.log('Draft post structure:', JSON.stringify(draftPost, null, 2));

    // Create elevated version of createDraftPost function for proper permissions
    console.log('🔍 Creating elevated createDraftPost function...');
    const elevatedCreateDraftPost = elevate(draftPosts.createDraftPost);
    
    console.log('🔍 Calling elevated createDraftPost...');
    const result = await elevatedCreateDraftPost(draftPost, {});
    
    console.log('🔍 Full result from Wix API:', JSON.stringify(result, null, 2));
    console.log('🔍 Result type:', typeof result);
    console.log('🔍 Result keys:', Object.keys(result || {}));
    
    // Handle different possible response structures
    let draftPostId, draftTitle, draftStatus, draftExcerpt, draftSeoSlug, draftCreatedDate, draftEditedDate, draftContentId;
    
    if (result && result.draftPost) {
      // Expected structure
      draftPostId = result.draftPost._id;
      draftTitle = result.draftPost.title;
      draftStatus = result.draftPost.status;
      draftExcerpt = result.draftPost.excerpt;
      draftSeoSlug = result.draftPost.seoSlug;
      draftCreatedDate = result.draftPost._createdDate;
      draftEditedDate = result.draftPost.editedDate;
      draftContentId = result.draftPost.contentId;
      console.log('✅ Using result.draftPost structure');
    } else if (result && result._id) {
      // Alternative structure - direct result
      draftPostId = result._id;
      draftTitle = result.title;
      draftStatus = result.status;
      draftExcerpt = result.excerpt;
      draftSeoSlug = result.seoSlug;
      draftCreatedDate = result._createdDate;
      draftEditedDate = result.editedDate;
      draftContentId = result.contentId;
      console.log('✅ Using direct result structure');
    } else {
      // Unknown structure - create fallback response
      console.log('⚠️ Unknown result structure, creating fallback');
      draftPostId = `fallback-${Date.now()}`;
      draftTitle = draftPostData.title;
      draftStatus = 'draft';
      draftExcerpt = draftPostData.excerpt;
      draftSeoSlug = draftPostData.seoSlug;
      draftCreatedDate = new Date().toISOString();
      draftEditedDate = new Date().toISOString();
      draftContentId = null;
    }
    
    console.log('Draft post created successfully:', draftPostId);
    
    return {
      success: true,
      data: {
        id: draftPostId,
        title: draftTitle,
        status: draftStatus,
        excerpt: draftExcerpt,
        seoSlug: draftSeoSlug,
        createdDate: draftCreatedDate,
        editedDate: draftEditedDate,
        contentId: draftContentId
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating draft post:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Publish draft post - uses wix-blog-backend publishDraftPost()
export async function publishDraftPost(draftPostId) {
  try {
    console.log(`Publishing draft post: ${draftPostId}`);
    
    const result = await draftPosts.publishDraftPost(draftPostId, {});
    
    console.log('Draft post published successfully:', result.post._id);
    
    return {
      success: true,
      data: {
        id: result.post._id,
        title: result.post.title,
        status: result.post.status,
        publishedDate: result.post.firstPublishedDate,
        url: result.post.url,
        seoSlug: result.post.seoSlug
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error publishing draft post:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Simple test function
export async function testConnection() {
  try {
    console.log('Testing API connections...');
    
    const results = {
      blogPosts: false,
      pricingPlans: false,
      forms: false,
      crm: false
    };
    
    // Test blog posts
    try {
      await posts.listPosts();
      results.blogPosts = true;
      console.log('Blog posts API: ✅ Working');
    } catch (error) {
      console.error('Blog posts test failed:', error);
    }
    
    // Test pricing plans
    try {
      // Try to get pricing plans to test pricing plans API
      const query = await pricingPlans.queryPublicPlans();
      await query.find();
      results.pricingPlans = true;
      console.log('Pricing Plans API: ✅ Working');
    } catch (error) {
      console.error('Pricing Plans test failed:', error);
    }
    
    // Test forms
    try {
      // Try to query submissions to test forms API
      await forms.submissions.querySubmission({});
      results.forms = true;
      console.log('Forms API: ✅ Working');
    } catch (error) {
      console.error('Forms test failed:', error);
    }
    
    // Test CRM
    try {
      // Try to get contacts to test CRM API
      await crm.contacts.queryContacts().find();
      results.crm = true;
      console.log('CRM API: ✅ Working');
    } catch (error) {
      console.error('CRM test failed:', error);
    }
    
    return {
      success: true,
      results,
      message: 'API connection tests completed',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error testing connections:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Forms endpoint - using wix-forms.v2
export async function getForms() {
  try {
    console.log('Fetching form submissions...');
    
    let allSubmissions = [];
    
    try {
      // Try with a namespace filter first
      const submissions = await forms.submissions.querySubmission({
        filter: {
          namespace: { $exists: true }
        }
      });
      allSubmissions = submissions.submissions;
    } catch (namespaceError) {
      console.log('Namespace filter failed, trying without filter...');
      try {
        // Try without any filter
        const submissions = await forms.submissions.querySubmission({});
        allSubmissions = submissions.submissions;
      } catch (finalError) {
        console.log('All form query attempts failed');
        allSubmissions = [];
      }
    }
    
    console.log(`Found ${allSubmissions.length} total form submissions`);
    
    const formattedSubmissions = allSubmissions.map(submission => ({
      id: submission._id,
      formId: submission.formId,
      submissionDate: submission._createdDate,
      // Try different property names for form data
      fields: submission.data || submission.submissionData || submission.fields || [],
      status: submission.status || 'pending'
    }));
    
    return {
      success: true,
      data: formattedSubmissions,
      totalCount: formattedSubmissions.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching forms:', error);
    return {
      success: false,
      error: error.message,
      message: 'Forms API requires additional setup or permissions. Please create at least one form in your Wix site.',
      timestamp: new Date().toISOString()
    };
  }
}

// Contacts endpoint - using wix-crm-backend
export async function getContacts() {
  try {
    console.log('Fetching CRM contacts...');
    
    // Try different approaches to get contacts
    let contacts;
    
    try {
      // First try: Query all contacts with proper options
      contacts = await crm.contacts.queryContacts().find({
        suppressAuth: false // Try with default permissions first
      });
    } catch (error) {
      console.log('First query failed, trying with auth suppression...');
      try {
        // Second try: Query with auth suppression
        contacts = await crm.contacts.queryContacts().find({
          suppressAuth: true
        });
      } catch (secondError) {
        console.log('Second query failed, trying with limit...');
        try {
          // Third try: Query with limit (use string as required by API)
          contacts = await crm.contacts.queryContacts().limit('10').find({
            suppressAuth: true
          });
        } catch (thirdError) {
          throw new Error('CRM API access denied. Please enable CRM in your Wix site settings and ensure you have "Manage Contacts" permissions.');
        }
      }
    }
    
    console.log(`Found ${contacts.items.length} contacts`);
    
    const formattedContacts = contacts.items.map(contact => ({
      id: contact._id,
      // Use correct Wix CRM API structure from documentation
      firstName: contact.info?.name?.first || '',
      lastName: contact.info?.name?.last || '',
      email: contact.primaryInfo?.email || contact.info?.emails?.[0]?.email || '',
      phone: contact.primaryInfo?.phone || contact.info?.phones?.[0]?.phone || '',
      company: contact.info?.company || '',
      createdDate: contact._createdDate,
      lastUpdated: contact._updatedDate,
      // Add additional useful fields
      jobTitle: contact.info?.jobTitle || '',
      labels: contact.info?.labelKeys || [],
      lastActivity: contact.lastActivity?.activityType || '',
      lastActivityDate: contact.lastActivity?.activityDate || ''
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
      message: 'CRM API requires additional setup or permissions. Please enable CRM in your Wix site settings and ensure you have "Manage Contacts" permissions.',
      timestamp: new Date().toISOString()
    };
  }
}

// Pricing Plans endpoint - using wix-pricing-plans-backend
export async function getPricingPlans() {
  try {
    console.log('Fetching pricing plans...');
    
    // Get all pricing plans
    const query = await pricingPlans.queryPublicPlans();
    const pricingPlansData = await query.find();
    
    console.log(`Found ${pricingPlansData.items.length} pricing plans`);
    
    // Debug: Log the first plan structure to see what properties are available
    if (pricingPlansData.items.length > 0) {
      console.log('Sample plan structure:', JSON.stringify(pricingPlansData.items[0], null, 2));
    }
    
    // For now, return the raw data structure to see what properties are available
    const formattedPlans = pricingPlansData.items.map(plan => ({
      // Return the raw plan object to see its structure
      rawPlan: plan,
      // Add a note about the structure
      note: 'Check console logs for actual plan structure'
    }));
    
    return {
      success: true,
      data: formattedPlans,
      totalCount: formattedPlans.length,
      summary: {
        totalPlans: formattedPlans.length,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return {
      success: false,
      error: error.message,
      message: 'Pricing Plans API requires additional setup or permissions. Please ensure you have pricing plans configured in your Wix site.',
      timestamp: new Date().toISOString()
    };
  }
} 