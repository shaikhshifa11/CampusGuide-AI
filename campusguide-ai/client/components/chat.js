// CampusGuide AI - Chat Component
// Handles all chat functionality and API communication

const API_BASE_URL = 'http://localhost:3000/api';

let conversationHistory = [];
let studentProfile = {
    branch: null,
    year: null,
    accommodation: null
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎓 CampusGuide AI initialized');
    loadStudentProfile();
    setupEventListeners();
    setupFileInput();
});

function setupEventListeners() {
    // Auto-resize textarea
    const textarea = document.getElementById('messageInput');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
}

function loadStudentProfile() {
    // Load from localStorage if exists
    const saved = localStorage.getItem('studentProfile');
    if (saved) {
        studentProfile = JSON.parse(saved);
        updateStudentBadge();
    }
}

function updateStudentBadge() {
    const badge = document.getElementById('studentBadge');
    if (badge) {
        if (studentProfile.name && studentProfile.branch) {
            badge.innerHTML = `
                <span class="badge-icon">👤</span>
                <div class="badge-details">
                    <div class="badge-name">${studentProfile.name}</div>
                    <div class="badge-info">${studentProfile.branch} • ${studentProfile.accommodation || 'Day Scholar'}</div>
                </div>
            `;
        } else {
            badge.innerHTML = `
                <span class="badge-icon">👤</span>
                <span class="badge-text">Guest User</span>
            `;
        }
    }
}

function saveStudentProfile(name, branch, year, accommodation) {
    studentProfile = { name, branch, year, accommodation };
    localStorage.setItem('studentProfile', JSON.stringify(studentProfile));
    updateStudentBadge();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icons
    const lightIcon = document.getElementById('theme-icon-light');
    const darkIcon = document.getElementById('theme-icon-dark');
    
    if (newTheme === 'dark') {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'block';
    } else {
        lightIcon.style.display = 'block';
        darkIcon.style.display = 'none';
    }
}

function askQuestion(question) {
    document.getElementById('messageInput').value = question;
    sendMessage();
}

function askPredefinedQuestion(question) {
    // Hide welcome screen if visible
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }
    
    // Set the question and send
    document.getElementById('messageInput').value = question;
    sendMessage();
}

function switchView(viewName) {
    // Get user role (for now, simulate - in production this would come from auth)
    const userRole = localStorage.getItem('userRole') || 'student';
    
    // Check if trying to access admin-only features
    if (viewName === 'knowledge' && userRole !== 'admin') {
        alert('⚠️ Admin access required\n\nKnowledge Base management is only available to administrators.\n\nTo enable admin mode, open console (F12) and run:\nlocalStorage.setItem("userRole", "admin");\nlocation.reload();');
        return;
    }
    
    // Hide all views
    const chatView = document.getElementById('chatView');
    const knowledgeView = document.getElementById('knowledgeView');
    
    if (chatView) chatView.style.display = 'none';
    if (knowledgeView) knowledgeView.style.display = 'none';
    
    // Show selected view
    if (viewName === 'chat' && chatView) {
        chatView.style.display = 'flex';
    } else if (viewName === 'knowledge' && knowledgeView) {
        knowledgeView.style.display = 'flex';
        loadKnowledgeBaseStats();
    }
    
    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeItem = document.querySelector(`[onclick="switchView('${viewName}')"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    console.log(`📍 Switched to ${viewName} view`);
}

async function loadKnowledgeBaseStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/knowledge/stats`);
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('totalDocs').textContent = stats.totalDocuments || 0;
            document.getElementById('totalChunks').textContent = stats.totalChunks || 0;
            document.getElementById('lastUpdated').textContent = stats.lastUpdated || 'Never';
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

function setupFileInput() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const files = Array.from(this.files);
            displaySelectedFiles(files);
        });
    }
}

function displaySelectedFiles(files) {
    const container = document.getElementById('selectedFiles');
    container.innerHTML = '';
    
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span>📄 ${file.name} (${formatFileSize(file.size)})</span>
            <button onclick="removeFile(${index})" style="background: none; border: none; cursor: pointer; color: var(--error-color);">✕</button>
        `;
        container.appendChild(fileItem);
    });
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function uploadDocuments() {
    const fileInput = document.getElementById('fileInput');
    const category = document.getElementById('categorySelect').value;
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('Please select at least one file to upload');
        return;
    }
    
    const formData = new FormData();
    formData.append('category', category);
    
    for (let file of files) {
        formData.append('documents', file);
    }
    
    try {
        // Show loading state
        const uploadButton = document.querySelector('.upload-button');
        const originalText = uploadButton.innerHTML;
        uploadButton.innerHTML = '<span>⏳ Uploading...</span>';
        uploadButton.disabled = true;
        
        const response = await fetch(`${API_BASE_URL}/knowledge/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`✅ Success!\n\n${result.processed} documents uploaded and processed.\n\nThe AI can now answer questions using these documents.`);
            
            // Clear form
            fileInput.value = '';
            document.getElementById('selectedFiles').innerHTML = '';
            
            // Reload stats
            loadKnowledgeBaseStats();
        } else {
            throw new Error(result.error || 'Upload failed');
        }
        
        // Restore button
        uploadButton.innerHTML = originalText;
        uploadButton.disabled = false;
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('❌ Upload failed\n\n' + error.message);
        
        // Restore button
        const uploadButton = document.querySelector('.upload-button');
        uploadButton.innerHTML = '<span>Upload & Process</span>';
        uploadButton.disabled = false;
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
    // Shift+Enter allows new line (default textarea behavior)
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Check for help command
    if (message.toLowerCase().includes('what is this assistant') || 
        message.toLowerCase().includes('how does this work') ||
        message.toLowerCase().includes('explain this assistant')) {
        showHelpMessage();
        input.value = '';
        return;
    }
    
    // Hide welcome screen
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }
    
    // Disable input
    input.disabled = true;
    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = true;
    
    // Add user message to UI
    addMessage(message, 'user');
    input.value = '';
    input.style.height = 'auto';
    
    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: message
    });
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Call backend API
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                conversationHistory: conversationHistory.slice(-10), // Last 10 messages
                studentProfile
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        if (data.success) {
            // Add assistant response with sources
            addMessage(data.response, 'assistant', data.metadata);
            
            // Add to conversation history
            conversationHistory.push({
                role: 'assistant',
                content: data.response
            });
            
            console.log('📊 Retrieved documents:', data.metadata.retrievedDocuments);
        } else {
            throw new Error(data.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ Chat error:', error);
        removeTypingIndicator();
        
        // Show error message
        const errorMessage = error.message.includes('Failed to fetch')
            ? '⚠️ Cannot connect to server. Please ensure the backend is running on http://localhost:3000'
            : `⚠️ Error: ${error.message}`;
        
        addMessage(errorMessage, 'assistant');
    } finally {
        // Re-enable input
        input.disabled = false;
        sendButton.disabled = false;
        input.focus();
    }
}

