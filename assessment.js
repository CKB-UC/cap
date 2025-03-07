    document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded!");

    const progressBar = document.getElementById("progress");
    const questionNumber = document.getElementById("question-number");
    const questionText = document.getElementById("question-text");
    const optionsContainer = document.getElementById("options-container");
    const categoryDisplay = document.getElementById("category");

    if (!progressBar || !questionNumber || !questionText || !optionsContainer) {
        console.error("Some elements are missing. Double-check your HTML IDs!");
        return;
    }

    const questions = [
        // Original Questions
        {
            category: "Team Dynamics",
            text: "When faced with a team conflict, I usually:",
            options: [
                { text: "Take charge and make decisions for the group", value: "leadership" },
                { text: "Listen to all perspectives before suggesting solutions", value: "collaboration" },
                { text: "Avoid the conflict and hope it resolves itself", value: "avoidance" },
                { text: "Seek help from a superior immediately", value: "dependency" },
            ],
        },
        {
            category: "Problem Management",
            text: "How do you handle unexpected challenges at work?",
            options: [
                { text: "Stay calm and create a step-by-step plan", value: "problem-solving" },
                { text: "Seek advice from colleagues or supervisors", value: "collaboration" },
                { text: "Wait and see if the issue resolves on its own", value: "avoidance" },
                { text: "Panic and rush through tasks to finish quickly", value: "stress" },
            ],
        },
        {
            category: "Task Management",
            text: "How do you prioritize your tasks?",
            options: [
                { text: "Create a to-do list and stick to it", value: "organization" },
                { text: "Handle tasks as they come", value: "reactive" },
                { text: "Focus on what seems urgent at the time", value: "stress" },
                { text: "Ask others what to prioritize", value: "dependency" },
            ],
        },
        {
            category: "Communication",
            text: "When giving feedback to a colleague, I:",
            options: [
                { text: "Am direct and to the point", value: "directness" },
                { text: "Balance positive and constructive comments", value: "empathy" },
                { text: "Avoid giving feedback unless asked", value: "avoidance" },
                { text: "Ask someone else to provide the feedback", value: "dependency" },
            ],
        },
        {
            category: "Learning",
            text: "What is your approach to learning new skills?",
            options: [
                { text: "Take courses or read books", value: "self-learning" },
                { text: "Learn through trial and error", value: "experiential" },
                { text: "Ask others to teach me", value: "collaboration" },
                { text: "Avoid unless absolutely necessary", value: "avoidance" },
            ],
        },
        {
            category: "Communication",
            text: "How would you rate your communication skills in a team?",
            options: [
                { text: "I am clear and concise in my communication", value: "communication" },
                { text: "I prefer listening more than speaking", value: "listening" },
                { text: "I struggle to express my thoughts clearly", value: "difficulty" },
                { text: "I sometimes misunderstand others' communication", value: "miscommunication" },
            ],
        },
        // New Communication Skills Questions
        {
            category: "Communication",
            text: "When presenting ideas in a group, you typically:",
            options: [
                { text: "Speak confidently and clearly", value: "communication-strong" },
                { text: "Feel nervous but try to contribute", value: "communication-developing" },
                { text: "Prefer to listen and only speak when necessary", value: "communication-passive" },
                { text: "Struggle to express your thoughts", value: "communication-weak" },
            ],
        },
        {
            category: "Communication",
            text: "When receiving feedback, you usually:",
            options: [
                { text: "Welcome it as an opportunity to improve", value: "feedback-positive" },
                { text: "Feel defensive initially", value: "feedback-defensive" },
                { text: "Avoid seeking feedback", value: "feedback-avoidance" },
                { text: "Ask clarifying questions to understand better", value: "feedback-analytical" },
            ],
        },
        {
            category: "Communication",
            text: "In a misunderstanding, you most often:",
            options: [
                { text: "Take time to listen to the other person's perspective", value: "communication-empathetic" },
                { text: "Immediately try to explain your point of view", value: "communication-direct" },
                { text: "Withdraw from the conversation", value: "communication-passive" },
                { text: "Look for a compromise", value: "communication-collaborative" },
            ],
        },
        // Teamwork and Collaboration Questions
        {
            category: "Teamwork",
            text: "In a group project, you typically:",
            options: [
                { text: "Volunteer to lead and coordinate tasks", value: "teamwork-leadership" },
                { text: "Contribute equally to the work", value: "teamwork-collaborative" },
                { text: "Complete only your assigned tasks", value: "teamwork-minimal" },
                { text: "Struggle to find your role in the team", value: "teamwork-uncertain" },
            ],
        },
        {
            category: "Teamwork",
            text: "When a team member is struggling, you:",
            options: [
                { text: "Offer support and help them improve", value: "teamwork-supportive" },
                { text: "Discuss the issue with the team leader", value: "teamwork-escalation" },
                { text: "Complete their tasks to ensure project success", value: "teamwork-overcompensating" },
                { text: "Ignore the situation", value: "teamwork-disengaged" },
            ],
        },
        {
            category: "Teamwork",
            text: "Dealing with different opinions, you:",
            options: [
                { text: "See them as an opportunity for better solutions", value: "teamwork-collaborative" },
                { text: "Try to find a middle ground", value: "teamwork-compromise" },
                { text: "Stick to your original perspective", value: "teamwork-rigid" },
                { text: "Avoid confrontation", value: "teamwork-conflict-avoidant" },
            ],
        },
        // Problem-Solving Questions
        {
            category: "Problem-Solving",
            text: "When faced with a complex problem, you:",
            options: [
                { text: "Break it down into smaller, manageable parts", value: "problem-solving-strategic" },
                { text: "Seek advice from others", value: "problem-solving-collaborative" },
                { text: "Feel overwhelmed and procrastinate", value: "problem-solving-avoidant" },
                { text: "Jump into solving without careful analysis", value: "problem-solving-impulsive" },
            ],
        },
        {
            category: "Problem-Solving",
            text: "Your approach to unexpected challenges is:",
            options: [
                { text: "Remain calm and think strategically", value: "problem-solving-composed" },
                { text: "Feel stressed but try to find solutions", value: "problem-solving-resilient" },
                { text: "Look for someone else to handle it", value: "problem-solving-dependent" },
                { text: "Panic and lose focus", value: "problem-solving-overwhelmed" },
            ],
        },
        {
            category: "Problem-Solving",
            text: "Learning from mistakes, you:",
            options: [
                { text: "Reflect and develop strategies to improve", value: "problem-solving-growth" },
                { text: "Feel discouraged but try again", value: "problem-solving-persistent" },
                { text: "Avoid similar situations in the future", value: "problem-solving-avoidant" },
                { text: "Blame external factors", value: "problem-solving-defensive" },
            ],
        }
    ];

    let currentQuestionIndex = 0;
    const results = {};

    function loadQuestion() {
        const currentQuestion = questions[currentQuestionIndex];
        
        questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
        questionText.textContent = currentQuestion.text;
        
        // Add category display
        const categoryElement = document.getElementById("category");
        if (categoryElement) {
            categoryElement.textContent = `Category: ${currentQuestion.category}`;
        }

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
        const topResults = sortedResults.slice(0, 3); // Top 3 results
    
        // Detailed development recommendations
        const developmentRecommendations = {
            "communication-weak": {
                summary: "Your communication skills need significant improvement.",
                actions: [
                    "Enroll in public speaking workshops",
                    "Practice active listening techniques",
                    "Join a communication skills course or Toastmasters club",
                    "Record and review your presentations to identify areas of improvement"
                ]
            },
            "communication-passive": {
                summary: "You tend to be reserved in group settings.",
                actions: [
                    "Gradually increase participation in team discussions",
                    "Prepare talking points before meetings",
                    "Seek opportunities to present small projects",
                    "Practice expressing your thoughts concisely"
                ]
            },
            "communication-developing": {
                summary: "You're working on building communication confidence.",
                actions: [
                    "Attend confidence-building seminars",
                    "Practice presentations in low-pressure environments",
                    "Seek mentorship from confident communicators",
                    "Use communication skills apps and online resources"
                ]
            },
            "teamwork-uncertain": {
                summary: "You struggle to find your role in team settings.",
                actions: [
                    "Take team collaboration workshops",
                    "Learn about different team roles and strengths",
                    "Practice identifying your unique contributions",
                    "Develop a personal strengths inventory"
                ]
            },
            "teamwork-minimal": {
                summary: "You may need to become more proactive in team environments.",
                actions: [
                    "Volunteer for cross-functional projects",
                    "Offer help to teammates proactively",
                    "Learn about team dynamics and collaboration strategies",
                    "Practice collaborative problem-solving exercises"
                ]
            },
            "problem-solving-avoidant": {
                summary: "You tend to avoid complex problem-solving scenarios.",
                actions: [
                    "Take critical thinking and problem-solving workshops",
                    "Learn systematic problem-solving frameworks",
                    "Practice breaking down complex problems step-by-step",
                    "Develop a growth mindset towards challenges"
                ]
            },
            "problem-solving-overwhelmed": {
                summary: "Complex challenges can cause stress and panic.",
                actions: [
                    "Learn stress management techniques",
                    "Practice mindfulness and calm-down strategies",
                    "Develop a structured approach to problem-solving",
                    "Create personal stress-reduction plans"
                ]
            },
            "feedback-defensive": {
                summary: "You may struggle with receiving constructive criticism.",
                actions: [
                    "Attend emotional intelligence workshops",
                    "Practice reframing feedback as a growth opportunity",
                    "Learn active listening and non-defensive communication",
                    "Keep a feedback journal to track personal development"
                ]
            },
            "feedback-avoidance": {
                summary: "You tend to avoid seeking feedback.",
                actions: [
                    "Create a personal feedback request plan",
                    "Schedule regular check-ins with supervisors",
                    "Learn to ask for specific, actionable feedback",
                    "Develop a growth mindset towards continuous improvement"
                ]
            }
        };
    
        questionNumber.textContent = "Assessment Complete!";
        questionText.textContent = "Your Personalized Development Report";
    
        // Categorize results
        const categorizedResults = {
            "Communication": [],
            "Teamwork": [],
            "Problem-Solving": [],
            "Other": []
        };
    
        topResults.forEach(([key, value]) => {
            const category = 
                key.includes("communication") ? "Communication" :
                key.includes("teamwork") ? "Teamwork" :
                key.includes("problem-solving") ? "Problem-Solving" : 
                "Other";
            
            categorizedResults[category].push({
                trait: key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                score: value
            });
        });
    
        // Generate comprehensive HTML report
        let resultHTML = `<div class="results-breakdown">
            <h2>Your Personal Development Roadmap</h2>`;
    
        Object.entries(categorizedResults).forEach(([category, results]) => {
            if (results.length > 0) {
                resultHTML += `
                    <div class="category-results">
                        <h3>${category} Development Focus</h3>
                        <ul>
                            ${results.map(result => {
                                const recommendation = developmentRecommendations[result.trait.toLowerCase().replace(/ /g, '-')];
                                return recommendation 
                                    ? `
                                    <li>
                                        <strong>${result.trait}</strong>
                                        <p>${recommendation.summary}</p>
                                        <div class="action-items">
                                            <h4>Recommended Actions:</h4>
                                            <ul>
                                                ${recommendation.actions.map(action => `<li>${action}</li>`).join('')}
                                            </ul>
                                        </div>
                                    </li>` 
                                    : `<li>${result.trait}</li>`
                            }).join('')}
                        </ul>
                    </div>`;
            }
        });
    
        resultHTML += `
            <div class="overall-recommendation">
                <h3>Next Steps</h3>
                <ol>
                    <li>Review your development areas carefully</li>
                    <li>Select 2-3 action items to focus on immediately</li>
                    <li>Create a 3-month personal development plan</li>
                    <li>Seek mentorship or coaching if possible</li>
                    <li>Retake this assessment in 6 months to track progress</li>
                </ol>
            </div>
            <div class="result-buttons">
                <button id="retry-button">Retry Assessment</button>
                <button id="save-report-button">Save Report</button>
            </div>
        </div>`;
    
        optionsContainer.innerHTML = resultHTML;
        progressBar.style.width = "100%";
    
        // Add event listeners for new buttons
        document.getElementById("retry-button").addEventListener("click", retryAssessment);
        document.getElementById("save-report-button").addEventListener("click", saveReport);
    }
    
    // New function to save the report (you might want to implement this based on your specific requirements)
    function saveReport() {
        const reportContent = document.querySelector('.results-breakdown').innerText;
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `soft-skills-assessment-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function retryAssessment() {
        currentQuestionIndex = 0;
        for (let key in results) {
            results[key] = 0;
        }
        loadQuestion();
        progressBar.style.width = "0%";
    }

    loadQuestion();
});