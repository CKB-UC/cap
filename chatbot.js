import React from 'react';
import { createRoot } from 'react-dom/client';
import SoftSkillsChatbot from './path/to/SoftSkillsChatbot';

const chatbotRoot = createRoot(document.getElementById('chatbot-root'));
chatbotRoot.render(<SoftSkillsChatbot />);

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

const SoftSkillsChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    // Predefined knowledge base for soft skills and website navigation
    const knowledgeBase = {
        // Soft Skills Related Queries
        softSkills: {
            "what are soft skills": "Soft skills are personal attributes that enable you to interact effectively and harmoniously with other people. These include communication, teamwork, adaptability, problem-solving, leadership, and emotional intelligence.",
            "why are soft skills important": "Soft skills are crucial because they help you work effectively with others, adapt to workplace challenges, communicate clearly, and advance in your career. Our assessment helps you identify areas for improvement.",
            "how can i improve my soft skills": "You can improve soft skills through practice, training, and self-reflection. Our website offers an assessment to help you understand your current soft skills level and provide personalized development recommendations.",
        },
        
        // Website Navigation
        navigation: {
            "how to take assessment": "Go to the Soft Skills Assessment page. Click through the questions, answer honestly, and receive a personalized development report at the end.",
            "what pages are available": "Our website has Home, Workshops, About Us, and Contact Us pages. Each provides different information about our soft skills training platform.",
            "how to contact": "You can use the Contact Us page to reach out. We're located in Room 316 B Lopez Building, Session Road, Baguio City 2600. Our phone number is 0908-340-8351.",
        },

        // Workshops Related
        workshops: {
            "what workshops do you offer": "We offer interactive workshops focused on developing key soft skills like communication, teamwork, leadership, problem-solving, and emotional intelligence. Check our Workshops page for current offerings.",
            "how to join workshops": "Visit the Workshops page to see available sessions. You can register directly on the page or contact us for more information.",
        }
    };

    // Chatbot response generation
    const getChatbotResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase();

        // Check soft skills queries
        for (let [key, response] of Object.entries(knowledgeBase.softSkills)) {
            if (lowerMessage.includes(key)) return response;
        }

        // Check navigation queries
        for (let [key, response] of Object.entries(knowledgeBase.navigation)) {
            if (lowerMessage.includes(key)) return response;
        }

        // Check workshops queries
        for (let [key, response] of Object.entries(knowledgeBase.workshops)) {
            if (lowerMessage.includes(key)) return response;
        }

        // Default response
        return "I can help you with questions about soft skills, our assessment, and website navigation. Could you be more specific?";
    };

    const handleSendMessage = () => {
        if (input.trim() === '') return;

        const newMessages = [
            ...messages, 
            { text: input, sender: 'user' },
            { text: getChatbotResponse(input), sender: 'bot' }
        ];

        setMessages(newMessages);
        setInput('');
    };

    

    useEffect(() => {
        // Scroll to bottom of messages
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <div className="w-96 h-[500px] bg-white shadow-2xl rounded-xl border flex flex-col">
                    <div className="bg-[#004080] text-white p-4 flex justify-between items-center rounded-t-xl">
                        <h2 className="font-bold">UPSKILL Soft Skills Assistant</h2>
                        <button onClick={() => setIsOpen(false)}>
                            <X color="white" />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-4 space-y-2">
                        {messages.map((message, index) => (
                            <div 
                                key={index} 
                                className={`p-2 rounded-lg max-w-[80%] ${
                                    message.sender === 'user' 
                                        ? 'bg-blue-100 self-end ml-auto' 
                                        : 'bg-gray-100 self-start'
                                }`}
                            >
                                {message.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t flex">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask about soft skills or navigation..."
                            className="flex-grow p-2 border rounded-l-lg"
                        />
                        <button 
                            onClick={handleSendMessage}
                            className="bg-[#004080] text-white p-2 rounded-r-lg"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-[#004080] text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-colors"
                >
                    <MessageCircle />
                </button>
            )}
        </div>
    );
};

export default SoftSkillsChatbot;