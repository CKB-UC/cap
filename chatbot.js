document.addEventListener('DOMContentLoaded', function() {
    // Navigation data - customize this for your website
    const navigationData = {
        "home": {
            "title": "Home Page",
            "path": "/index.html",
            "description": "Main landing page with overview of our services"
        },
        "about": {
            "title": "About Us",
            "path": "/aboutus.html",
            "description": "Information about our company history and team"
        },
        "services": {
            "title": "Services",
            "path": "/workshops.html",
            "description": "Details about the services we offer"
        },
        "contact": {
            "title": "Contact Us",
            "path": "/contact.html",
            "description": "How to reach our team and office locations"
        },
        "workshop": {
            "title": "Workshops",
            "path": "/workshops.html",
            "description": "Look for what you need"
        },
    };

    // Elements
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChat = document.getElementById('close-chat');
    const messagesContainer = document.getElementById('chatbot-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-message');

    // Toggle chatbot visibility
    chatbotIcon.addEventListener('click', function() {
        chatbotContainer.classList.toggle('hidden');
        // Remove pulse animation if it exists
        chatbotIcon.classList.remove('new-message');
        
        if (!chatbotContainer.classList.contains('hidden') && messagesContainer.children.length === 0) {
            // Send welcome message when opening for the first time
            addBotMessage("Hi there! I'm your navigation assistant. How can I help you find what you're looking for?");
        }
    });

    // Close chatbot
    closeChat.addEventListener('click', function() {
        chatbotContainer.classList.add('hidden');
    });

    // Send message on button click
    sendButton.addEventListener('click', sendUserMessage);

    // Send message on Enter key
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendUserMessage();
        }
    });

    // Function to handle user messages
    function sendUserMessage() {
        const message = userInput.value.trim();
        if (message) {
            // Add user message to chat
            addUserMessage(message);
            
            // Clear input field
            userInput.value = '';
            
            // Process user message and respond
            setTimeout(() => {
                processChatbotResponse(message);
            }, 500);
        }
    }

    // Function to add bot message to chat
    function addBotMessage(message) {
        const msgElement = document.createElement('div');
        msgElement.className = 'bg-gray-100 py-2 px-3 rounded-lg rounded-tl-none max-w-3/4 text-gray-800 self-start';
        msgElement.textContent = message;
        messagesContainer.appendChild(msgElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Function to add user message to chat
    function addUserMessage(message) {
        const msgElement = document.createElement('div');
        msgElement.className = 'bg-blue-100 py-2 px-3 rounded-lg rounded-br-none max-w-3/4 text-gray-800 self-end ml-auto';
        msgElement.textContent = message;
        messagesContainer.appendChild(msgElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Function to add navigation link to chat
    function addNavigationLink(page) {
        const linkData = navigationData[page];
        if (linkData) {
            const linkElement = document.createElement('div');
            linkElement.className = 'bg-white border border-blue-200 p-3 rounded-lg max-w-3/4 self-start';
            
            const titleElement = document.createElement('a');
            titleElement.href = linkData.path;
            titleElement.className = 'text-blue-600 font-medium hover:underline';
            titleElement.textContent = linkData.title;
            
            const descElement = document.createElement('p');
            descElement.className = 'text-gray-600 text-sm mt-1';
            descElement.textContent = linkData.description;
            
            linkElement.appendChild(titleElement);
            linkElement.appendChild(descElement);
            messagesContainer.appendChild(linkElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Process user input and generate response
    function processChatbotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Check for greetings
        if (message.match(/^(hi|hello|hey|greetings).*/i)) {
            addBotMessage("Hello! How can I help you navigate our website?");
            return;
        }
        
        // Check for gratitude
        if (message.match(/^(thanks|thank you|thx).*/i)) {
            addBotMessage("You're welcome! Is there anything else I can help you with?");
            return;
        }
        
        // Check for goodbyes
        if (message.match(/^(bye|goodbye|see you).*/i)) {
            addBotMessage("Goodbye! Feel free to ask if you need help navigating our site again.");
            return;
        }
        
        // Check for help request
        if (message.match(/^(help|assist|support).*/i)) {
            addBotMessage("I can help you navigate to different pages on our website. Try asking about our services, products, contact information, or any other page you're looking for.");
            return;
        }

        // Check for navigation intents
        let foundPage = null;
        
        // Direct page mentions
        for (const page in navigationData) {
            if (message.includes(page)) {
                foundPage = page;
                break;
            }
        }
        
        // More complex intent detection
        if (!foundPage) {
            if (message.includes('contact') || message.includes('reach') || message.includes('talk to') || message.includes('email') || message.includes('call')) {
                foundPage = 'contact';
            } else if (message.includes('what you do') || message.includes('offer') || message.includes('provide')) {
                foundPage = 'services';
            } else if (message.includes('who are you') || message.includes('company') || message.includes('team')) {
                foundPage = 'about';
            } else if (message.includes('article') || message.includes('news') || message.includes('post')) {
                foundPage = 'blog';
            } else if (message.includes('buy') || message.includes('purchase') || message.includes('product') || message.includes('shop')) {
                foundPage = 'products';
            } else if (message.includes('main') || message.includes('home') || message.includes('start')) {
                foundPage = 'home';
            }
        }
        
        if (foundPage) {
            addBotMessage(`I found what you're looking for! Here's a link to our ${navigationData[foundPage].title}:`);
            addNavigationLink(foundPage);
        } else {
            addBotMessage("I'm not sure what you're looking for. Can you be more specific? You can ask about our home page, services, products, blog, contact information, or about us.");
        }
    }

    // Add a helper function to show a notification on the chat icon
    // You can call this function from other parts of your website
    window.notifyChatbot = function(message) {
        // Add pulse animation class to the icon
        chatbotIcon.classList.add('new-message');
        
        // If the chat is closed, store the message to show when opened
        if (chatbotContainer.classList.contains('hidden')) {
            // Set a flag to show this message when opened
            chatbotIcon._pendingMessage = message;
            
            // Add click handler to show the message once
            const showPendingMessage = function() {
                if (chatbotIcon._pendingMessage) {
                    addBotMessage(chatbotIcon._pendingMessage);
                    chatbotIcon._pendingMessage = null;
                    chatbotIcon.removeEventListener('click', showPendingMessage);
                }
            };
            
            chatbotIcon.addEventListener('click', showPendingMessage);
        } else {
            // If chat is already open, show message immediately
            addBotMessage(message);
        }
    };

    // Example of how other scripts could notify the chatbot
    // window.notifyChatbot("Hey! Check out our new products section!");
});