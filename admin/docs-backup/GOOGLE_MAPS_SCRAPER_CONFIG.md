# Google Maps Scraper Configuration Guide - New Hampshire Focus

## 🎯 **Perfect Configuration for New Hampshire Local Business Research**

Based on your Apify console setup, here's the optimal configuration for finding detailed local business information in New Hampshire:

---

## 📝 **JSON Configuration for New Hampshire**

Replace the current JSON with this optimized configuration for your local area:

```json
{
  "locationQuery": "New Hampshire, USA",
  "searchStringsArray": [
    "coffee shop",
    "restaurant",
    "hair salon",
    "cleaning services",
    "auto repair",
    "dentist",
    "plumber",
    "electrician",
    "landscaping",
    "bakery",
    "jewelry store",
    "bookstore",
    "antique shop",
    "pet groomer",
    "chiropractor",
    "massage therapy",
    "real estate",
    "insurance",
    "lawyer",
    "fitness center"
  ],
  "maxCrawledPlacesPerSearch": 30,
  "includeWebResults": false,
  "language": "en",
  "maxImages": 0,
  "maximumLeadsEnrichmentRecords": 0,
  "scrapeContacts": true,
  "scrapeDirectories": false,
  "scrapeImageAuthors": false,
  "scrapePlaceDetailPage": true,
  "scrapeReviewsPersonalData": true,
  "scrapeTableReservationProvider": false,
  "skipClosedPlaces": false
}
```

---

## 🔧 **Configuration Breakdown for New Hampshire**

### **Location Query (Most Important)**
```json
"locationQuery": "New Hampshire, USA"
```

**Why This Works:**
- **"New Hampshire, USA"** - Covers the entire state
- **Broader coverage** than city-specific searches
- **Finds businesses** in all NH cities and towns
- **Better for statewide** market research

### **Search Strings Array (20 Business Types)**
```json
"searchStringsArray": [
  "coffee shop",
  "restaurant", 
  "hair salon",
  "cleaning services",
  "auto repair",
  "dentist",
  "plumber",
  "electrician",
  "landscaping",
  "bakery",
  "jewelry store",
  "bookstore",
  "antique shop",
  "pet groomer",
  "chiropractor",
  "massage therapy",
  "real estate",
  "insurance",
  "lawyer",
  "fitness center"
]
```

**Why These 20 Business Types:**
- **Matches your Google Search results** for consistency
- **Covers all major local business categories**
- **Perfect for your automation services** target market
- **Diverse enough** to test different business needs

### **Data Collection Settings**
```json
"maxCrawledPlacesPerSearch": 30,
"scrapeContacts": true,
"scrapePlaceDetailPage": true,
"scrapeReviewsPersonalData": true
```

**Why These Settings:**
- **30 places per search** = 600 total businesses (20 types × 30)
- **`scrapeContacts: true`** - Get phone numbers and emails
- **`scrapePlaceDetailPage: true`** - Get detailed business info
- **`scrapeReviewsPersonalData: true`** - Get customer insights

### **Performance Settings**
```json
"includeWebResults": false,
"maxImages": 0,
"maximumLeadsEnrichmentRecords": 0,
"scrapeDirectories": false,
"scrapeImageAuthors": false,
"scrapeTableReservationProvider": false,
"skipClosedPlaces": false
```

**Why These Settings:**
- **`includeWebResults: false`** - Focus on Google Maps data only
- **`maxImages: 0`** - Save compute units, not needed for research
- **`skipClosedPlaces: false`** - Include all businesses for market analysis

---

## 🚀 **Run Options (Optimized Settings)**

Your current run options are good, but here are the recommended settings:

- **Build:** `latest` ✅
- **Timeout:** `604800s` (7 days) ✅
- **Memory:** `4096 MB` (4 GB) ✅ - Perfect for this actor
- **Maximum cost per run:** `Unlimited` ✅

---

## 🎯 **Expected Results for New Hampshire**

### **What You'll Get:**
- **600 total businesses** across 20 business types
- **Detailed business information** including:
  - Business names and addresses
  - Phone numbers and websites
  - Hours of operation
  - Customer reviews and ratings
  - Business descriptions
  - Contact information

