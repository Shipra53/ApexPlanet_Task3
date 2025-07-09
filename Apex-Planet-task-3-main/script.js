// script.js

// =========================================================
// Global Constants & State
// =========================================================
const OPENWEATHER_API_KEY = "API KEY"; // <-- Your API Key is here
const API_BASE_URL = "https://api.openweathermap.org/data/2.5/weather?";

// --- Custom Message Box Function ---
/**
 * Displays a custom message box instead of using alert().
 * @param {string} message - The message to display.
 * @param {string} classes - Additional Tailwind CSS classes for styling (e.g., color).
 */
function showCustomMessage(message, classes = "bg-blue-100 text-blue-700") {
    let messageBox = document.querySelector('.custom-message-box');
    // If a message box already exists, remove it before creating a new one
    if (messageBox) {
        messageBox.remove();
    }

    messageBox = document.createElement('div');
    messageBox.textContent = message;
    messageBox.className = `custom-message-box ${classes}`; // Apply base and custom classes
    document.body.appendChild(messageBox);

    // Show the message box with a slight delay for transition
    setTimeout(() => {
        messageBox.style.transform = 'translateX(-50%) scale(1)';
        messageBox.style.opacity = '1';
    }, 10);

    // Hide and remove after some time
    setTimeout(() => {
        messageBox.style.transform = 'translateX(-50%) scale(0)';
        messageBox.style.opacity = '0';
        // Remove from DOM after transition completes
        messageBox.addEventListener('transitionend', () => messageBox.remove(), {
            once: true
        });
    }, 4000); // Message visible for 4 seconds
}


