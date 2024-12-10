import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle } from 'lucide-react';

const UpskillChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Knowledge base (same as original script)
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

  // Function to get bot response
  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

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
  };

  // Add message to chat
  const addMessage = (message, type) => {
    setMessages(prevMessages => [...prevMessages, { text: message, type }]);
  };

  // Send message
  const sendMessage = (message) => {
    if (message) {
      addMessage(message, 'user-message');
      const botResponse = getBotResponse(message);
      setTimeout(() => addMessage(botResponse, 'bot-message'), 500);
      setInputValue('');
    }
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    setTimeout(() => {
      addMessage("Hi! I'm the UPSKILL ChatBot. How can I help you today?", 'bot-message');
    }, 1000);
  }, []);

  // Suggestion button groups
  const suggestionGroups = [
    {
      title: "Soft Skills",
      buttons: [
        "What are soft skills?",
        "Why are soft skills important?",
        "How can I improve my soft skills?"
      ]
    },
    {
      title: "Navigation",
      buttons: [
        "How to take assessment",
        "What pages are available?",
        "How to contact support"
      ]
    },
    {
      title: "Workshops",
      buttons: [
        "What workshops do you offer?",
        "How to join workshops"
      ]
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chatbot Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition"
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl border">
          {/* Chatbot Header */}
          <div className="bg-blue-500 text-white p-3 flex justify-between items-center rounded-t-lg">
            <span className="font-semibold">UPSKILL ChatBot</span>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} color="white" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="h-96 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.type === 'user-message' 
                    ? 'bg-blue-100 self-end ml-auto' 
                    : 'bg-gray-100 self-start mr-auto'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Buttons */}
          <div className="p-2 border-t">
            {suggestionGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-2">
                <p className="text-sm font-semibold text-gray-600 mb-1">{group.title}</p>
                <div className="flex flex-wrap gap-2">
                  {group.buttons.map((button, buttonIndex) => (
                    <button 
                      key={buttonIndex}
                      onClick={() => sendMessage(button)}
                      className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-100 transition"
                    >
                      {button}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="flex p-2 border-t">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
              placeholder="Ask about soft skills or navigation..."
              className="flex-grow p-2 border rounded-l"
            />
            <button 
              onClick={() => sendMessage(inputValue)}
              className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpskillChatbot;