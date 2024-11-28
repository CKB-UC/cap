document.addEventListener("DOMContentLoaded", () => {
    const progressBar = document.getElementById("progress-leadership");
    const questionNumber = document.getElementById("question-number-leadership");
    const questionText = document.getElementById("question-text-leadership");
    const optionsContainer = document.getElementById("options-container-leadership");

    const questions = [
        {
            text: "When leading a team, how do you delegate tasks?",
            options: [
                { text: "Assign tasks based on individual strengths", value: "strategic" },
                { text: "Distribute tasks equally to everyone", value: "fair" },
                { text: "Keep the critical tasks for yourself", value: "controlling" },
                { text: "Let the team decide among themselves", value: "democratic" },
            ],
        },
        {
            text: "How do you handle conflict within your team?",
            options: [
                { text: "Mediate and find a resolution", value: "mediator" },
                { text: "Let the team members resolve it", value: "hands-off" },
                { text: "Take sides based on logic", value: "rational" },
                { text: "Ignore it unless it escalates", value: "avoidance" },
            ],
        },
        {
            text: "What is your leadership style?",
            options: [
                { text: "Lead by example", value: "role-model" },
                { text: "Motivate and inspire", value: "inspirational" },
                { text: "Focus on efficiency", value: "practical" },
                { text: "Ensure strict compliance", value: "authoritative" },
            ],
        },
        {
            text: "How do you provide feedback to your team?",
            options: [
                { text: "Focus on constructive criticism", value: "constructive" },
                { text: "Praise only exceptional work", value: "selective-praise" },
                { text: "Highlight both strengths and weaknesses", value: "balanced" },
                { text: "Avoid feedback unless necessary", value: "reserved" },
            ],
        },
        {
            text: "What motivates you as a leader?",
            options: [
                { text: "Achieving team success", value: "team-success" },
                { text: "Personal recognition", value: "recognition" },
                { text: "Overcoming challenges", value: "challenge-driven" },
                { text: "Maintaining order", value: "order-driven" },
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
        questionText.textContent = `Your leadership strength is: ${topResult.charAt(0).toUpperCase() + topResult.slice(1)}`;

        optionsContainer.innerHTML = `
            <p>Here's your leadership style breakdown:</p>
            <ul>${sortedResults.map(([key, value]) => `<li>${key}: ${value}</li>`).join("")}</ul>
            <button id="retry-button-leadership">Retry Assessment</button>
        `;

        progressBar.style.width = "100%";

        document.getElementById("retry-button-leadership").addEventListener("click", retryAssessment);
    }

    function retryAssessment() {
        currentQuestionIndex = 0;
        for (let key in results) results[key] = 0;
        loadQuestion();
        progressBar.style.width = "0%";
    }

    loadQuestion();
});
