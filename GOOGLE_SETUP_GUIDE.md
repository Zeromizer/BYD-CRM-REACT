# Google OAuth Setup Guide for BYD CRM

This guide will help you configure Google OAuth credentials for the BYD CRM application.

## Prerequisites

- A Google Cloud account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create or Select a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Either select an existing project or create a new one:
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter a project name (e.g., "BYD CRM")
   - Click "Create"

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - **Google Drive API**
   - **Google+ API** (for user profile information)

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select **External** user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required information:
   - **App name**: BYD CRM
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes" and add:
   - `.../auth/drive`
   - `.../auth/drive.appdata`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
7. Click "Save and Continue"
8. On "Test users", add your Google account email for testing
9. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

### Create OAuth Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Enter a name (e.g., "BYD CRM Web Client")
5. **Add Authorized JavaScript origins:**

   For GitHub Pages deployment:
   ```
   https://zeromizer.github.io
   ```

   For local development:
   ```
   http://localhost:5173
   http://localhost:3000
   ```

6. **Add Authorized redirect URIs:**

   **IMPORTANT**: Add both with and without trailing slash to ensure OAuth works correctly:
   ```
   https://zeromizer.github.io/BYD-CRM-REACT
   https://zeromizer.github.io/BYD-CRM-REACT/
   http://localhost:5173
   http://localhost:5173/
   http://localhost:3000
   http://localhost:3000/
   ```

7. Click "Create"
8. **Save the Client ID** - you'll need this for your `.env` file

### Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API key"
3. **Save the API Key**
4. Click "Edit API key" to restrict it (recommended):
   - Under "Application restrictions", select "HTTP referrers"
   - Add these referrers:
     ```
     https://zeromizer.github.io/*
     http://localhost:5173/*
     http://localhost:3000/*
     ```
   - Under "API restrictions", select "Restrict key"
   - Select "Google Drive API"
   - Click "Save"

## Step 5: Update Your .env File

1. Open or create `.env` file in your project root
2. Add your credentials:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=YOUR_API_KEY_HERE

# App Configuration
VITE_APP_NAME=BYD CRM
VITE_APP_VERSION=2.0.0
VITE_APP_ENV=development

# Encryption (Change this in production!)
VITE_ENCRYPTION_SALT=your-secure-random-salt-here
```

## Step 6: Update Production Environment

If deploying to GitHub Pages, you may need to set environment variables in your build process:

1. Create `.env.production` file:
```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=YOUR_API_KEY_HERE
VITE_APP_ENV=production
```

2. Make sure your build process includes these environment variables

## Common Issues and Solutions

### 400 Error on Page Load

**Problem**: You see a "400 Bad Request" error in the browser console when the page loads.

**Solution**: This usually means your OAuth credentials are not properly configured:

1. **Check Client ID is configured for your domain**:
   - Go to Google Cloud Console > APIs & Services > Credentials
   - Click on your OAuth 2.0 Client ID
   - Verify that `https://zeromizer.github.io` is in "Authorized JavaScript origins"
   - Verify that `https://zeromizer.github.io/BYD-CRM-REACT` is in "Authorized redirect URIs"

2. **Check API Key restrictions**:
   - Go to Google Cloud Console > APIs & Services > Credentials
   - Click on your API Key
   - Make sure the referrer restrictions include your domain
   - Make sure Google Drive API is enabled for the key

3. **Check APIs are enabled**:
   - Go to Google Cloud Console > APIs & Services > Enabled APIs
   - Verify "Google Drive API" is enabled

### Origin Mismatch Error

**Problem**: You see "Error: origin_mismatch" when trying to sign in.

**Solution**:
- Your current domain is not in the authorized JavaScript origins list
- Add the exact domain (including protocol) to your OAuth client's authorized origins

### API Key Invalid Error

**Problem**: You see "API key not valid" or similar error.

**Solution**:
- Check that the API key is correctly copied to your `.env` file
- Verify the API key has Google Drive API enabled
- Check that referrer restrictions are not blocking your domain

## Testing Your Setup

1. Clear your browser cache and cookies
2. Navigate to your application
3. Open browser DevTools (F12) and check the Console
4. You should see: `✅ Google API initialized with GIS`
5. Click "Sign in with Google"
6. You should see the Google sign-in popup
7. Sign in and grant permissions
8. You should be redirected to the app's main page

## Security Best Practices

1. **Never commit your `.env` file** - it's already in `.gitignore`
2. **Use different credentials for development and production**
3. **Restrict your API keys** to only the domains and APIs you need
4. **Rotate your API keys** periodically
5. **Monitor your API usage** in Google Cloud Console

## Need Help?

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API Documentation](https://developers.google.com/drive)
- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
