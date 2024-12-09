document.addEventListener('DOMContentLoaded', () => {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');

    // Knowledge base for responses
    const knowledgeBase = {
        softSkills: {
            "what are soft skills": "Soft skills are personal attributes that enable you to interact effectively and harmoniously with other people. These include communication, teamwork, adaptability, problem-solving, leadership, and emotional intelligence.",
            "why are soft skills important": "Soft skills are crucial because they help you work effectively with others, adapt to workplace challenges, communicate clearly, and advance in your career. Our assessment helps you identify areas for improvement.",
            "how can i improve my soft skills": "You can improve soft skills through practice, training, and self-reflection. Our website offers an assessment to help you understand your current soft skills level and provide personalized development recommendations.",
        },
        navigation: {
            "how to take assessment": "Go to the Soft Skills Assessment page. Click through the questions, answer honestly, and receive a personalized development report at the end.",
            "what pages are available": "Our website has Home, Workshops, About Us, and Contact Us pages. Each provides different information about our soft skills training platform.",
            "how to contact": "You can use the Contact Us page to reach out. We're located in Room 316 B Lopez Building, Session Road, Baguio City 2600. Our phone number is 0908-340-8351.",
        },
        workshops: {
            "what workshops do you offer": "We offer interactive workshops focused on developing key soft skills like communication, teamwork, leadership, problem-solving, and emotional intelligence. Check our Workshops page for current offerings.",
            "how to join workshops": "Visit the Workshops page to see available sessions. You can register directly on the page or contact us for more information.",
        }
    };

    // Function to add a message to the chat
    function addMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);
        messageElement.textContent = message;
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Function to get bot response
    function getBotResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // Check all categories of knowledge base
        const categories = [
            knowledgeBase.softSkills, 
            knowledgeBase.navigation, 
            knowledgeBase.workshops
        ];

        for (let category of categories) {
            for (let [key, response] of Object.entries(category)) {
                if (lowerMessage.includes(key)) return response;
            }
        }

        return "I can help you with questions about soft skills, our assessment, and website navigation. Could you be more specific?";
    }

    // Toggle chatbot visibility
    function toggleChatbot() {
        chatbotContainer.style.display = 
            chatbotContainer.style.display === 'none' || 
            chatbotContainer.style.display === '' ? 'flex' : 'none';
    }

    // Send message functionality
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (message) {
            addMessage(message, 'user-message');
            const botResponse = getBotResponse(message);
            setTimeout(() => addMessage(botResponse, 'bot-message'), 500);
            chatbotInput.value = '';
        }
    }

    // Event Listeners
    chatbotToggle.addEventListener('click', toggleChatbot);
    chatbotClose.addEventListener('click', toggleChatbot);
    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Initial welcome message
    setTimeout(() => {
        addMessage("Hi! I'm the UPSKILL ChatBot. How can I help you today?", 'bot-message');
    }, 1000);

    // Initially hide the container
    chatbotContainer.style.display = 'none';
});