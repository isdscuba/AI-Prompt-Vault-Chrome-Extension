import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

// Firebase instances - initialized after loading config
let app, auth, db;

// Load Firebase config from JSON file and initialize
async function initializeFirebase() {
  try {
    const response = await fetch(chrome.runtime.getURL('firebase-config.json'));
    const firebaseConfig = await response.json();
    
    // Validate config
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
      throw new Error('Please configure firebase-config.json with your Firebase credentials');
    }
    
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    alert('Firebase configuration error. Please edit firebase-config.json with your Firebase credentials and reload the extension.');
    return false;
  }
}

// State
let currentUser = null;
let prompts = [];
let allCategories = new Set();
let allTags = new Set();
let currentFilter = 'all';
let searchQuery = '';
let editingPromptId = null;
let selectedTags = [];
let unsubscribeSnapshot = null;

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const mainScreen = document.getElementById('main-screen');
const signInBtn = document.getElementById('sign-in-btn');
const signOutBtn = document.getElementById('sign-out-btn');
const userEmailEl = document.getElementById('user-email');
const searchInput = document.getElementById('search-input');
const addPromptBtn = document.getElementById('add-prompt-btn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const promptForm = document.getElementById('prompt-form');
const promptsContainer = document.getElementById('prompts-container');
const emptyState = document.getElementById('empty-state');

// Form inputs
const titleInput = document.getElementById('prompt-title');
const textInput = document.getElementById('prompt-text');
const categoryInput = document.getElementById('prompt-category');
const tagsInput = document.getElementById('prompt-tags');
const favoriteInput = document.getElementById('prompt-favorite');
const tagsDisplay = document.getElementById('tags-display');
const categorySuggestions = document.getElementById('category-suggestions');
const tagSuggestions = document.getElementById('tag-suggestions');

// Auth setup - called after Firebase initialization
function setupAuth() {
  // Sign in using Chrome identity API
  signInBtn.addEventListener('click', async () => {
    try {
      // Get OAuth token from Chrome
      chrome.identity.getAuthToken({ interactive: true }, async (token) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome identity error:', chrome.runtime.lastError);
          alert('Failed to sign in: ' + chrome.runtime.lastError.message);
          return;
        }
        
        if (!token) {
          alert('No token received. Please try again.');
          return;
        }
        
        try {
          // Use the token to sign into Firebase
          const credential = GoogleAuthProvider.credential(null, token);
          await signInWithCredential(auth, credential);
          console.log('Sign in successful!');
        } catch (error) {
          console.error('Firebase sign in error:', error);
          alert('Failed to sign in to Firebase: ' + error.message);
        }
      });
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to sign in: ' + error.message);
    }
  });

  signOutBtn.addEventListener('click', async () => {
    try {
      // Clear Chrome identity cache
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (token) {
          chrome.identity.removeCachedAuthToken({ token: token }, () => {
            console.log('Token removed from cache');
          });
        }
      });
      
      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      userEmailEl.textContent = user.email;
      authScreen.classList.add('hidden');
      mainScreen.classList.remove('hidden');
      loadPrompts();
    } else {
      currentUser = null;
      authScreen.classList.remove('hidden');
      mainScreen.classList.add('hidden');
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
    }
  });
}

// Load Prompts with real-time updates
function loadPrompts() {
  if (!currentUser) return;
  
  const promptsQuery = query(
    collection(db, 'prompts'),
    where('userId', '==', currentUser.uid),
    orderBy('createdAt', 'desc')
  );

  unsubscribeSnapshot = onSnapshot(promptsQuery, (snapshot) => {
    prompts = [];
    allCategories.clear();
    allTags.clear();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const prompt = {
        id: doc.id,
        ...data
      };
      prompts.push(prompt);
      
      if (data.category) allCategories.add(data.category);
      if (data.tags) data.tags.forEach(tag => allTags.add(tag));
    });

    updateSuggestions();
    renderPrompts();
  }, (error) => {
    console.error('Error loading prompts:', error);
  });
}

