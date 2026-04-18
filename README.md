# Prompt Vault - Chrome Extension

A powerful Chrome extension for managing and syncing AI prompts across all your devices using Firebase.

## Features

✨ **Cloud Sync** - Store prompts in Firebase Firestore, accessible from any device
🔍 **Smart Search** - Search across titles, prompts, categories, and tags
🏷️ **Organization** - Categorize and tag prompts with auto-suggestions
⭐ **Favorites** - Star important prompts for quick access
📋 **One-Click Copy** - Instantly copy prompts to clipboard
🤖 **Direct Injection** - Open prompts directly in ChatGPT or Claude with pre-filled text
⌨️ **Quick Save** - Save selected text as a prompt with Ctrl+Shift+S (Cmd+Shift+S on Mac)
🎨 **Clean Design** - Unique, non-generic interface with custom color scheme

## Setup Instructions

### Prerequisites

- Chrome browser
- Google account
- Text editor (Notepad, VS Code, etc.)

**Note for Developers**: If you want to modify the extension code, you'll need Node.js. See the Developer section at the bottom.

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enter a project name (e.g., "Prompt Vault")
4. Follow the setup wizard (you can disable Google Analytics if you want)

#### Enable Authentication

1. In Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Click on "Google" provider
5. Toggle "Enable" and click "Save"

#### Create Firestore Database

1. In Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in production mode"
4. Choose a location (pick one closest to you)
5. Click "Enable"

#### Set Firestore Rules

1. In Firestore Database, click on "Rules" tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prompts/{promptId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click "Publish"

#### Get Firebase Config

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>` to add a web app
5. Give it a nickname (e.g., "Prompt Vault Extension")
6. Click "Register app"
7. Copy the `firebaseConfig` object
8. Open `firebase-config.json` in this extension folder
9. Replace the placeholder values with your Firebase config

Your `firebase-config.json` should look like:
```json
{
  "apiKey": "AIza...",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef"
}
```

**That's it! No build step needed - just edit the JSON file and load the extension.**


### 2. Install Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `prompt-vault` folder
5. The extension should now appear in your extensions list

### 3. Pin the Extension (Recommended)

1. Click the puzzle piece icon in Chrome toolbar
2. Find "Prompt Vault" in the list
3. Click the pin icon to pin it to your toolbar

## Usage

### Opening Prompt Vault

- Click the Prompt Vault icon in your Chrome toolbar
- The sidebar will open on the right side of your browser

### First Time Setup

1. Click "Sign in with Google"
2. Choose your Google account
3. Grant permissions

### Adding Prompts

**Method 1: Manual Add**
1. Click "+ New Prompt"
2. Fill in the details:
   - Title (required)
   - Prompt text (required)
   - Category (optional, auto-suggests from existing)
   - Tags (optional, press Enter after each tag)
   - Mark as favorite (optional)
3. Click "Save Prompt"

**Method 2: Quick Save from Any Page**
1. Select any text on a webpage
2. Press `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac)
3. The Prompt Vault sidebar will open with the text pre-filled
4. Add title and other details
5. Save

### Using Prompts

Each prompt card has several action buttons:

- **Copy** - Copies prompt to clipboard
- **ChatGPT** - Opens ChatGPT in a new tab and fills in the prompt
- **Claude** - Opens Claude in a new tab and fills in the prompt
- **Edit** - Edit the prompt details
- **Delete** - Delete the prompt (with confirmation)
- **⭐ Star** - Toggle favorite status

### Searching

- Type in the search box at the top
- Search looks through:
  - Prompt titles
  - Prompt text
  - Categories
  - Tags

### Filtering

- **All** - Shows all prompts
- **⭐ Favorites** - Shows only starred prompts

### Organizing with Categories & Tags

**Categories**: Broad classifications
- Examples: "Teaching", "Business", "Research", "Grading"
- Type in the Category field when creating/editing
- Auto-suggests from previously used categories

**Tags**: Specific attributes or keywords
- Examples: "quick", "detailed", "analysis", "creative"
- Type and press Enter to add each tag
- Auto-suggests from previously used tags
- Click × to remove a tag

## Customization

### Changing Icons

Replace these files with your own icons:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

