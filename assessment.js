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
        // Team Dynamics - Based on Thomas-Kilmann Conflict Mode Instrument
        {
            category: "Team Dynamics",
            text: "When faced with a team conflict, I usually:",
            options: [
                { text: "Take charge and make decisions for the group", value: "leadership", theory: "Competing style (Thomas-Kilmann)" },
                { text: "Listen to all perspectives before suggesting solutions", value: "collaboration", theory: "Collaborating style (Thomas-Kilmann)" },
                { text: "Avoid the conflict and hope it resolves itself", value: "avoidance", theory: "Avoiding style (Thomas-Kilmann)" },
                { text: "Seek help from a superior immediately", value: "dependency", theory: "Accommodating style (Thomas-Kilmann)" },
            ],
            theory: "Based on the Thomas-Kilmann Conflict Mode Instrument, which identifies five styles of handling conflict: competing, collaborating, compromising, avoiding, and accommodating."
        },
        // Problem Management - Based on Dweck's Growth Mindset
        {
            category: "Problem Management",
            text: "How do you handle unexpected challenges at work?",
            options: [
                { text: "Stay calm and create a step-by-step plan", value: "problem-solving", theory: "Demonstrates growth mindset (Dweck)" },
                { text: "Seek advice from colleagues or supervisors", value: "collaboration", theory: "Shows social learning approach (Bandura)" },
                { text: "Wait and see if the issue resolves on its own", value: "avoidance", theory: "Indicates avoidance coping" },
                { text: "Panic and rush through tasks to finish quickly", value: "stress", theory: "Suggests fixed mindset (Dweck)" },
            ],
            theory: "Based on Carol Dweck's Growth Mindset theory, which examines how individuals approach challenges and setbacks."
        },
        // Task Management - Based on Executive Function theories
        {
            category: "Task Management",
            text: "How do you prioritize your tasks?",
            options: [
                { text: "Create a to-do list and stick to it", value: "organization", theory: "Strong executive function skills" },
                { text: "Handle tasks as they come", value: "reactive", theory: "Reactive coping style" },
                { text: "Focus on what seems urgent at the time", value: "stress", theory: "Eisenhower Matrix - urgent vs important" },
                { text: "Ask others what to prioritize", value: "dependency", theory: "External locus of control" },
            ],
            theory: "Based on theories of executive function and time management, particularly the Eisenhower Matrix for task prioritization."
        },
        // Communication - Based on Emotional Intelligence
        {
            category: "Communication",
            text: "When giving feedback to a colleague, I:",
            options: [
                { text: "Am direct and to the point", value: "directness", theory: "Low emotional intelligence (Goleman)" },
                { text: "Balance positive and constructive comments", value: "empathy", theory: "High emotional intelligence (Goleman)" },
                { text: "Avoid giving feedback unless asked", value: "avoidance", theory: "Conflict avoidance pattern" },
                { text: "Ask someone else to provide the feedback", value: "dependency", theory: "Low assertiveness" },
            ],
            theory: "Based on Daniel Goleman's Emotional Intelligence theory, particularly the social skills component."
        },
        // Learning - Based on Social Learning Theory
        {
            category: "Learning",
            text: "What is your approach to learning new skills?",
            options: [
                { text: "Take courses or read books", value: "self-learning", theory: "Formal learning approach" },
                { text: "Learn through trial and error", value: "experiential", theory: "Experiential learning (Kolb)" },
                { text: "Ask others to teach me", value: "collaboration", theory: "Social learning theory (Bandura)" },
                { text: "Avoid unless absolutely necessary", value: "avoidance", theory: "Learning avoidance" },
            ],
            theory: "Based on Albert Bandura's Social Learning Theory and David Kolb's Experiential Learning Theory."
        },
        // Additional Communication Skills Questions
        {
            category: "Communication",
            text: "When presenting ideas in a group, you typically:",
            options: [
                { text: "Speak confidently and clearly", value: "communication-strong", theory: "High self-efficacy (Bandura)" },
                { text: "Feel nervous but try to contribute", value: "communication-developing", theory: "Developing communication skills" },
                { text: "Prefer to listen and only speak when necessary", value: "communication-passive", theory: "Passive communication style" },
                { text: "Struggle to express your thoughts", value: "communication-weak", theory: "Communication apprehension" },
            ],
            theory: "Based on Communication Apprehension theory and Self-Efficacy theory."
        },
        // Teamwork Questions - Based on Big Five Personality Traits
        {
            category: "Teamwork",
            text: "In a group project, you typically:",
            options: [
                { text: "Volunteer to lead and coordinate tasks", value: "teamwork-leadership", theory: "High extraversion (Big Five)" },
                { text: "Contribute equally to the work", value: "teamwork-collaborative", theory: "High agreeableness (Big Five)" },
                { text: "Complete only your assigned tasks", value: "teamwork-minimal", theory: "Low conscientiousness (Big Five)" },
                { text: "Struggle to find your role in the team", value: "teamwork-uncertain", theory: "Low emotional stability (Big Five)" },
            ],
            theory: "Based on the Big Five Personality Traits model (OCEAN) which examines how personality affects teamwork."
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
            button.addEventListener("click", () => handleOptionClick(option.value, currentQuestion.theory));
            optionsContainer.appendChild(button);
        });

        const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    function handleOptionClick(value, questionTheory) {
        results[value] = {
            count: (results[value]?.count || 0) + 1,
            theory: questionTheory
        };

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            showResults();
        }
    }

    function showResults() {
        const sortedResults = Object.entries(results).sort((a, b) => b[1].count - a[1].count);
        const topResults = sortedResults.slice(0, 3); // Top 3 results
    
        // Enhanced development recommendations with scientific backing
        const developmentRecommendations = {
            "communication-weak": {
                summary: "Your communication skills need significant improvement based on your assessment responses.",
                scientificBasis: "According to Communication Apprehension Theory (McCroskey, 1977), individuals with high communication apprehension tend to avoid communication situations and experience anxiety when forced to communicate.",
                actions: [
                    "Enroll in public speaking workshops to build confidence (based on Systematic Desensitization theory)",
                    "Practice active listening techniques (supported by Rogers & Farson's Active Listening model)",
                    "Join a Toastmasters club to practice in a supportive environment (social learning theory)",
                    "Use visualization techniques before speaking engagements (mental rehearsal theory)"
                ],
                resources: [
                    "Book: 'Crucial Conversations' by Patterson et al.",
                    "Online course: 'Communication Skills for Success' (Coursera)",
                    "App: 'Orai' for speech practice and feedback"
                ]
            },
            "communication-passive": {
                summary: "You tend to be reserved in group settings, which may limit your professional impact.",
                scientificBasis: "Passive communication style is associated with lower self-efficacy (Bandura, 1977) and can hinder career advancement according to organizational behavior research.",
                actions: [
                    "Set small, incremental goals for participation in meetings (behavioral shaping)",
                    "Prepare talking points before meetings to increase confidence (cognitive preparation)",
                    "Practice assertive communication techniques (Lange & Jakubowski model)",
                    "Seek a communication mentor for guidance (social learning theory)"
                ],
                resources: [
                    "Book: 'The Assertiveness Workbook' by Randy Paterson",
                    "Worksheet: Assertive Communication Templates",
                    "Video series: 'Finding Your Professional Voice' (LinkedIn Learning)"
                ]
            },
            "teamwork-uncertain": {
                summary: "You struggle to find your role in team settings, which may affect collaboration.",
                scientificBasis: "Belbin's Team Role theory suggests that effective teams require members to understand and embrace their natural roles for optimal team performance.",
                actions: [
                    "Take a team role assessment (Belbin or similar)",
                    "Observe successful teams to identify role models (social learning theory)",
                    "Practice contributing in low-stakes team settings first (gradual exposure)",
                    "Develop a personal strengths inventory (positive psychology approach)"
                ],
                resources: [
                    "Assessment: Belbin Team Roles",
                    "Book: 'The Five Dysfunctions of a Team' by Lencioni",
                    "Toolkit: Team Collaboration Exercises"
                ]
            },
            "problem-solving-avoidant": {
                summary: "You tend to avoid complex problem-solving scenarios, which may limit your effectiveness.",
                scientificBasis: "According to Dweck's Mindset Theory (2006), individuals with a fixed mindset may avoid challenges to protect their self-image of competence.",
                actions: [
                    "Learn structured problem-solving frameworks (e.g., IDEAL model)",
                    "Practice breaking problems into smaller components (chunking theory)",
                    "Develop cognitive reframing techniques (cognitive behavioral approach)",
                    "Start with low-risk problems to build confidence (self-efficacy theory)"
                ],
                resources: [
                    "Book: 'Mindset' by Carol Dweck",
                    "Framework: IDEAL Problem-Solving Model",
                    "Workshop: Critical Thinking Bootcamp"
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
    
        topResults.forEach(([key, data]) => {
            const category = 
                key.includes("communication") ? "Communication" :
                key.includes("teamwork") ? "Teamwork" :
                key.includes("problem-solving") ? "Problem-Solving" : 
                "Other";
            
            categorizedResults[category].push({
                trait: key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                score: data.count,
                theory: data.theory
            });
        });
    
        // Generate comprehensive HTML report with scientific backing
        let resultHTML = `<div class="results-breakdown">
            <h2 class="text-2xl font-bold mb-6 text-center">Your Personal Development Roadmap</h2>
            <div class="mb-8 p-6 bg-blue-50 rounded-lg">
                <h3 class="text-xl font-semibold mb-3">Assessment Overview</h3>
                <p>This assessment is based on established psychological theories including:</p>
                <ul class="list-disc pl-5 mt-2 space-y-1">
                    <li>Emotional Intelligence Theory (Goleman, 1995)</li>
                    <li>Big Five Personality Traits (Goldberg, 1990)</li>
                    <li>Social Learning Theory (Bandura, 1977)</li>
                    <li>Growth Mindset Theory (Dweck, 2006)</li>
                    <li>Thomas-Kilmann Conflict Mode Instrument</li>
                </ul>
            </div>`;
    
        Object.entries(categorizedResults).forEach(([category, results]) => {
            if (results.length > 0) {
                resultHTML += `
                    <div class="category-results mb-8 p-6 bg-gray-50 rounded-lg">
                        <h3 class="text-xl font-semibold mb-4">${category} Development Focus</h3>
                        <div class="space-y-6">
                            ${results.map(result => {
                                const recommendation = developmentRecommendations[result.trait.toLowerCase().replace(/ /g, '-')];
                                return `
                                <div class="trait-result border-b pb-4 last:border-0">
                                    <div class="flex justify-between items-start">
                                        <h4 class="font-medium text-lg">${result.trait}</h4>
                                        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Score: ${result.score}</span>
                                    </div>
                                    ${result.theory ? `<p class="text-sm text-gray-600 mt-1"><em>Theoretical basis: ${result.theory}</em></p>` : ''}
                                    ${recommendation ? `
                                    <div class="mt-3">
                                        <p class="mb-2">${recommendation.summary}</p>
                                        <div class="bg-white p-4 rounded-md mb-3">
                                            <h5 class="font-medium mb-1">Scientific Basis:</h5>
                                            <p class="text-sm">${recommendation.scientificBasis}</p>
                                        </div>
                                        <div class="action-items bg-white p-4 rounded-md">
                                            <h5 class="font-medium mb-2">Recommended Actions:</h5>
                                            <ul class="list-disc pl-5 space-y-1">
                                                ${recommendation.actions.map(action => `<li>${action}</li>`).join('')}
                                            </ul>
                                        </div>
                                        ${recommendation.resources ? `
                                        <div class="resources mt-3 bg-white p-4 rounded-md">
                                            <h5 class="font-medium mb-2">Recommended Resources:</h5>
                                            <ul class="list-disc pl-5 space-y-1">
                                                ${recommendation.resources.map(resource => `<li>${resource}</li>`).join('')}
                                            </ul>
                                        </div>
                                        ` : ''}
                                    </div>
                                    ` : ''}
                                </div>`
                            }).join('')}
                        </div>
                    </div>`;
            }
        });
    
        resultHTML += `
            <div class="workshop-recommendations bg-purple-50 p-6 rounded-lg mb-8">
                <h3 class="text-xl font-semibold mb-4">Recommended Workshops</h3>
                <div id="recommended-workshops" class="workshops-grid grid md:grid-cols-2 gap-4">
                    <p>Loading recommended workshops...</p>
                </div>
            </div>
            <div class="overall-recommendation bg-green-50 p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-3">Next Steps for Development</h3>
                <ol class="list-decimal pl-5 space-y-2">
                    <li>Review your development areas carefully and select 2-3 priorities</li>
                    <li>Create a SMART (Specific, Measurable, Achievable, Relevant, Time-bound) development plan</li>
                    <li>Schedule regular check-ins to monitor your progress (recommended every 2 weeks)</li>
                    <li>Consider finding a mentor or accountability partner</li>
                    <li>Retake this assessment in 3-6 months to measure improvement</li>
                </ol>
                <div class="mt-4 p-4 bg-white rounded-md">
                    <h4 class="font-medium mb-2">Remember:</h4>
                    <p>Skill development follows the <strong>Four Stages of Competence</strong> model (conscious competence theory):</p>
                    <ol class="list-decimal pl-5 mt-2 space-y-1">
                        <li>Unconscious Incompetence (you don't know what you don't know)</li>
                        <li>Conscious Incompetence (you recognize the skill gap)</li>
                        <li>Conscious Competence (you can perform with effort)</li>
                        <li>Unconscious Competence (the skill becomes second nature)</li>
                    </ol>
                </div>
            </div>
            <div class="result-buttons flex justify-center space-x-4 mt-8">
                <button id="retry-button" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Retry Assessment</button>
                <button id="save-report-button" class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">Save Report</button>
            </div>
        </div>`;
    
        optionsContainer.innerHTML = resultHTML;
        progressBar.style.width = "100%";
    
        // Add event listeners for new buttons
        document.getElementById("retry-button").addEventListener("click", retryAssessment);
        document.getElementById("save-report-button").addEventListener("click", saveReport);
        loadRecommendedWorkshops(topResults);
    }

    // Rest of the functions remain the same...
    async function loadRecommendedWorkshops(topResults) {
        const recommendedWorkshopsContainer = document.getElementById('recommended-workshops');
        if (!recommendedWorkshopsContainer) return;

        try {
            // Get all active workshops
            const snapshot = await db.collection('workshops')
                .where('status', '==', 'active')
                .get();

            if (snapshot.empty) {
                recommendedWorkshopsContainer.innerHTML = '<p>No available workshops at this time.</p>';
                return;
            }

            // Map assessment results to workshop tags
            const assessmentTags = topResults.map(result => {
                const trait = result[0];
                if (trait.includes('communication')) return 'communication';
                if (trait.includes('teamwork')) return 'teamwork';
                if (trait.includes('problem-solving')) return 'problem-solving';
                return null;
            }).filter(tag => tag !== null);

            // Filter workshops that match assessment results
            const matchingWorkshops = [];
            snapshot.forEach(doc => {
                const workshop = doc.data();
                workshop.id = doc.id;
                
                // Check if workshop tags match assessment results
                if (workshop.tags && workshop.tags.some(tag => assessmentTags.includes(tag))) {
                    matchingWorkshops.push(workshop);
                }
            });

            // Display workshops
            if (matchingWorkshops.length > 0) {
                recommendedWorkshopsContainer.innerHTML = matchingWorkshops.map(workshop => `
                    <div class="workshop-card bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
                        <h4 class="font-semibold text-lg text-blue-800">${workshop.title}</h4>
                        <p class="text-gray-600 my-2">${workshop.description?.substring(0, 100)}...</p>
                        <p class="text-sm"><strong class="font-medium">Date:</strong> ${workshop.date?.toDate().toLocaleDateString()}</p>
                        <a href="workshops.html#${workshop.id}" class="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition">View Details</a>
                    </div>
                `).join('');
            } else {
                // Show all active workshops if no specific matches
                recommendedWorkshopsContainer.innerHTML = snapshot.docs.map(doc => {
                    const workshop = doc.data();
                    return `
                        <div class="workshop-card bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
                            <h4 class="font-semibold text-lg text-blue-800">${workshop.title}</h4>
                            <p class="text-gray-600 my-2">${workshop.description?.substring(0, 100)}...</p>
                            <p class="text-sm"><strong class="font-medium">Date:</strong> ${workshop.date?.toDate().toLocaleDateString()}</p>
                            <a href="workshops.html#${workshop.id}" class="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition">View Details</a>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error("Error loading workshops:", error);
            recommendedWorkshopsContainer.innerHTML = '<p class="text-red-500">Error loading workshop recommendations.</p>';
        }
    }
    
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
            delete results[key];
        }
        loadQuestion();
        progressBar.style.width = "0%";
    }

    loadQuestion();
});