function showHelpMessage() {
    const helpText = `🎓 About CampusGuide AI

This assistant uses Retrieval Augmented Generation (RAG) to provide accurate, up-to-date information about our college.

How it works:
• College administrators upload official notices, policies, and documents
• When you ask a question, the system searches through these documents
• Relevant information is retrieved and used to answer your question
• All responses are based on official college records

This ensures you get:
✓ Current and accurate information
✓ Official policy details
✓ Latest notices and deadlines
✓ Verified college data

The system automatically updates when new documents are added - no retraining needed!`;
    
    addMessage(helpText, 'assistant');
}

function addMessage(content, role, metadata = null) {
    const messagesContainer = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    // Format content (convert markdown-style to HTML)
    const formattedContent = formatMessage(content);
    
    const timestamp = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Avatar
    const avatar = role === 'user' 
        ? '<div class="message-avatar user-avatar">👤</div>'
        : '<div class="message-avatar bot-avatar">🎓</div>';
    
    // Source badges (if metadata has sources)
    let sourceBadges = '';
    if (metadata && metadata.sources && metadata.sources.length > 0) {
        const uniqueSources = [...new Set(metadata.sources.map(s => s.category))];
        sourceBadges = '<div class="source-badges">' + 
            uniqueSources.map(category => 
                `<span class="source-badge">📄 Source: ${formatCategory(category)}</span>`
            ).join('') + 
            '</div>';
    }
    
    // Collapsible source context
    let sourceContext = '';
    if (metadata && metadata.sources && metadata.sources.length > 0) {
        const contextId = 'context-' + Date.now();
        sourceContext = `
            <div class="source-context-toggle" onclick="toggleSourceContext('${contextId}')">
                <span class="toggle-icon">▶</span> View Source Context
            </div>
            <div class="source-context" id="${contextId}" style="display: none;">
                ${metadata.sources.map((s, i) => 
                    `<div class="context-item">
                        <strong>Document ${i + 1}:</strong> ${s.source || 'Unknown'}
                        <br><small>Category: ${formatCategory(s.category)}</small>
                    </div>`
                ).join('')}
            </div>
        `;
    }
    
    messageDiv.innerHTML = `
        ${avatar}
        <div class="message-content">
            ${formattedContent}
            ${sourceBadges}
            ${sourceContext}
            <div class="message-timestamp">${timestamp}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

function formatCategory(category) {
    const categoryMap = {
        'policies': 'Policy Document',
        'notices': 'Official Notice',
        'holidays': 'Holidays & Events',
        'timetable': 'Timetable & Schedule',
        'academic-calendar': 'Academic Calendar',
        'fees': 'Fee Information',
        'hostel': 'Hostel Information',
        'faq': 'FAQ'
    };
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

function toggleSourceContext(contextId) {
    const context = document.getElementById(contextId);
    const toggle = context.previousElementSibling;
    const icon = toggle.querySelector('.toggle-icon');
    
    if (context.style.display === 'none') {
        context.style.display = 'block';
        icon.textContent = '▼';
    } else {
        context.style.display = 'none';
        icon.textContent = '▶';
    }
}

function formatMessage(content) {
    return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[Answer\]/g, '<strong style="color: var(--primary-color);">💡 Answer</strong>')
        .replace(/\[Steps\]/g, '<strong style="color: var(--primary-color);">📋 Steps</strong>')
        .replace(/\[Important\]/g, '<strong style="color: var(--warning-color);">⚠️ Important</strong>')
        .replace(/\[Contact\]/g, '<strong style="color: var(--primary-color);">📞 Contact</strong>');
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Make functions globally available
window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.askQuestion = askQuestion;
window.askPredefinedQuestion = askPredefinedQuestion;
window.switchView = switchView;
window.sendMessage = sendMessage;
window.handleKeyPress = handleKeyPress;
window.saveStudentProfile = saveStudentProfile;
window.toggleSourceContext = toggleSourceContext;
window.uploadDocuments = uploadDocuments;
window.loadKnowledgeBaseStats = loadKnowledgeBaseStats;