document.addEventListener('DOMContentLoaded', () => {
    // --- Global Elements ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const contentSections = document.querySelectorAll('.content-section');

    // --- Tab Switching Logic ---
    function showSection(sectionId) {
        // Hide all content sections
        contentSections.forEach(section => {
            section.classList.add('hidden');
        });
        // Show the target section
        document.getElementById(sectionId).classList.remove('hidden');

        // Remove active class from all tab buttons
        tabButtons.forEach(button => {
            button.classList.remove('active');
            // Reset text color for inactive tabs
            button.classList.remove('text-indigo-700');
            button.classList.add('text-gray-700');
        });
        // Add active class to the clicked tab button
        const activeTabButton = document.getElementById(`${sectionId.replace('-section', '')}-tab`);
        activeTabButton.classList.add('active');
        // Set specific color for active tab text
        activeTabButton.classList.remove('text-gray-700');
        activeTabButton.classList.add('text-indigo-700');
    }

    // Add event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const sectionId = event.currentTarget.id.replace('-tab', '-section');
            showSection(sectionId);
            // Special logic for the weather tab: Fetch default city weather if not already fetched
            if (sectionId === 'weather-section' && !lastWeatherData) {
                // Fetch weather for Lucknow (your current location) when the weather tab is clicked
                fetchWeatherData('Lucknow');
            }
        });
    });

    // Set default active tab to Image Gallery as per initial screenshot
    showSection('gallery-section');


    // --- Quiz Section Logic ---
    const quizQuestions = [{
            question: "What type of cloud typically produces thunderstorms?",
            options: ["Cirrus", "Stratus", "Cumulonimbus", "Altocumulus"],
            answer: "Cumulonimbus"
        },
        {
            question: "Which instrument is used to measure atmospheric pressure?",
            options: ["Anemometer", "Thermometer", "Barometer", "Hygrometer"],
            answer: "Barometer"
        },
        {
            question: "What is the common term for a rapidly rotating column of air extending from a thunderstorm to the ground?",
            options: ["Hurricane", "Typhoon", "Tornado", "Cyclone"],
            answer: "Tornado"
        },
        {
            question: "Which of the following is a greenhouse gas?",
            options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"],
            answer: "Carbon Dioxide"
        },
        {
            question: "What phenomenon causes the beautiful colors of a rainbow?",
            options: ["Reflection", "Refraction", "Diffraction", "Absorption"],
            answer: "Refraction"
        }
    ];

    let currentQuestionIndex = 0;
    let score = 0;

    const quizQuestionEl = document.getElementById('quiz-question');
    const quizOptionsEl = document.getElementById('quiz-options');
    const submitAnswerBtn = document.getElementById('submit-answer');
    const quizScoreEl = document.getElementById('quiz-score');
    const currentQuestionNumberEl = document.getElementById('current-question-number');
    const totalQuestionsEl = document.getElementById('total-questions');
    const quizProgressBar = document.getElementById('quiz-progress-bar');
    const quizResultEl = document.getElementById('quiz-result');
    const restartQuizBtn = document.getElementById('restart-quiz');

    totalQuestionsEl.textContent = quizQuestions.length;

    /**
     * Loads the current question into the quiz section.
     */
    function loadQuestion() {
        const q = quizQuestions[currentQuestionIndex];
        quizQuestionEl.textContent = q.question;
        quizOptionsEl.innerHTML = ''; // Clear previous options

        // Create and append radio buttons for options
        q.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'flex items-center p-3 rounded-lg hover:bg-indigo-50 cursor-pointer transition duration-200';
            optionDiv.innerHTML = `
                <input type="radio" id="option${index}" name="quiz-option" value="${option}" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 rounded-full">
                <label for="option${index}" class="ml-3 text-md text-gray-700 flex-grow">${option}</label>
            `;
            optionDiv.addEventListener('click', () => {
                // Check the radio button when the whole div is clicked
                document.getElementById(`option${index}`).checked = true;
            });
            quizOptionsEl.appendChild(optionDiv);
        });

        currentQuestionNumberEl.textContent = currentQuestionIndex + 1;
        updateProgressBar();
        quizResultEl.classList.add('hidden'); // Hide result message for new question
        quizResultEl.textContent = '';
        submitAnswerBtn.classList.remove('hidden'); // Show submit button
        submitAnswerBtn.disabled = false; // Enable submit button
    }

    /**
     * Updates the progress bar based on the current question index.
     */
    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
        quizProgressBar.style.width = `${progress}%`;
    }

    /**
     * Submits the user's answer, checks correctness, updates score, and moves to the next question.
     */
    function submitAnswer() {
        const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
        if (!selectedOption) {
            quizResultEl.classList.remove('hidden');
            quizResultEl.className = 'mt-6 p-4 rounded-lg text-center font-semibold bg-red-100 text-red-700';
            quizResultEl.textContent = 'Please select an answer!';
            return;
        }

        const userAnswer = selectedOption.value;
        const correctAnswer = quizQuestions[currentQuestionIndex].answer;

        submitAnswerBtn.disabled = true; // Disable submit button to prevent multiple clicks

        if (userAnswer === correctAnswer) {
            score++;
            quizResultEl.className = 'mt-6 p-4 rounded-lg text-center font-semibold bg-emerald-100 text-emerald-700';
            quizResultEl.textContent = 'Correct!';
        } else {
            quizResultEl.className = 'mt-6 p-4 rounded-lg text-center font-semibold bg-rose-100 text-rose-700';
            quizResultEl.textContent = `Wrong! The correct answer was: ${correctAnswer}`;
        }
        quizResultEl.classList.remove('hidden');
        quizScoreEl.textContent = `Current Score: ${score} / ${quizQuestions.length}`;

        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizQuestions.length) {
                loadQuestion(); // Load next question
            } else {
                endQuiz(); // End quiz if all questions answered
            }
        }, 1500); // Wait 1.5 seconds before moving on
    }

    /**
     * Ends the quiz, displays final score, and shows restart button.
     */
    function endQuiz() {
        quizQuestionEl.textContent = `Quiz Completed! Your final score is: ${score} out of ${quizQuestions.length}`;
        quizOptionsEl.innerHTML = ''; // Clear options
        submitAnswerBtn.classList.add('hidden');
        restartQuizBtn.classList.remove('hidden');
        quizResultEl.classList.add('hidden'); // Hide last correct/wrong message
        quizScoreEl.textContent = `Final Score: ${score} / ${quizQuestions.length}`;
        quizProgressBar.style.width = `100%`; // Ensure progress bar is full
    }

    /**
     * Resets the quiz to its initial state.
     */
    function restartQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        quizScoreEl.textContent = `Current Score: 0 / ${quizQuestions.length}`;
        restartQuizBtn.classList.add('hidden');
        loadQuestion();
    }

    // Attach event listeners for quiz buttons
    submitAnswerBtn.addEventListener('click', submitAnswer);
    restartQuizBtn.addEventListener('click', restartQuiz);

    // Initial quiz load when the page loads
    loadQuestion();


    // --- Image Gallery Section Logic ---
    const carouselImages = [{
            src: "mounrains pic.jpg", // Your uploaded image
            category: "Extreme Weather",
            title: "Mountain Lightning",
            description: "A powerful lightning bolt illuminating the night sky over mountains."
        },
        {
            src: "Forest.jpg",
            category: "Nature's Beauty",
            title: "Tranquil Forest",
            description: "Green trees standing tall under a clear sky, offering a serene view."
        },
        {
            src: "Coastal cliffs.jpg",
            category: "Scenic Views",
            title: "Coastal Majesty",
            description: "Waves crashing against rugged coastal cliffs, showcasing nature's power."
        },
        {
            src: "Desert dunes.jpg",
            category: "Morning Glow",
            title: "Desert Sunrise",
            description: "The sun rising over vast desert dunes, casting long shadows."
        },
        {
            src: "Waterfall.jpg",
            category: "Atmospheric",
            title: "Misty Waterfall",
            description: "A beautiful waterfall surrounded by an ethereal mist, creating a magical scene."
        }
    ];

    let currentImageIndex = 0;
    let autoplayInterval;
    let autoplayEnabledState = true; // State to track if autoplay should be active

    const carouselMainImage = document.getElementById('carousel-main-image');
    const carouselCategory = document.getElementById('carousel-category');
    const carouselTitle = document.getElementById('carousel-title');
    const carouselDescription = document.getElementById('carousel-description');
    const carouselPrevBtn = document.getElementById('carousel-prev');
    const carouselNextBtn = document.getElementById('carousel-next');
    const carouselDotsContainer = document.getElementById('carousel-dots');
    const carouselThumbnailsContainer = document.getElementById('carousel-thumbnails');
    const autoplayToggleBtn = document.getElementById('autoplay-toggle');

    /**
     * Displays the image at the given index in the carousel.
     * @param {number} index - The index of the image to display.
     */
    function showImage(index) {
        currentImageIndex = (index + carouselImages.length) % carouselImages.length; // Ensure index wraps around
        const imageData = carouselImages[currentImageIndex];

        carouselMainImage.src = imageData.src;
        carouselCategory.textContent = imageData.category;
        carouselTitle.textContent = imageData.title;
        carouselDescription.textContent = imageData.description;

        updateCarouselIndicators();
    }

    /**
     * Updates the carousel's dot indicators and thumbnails to reflect the current image.
     */
    function updateCarouselIndicators() {
        // Update dots
        carouselDotsContainer.innerHTML = ''; // Clear existing dots
        carouselImages.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `carousel-dot ${index === currentImageIndex ? 'active' : ''}`;
            dot.addEventListener('click', () => showImage(index));
            carouselDotsContainer.appendChild(dot);
        });

        // Update thumbnails
        carouselThumbnailsContainer.innerHTML = ''; // Clear existing thumbnails
        carouselImages.forEach((img, index) => {
            const thumb = document.createElement('img');
            // For thumbnails, use smaller placeholder images or generate new ones.
            // If the main image is an uploaded one, use a generic placeholder for its thumbnail for consistent size.
            // NOTE: Using a placeholder if src starts with 'uploaded:' is a good practice if real small thumbnails aren't available.
            // For now, let's just use the full image path for thumbnails directly, assuming they are appropriately sized or scaled by CSS.
            thumb.src = img.src; // Using the actual image source for thumbnail
            thumb.alt = `Thumbnail ${index + 1}`;
            thumb.className = `w-20 h-12 object-cover rounded-md cursor-pointer transition transform duration-200 ${index === currentImageIndex ? 'border-2 border-indigo-500 scale-105 shadow-md' : 'border border-gray-300'}`;
            thumb.addEventListener('click', () => showImage(index));
            carouselThumbnailsContainer.appendChild(thumb);
        });
    }

    /**
     * Starts the automatic rotation of carousel images.
     */
    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval); // Clear any existing interval
        autoplayInterval = setInterval(() => {
            showImage(currentImageIndex + 1);
        }, 3000); // Change image every 3 seconds
        autoplayToggleBtn.textContent = 'Pause';
        autoplayToggleBtn.classList.remove('bg-emerald-500', 'hover:bg-emerald-600');
        autoplayToggleBtn.classList.add('bg-indigo-500', 'hover:bg-indigo-600');
        autoplayEnabledState = true;
    }

    /**
     * Stops the automatic rotation of carousel images.
     */
    function stopAutoplay() {
        clearInterval(autoplayInterval); // Stop the interval
        autoplayInterval = null; // Reset interval ID
        autoplayToggleBtn.textContent = 'Play';
        autoplayToggleBtn.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
        autoplayToggleBtn.classList.add('bg-emerald-500', 'hover:bg-emerald-600');
        autoplayEnabledState = false;
    }

    // Toggle autoplay on button click
    autoplayToggleBtn.addEventListener('click', () => {
        if (autoplayEnabledState) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });

    // Navigate to previous image and stop autoplay
    carouselPrevBtn.addEventListener('click', () => {
        stopAutoplay(); // Stop autoplay on manual navigation
        showImage(currentImageIndex - 1);
    });

    // Navigate to next image and stop autoplay
    carouselNextBtn.addEventListener('click', () => {
        stopAutoplay(); // Stop autoplay on manual navigation
        showImage(currentImageIndex + 1);
    });

    // Initial carousel load
    showImage(0); // Display the first image
    if (autoplayEnabledState) {
        startAutoplay(); // Start autoplay if enabled by default
    } else {
        stopAutoplay();
    }

    // Keyboard navigation for carousel when gallery section is active
    document.addEventListener('keydown', (e) => {
        if (!document.getElementById('gallery-section').classList.contains('hidden')) {
            if (e.key === 'ArrowLeft') {
                stopAutoplay();
                showImage(currentImageIndex - 1);
            } else if (e.key === 'ArrowRight') {
                stopAutoplay();
                showImage(currentImageIndex + 1);
            }
        }
    });


    // --- Live Weather Section Logic ---
    const cityInput = document.getElementById('city-input');
    const searchWeatherBtn = document.getElementById('search-weather');
    const weatherCity = document.getElementById('weather-city');
    const weatherTemp = document.getElementById('weather-temp');
    const weatherFeelsLike = document.getElementById('weather-feels-like');
    const weatherCondition = document.getElementById('weather-condition');
    const weatherWindSpeed = document.getElementById('weather-wind-speed');
    const weatherWindDir = document.getElementById('weather-wind-dir');
    const weatherHumidity = document.getElementById('weather-humidity');
    const weatherVisibility = document.getElementById('weather-visibility');
    const weatherPressure = document.getElementById('weather-pressure');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherMainCard = document.querySelector('.weather-main-card'); // Select the main weather card element
    const tempUnitToggle = document.getElementById('temp-unit-toggle');
    const apiInfoBox = document.querySelector('.api-info-box'); // This element isn't in your HTML, assuming it's for info messages.
    const demoModeBox = document.querySelector('.demo-mode-box'); // This element isn't in your HTML, assuming it's for demo mode messages.

    let isCelsius = true;
    let lastWeatherData = null; // Store last fetched weather data to toggle units


    /**
     * Fetches live weather data for a given city from OpenWeatherMap API.
     * @param {string} city - The city name to fetch weather for.
     */
    async function fetchWeatherData(city) {
        // --- API Key Check ---
        if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === "YOUR_API_KEY_HERE" || OPENWEATHER_API_KEY.length !== 32) {
            showCustomMessage(
                "Please replace 'YOUR_API_KEY_HERE' in script.js with your actual OpenWeatherMap API Key.",
                "bg-red-100 text-red-700"
            );
            if (demoModeBox) demoModeBox.style.display = 'block'; // Show demo mode if key is bad
            weatherCity.textContent = "API Key Error";
            weatherTemp.textContent = "--";
            weatherCondition.textContent = "Invalid API Key";
            weatherIcon.className = 'fas fa-exclamation-triangle absolute top-4 right-4 text-white text-4xl opacity-50'; // Error icon
            return;
        } else {
             if (demoModeBox) demoModeBox.style.display = 'none'; // Hide demo mode if key is valid
        }

        // Show loading state
        weatherCity.textContent = `Fetching for ${city}...`;
        weatherTemp.textContent = '...';
        weatherFeelsLike.textContent = '';
        weatherCondition.textContent = 'Loading...';
        weatherWindSpeed.textContent = '...';
        weatherWindDir.textContent = '';
        weatherHumidity.textContent = '...';
        weatherVisibility.textContent = '...';
        weatherPressure.textContent = '...';
        // Show a spinning loader icon
        weatherIcon.className = 'fas fa-spinner fa-spin absolute top-4 right-4 text-white text-4xl opacity-50';

        const url = `${API_BASE_URL}q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                // Specific error for city not found
                if (response.status === 404) {
                    throw new Error(`City not found: "${city}". Please check the spelling.`);
                }
                // Generic error for other HTTP issues
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            lastWeatherData = data; // Store fetched data
            displayWeatherData(data); // Display data and update UI
            showCustomMessage(`Weather data loaded for ${data.name}.`, "bg-green-100 text-green-700");

        } catch (error) {
            console.error('Error fetching weather data:', error);
            weatherCity.textContent = 'Error';
            weatherTemp.textContent = '--';
            weatherFeelsLike.textContent = '';
            weatherCondition.textContent = 'Failed to load weather';
            weatherWindSpeed.textContent = '';
            weatherWindDir.textContent = '';
            weatherHumidity.textContent = '';
            weatherVisibility.textContent = '';
            weatherPressure.textContent = '';
            weatherIcon.className = 'fas fa-exclamation-circle absolute top-4 right-4 text-white text-4xl opacity-50'; // Error icon

            showCustomMessage(`Failed to fetch weather: ${error.message}`, "bg-red-100 text-red-700");
        }
    }

    /**
     * Updates the main weather card's background gradient and icon based on weather condition.
     * @param {object} data - The weather data object from OpenWeatherMap.
     */
    function updateWeatherUI(data) {
        const weatherId = data.weather[0].id;
        // const condition = data.weather[0].main; // Not directly used in icon/gradient logic here
        const isDay = (data.dt > data.sys.sunrise) && (data.dt < data.sys.sunset); // Check if it's daytime using timestamp

        let iconClass = "fas fa-question-circle"; // Default icon
        let cardGradient = "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"; // Default indigo gradient

        // Map OpenWeatherMap's condition codes to Font Awesome icons and gradients
        if (weatherId >= 200 && weatherId < 300) { // Thunderstorm
            iconClass = "fas fa-bolt";
            cardGradient = "linear-gradient(135deg, #4b5563 0%, #1f2937 100%)"; // Darker gradient
        } else if (weatherId >= 300 && weatherId < 600) { // Drizzle & Rain (3xx, 5xx)
            iconClass = "fas fa-cloud-showers-heavy";
            cardGradient = "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)"; // Blue gradient
        } else if (weatherId >= 600 && weatherId < 700) { // Snow
            iconClass = "fas fa-snowflake";
            cardGradient = "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)"; // Light blue/grey gradient
        } else if (weatherId >= 700 && weatherId < 800) { // Atmosphere (Mist, Smoke, etc.)
            iconClass = "fas fa-smog";
            cardGradient = "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"; // Misty grey gradient
        } else if (weatherId === 800) { // Clear
            iconClass = isDay ? "fas fa-sun" : "fas fa-moon";
            cardGradient = isDay ? "linear-gradient(135deg, #fcd34d 0%, #fb923c 100%)" : "linear-gradient(135deg, #1e3a8a 0%, #4338ca 100%)"; // Day/night gradient
        } else if (weatherId > 800) { // Clouds
            iconClass = "fas fa-cloud";
            cardGradient = "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)"; // Cloud-like grey gradient
        }

        // Update the icon class
        weatherIcon.className = `${iconClass} absolute top-4 right-4 text-white text-4xl opacity-50`;

        // Apply the gradient background
        weatherMainCard.style.background = cardGradient;
    }

    /**
     * Displays the provided weather data on the webpage.
     * @param {object} data - The weather data object.
     */
    function displayWeatherData(data) {
        weatherCity.textContent = `${data.name}, ${data.sys.country}`;

        // Convert and display temperature based on current unit preference
        const temp = isCelsius ? data.main.temp : (data.main.temp * 9 / 5 + 32);
        const feelsLike = isCelsius ? data.main.feels_like : (data.main.feels_like * 9 / 5 + 32);
        const unit = isCelsius ? 'C' : 'F';

        weatherTemp.textContent = `${Math.round(temp)}°${unit}`;
        weatherFeelsLike.textContent = `Feels like ${Math.round(feelsLike)}°${unit}`;
        tempUnitToggle.textContent = `Switch to °${isCelsius ? 'F' : 'C'}`; // Update toggle button text

        weatherCondition.textContent = data.weather[0].description.replace(/\b\w/g, char => char.toUpperCase());
        weatherWindSpeed.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`; // Convert m/s to km/h, toFixed(1) for one decimal
        // OpenWeatherMap API provides wind direction in degrees (data.wind.deg).
        // You'll need a separate function or lookup table to convert degrees to cardinal directions (e.g., N, NE, E).
        // For simplicity, let's just display the degree for now or leave blank if not parsing.
        weatherWindDir.textContent = data.wind.deg ? ` from ${data.wind.deg}°` : ''; // Displays degrees if available
        weatherHumidity.textContent = `${data.main.humidity}%`;
        weatherVisibility.textContent = data.visibility ? `${(data.visibility / 1000).toFixed(1)} km` : 'N/A';
        weatherPressure.textContent = `${data.main.pressure} hPa`;

        updateWeatherUI(data); // Call the function to update icon and gradient
    }

    /**
     * Toggles the temperature unit between Celsius and Fahrenheit.
     */
    function toggleTemperatureUnit() {
        isCelsius = !isCelsius;
        if (lastWeatherData) {
            displayWeatherData(lastWeatherData); // Re-display with new unit if data exists
        }
    }

    // Event listener for search button
    searchWeatherBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
        } else {
            // Use custom message box for user feedback
            showCustomMessage("Please enter a city name.", "bg-yellow-100 text-yellow-700");
        }
    });

    // Event listener for temperature unit toggle
    tempUnitToggle.addEventListener('click', toggleTemperatureUnit);

    // Event listener for pressing Enter in the city input
    cityInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchWeatherBtn.click();
        }
    });

    // Initial check for API key and display demo mode if necessary
    // This will run when the DOM content is fully loaded
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === "YOUR_API_KEY_HERE" || OPENWEATHER_API_KEY.length !== 32) {
        if (demoModeBox) demoModeBox.style.display = 'block';
        showCustomMessage(
            "API Key is missing or invalid. Weather data will not load correctly. Please update 'OPENWEATHER_API_KEY' in script.js.",
            "bg-orange-100 text-orange-700"
        );
    } else {
        if (demoModeBox) demoModeBox.style.display = 'none'; // Hide demo mode if key is valid
    }
});
