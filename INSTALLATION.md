# INSTALLATION GUIDE - Updated! ✅

The extension is now **pre-built and ready to use**. No Node.js or build step required!

## Quick Installation (2-3 minutes)

### 1. Extract the Zip
Extract `prompt-vault.zip` to a folder on your computer.

### 2. Configure Firebase

1. Follow the Firebase setup in `QUICKSTART.md` to create your Firebase project
2. Get your Firebase config object
3. Open `firebase-config.json` in any text editor
4. Replace the placeholder values with your actual Firebase config
5. Save the file

Example `firebase-config.json`:
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

**No build step needed!** The extension is pre-compiled.

### 3. Load in Chrome

1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `prompt-vault` folder
5. Done!

### 4. Add Extension to Firebase Authorized Domains

**This is CRITICAL for sign-in to work:**

1. Go to `chrome://extensions/`
2. Find your extension ID (long string like: `abcdefghijk...`)
3. Go to Firebase Console → Authentication → Settings → Authorized domains
4. Click "Add domain"
5. Add: `chrome-extension://YOUR_EXTENSION_ID_HERE`
6. Save

### 5. Try Signing In

1. Click the extension icon
2. Click "Sign in with Google"
3. Should redirect to Google sign-in
4. After signing in, you'll be redirected back

## What Changed from the Old Version?

✅ **No build step required** - Extension comes pre-built  
✅ **No Node.js needed** - Just edit JSON and go  
✅ **Easier setup** - Edit one JSON file, load extension, done  
✅ **Works on any machine** - No dependencies to install  

## Developer Mode (Optional)

Only needed if you want to modify the extension code:

```bash
cd prompt-vault
npm install
# Make your changes to .js files
npm run build
```

## Troubleshooting

**"Firebase configuration error":**
- Open `firebase-config.json` and check it's valid JSON
- Make sure you replaced ALL placeholder values
- No trailing commas in JSON
- Quotes around all keys and string values

**Sign-in not working:**
- Make sure you added the extension ID to Firebase Authorized Domains (Step 4)
- Check browser console for errors (right-click extension → Inspect)
- Make sure Google auth is enabled in Firebase Console

**Extension won't load:**
- Make sure `firebase-config.json` has valid JSON syntax
- Check all files are present in the folder
- Look for errors in Chrome's extension page

## For Developers Only

If you want to modify the extension code:

```bash
npm install
npm run build
```

Changes to `firebase-config.json` do NOT require rebuild.  
Changes to `.js` files DO require rebuild.