### Changing Colors

Edit `sidebar.css` and modify the CSS variables in the `:root` section:

```css
:root {
  --primary: #2d5d4f;        /* Main brand color */
  --accent: #d97757;         /* Accent/action color */
  --bg: #faf8f5;            /* Background */
  /* ... etc */
}
```

## Keyboard Shortcuts

- `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac) - Quick save selected text

You can customize this in Chrome:
1. Go to `chrome://extensions/shortcuts`
2. Find "Prompt Vault"
3. Click the pencil icon to change the shortcut

## Troubleshooting

### Extension won't load
- Make sure you've replaced the Firebase config in `firebase-config.json`
- Make sure the JSON format is correct (no trailing commas, proper quotes)
- Check Chrome DevTools console for errors (right-click extension → Inspect)

### Sign-in not working
- Verify Google sign-in is enabled in Firebase Console
- Make sure you're using Chrome (not in incognito mode)

### Prompts not syncing
- Check your internet connection
- Verify Firestore rules are set correctly
- Check browser console for errors

### ChatGPT/Claude injection not working
- The injection works best when the page is fully loaded
- If it doesn't work immediately, try refreshing the ChatGPT/Claude page
- Some updates to those sites may break the injection - content.js may need updates

### "Permission denied" errors in Firestore
- Make sure your Firestore security rules match the ones in this README
- Verify you're signed in with the correct Google account

## Data & Privacy

- All your prompts are stored in **your own Firebase project**
- This extension does not send any data to third parties
- Your Firebase project is private and only accessible to you
- You can export/delete all data anytime from Firebase Console

## File Structure

```
prompt-vault/
├── manifest.json           # Extension configuration
├── firebase-config.json    # Firebase credentials (YOU MUST EDIT THIS)
├── sidebar.html           # Main UI
├── sidebar.css            # Styling
├── sidebar.js             # Source code (for developers)
├── sidebar-bundle.js      # Compiled code with Firebase (ready to use)
├── background.js          # Extension background worker
├── content.js             # Content script for page injection
├── icon16.png            # Extension icons
├── icon48.png
├── icon128.png
└── README.md             # This file
```

**For users**: Just edit `firebase-config.json` - the extension is pre-built and ready to use!

**For developers**: If you want to modify the code:
- Edit `sidebar.js` or other source files
- Run `npm install` then `npm run build` to rebuild
- See Developer Guide below

## Advanced: Exporting/Importing Prompts

To backup or transfer prompts:

1. Go to Firebase Console
2. Click on Firestore Database
3. Select the `prompts` collection
4. Use Firebase's export feature (requires Firebase CLI)

Or use the Firebase Console to manually export/import data.

## Support

If you encounter issues:
1. Check Chrome DevTools console (F12) for error messages
2. Verify Firebase setup is correct
3. Make sure all files are present in the extension folder

## Developer Guide

Want to modify the extension code? Here's how:

### Prerequisites
- Node.js (version 14+): https://nodejs.org/

### Setup
```bash
cd prompt-vault
npm install
```

### Development Workflow
1. Make changes to source files (`sidebar.js`, `sidebar.css`, etc.)
2. Rebuild: `npm run build`
3. Reload extension in Chrome: go to `chrome://extensions/` and click reload ↻

### Key Files
- `sidebar.js` - Main application logic (source)
- `sidebar-bundle.js` - Compiled output (do not edit directly)
- `build.js` - esbuild configuration
- `firebase-config.json` - Loaded at runtime (not bundled)

### Why the Build Step?
Firebase SDK is ~800KB and must be bundled locally (Chrome extensions can't load remote scripts). The build process:
1. Bundles Firebase SDK with your code
2. Creates `sidebar-bundle.js`
3. Optimizes for extension environment

### Testing
- Load unpacked extension for development
- Changes to `firebase-config.json` don't require rebuild
- Changes to `.js` files require rebuild

## Future Ideas

Potential features to add:
- Bulk import/export of prompts
- Prompt templates
- Usage statistics
- Sharing prompts with team members
- Browser sync across Chrome profiles
- Keyboard navigation
- Prompt versioning

---

Built for Dee's AI workflow optimization 🚀