// Update suggestions
function updateSuggestions() {
  categorySuggestions.innerHTML = '';
  Array.from(allCategories).sort().forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    categorySuggestions.appendChild(option);
  });

  tagSuggestions.innerHTML = '';
  Array.from(allTags).sort().forEach(tag => {
    const option = document.createElement('option');
    option.value = tag;
    tagSuggestions.appendChild(option);
  });
}

// Render Prompts
function renderPrompts() {
  let filtered = prompts;

  // Apply filter
  if (currentFilter === 'favorites') {
    filtered = filtered.filter(p => p.favorite);
  }

  // Apply search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(p => {
      const titleMatch = p.title.toLowerCase().includes(query);
      const textMatch = p.text.toLowerCase().includes(query);
      const categoryMatch = p.category && p.category.toLowerCase().includes(query);
      const tagsMatch = p.tags && p.tags.some(tag => tag.toLowerCase().includes(query));
      return titleMatch || textMatch || categoryMatch || tagsMatch;
    });
  }

  promptsContainer.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  filtered.forEach(prompt => {
    const card = createPromptCard(prompt);
    promptsContainer.appendChild(card);
  });
}

function createPromptCard(prompt) {
  const card = document.createElement('div');
  card.className = 'prompt-card';

  const header = document.createElement('div');
  header.className = 'prompt-header';

  const titleDiv = document.createElement('div');
  const title = document.createElement('h3');
  title.className = 'prompt-title';
  title.textContent = prompt.title;
  titleDiv.appendChild(title);

  const favoriteBtn = document.createElement('button');
  favoriteBtn.className = 'favorite-btn' + (prompt.favorite ? ' active' : '');
  favoriteBtn.textContent = '⭐';
  favoriteBtn.onclick = () => toggleFavorite(prompt.id, !prompt.favorite);

  header.appendChild(titleDiv);
  header.appendChild(favoriteBtn);

  const meta = document.createElement('div');
  meta.className = 'prompt-meta';

  if (prompt.category) {
    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'category-badge';
    categoryBadge.textContent = prompt.category;
    meta.appendChild(categoryBadge);
  }

  if (prompt.tags && prompt.tags.length > 0) {
    prompt.tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'tag';
      tagEl.textContent = tag;
      meta.appendChild(tagEl);
    });
  }

  const text = document.createElement('p');
  text.className = 'prompt-text';
  text.textContent = prompt.text;

  const actions = document.createElement('div');
  actions.className = 'prompt-actions';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'action-btn copy-btn';
  copyBtn.textContent = 'Copy';
  copyBtn.onclick = () => copyToClipboard(prompt.text);

  const chatGPTBtn = document.createElement('button');
  chatGPTBtn.className = 'action-btn chatgpt-btn';
  chatGPTBtn.textContent = 'ChatGPT';
  chatGPTBtn.onclick = () => openInChatGPT(prompt.text);

  const claudeBtn = document.createElement('button');
  claudeBtn.className = 'action-btn claude-btn';
  claudeBtn.textContent = 'Claude';
  claudeBtn.onclick = () => openInClaude(prompt.text);

  const editBtn = document.createElement('button');
  editBtn.className = 'action-btn edit-btn';
  editBtn.textContent = 'Edit';
  editBtn.onclick = () => openEditModal(prompt);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.onclick = () => deletePrompt(prompt.id);

  actions.appendChild(copyBtn);
  actions.appendChild(chatGPTBtn);
  actions.appendChild(claudeBtn);
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  card.appendChild(header);
  if (meta.children.length > 0) card.appendChild(meta);
  card.appendChild(text);
  card.appendChild(actions);

  return card;
}

// Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  } catch (error) {
    console.error('Copy failed:', error);
    showToast('Failed to copy');
  }
}

// Open in ChatGPT
function openInChatGPT(text) {
  chrome.tabs.create({ 
    url: 'https://chatgpt.com/',
    active: true 
  }, (tab) => {
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, {
        action: 'fillPrompt',
        platform: 'chatgpt',
        text: text
      });
    }, 2000);
  });
}

