class GeminiChatbot {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    }

    async sendMessage(message) {
        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: message
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Gemini API request failed');
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error communicating with Gemini API:', error);
            return 'Sorry, there was an error processing your request.';
        }
    }
}

// Initialize chatbot
const chatbot = new GeminiChatbot('AIzaSyAvgalwt6n4WoIv18_a4LX7RSHWqJ1lVDg');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');

function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    const chatBubble = document.getElementById('chat-bubble');
    
    if (chatWindow.style.display === 'flex') {
        chatWindow.style.display = 'none';
        chatBubble.style.display = 'flex';
    } else {
        chatWindow.style.display = 'flex';
        chatBubble.style.display = 'none';
    }
}

async function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Create and append user message
    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('message', 'user-message');
    userMessageElement.textContent = userMessage;
    chatMessages.appendChild(userMessageElement);

    // Clear input
    chatInput.value = '';

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Get bot response
    const botResponse = await chatbot.sendMessage(userMessage);

    // Create and append bot message
    const botMessageElement = document.createElement('div');
    botMessageElement.classList.add('message', 'bot-message');
    botMessageElement.textContent = botResponse;
    chatMessages.appendChild(botMessageElement);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Allow sending message with Enter key
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});