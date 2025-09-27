// Softmax Temperature Visualization Script

// Example data with different sentence contexts
const examples = [
    {
        sentence: "I read it yesterday, it is a very interesting...",
        words: ["door", "book", "story", "pineapple", "paper"],
        logits: [0.2, 2.1, 1.2, 0.05, 0.6]
    },
    {
        sentence: "The weather today is absolutely...",
        words: ["beautiful", "terrible", "perfect", "awful", "amazing"],
        logits: [1.9, -0.5, 1.6, -0.8, 1.4]
    },
    {
        sentence: "My favorite programming language is...",
        words: ["Python", "JavaScript", "Java", "C++", "Rust"],
        logits: [2.3, 1.7, 0.8, 0.2, 1.1]
    }
];

// Global variables
let currentExample = 0;
let temperature = 1.0;
let chart = null;
let treemapChart = null;
let currentDot = null; // Track the blue dot element

// Initialize the visualization
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateVisualization();
});

function setupEventListeners() {
    // Sentence selection buttons
    const sentenceBtns = document.querySelectorAll('.sentence-btn');
    sentenceBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            // Update active button
            sentenceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update current example
            currentExample = index;
            updateVisualization();
        });
    });

    // Temperature slider
    const temperatureSlider = document.getElementById('temperatureSlider');
    const temperatureValue = document.getElementById('temperatureValue');
    
    temperatureSlider.addEventListener('input', (e) => {
        temperature = parseFloat(e.target.value);
        temperatureValue.textContent = temperature.toFixed(1);
        updateVisualization();
    });
    
    // Add word functionality
    const addWordBtn = document.getElementById('addWordBtn');
    const newWordInput = document.getElementById('newWordInput');
    const newLogitInput = document.getElementById('newLogitInput');
    
    addWordBtn.addEventListener('click', addWord);
    
    // Allow Enter key to add word
    newWordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addWord();
    });
    
    newLogitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addWord();
    });
    
    // Sample word button
    const sampleWordBtn = document.getElementById('sampleWordBtn');
    sampleWordBtn.addEventListener('click', sampleWord);
}

function updateVisualization() {
    updateSentenceDisplay();
    updateWordsDisplay();
    updateChart();
    updateTreemap();
    updateSamplingSentenceDisplay();
    // Remove any existing blue dot when updating visualization
    removeBlueDot();
}

function updateSentenceDisplay() {
    const currentSentence = document.getElementById('currentSentence');
    const example = examples[currentExample];
    currentSentence.textContent = example.sentence;
}

