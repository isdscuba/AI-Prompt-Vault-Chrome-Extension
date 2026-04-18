# Quick Start Guide

Get Prompt Vault running in 3 minutes!

## Step 1: Firebase Setup (2 minutes)

1. Go to https://console.firebase.google.com/
2. Click "Add project" → Name it "Prompt Vault" → Continue → Create
3. Wait for it to finish creating

### Enable Google Sign-In
4. Click "Authentication" in left menu → "Get started"
5. Click "Google" → Toggle "Enable" → Save

### Create Database
6. Click "Firestore Database" in left menu → "Create database"
7. Select "Start in production mode" → Next
8. Pick a location (closest to you) → Enable

### Set Security Rules
9. Click "Rules" tab → Replace everything with this:

```
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

10. Click "Publish"

### Get Your Config
11. Click gear icon ⚙️ → Project settings
12. Scroll to "Your apps" → Click `</>` (web icon)
13. Nickname: "Prompt Vault" → Register app
14. **COPY the firebaseConfig object**

## Step 2: Configure Extension (30 seconds)

1. Open `firebase-config.jsonon` in the extension folder (use any text editor)
2. Replace the placeholder config with what you just copied
3. Save the file

Should look like:
```json
{
  "apiKey": "AIza...",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abc123"
}
```

**That's it! No build step needed.**

## Step 3: Install in Chrome (30 seconds)

1. Open Chrome
2. Go to: `chrome://extensions/`
3. Toggle "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `prompt-vault` folder
6. Done! 🎉

## Step 4: Start Using

1. Click the Prompt Vault icon in your toolbar
2. Click "Sign in with Google"
3. Choose your Google account
4. Start adding prompts!

## Quick Tips

- **Add prompt**: Click "+ New Prompt"
- **Quick save**: Select text anywhere → Press `Ctrl+Shift+S` (Cmd+Shift+S on Mac)
- **Copy**: Click "Copy" button on any prompt
- **Use in ChatGPT**: Click "ChatGPT" button - opens new tab with prompt pre-filled
- **Use in Claude**: Click "Claude" button - opens new tab with prompt pre-filled
- **Search**: Type in search box at top
- **Organize**: Use categories (broad) and tags (specific)
- **Star favorites**: Click ⭐ on important prompts

## Common Issues

**"Sign in failed"**
- Make sure Google auth is enabled in Firebase (Step 1.4-5)

**"Permission denied"**
- Check Firestore rules are set correctly (Step 1.9-10)

**Extension won't load**
- Make sure you edited `firebase-config.json` with your actual config

**Prompts not syncing**
- Check you're connected to internet
- Check Firebase Console to see if data is there

---

Need more help? See the full [README.md](README.md)
