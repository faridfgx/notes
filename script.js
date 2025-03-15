// DOM Elements - Authentication
const passwordSetupScreen = document.getElementById('password-setup-screen');
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const passwordScreenTitle = document.getElementById('password-screen-title');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const setPasswordBtn = document.getElementById('set-password-btn');
const cancelPasswordBtn = document.getElementById('cancel-password-btn');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const errorMessage = document.getElementById('error-message');
const loginErrorMessage = document.getElementById('login-error-message');
const changePasswordBtn = document.getElementById('change-password-btn');
const logoutBtn = document.getElementById('logout-btn');

// DOM Elements - Notes
const searchInput = document.getElementById('search-input');
const newNoteBtn = document.getElementById('new-note-btn');
const notesList = document.getElementById('notes-list');
const emptyNotesMessage = document.getElementById('empty-notes-message');
const editorTitle = document.getElementById('editor-title');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const saveNoteBtn = document.getElementById('save-note-btn');
const saveButtonText = document.getElementById('save-button-text');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const formatButtons = document.querySelectorAll('.format-btn');

// DOM Elements - Theme & Toast
const themeToggleBtn = document.getElementById('theme-toggle');
const toastContainer = document.getElementById('toast-container');

// DOM Elements - Footer
const currentYearElement = document.getElementById('current-year');

// App State
let isAuthenticated = false;
let password = '';
let notes = [];
let currentNote = { id: '', title: '', content: '' };
let isEditing = false;
let searchTerm = '';
let darkTheme = false;

// Initialize the application
function init() {
    // Set current year in footer
    currentYearElement.textContent = new Date().getFullYear();
    
    // Load theme preference
    const savedTheme = localStorage.getItem('memoVaultTheme');
    if (savedTheme === 'dark') {
        darkTheme = true;
        document.body.classList.add('dark-theme');
    }
    
    // Load password from localStorage
    const savedPassword = localStorage.getItem('memoVaultPassword');
    if (savedPassword) {
        password = savedPassword;
        showLoginScreen();
    } else {
        showPasswordSetupScreen(false);
    }
    
    // Add event listeners
    setupEventListeners();
}

// Setup all event listeners
function setupEventListeners() {
    // Authentication
    setPasswordBtn.addEventListener('click', handleSetPassword);
    cancelPasswordBtn.addEventListener('click', handleCancelPassword);
    loginBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleLogin();
    });
    changePasswordBtn.addEventListener('click', handleChangePassword);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Notes
    searchInput.addEventListener('input', handleSearch);
    newNoteBtn.addEventListener('click', createNewNote);
    noteTitleInput.addEventListener('input', handleNoteInputChange);
    noteContentInput.addEventListener('input', handleNoteInputChange);
    saveNoteBtn.addEventListener('click', saveNote);
    cancelEditBtn.addEventListener('click', cancelEdit);
    
    // Text formatting
    formatButtons.forEach(button => {
        button.addEventListener('click', () => {
            const format = button.dataset.format;
            formatText(format);
        });
    });
    
    // Theme Toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
}

// Toggle theme between light and dark
function toggleTheme() {
    darkTheme = !darkTheme;
    
    if (darkTheme) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('memoVaultTheme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('memoVaultTheme', 'light');
    }
    
    showToast('Theme updated', 'info');
}

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        toast.classList.add('hiding');
        
        // Wait for animation to finish
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

// Text formatting functions
function formatText(format) {
    noteContentInput.focus();
    
    // Save selection
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    // Process based on format type
    let formattedContent;
    
    switch (format) {
        case 'bold':
            document.execCommand('bold', false, null);
            break;
        case 'italic':
            document.execCommand('italic', false, null);
            break;
        case 'underline':
            document.execCommand('underline', false, null);
            break;
        case 'h1':
            if (selectedText) {
                document.execCommand('formatBlock', false, '<h1>');
            }
            break;
        case 'h2':
            if (selectedText) {
                document.execCommand('formatBlock', false, '<h2>');
            }
            break;
        case 'h3':
            if (selectedText) {
                document.execCommand('formatBlock', false, '<h3>');
            }
            break;
        case 'ul':
            document.execCommand('insertUnorderedList', false, null);
            break;
        case 'ol':
            document.execCommand('insertOrderedList', false, null);
            break;
    }
    
    // Update currentNote content with formatted HTML
    currentNote.content = noteContentInput.innerHTML;
}

// Delete confirmation dialog
function showDeleteConfirmation(id, title) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'confirmation-overlay';
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'confirmation-dialog';
    dialog.innerHTML = `
        <h3>Delete Note</h3>
        <p>Are you sure you want to delete "${title}"? This action cannot be undone.</p>
        <div class="confirmation-buttons">
            <button class="cancel-delete-btn">Cancel</button>
            <button class="confirm-delete-btn">Delete</button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Add event listeners
    const cancelBtn = dialog.querySelector('.cancel-delete-btn');
    const confirmBtn = dialog.querySelector('.confirm-delete-btn');
    
    cancelBtn.addEventListener('click', () => {
        overlay.remove();
    });
    
    confirmBtn.addEventListener('click', () => {
        // Actually delete the note
        deleteNoteConfirmed(id);
        overlay.remove();
    });
}

// Scroll to note in editor
function scrollToEditor() {
    document.querySelector('.editor').scrollIntoView({ behavior: 'smooth' });
}

// Authentication functions
function showPasswordSetupScreen(isChangingPassword = false) {
    passwordSetupScreen.classList.remove('hidden');
    loginScreen.classList.add('hidden');
    mainScreen.classList.add('hidden');
    
    // Reset inputs
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');
    
    // Update title based on context
    passwordScreenTitle.textContent = isChangingPassword ? 'Change Password' : 'Create Password';
    setPasswordBtn.textContent = isChangingPassword ? 'Update Password' : 'Set Password';
    
    // Show/hide cancel button based on context
    if (isChangingPassword) {
        cancelPasswordBtn.classList.remove('hidden');
    } else {
        cancelPasswordBtn.classList.add('hidden');
    }
    
    newPasswordInput.focus();
}

function showLoginScreen() {
    passwordSetupScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    mainScreen.classList.add('hidden');
    
    // Reset inputs
    passwordInput.value = '';
    loginErrorMessage.textContent = '';
    loginErrorMessage.classList.add('hidden');
    
    passwordInput.focus();
}

function showMainScreen() {
    passwordSetupScreen.classList.add('hidden');
    loginScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    
    loadNotes();
    renderNotesList();
}

function handleSetPassword() {
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (newPassword.length < 4) {
        showError('Password must be at least 4 characters long.');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match.');
        return;
    }
    
    // Save password to localStorage
    localStorage.setItem('memoVaultPassword', newPassword);
    password = newPassword;
    
    // Show login screen or main screen
    if (isAuthenticated) {
        showMainScreen();
    } else {
        showLoginScreen();
    }
}

function handleCancelPassword() {
    if (isAuthenticated) {
        showMainScreen();
    } else {
        showLoginScreen();
    }
}

function handleLogin() {
    if (passwordInput.value === password) {
        isAuthenticated = true;
        showMainScreen();
    } else {
        loginErrorMessage.textContent = 'Incorrect password. Please try again.';
        loginErrorMessage.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function handleChangePassword() {
    showPasswordSetupScreen(true);
}

function handleLogout() {
    isAuthenticated = false;
    currentNote = { id: '', title: '', content: '' };
    isEditing = false;
    showLoginScreen();
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Notes functions
function loadNotes() {
    const savedNotes = JSON.parse(localStorage.getItem('memoVaultNotes') || '[]');
    notes = savedNotes;
}

function saveNotesToStorage() {
    localStorage.setItem('memoVaultNotes', JSON.stringify(notes));
}

function renderNotesList() {
    // Apply search filter
    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        // For HTML content, we need to strip tags for search
        stripHtml(note.content).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Clear the list
    notesList.innerHTML = '';
    
    // Show empty message if no notes
    if (filteredNotes.length === 0) {
        emptyNotesMessage.textContent = searchTerm 
            ? 'No matching notes found' 
            : 'No notes yet. Create one!';
        emptyNotesMessage.classList.remove('hidden');
    } else {
        emptyNotesMessage.classList.add('hidden');
        
        // Create list items for each note
        filteredNotes.forEach(note => {
            const listItem = document.createElement('li');
            listItem.className = `note-item ${currentNote.id === note.id ? 'active' : ''}`;
            
            // For the preview, strip HTML tags and limit length
            const contentPreview = stripHtml(note.content || 'No content');
            
            listItem.innerHTML = `
                <div class="note-item-header">
                    <h3 class="note-item-title">${note.title}</h3>
                    <button class="delete-note-btn" data-id="${note.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="delete-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
                <p class="note-item-preview">${contentPreview}</p>
                ${note.createdAt ? `<p class="note-item-date">${note.createdAt}</p>` : ''}
            `;
            
            // Add click event to edit note
            listItem.addEventListener('click', () => editNote(note.id));
            
            // Add delete button click event
            const deleteBtn = listItem.querySelector('.delete-note-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteNote(note.id);
            });
            
            notesList.appendChild(listItem);
        });
    }
}

// Helper function to strip HTML tags
function stripHtml(html) {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

function handleSearch() {
    searchTerm = searchInput.value;
    renderNotesList();
}

function createNewNote() {
    currentNote = { id: '', title: '', content: '' };
    isEditing = false;
    
    // Update UI
    noteTitleInput.value = '';
    noteContentInput.innerHTML = '';
    saveButtonText.textContent = 'Save Note';
    editorTitle.textContent = 'Create New Note';
    cancelEditBtn.classList.add('hidden');
    saveNoteBtn.disabled = true;
    
    renderNotesList();
    noteTitleInput.focus();
}

function editNote(id) {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
        currentNote = { ...noteToEdit };
        isEditing = true;
        
        // Update UI
        noteTitleInput.value = currentNote.title;
        noteContentInput.innerHTML = currentNote.content || '';
        saveButtonText.textContent = 'Update Note';
        editorTitle.textContent = 'Edit Note';
        cancelEditBtn.classList.remove('hidden');
        saveNoteBtn.disabled = !currentNote.title.trim();
        
        renderNotesList();
        
        // Scroll to editor on mobile
        scrollToEditor();
    }
}

function saveNote() {
    // Don't save if title is empty
    if (!currentNote.title.trim()) return;
    
    if (isEditing) {
        // Update existing note
        notes = notes.map(note => 
            note.id === currentNote.id ? currentNote : note
        );
        isEditing = false;
        showToast('Note updated', 'success');
    } else {
        // Add new note with a unique ID
        const newNote = {
            ...currentNote,
            id: Date.now().toString(),
            createdAt: new Date().toLocaleString()
        };
        notes.push(newNote);
        showToast('Note created', 'success');
    }
    
    // Save to localStorage
    saveNotesToStorage();
    
    // Reset the editor
    createNewNote();
}

function cancelEdit() {
    createNewNote();
}

function deleteNote(id) {
    const noteToDelete = notes.find(note => note.id === id);
    if (noteToDelete) {
        showDeleteConfirmation(id, noteToDelete.title);
    }
}

function deleteNoteConfirmed(id) {
    notes = notes.filter(note => note.id !== id);
    
    // Save to localStorage
    saveNotesToStorage();
    
    // Show toast notification
    showToast('Note deleted', 'error');
    
    // If we're editing this note, clear the form
    if (currentNote.id === id) {
        createNewNote();
    } else {
        renderNotesList();
    }
}

function handleNoteInputChange(e) {
    const { id, value } = e.target;
    
    if (id === 'note-title') {
        currentNote.title = value;
        saveNoteBtn.disabled = !value.trim();
    } else if (id === 'note-content') {
        // For contenteditable div
        currentNote.content = e.target.innerHTML;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);