function updateWordsDisplay() {
    const wordsColumn = document.getElementById('wordsColumn');
    const example = examples[currentExample];
    
    wordsColumn.innerHTML = '';
    
    example.words.forEach((word, index) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
            <div class="word-inputs">
                <input type="text" class="word-input" value="${word}" onchange="updateWord(${index}, 'word', this.value)" maxlength="20">
                <input type="number" class="logit-input" value="${example.logits[index].toFixed(1)}" onchange="updateWord(${index}, 'logit', this.value)" step="0.1" min="-10" max="10">
            </div>
            <button class="delete-btn" onclick="deleteWord(${index})" title="Delete word">×</button>
        `;
        wordsColumn.appendChild(wordItem);
    });
    
    // Update add button state
    updateAddButtonState();
}

function calculateSoftmax(logits, temperature) {
    // Apply temperature scaling
    const scaledLogits = logits.map(logit => logit / temperature);
    
    // Calculate exponentials
    const exponentials = scaledLogits.map(logit => Math.exp(logit));
    
    // Calculate sum of exponentials
    const sumExp = exponentials.reduce((sum, exp) => sum + exp, 0);
    
    // Calculate probabilities
    const probabilities = exponentials.map(exp => exp / sumExp);
    
    return probabilities;
}

function updateChart() {
    const example = examples[currentExample];
    const probabilities = calculateSoftmax(example.logits, temperature);
    
    // If chart exists, just update the data
    if (chart) {
        chart.data.labels = example.words;
        chart.data.datasets[0].data = probabilities;
        
        // Update colors for new number of words
        const uniformColor = 'rgba(0, 102, 204, 0.7)';
        const uniformBorderColor = 'rgba(0, 102, 204, 1)';
        chart.data.datasets[0].backgroundColor = new Array(example.words.length).fill(uniformColor);
        chart.data.datasets[0].borderColor = new Array(example.words.length).fill(uniformBorderColor);
        
        chart.update('none'); // No animation for smooth transition
        return;
    }
    
    // Create new chart only if it doesn't exist
    const ctx = document.getElementById('probabilityChart').getContext('2d');
    
    // Create uniform color array
    const uniformColor = 'rgba(0, 102, 204, 0.7)';
    const uniformBorderColor = 'rgba(0, 102, 204, 1)';
    const colors = new Array(example.words.length).fill(uniformColor);
    const borderColors = new Array(example.words.length).fill(uniformBorderColor);
    
    chart = new Chart(ctx, {
        type: 'bar',
        plugins: [ChartDataLabels],
        data: {
            labels: example.words,
            datasets: [{
                label: 'Probability',
                data: probabilities,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1,
                borderRadius: 2,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const probability = context.parsed.y;
                            const percentage = (probability * 100).toFixed(1);
                            return `${context.label}: ${percentage}%`;
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: function(value, context) {
                        const percentage = (value * 100).toFixed(1);
                        return percentage + '%';
                    },
                    color: '#333',
                    font: {
                        weight: 'bold',
                        size: 11
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        callback: function(value) {
                            return (value * 100).toFixed(0) + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Probability'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Words'
                    }
                }
            },
            animation: {
                duration: 300,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function updateTreemap() {
    const example = examples[currentExample];
    const probabilities = calculateSoftmax(example.logits, temperature);
    
    // Prepare data for treemap
    const treemapData = example.words.map((word, index) => ({
        word: word,
        value: probabilities[index],
        percentage: (probabilities[index] * 100).toFixed(1)
    }));
    
    
    // If treemap exists and it's the same example, just update the data
    if (treemapChart && treemapChart.data.datasets[0].tree.length === treemapData.length) {
        // Update the data without recreating
        treemapChart.data.datasets[0].tree = treemapData;
        treemapChart.update('none'); // No animation for smooth transition
        return;
    }
    
    // If treemap exists but different example, destroy it
    if (treemapChart) {
        treemapChart.destroy();
        treemapChart = null;
    }
    
    // Create new treemap
    const ctx = document.getElementById('treemapChart').getContext('2d');
    
    treemapChart = new Chart(ctx, {
        type: 'treemap',
        data: {
            datasets: [{
                tree: treemapData,
                key: 'value',
                groups: ['word'],
                backgroundColor: function(ctx) {
                    // Generate different shades of blue based on value
                    if (ctx.raw && ctx.raw._data && ctx.raw._data.value) {
                        const value = ctx.raw._data.value;
                        const alpha = 0.3 + (value * 0.5);
                        return `rgba(0, 102, 204, ${alpha})`;
                    }
                    return 'rgba(0, 102, 204, 0.7)'; // fallback color
                },
                borderColor: 'rgba(0, 102, 204, 1)',
                borderWidth: 2,
                spacing: 1,
                labels: {
                    display: true,
                    formatter: function(ctx) {
                        if (ctx.raw && ctx.raw._data) {
                            return ctx.raw._data.word;
                        }
                        return '';
                    },
                    color: 'white',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            if (context[0] && context[0].raw && context[0].raw._data) {
                                return context[0].raw._data.word || '';
                            }
                            return '';
                        },
                        label: function(context) {
                            // Get the value directly from the context's raw data
                            if (context.raw && context.raw.v !== undefined) {
                                const probability = context.raw.v;
                                const percentage = (probability * 100).toFixed(1);
                                return `Probability: ${percentage}%`;
                            }
                            return 'Probability: 0%';
                        }
                    }
                }
            }
        }
    });
}

// Word management functions
function updateWord(index, type, value) {
    const example = examples[currentExample];
    
    if (type === 'word') {
        const trimmedValue = value.trim();
        if (!trimmedValue) {
            // Reset to original value if empty
            updateWordsDisplay();
            return;
        }
        
        // Check for duplicates (excluding current word)
        const isDuplicate = example.words.some((word, i) => 
            i !== index && word.toLowerCase() === trimmedValue.toLowerCase()
        );
        
        if (isDuplicate) {
            alert('This word already exists.');
            updateWordsDisplay();
            return;
        }
        
        example.words[index] = trimmedValue;
    } else if (type === 'logit') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            // Reset to original value if invalid
            updateWordsDisplay();
            return;
        }
        example.logits[index] = numValue;
    }
    
    // Update visualization
    updateVisualization();
}

function addWord() {
    const newWordInput = document.getElementById('newWordInput');
    const newLogitInput = document.getElementById('newLogitInput');
    const example = examples[currentExample];
    
    const word = newWordInput.value.trim();
    const logit = parseFloat(newLogitInput.value);
    
    // Validation
    if (!word) {
        alert('Please enter a word.');
        newWordInput.focus();
        return;
    }
    
    if (isNaN(logit)) {
        alert('Please enter a valid logit value.');
        newLogitInput.focus();
        return;
    }
    
    if (example.words.length >= 10) {
        alert('Maximum of 10 words allowed.');
        return;
    }
    
    // Check for duplicate words
    if (example.words.some(existingWord => existingWord.toLowerCase() === word.toLowerCase())) {
        alert('This word already exists.');
        newWordInput.focus();
        return;
    }
    
    // Add the word
    example.words.push(word);
    example.logits.push(logit);
    
    // Clear inputs
    newWordInput.value = '';
    newLogitInput.value = '';
    
    // Update visualization
    updateVisualization();
}

function deleteWord(index) {
    const example = examples[currentExample];
    
    // Prevent deleting if only one word remains
    if (example.words.length <= 1) {
        alert('At least one word must remain.');
        return;
    }
    
    // Remove the word and logit
    example.words.splice(index, 1);
    example.logits.splice(index, 1);
    
    // Update visualization
    updateVisualization();
}

function updateAddButtonState() {
    const addWordBtn = document.getElementById('addWordBtn');
    const example = examples[currentExample];
    
    if (example.words.length >= 10) {
        addWordBtn.disabled = true;
        addWordBtn.title = 'Maximum 10 words allowed';
    } else {
        addWordBtn.disabled = false;
        addWordBtn.title = 'Add word';
    }
}

// Sampling functions
function updateSamplingSentenceDisplay() {
    const sentencePrefix = document.querySelector('.sentence-prefix');
    const example = examples[currentExample];
    
    // Extract the sentence without the "..." at the end
    const baseSentence = example.sentence.replace(/\.\.\.$/, '');
    sentencePrefix.textContent = baseSentence;
    
    // Clear any previously sampled word
    const sampledWordElement = document.getElementById('sampledWord');
    sampledWordElement.textContent = '';
    sampledWordElement.style.color = '';
}

function sampleWord() {
    const example = examples[currentExample];
    const probabilities = calculateSoftmax(example.logits, temperature);
    
    // Sample a word based on the probability distribution
    const sampledIndex = sampleFromDistribution(probabilities);
    const sampledWord = example.words[sampledIndex];
    
    // Update the display
    const sampledWordElement = document.getElementById('sampledWord');
    sampledWordElement.textContent = ' ' + sampledWord;
    sampledWordElement.style.color = '#0066cc'; // Blue color
    
    // Add blue dot to treemap
    addBlueDotToTreemap(sampledIndex);
}

function sampleFromDistribution(probabilities) {
    // Generate a random number between 0 and 1
    const random = Math.random();
    
    // Find the index where the cumulative probability exceeds the random number
    let cumulativeProb = 0;
    for (let i = 0; i < probabilities.length; i++) {
        cumulativeProb += probabilities[i];
        if (random <= cumulativeProb) {
            return i;
        }
    }
    
    // Fallback to last index (should not happen with proper probabilities)
    return probabilities.length - 1;
}

// Blue dot functions
function removeBlueDot() {
    if (currentDot) {
        currentDot.remove();
        currentDot = null;
    }
}

function createBlueDot(x, y) {
    const dot = document.createElement('div');
    dot.className = 'blue-sampling-dot';
    dot.style.position = 'absolute';
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    dot.style.width = '8px';
    dot.style.height = '8px';
    dot.style.backgroundColor = '#0066ff';
    dot.style.borderRadius = '50%';
    dot.style.zIndex = '1000';
    dot.style.pointerEvents = 'none';
    dot.style.boxShadow = '0 0 6px rgba(0, 102, 255, 0.8)';
    dot.style.animation = 'blueDotPulse 1.5s ease-in-out infinite';
    
    return dot;
}

function getTreemapRectForWord(wordIndex) {
    if (!treemapChart) return null;
    
    const example = examples[currentExample];
    const targetWord = example.words[wordIndex];
    
    // Get the treemap elements from the chart
    const elements = treemapChart.getDatasetMeta(0).data;
    if (!elements) return null;
    
    // Find the element that matches our target word
    let targetElement = null;
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        
        // Try different ways to access the word data
        let elementWord = null;
        
        // Method 1: Try accessing through _data
        if (element._data && element._data.word) {
            elementWord = element._data.word;
        }
        // Method 2: Try accessing through options or other properties
        else if (element.options && element.options.word) {
            elementWord = element.options.word;
        }
        // Method 3: Try accessing through $context
        else if (element.$context && element.$context.raw && element.$context.raw._data) {
            elementWord = element.$context.raw._data.word;
        }
        // Method 4: Direct raw access
        else if (element.raw && element.raw.word) {
            elementWord = element.raw.word;
        }
        
        if (elementWord === targetWord) {
            targetElement = element;
            break;
        }
    }
    
    if (!targetElement) {
        return null;
    }
    
    // Get the rectangle bounds
    const rect = targetElement.getProps(['x', 'y', 'width', 'height']);
    return rect;
}

function addBlueDotToTreemap(wordIndex) {
    // Remove existing dot
    removeBlueDot();
    
    // Get the rectangle for this word in the treemap
    const rect = getTreemapRectForWord(wordIndex);
    if (!rect) return;
    
    // Get the treemap canvas container position
    const treemapContainer = document.querySelector('.treemap-container');
    const containerRect = treemapContainer.getBoundingClientRect();
    
    // Generate random position within the word's rectangle
    const randomX = rect.x + Math.random() * rect.width;
    const randomY = rect.y + Math.random() * rect.height;
    
    // Create and position the dot
    const dot = createBlueDot(randomX, randomY);
    treemapContainer.style.position = 'relative';
    treemapContainer.appendChild(dot);
    
    // Store reference to current dot
    currentDot = dot;
}
