# Installation Checklist

Use this checklist to ensure everything is set up correctly.

## ✅ Firebase Setup

- [ ] Created Firebase project at https://console.firebase.google.com/
- [ ] Enabled Google Authentication
  - [ ] Went to Authentication > Sign-in method
  - [ ] Enabled Google provider
- [ ] Created Firestore Database
  - [ ] Selected "production mode"
  - [ ] Chose location
- [ ] Set Firestore Security Rules
  - [ ] Copied rules from README
  - [ ] Published rules
- [ ] Got Firebase Config
  - [ ] Clicked web icon in Project Settings
  - [ ] Registered app
  - [ ] Copied firebaseConfig object

## ✅ Extension Configuration

- [ ] Opened `firebase-config.json`
- [ ] Replaced ALL placeholder values with my Firebase config
  - [ ] apiKey
  - [ ] authDomain
  - [ ] projectId
  - [ ] storageBucket
  - [ ] messagingSenderId
  - [ ] appId
- [ ] Saved the file

## ✅ Chrome Installation

- [ ] Opened Chrome
- [ ] Went to `chrome://extensions/`
- [ ] Enabled "Developer mode"
- [ ] Clicked "Load unpacked"
- [ ] Selected the `prompt-vault` folder
- [ ] Extension shows up with no errors
- [ ] (Optional) Pinned extension to toolbar

## ✅ First Use

- [ ] Clicked extension icon
- [ ] Sidebar opened
- [ ] Clicked "Sign in with Google"
- [ ] Successfully signed in
- [ ] Created first test prompt
- [ ] Prompt appears in list

## ✅ Test Features

- [ ] Search works
- [ ] Copy to clipboard works
- [ ] Created a category
- [ ] Added tags to a prompt
- [ ] Marked a prompt as favorite
- [ ] Filtered by favorites
- [ ] Edited a prompt
- [ ] Deleted a prompt (with confirmation)
- [ ] Selected text on webpage → Pressed Ctrl+Shift+S → Prompt saved
- [ ] Clicked "ChatGPT" button → Tab opened (check if prompt fills)
- [ ] Clicked "Claude" button → Tab opened (check if prompt fills)

## ✅ Sync Test (If you have multiple devices)

- [ ] Created prompt on Device A
- [ ] Opened extension on Device B
- [ ] Signed in with same Google account
- [ ] Saw prompt from Device A appear

## 🔍 Troubleshooting

If something doesn't work:

1. **Check browser console**
   - Right-click on extension icon → Inspect popup
   - Look for red errors
   - Check if Firebase config is correct

2. **Check Firebase Console**
   - Go to Firestore Database
   - See if prompts collection exists
   - Check if data is being written

3. **Verify Firestore Rules**
   - Go to Firestore > Rules
   - Make sure they match the README

4. **Reload Extension**
   - Go to chrome://extensions/
   - Click reload icon on Prompt Vault
   - Try again

## 📝 Notes

- First time using Firestore? Data might take a few seconds to sync
- ChatGPT/Claude injection depends on their current DOM structure - may need updates if they change their site
- Extension stores no data locally - everything is in your Firebase project
- You can view/export all data from Firebase Console anytime

---

✅ Everything checked? You're ready to boost your productivity! 🚀
