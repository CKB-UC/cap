document.addEventListener('DOMContentLoaded', function() {
    // Business information - customize this for your company
    const businessInfo = {
        name: "JenMen",
        avatar: "assets/logo.jpg",
        hours: "Mon-Fri 8AM-5PM EST",
        responseTime: "Typically replies within minutes",
        phone: "(074) 619 1131",
        email: "@.com"
    };

    // ADD Navigation and services data HERE
    const navigationData = {
        "home": {
            "title": "Home Page",
            "path": "/index.html",
            "description": "Main landing page with overview of our services",
            "icon": "🏠"
        },
        "about": {
            "title": "About Us",
            "path": "/aboutus.html",
            "description": "Information about our company history and team",
            "icon": "ℹ️"
        },
        "contact": {
            "title": "Contact Us",
            "path": "/contact.html",
            "description": "How to reach our team and office locations",
            "icon": "📞"
        },
        "workshop": {
            "title": "Workshops",
            "path": "/workshops.html",
            "description": "Educational workshops and training sessions",
            "icon": "🎓"
        },
    };

    // Quick replies for common inquiries, imbento na kayo dito
    const quickReplies = [
        { text: "See Workshops", action: "workshop" },
        { text: "Go to Home", action: "home" },
        { text: "Contact Us", action: "contact" },
        { text: "About Us", action: "about" }
    ];

    // Elements
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChat = document.getElementById('close-chat');
    const minimizeChat = document.getElementById('minimize-chat');
    const messagesContainer = document.getElementById('chatbot-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-message');
    const attachButton = document.getElementById('attach-button');
    const typingIndicator = document.getElementById('typing-indicator');

    let isTyping = false;
    let conversationStarted = false;
    let messageCount = 0;

    // Initialize chat header
    function initializeChatHeader() {
        const header = document.querySelector('.chatbot-header');
        if (header) {
            header.innerHTML = `
                <div class="flex items-center space-x-3">
                    <img src="${businessInfo.avatar}" alt="${businessInfo.name}" class="w-8 h-8 rounded-full">
                    <div class="flex-1">
                        <h3 class="font-semibold text-white text-sm">${businessInfo.name}</h3>
                        <p class="text-xs text-blue-100">Online • ${businessInfo.responseTime}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button id="minimize-chat" class="text-white hover:text-blue-200 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                        </svg>
                    </button>
                    <button id="close-chat" class="text-white hover:text-blue-200 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `;
        }
    }

    // Toggle chatbot visibility
    chatbotIcon.addEventListener('click', function() {
        chatbotContainer.classList.toggle('hidden');
        chatbotIcon.classList.remove('new-message', 'pulse');
        
        if (!chatbotContainer.classList.contains('hidden')) {
            if (!conversationStarted) {
                setTimeout(() => {
                    showWelcomeSequence();
                }, 500);
            }
            userInput.focus();
        }
    });

    // Close chatbot
    document.addEventListener('click', function(e) {
        if (e.target.id === 'close-chat' || e.target.closest('#close-chat')) {
            chatbotContainer.classList.add('hidden');
        }
        if (e.target.id === 'minimize-chat' || e.target.closest('#minimize-chat')) {
            chatbotContainer.classList.add('hidden');
        }
    });

    // Send message on button click
    sendButton.addEventListener('click', sendUserMessage);

    // Send message on Enter key
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendUserMessage();
        }
    });

    // Handle attachment button (placeholder)
    if (attachButton) {
        attachButton.addEventListener('click', function() {
            addBotMessage("File attachments will be available soon! For now, please describe what you need help with.");
        });
    }

    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // Welcome sequence
    function showWelcomeSequence() {
        conversationStarted = true;
        
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            addBotMessage(`Hi there! 👋 Welcome to ${businessInfo.name}!`);
            
            setTimeout(() => {
                showTypingIndicator();
                setTimeout(() => {
                    hideTypingIndicator();
                    addBotMessage("I'm here to help you find what you're looking for. How can I assist you today?");
                    addQuickReplies(quickReplies);
                }, 1000);
            }, 800);
        }, 1000);
    }

    // Function to handle user messages
    function sendUserMessage() {
        const message = userInput.value.trim();
        if (message) {
            addUserMessage(message);
            userInput.value = '';
            userInput.style.height = 'auto';
            
            // Remove quick replies after user sends a message
            removeQuickReplies();
            
            showTypingIndicator();
            setTimeout(() => {
                hideTypingIndicator();
                processChatbotResponse(message);
            }, Math.random() * 1000 + 800); // Random delay for more natural feel
        }
    }

    // Typing indicator functions
    function showTypingIndicator() {
        if (isTyping) return;
        isTyping = true;
        
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.className = 'flex items-center space-x-2 mb-4';
        indicator.innerHTML = `
            <img src="${businessInfo.avatar}" alt="typing" class="w-8 h-8 rounded-full">
            <div class="bg-gray-100 py-2 px-4 rounded-full">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
        isTyping = false;
    }

    // Function to add bot message to chat
    function addBotMessage(message, isHtml = false) {
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const msgElement = document.createElement('div');
        msgElement.className = 'flex items-start space-x-2 mb-4 animate-fade-in';
        
        msgElement.innerHTML = `
            <img src="${businessInfo.avatar}" alt="${businessInfo.name}" class="w-8 h-8 rounded-full flex-shrink-0">
            <div class="flex-1">
                <div class="bg-gray-100 py-3 px-4 rounded-2xl rounded-tl-md max-w-xs break-words">
                    ${isHtml ? message : escapeHtml(message)}
                </div>
                <div class="text-xs text-gray-500 mt-1 pl-2">${timestamp}</div>
            </div>
        `;
        
        messagesContainer.appendChild(msgElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        messageCount++;
    }

    // Function to add user message to chat
    function addUserMessage(message) {
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const msgElement = document.createElement('div');
        msgElement.className = 'flex items-start justify-end space-x-2 mb-4 animate-fade-in';
        
        msgElement.innerHTML = `
            <div class="flex-1 flex flex-col items-end">
                <div class="bg-blue-600 text-white py-3 px-4 rounded-2xl rounded-tr-md max-w-xs break-words">
                    ${escapeHtml(message)}
                </div>
                <div class="text-xs text-gray-500 mt-1 pr-2">${timestamp}</div>
            </div>
        `;
        
        messagesContainer.appendChild(msgElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Function to add quick replies
    function addQuickReplies(replies) {
        const quickReplyContainer = document.createElement('div');
        quickReplyContainer.className = 'quick-replies flex flex-wrap gap-2 mb-4 px-2';
        
        replies.forEach(reply => {
            const button = document.createElement('button');
            button.className = 'bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-full text-sm hover:bg-blue-50 transition-colors';
            button.textContent = reply.text;
            button.onclick = () => {
                addUserMessage(reply.text);
                removeQuickReplies();
                showTypingIndicator();
                setTimeout(() => {
                    hideTypingIndicator();
                    if (reply.action && navigationData[reply.action]) {
                        showPageInfo(reply.action);
                    } else {
                        processChatbotResponse(reply.text);
                    }
                }, 1000);
            };
            quickReplyContainer.appendChild(button);
        });
        
        messagesContainer.appendChild(quickReplyContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Remove quick replies
    function removeQuickReplies() {
        const quickReplies = messagesContainer.querySelectorAll('.quick-replies');
        quickReplies.forEach(qr => qr.remove());
    }

    // Function to show page information as rich card
    function showPageInfo(page) {
        const pageData = navigationData[page];
        if (pageData) {
            const cardHtml = `
                <div class="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <div class="p-4">
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="text-xl">${pageData.icon}</span>
                            <h3 class="font-semibold text-gray-800">${pageData.title}</h3>
                        </div>
                        <p class="text-gray-600 text-sm mb-3">${pageData.description}</p>
                        <a href="${pageData.path}" class="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                            Visit Page →
                        </a>
                    </div>
                </div>
            `;
            addBotMessage(cardHtml, true);
        }
    }

    // Enhanced response processing
    function processChatbotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Check for greetings
        if (message.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening).*/i)) {
            const greetings = [
                "Hello! Great to hear from you! 😊",
                "Hi there! Thanks for reaching out!",
                "Hey! How can I help you today?",
                "Hello! Welcome to our chat!"
            ];
            addBotMessage(greetings[Math.floor(Math.random() * greetings.length)]);
            if (messageCount <= 2) {
                setTimeout(() => addQuickReplies(quickReplies), 1000);
            }
            return;
        }
        
        // Check for gratitude
        if (message.match(/(thanks|thank you|thx|appreciate|grateful).*/i)) {
            const responses = [
                "You're very welcome! 😊 Anything else I can help with?",
                "Happy to help! Is there anything else you'd like to know?",
                "My pleasure! Feel free to ask if you need anything else.",
                "Glad I could assist! What else can I do for you?"
            ];
            addBotMessage(responses[Math.floor(Math.random() * responses.length)]);
            return;
        }
        
        // Check for goodbyes
        if (message.match(/(bye|goodbye|see you|talk later|have a good|take care).*/i)) {
            addBotMessage(`Thanks for chatting with us! Have a wonderful day! 👋`);
            setTimeout(() => {
                addBotMessage(`Remember, we're here ${businessInfo.hours} if you need anything else!`);
            }, 1000);
            return;
        }
        
        // Check for business hours inquiry
        if (message.match(/(hours|open|closed|when|time|available).*/i)) {
            addBotMessage(`We're available ${businessInfo.hours}. Right now we're online and ready to help! ⏰`);
            return;
        }
        
        // Check for contact information
        if (message.match(/(phone|call|number|contact|email|reach).*/i)) {
            const contactHtml = `
                <div class="space-y-2">
                    <p><strong>📞 Phone:</strong> <a href="tel:${businessInfo.phone}" class="text-blue-600">${businessInfo.phone}</a></p>
                    <p><strong>✉️ Email:</strong> <a href="mailto:${businessInfo.email}" class="text-blue-600">${businessInfo.email}</a></p>
                    <p><strong>🕒 Hours:</strong> ${businessInfo.hours}</p>
                </div>
            `;
            addBotMessage(contactHtml, true);
            return;
        }

        // Check for pricing inquiries
        if (message.match(/(price|cost|pricing|how much|rate|fee|payment).*/i)) {
            showPageInfo('pricing');
            setTimeout(() => {
                addBotMessage("Would you like to schedule a consultation to discuss your specific needs? 📅");
            }, 1000);
            return;
        }

        // Navigation intent detection
        let foundPage = null;
        
        // Direct page mentions
        for (const page in navigationData) {
            if (message.includes(page) || message.includes(navigationData[page].title.toLowerCase())) {
                foundPage = page;
                break;
            }
        }
        
        // Intent-based detection
        if (!foundPage) {
            if (message.match(/(what do you do|services|offer|provide|help with).*/i)) {
                foundPage = 'services';
            } else if (message.match(/(about|who are you|company|team|story).*/i)) {
                foundPage = 'about';
            } else if (message.match(/(workshop|training|learn|education).*/i)) {
                foundPage = 'workshop';
            } else if (message.match(/(home|main|start|beginning).*/i)) {
                foundPage = 'home';
            }
        }
        
        if (foundPage) {
            addBotMessage(`Perfect! Here's information about our ${navigationData[foundPage].title}:`);
            setTimeout(() => showPageInfo(foundPage), 500);
        } else {
            // Default response with helpful suggestions
            addBotMessage("I'd be happy to help you find what you're looking for! 🔍");
            setTimeout(() => {
                addBotMessage("Here are some things I can help you with:");
                addQuickReplies([
                    { text: "Learn about our services", action: "services" },
                    { text: "Contact information", action: "contact" },
                    { text: "Company information", action: "about" },
                    { text: "View pricing", action: "pricing" }
                ]);
            }, 1000);
        }
    }

    // Utility function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Enhanced notification system
    window.notifyChatbot = function(message, showImmediately = false) {
        chatbotIcon.classList.add('new-message', 'pulse');
        
        if (chatbotContainer.classList.contains('hidden') && !showImmediately) {
            chatbotIcon._pendingMessage = message;
            
            const showPendingMessage = function() {
                if (chatbotIcon._pendingMessage) {
                    setTimeout(() => {
                        addBotMessage(chatbotIcon._pendingMessage);
                        chatbotIcon._pendingMessage = null;
                    }, 1000);
                    chatbotIcon.removeEventListener('click', showPendingMessage);
                }
            };
            
            chatbotIcon.addEventListener('click', showPendingMessage);
        } else if (showImmediately || !chatbotContainer.classList.contains('hidden')) {
            showTypingIndicator();
            setTimeout(() => {
                hideTypingIndicator();
                addBotMessage(message);
            }, 1000);
        }
    };

    // Initialize chat header
    initializeChatHeader();

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out;
        }
        .pulse {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .new-message::after {
            content: '';
            position: absolute;
            top: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            background: #ef4444;
            border: 2px solid white;
            border-radius: 50%;
        }
    `;
    document.head.appendChild(style);

    // Example usage for other developers
    // window.notifyChatbot("🎉 Welcome to our site! Need any help finding something?");
    // window.notifyChatbot("💬 Our team just went online. How can we help?", true);
});