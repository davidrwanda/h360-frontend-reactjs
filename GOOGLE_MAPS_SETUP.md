# Google Maps API Setup Guide

## How to Set Up Google Maps Autocomplete

### Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. **IMPORTANT**: Enable the following APIs:
   - **Places API (New)** ⚠️ **NOT** "Places API (Legacy)" - The legacy API is deprecated
   - **Maps JavaScript API** (required for the autocomplete widget)
   
   To enable:
   - Go to "APIs & Services" → "Library"
   - Search for "Places API (New)" and enable it
   - Search for "Maps JavaScript API" and enable it
   
   ⚠️ **Note**: If you see "Places API (Legacy)", do NOT enable it. Use "Places API (New)" instead.
   
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

### Step 2: Configure API Key Restrictions (Recommended)

1. Click on your API key to edit it
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domains:
     - `http://localhost:3001/*` (for development)
     - `https://yourdomain.com/*` (for production)
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose: **"Places API (New)"** and "Maps JavaScript API"
   - ⚠️ Make sure you select "Places API (New)" NOT "Places API (Legacy)"
4. Save changes

### Step 3: Add API Key to Your Project

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add your API key:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

3. **Important**: Restart your development server after adding the API key:
   ```bash
   npm run dev
   ```

### Step 4: Verify It's Working

#### Method 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Look for messages starting with `[LocationInput]`:
   - ✅ `[LocationInput] API key found, will load Google Maps` - API key detected
   - ✅ `[LocationInput] Google Maps script loaded successfully` - Script loaded
   - ✅ `[LocationInput] Autocomplete initialized successfully` - Ready to use!
   - ⚠️ `[LocationInput] No API key found` - Need to add API key
   - ⚠️ `[LocationInput] Failed to load Google Maps API` - Check API key and enabled APIs

#### Method 2: Visual Indicator (Development Mode)
- In development mode, you'll see a small status indicator below the input field:
  - ⏳ "Loading Google Maps..." - Currently loading
  - ✅ "Autocomplete ready" - Working correctly
  - ⚠️ Error message - Something went wrong
  - ℹ️ "Manual entry only" - No API key configured

#### Method 3: Test Autocomplete
1. Go to the landing page (`/`)
2. Click on the "City or Postal Code" field
3. Start typing a city name (e.g., "Kigali")
4. You should see Google Places suggestions appear in a dropdown
5. Select a suggestion - it should auto-fill the field

### Common Issues and Solutions

#### Issue: "This page can't load Google Maps correctly" or "You're calling a legacy API"
**Solutions:**
1. Check if API key is in `.env` file: `VITE_GOOGLE_MAPS_API_KEY=your_key`
2. Restart your dev server after adding the key
3. **CRITICAL**: Verify **"Places API (New)"** is enabled (NOT "Places API (Legacy)")
   - Go to Google Cloud Console → APIs & Services → Library
   - Search for "Places API (New)" and make sure it's enabled
   - If you see "Places API (Legacy)" enabled, disable it and enable the new one instead
4. Verify "Maps JavaScript API" is also enabled
5. Check browser console for specific error messages
6. Ensure API key restrictions allow your domain
7. If you see "legacy API" error, you're using the wrong API - enable "Places API (New)"

#### Issue: No autocomplete suggestions appear
**Solutions:**
1. Check browser console for errors
2. Verify **"Places API (New)"** is enabled (NOT the legacy version)
3. Verify "Maps JavaScript API" is enabled
4. Check API key restrictions - make sure your domain is allowed
5. Try typing a well-known city name to test
6. Make sure billing is enabled (required for Places API)

#### Issue: API key works but shows quota exceeded
**Solutions:**
1. Check your Google Cloud billing account
2. Verify you have billing enabled (required for Places API)
3. Check API usage in Google Cloud Console
4. Consider setting up billing alerts

### Testing Checklist

- [ ] API key added to `.env` file
- [ ] Development server restarted
- [ ] **"Places API (New)"** enabled in Google Cloud Console (NOT legacy)
- [ ] "Maps JavaScript API" enabled in Google Cloud Console
- [ ] Browser console shows successful load messages
- [ ] Autocomplete suggestions appear when typing
- [ ] Selecting a suggestion fills the field correctly
- [ ] No errors in browser console
- [ ] No "legacy API" error messages

### Need Help?

Check the browser console for detailed error messages. All LocationInput logs are prefixed with `[LocationInput]` for easy filtering.
