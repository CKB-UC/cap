document.addEventListener("DOMContentLoaded", () => {
    const progressBar = document.getElementById("progress-new");
    const questionNumber = document.getElementById("question-number-new");
    const questionText = document.getElementById("question-text-new");
    const optionsContainer = document.getElementById("options-container-new");

    const questions = [
        {
            text: "What do you prioritize when making decisions?",
            options: [
                { text: "Facts and data", value: "analytical" },
                { text: "Gut feeling", value: "intuitive" },
                { text: "Team input", value: "collaborative" },
                { text: "Rules and guidelines", value: "procedural" },
            ],
        },
        {
            text: "How do you approach learning new things?",
            options: [
                { text: "Practice repeatedly", value: "experiential" },
                { text: "Read or research extensively", value: "theoretical" },
                { text: "Seek mentorship", value: "mentorship" },
                { text: "Wait until necessary", value: "reluctant" },
            ],
        },
        {
            text: "What motivates you the most?",
            options: [
                { text: "Achieving personal goals", value: "goal-oriented" },
                { text: "Being recognized", value: "recognition" },
                { text: "Helping others succeed", value: "altruistic" },
                { text: "Overcoming challenges", value: "resilient" },
            ],
        },
        {
            text: "How do you handle mistakes?",
            options: [
                { text: "Reflect and improve", value: "adaptive" },
                { text: "Ignore and move on", value: "dismissive" },
                { text: "Seek advice to fix it", value: "consultative" },
                { text: "Blame external factors", value: "deflective" },
            ],
        },
        {
            text: "What is your biggest strength?",
            options: [
                { text: "Creativity", value: "creative" },
                { text: "Reliability", value: "reliable" },
                { text: "Communication", value: "communicative" },
                { text: "Problem-solving", value: "problem-solver" },
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
            button.textContent = option.text;
            button.classList.add("option");
            button.addEventListener("click", () => handleOptionClick(option.value));
            optionsContainer.appendChild(button);
        });

        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
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
        const topResult = sortedResults[0] ? sortedResults[0][0] : "None";

        questionNumber.textContent = "Assessment Complete!";
        questionText.textContent = `Your strongest skill is: ${topResult.charAt(0).toUpperCase() + topResult.slice(1)}`;

        optionsContainer.innerHTML = `
            <p>Skill Breakdown:</p>
            <ul>${sortedResults.map(([key, value]) => `<li>${key}: ${value}</li>`).join("")}</ul>
            <button id="retry-button-new">Retry Assessment</button>
        `;

        progressBar.style.width = "100%";
        document.getElementById("retry-button-new").addEventListener("click", retryAssessment);
    }

    function retryAssessment() {
        currentQuestionIndex = 0;
        Object.keys(results).forEach((key) => (results[key] = 0));
        loadQuestion();
        progressBar.style.width = "0%";
    }

    loadQuestion();
});