// Open in Claude
function openInClaude(text) {
  chrome.tabs.create({ 
    url: 'https://claude.ai/new',
    active: true 
  }, (tab) => {
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, {
        action: 'fillPrompt',
        platform: 'claude',
        text: text
      });
    }, 2000);
  });
}

// Toast notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #2d5d4f;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// Toggle favorite
async function toggleFavorite(promptId, favorite) {
  try {
    await updateDoc(doc(db, 'prompts', promptId), { favorite });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    showToast('Failed to update favorite');
  }
}

// Delete prompt
async function deletePrompt(promptId) {
  if (!confirm('Are you sure you want to delete this prompt?')) return;
  
  try {
    await deleteDoc(doc(db, 'prompts', promptId));
    showToast('Prompt deleted');
  } catch (error) {
    console.error('Error deleting prompt:', error);
    showToast('Failed to delete prompt');
  }
}

// Modal handlers
addPromptBtn.addEventListener('click', () => {
  editingPromptId = null;
  modalTitle.textContent = 'Add Prompt';
  promptForm.reset();
  selectedTags = [];
  renderTagsDisplay();
  modal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

function closeModal() {
  modal.classList.add('hidden');
  editingPromptId = null;
  selectedTags = [];
}

function openEditModal(prompt) {
  editingPromptId = prompt.id;
  modalTitle.textContent = 'Edit Prompt';
  titleInput.value = prompt.title;
  textInput.value = prompt.text;
  categoryInput.value = prompt.category || '';
  favoriteInput.checked = prompt.favorite || false;
  selectedTags = prompt.tags || [];
  renderTagsDisplay();
  modal.classList.remove('hidden');
}

// Tags handling
tagsInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const tag = tagsInput.value.trim();
    if (tag && !selectedTags.includes(tag)) {
      selectedTags.push(tag);
      renderTagsDisplay();
      tagsInput.value = '';
    }
  }
});

function renderTagsDisplay() {
  tagsDisplay.innerHTML = '';
  selectedTags.forEach((tag, index) => {
    const tagItem = document.createElement('div');
    tagItem.className = 'tag-item';
    
    const tagText = document.createElement('span');
    tagText.textContent = tag;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'tag-remove';
    removeBtn.textContent = '×';
    removeBtn.type = 'button';
    removeBtn.onclick = () => {
      selectedTags.splice(index, 1);
      renderTagsDisplay();
    };
    
    tagItem.appendChild(tagText);
    tagItem.appendChild(removeBtn);
    tagsDisplay.appendChild(tagItem);
  });
}

// Form submit
promptForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const promptData = {
    title: titleInput.value.trim(),
    text: textInput.value.trim(),
    category: categoryInput.value.trim(),
    tags: selectedTags,
    favorite: favoriteInput.checked,
    userId: currentUser.uid,
    updatedAt: Timestamp.now()
  };

  try {
    if (editingPromptId) {
      await updateDoc(doc(db, 'prompts', editingPromptId), promptData);
      showToast('Prompt updated!');
    } else {
      promptData.createdAt = Timestamp.now();
      await addDoc(collection(db, 'prompts'), promptData);
      showToast('Prompt added!');
    }
    closeModal();
  } catch (error) {
    console.error('Error saving prompt:', error);
    showToast('Failed to save prompt');
  }
});

// Search
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderPrompts();
});

// Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderPrompts();
  });
});

// Listen for quick save from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'quickSave' && message.text) {
    editingPromptId = null;
    modalTitle.textContent = 'Save Selection';
    promptForm.reset();
    textInput.value = message.text;
    selectedTags = [];
    renderTagsDisplay();
    modal.classList.remove('hidden');
    sendResponse({ success: true });
  }
});

// Initialize Firebase and setup auth when page loads
(async () => {
  const initialized = await initializeFirebase();
  if (initialized) {
    setupAuth();
  }
})();