### **Sample Results You'll See:**
```json
{
  "title": "Hometown Coffee Roasters",
  "address": "844 Elm St, Manchester, NH 03101",
  "phone": "+1 (603) 555-0123",
  "website": "https://hometowncoffee.com",
  "rating": 4.5,
  "reviewCount": 127,
  "hours": "Mon-Fri: 7AM-6PM, Sat-Sun: 8AM-5PM",
  "category": "Coffee shop",
  "description": "Local coffee roaster serving fresh brews and pastries"
}
```

---

## 🔄 **Alternative Configurations**

### **City-Specific Focus (More Targeted):**
```json
{
  "locationQuery": "Manchester, NH, USA",
  "searchStringsArray": [
    "coffee shop",
    "restaurant",
    "hair salon",
    "cleaning services",
    "auto repair"
  ],
  "maxCrawledPlacesPerSearch": 50
}
```

### **High-Value Business Focus:**
```json
{
  "locationQuery": "Portsmouth, NH, USA",
  "searchStringsArray": [
    "real estate",
    "lawyer",
    "dentist",
    "chiropractor",
    "insurance"
  ],
  "maxCrawledPlacesPerSearch": 40
}
```

### **Service Business Focus:**
```json
{
  "locationQuery": "Nashua, NH, USA",
  "searchStringsArray": [
    "plumber",
    "electrician",
    "landscaping",
    "cleaning services",
    "auto repair"
  ],
  "maxCrawledPlacesPerSearch": 35
}
```

---

## 💰 **Cost Analysis for NH Focus**

### **Compute Unit Usage:**
- **20 business types × 30 places = 600 total businesses**
- **Estimated cost:** 300-600 compute units
- **Your free tier:** 5,000 units per month
- **This run:** ~12% of monthly allocation

### **Cost Optimization Tips:**
1. **Start with 30 places per search** - You can always increase later
2. **Focus on high-value business types** - Real estate, lawyers, dentists
3. **Use city-specific searches** - More targeted, better ROI
4. **Save results** - Don't re-scrape the same data

---

## 🎯 **Next Steps After Configuration**

### **1. Save & Start the Actor**
Click the green "Save & Start" button in your Apify console.

### **2. Monitor the Run**
- Watch the progress in your Apify dashboard
- Expected completion time: 15-30 minutes
- Check for any errors or warnings

### **3. Download Results**
- Results will be available in JSON format
- Download and save for your AI agents to process
- Store in your project's data folder

### **4. Test with Your AI Agents**
```bash
# Test the integration with your NH local business data
node test-apify-simple.js
```

---

## 🔧 **Troubleshooting for NH**

### **If Actor Fails:**
1. **Check location query** - Ensure "New Hampshire, USA" is correct
2. **Reduce maxCrawledPlacesPerSearch** - Try 20 instead of 30
3. **Check compute units** - Ensure you have enough remaining
4. **Try city-specific searches** - Some areas might have fewer results

### **If Results Are Poor:**
1. **Use more specific locations** - "Manchester, NH, USA" instead of "New Hampshire, USA"
2. **Add more business types** - Include seasonal businesses
3. **Increase maxCrawledPlacesPerSearch** - Get more results
4. **Try different search terms** - "cafe" instead of "coffee shop"

---

## 🎉 **Ready to Deploy for New Hampshire!**

Your configuration is perfect for New Hampshire local business research. Click **"Save & Start"** and you'll have detailed business information for your AI agents to analyze!

**This will give your AI agents comprehensive local business intelligence with contact details, reviews, and operational information!** 🏔️🍁🏪

---

## 📊 **Why Google Maps Scraper is Perfect for Your Startup**

### **Rich Business Data:**
- ✅ **Contact information** - Phone numbers, websites, addresses
- ✅ **Customer reviews** - Understand business reputation
- ✅ **Hours of operation** - Identify automation opportunities
- ✅ **Business descriptions** - Understand service offerings
- ✅ **Geographic data** - Target specific areas

### **Perfect for Lead Generation:**
- **Direct contact info** for outreach campaigns
- **Customer sentiment** to prioritize prospects
- **Business details** for personalized pitches
- **Geographic targeting** for local marketing

**Google Maps Scraper will give you the detailed business intelligence you need to target your perfect clients!** 🚀 