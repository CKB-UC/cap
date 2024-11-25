document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded!");

    const progressBar = document.getElementById("progress");
    const questionNumber = document.getElementById("question-number");
    const questionText = document.getElementById("question-text");
    const optionsContainer = document.getElementById("options-container");

    if (!progressBar || !questionNumber || !questionText || !optionsContainer) {
        console.error("Some elements are missing. Double-check your HTML IDs!");
        return;
    }

    const questions = [
        {
            text: "When faced with a team conflict, I usually:",
            options: [
                { text: "Take charge and make decisions for the group", value: "leadership" },
                { text: "Listen to all perspectives before suggesting solutions", value: "collaboration" },
                { text: "Avoid the conflict and hope it resolves itself", value: "avoidance" },
                { text: "Seek help from a superior immediately", value: "dependency" },
            ],
        },
        {
            text: "How do you handle unexpected challenges at work?",
            options: [
                { text: "Stay calm and create a step-by-step plan", value: "problem-solving" },
                { text: "Seek advice from colleagues or supervisors", value: "collaboration" },
                { text: "Wait and see if the issue resolves on its own", value: "avoidance" },
                { text: "Panic and rush through tasks to finish quickly", value: "stress" },
            ],
        },
        {
            text: "How do you prioritize your tasks?",
            options: [
                { text: "Create a to-do list and stick to it", value: "organization" },
                { text: "Handle tasks as they come", value: "reactive" },
                { text: "Focus on what seems urgent at the time", value: "stress" },
                { text: "Ask others what to prioritize", value: "dependency" },
            ],
        },
        {
            text: "When giving feedback to a colleague, I:",
            options: [
                { text: "Am direct and to the point", value: "directness" },
                { text: "Balance positive and constructive comments", value: "empathy" },
                { text: "Avoid giving feedback unless asked", value: "avoidance" },
                { text: "Ask someone else to provide the feedback", value: "dependency" },
            ],
        },
        {
            text: "What is your approach to learning new skills?",
            options: [
                { text: "Take courses or read books", value: "self-learning" },
                { text: "Learn through trial and error", value: "experiential" },
                { text: "Ask others to teach me", value: "collaboration" },
                { text: "Avoid unless absolutely necessary", value: "avoidance" },
            ],
        },
        {
            text: "How would you rate your communication skills in a team?",
            options: [
                { text: "I am clear and concise in my communication", value: "communication" },
                { text: "I prefer listening more than speaking", value: "listening" },
                { text: "I struggle to express my thoughts clearly", value: "difficulty" },
                { text: "I sometimes misunderstand others' communication", value: "miscommunication" },
            ],
        },
    ];

    let currentQuestionIndex = 0;
    const results = {};

    function loadQuestion() {
        const currentQuestion = questions[currentQuestionIndex];

        
        questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
        questionText.textContent = currentQuestion.text;

        
        optionsContainer.innerHTML = "";

        
        currentQuestion.options.forEach((option) => {
            const button = document.createElement("button");
            button.classList.add("option");
            button.textContent = option.text;
            button.addEventListener("click", () => handleOptionClick(option.value));
            optionsContainer.appendChild(button);
        });

        
        const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    function handleOptionClick(value) {
        
        results[value] = (results[value] || 0) + 1;

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            showResults();
        }
    }

    function showResults() {
        
        const sortedResults = Object.entries(results).sort((a, b) => b[1] - a[1]);
        const topResult = sortedResults[0] ? sortedResults[0][0] : "No result";

        questionNumber.textContent = "Assessment Complete!";
        questionText.textContent = `Your top skill is: ${topResult.charAt(0).toUpperCase() + topResult.slice(1)}`;

        
        const breakdown = sortedResults
            .map(([key, value]) => `<li>${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}</li>`)
            .join("");

        optionsContainer.innerHTML = `
            <p>Here is a breakdown of your skills:</p>
            <ul>${breakdown}</ul>
            <div class="result-buttons">
                <button id="retry-button">Retry Assessment</button>
            </div>
        `;

        progressBar.style.width = "100%";

        
        document.getElementById("retry-button").addEventListener("click", retryAssessment);
    }

    function retryAssessment() {
        // Reset 
        currentQuestionIndex = 0;
        for (let key in results) {
            results[key] = 0;
        }
        loadQuestion();
        progressBar.style.width = "0%";
    }

   
    loadQuestion();
});

