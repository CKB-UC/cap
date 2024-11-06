
document.addEventListener("DOMContentLoaded", () => {
    const chatOutput = document.getElementById("chat-output");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");

    
    const displayMessage = (message, sender) => {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("chat-message");
        messageDiv.innerHTML = `<strong>${sender}: </strong>${message}`;
        chatOutput.appendChild(messageDiv);
        chatOutput.scrollTop = chatOutput.scrollHeight; 
    };

    
    const chatbotResponse = (userMessage) => {
        let response;

       
        if (userMessage.toLowerCase().includes("hello")) {
            response = "Hello! How can I assist you today?";
        } else if (userMessage.toLowerCase().includes("terms")) {
            response = "You can view our Terms of Service on this page.";
        } else if (userMessage.toLowerCase().includes("contact")) {
            response = "You can reach us through the Contact page.";
        } else {
            response = "I'm not sure how to respond to that. Could you clarify?";
        }

       
        setTimeout(() => {
            displayMessage(response, "Bot");
        }, 1000); 
    };

    // Event listener for the send button
    sendBtn.addEventListener("click", () => {
        const userMessage = chatInput.value.trim();
        if (userMessage) {
            displayMessage(userMessage, "You");
            chatInput.value = ""; 
            chatbotResponse(userMessage); 
        }
    });

    
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendBtn.click(); 
        }
    });
});
