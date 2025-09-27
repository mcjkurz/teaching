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
}

function updateVisualization() {
    updateSentenceDisplay();
    updateWordsDisplay();
    updateChart();
    updateTreemap();
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
            <span class="word-text">${word}</span>
            <span class="word-logit">${example.logits[index].toFixed(1)}</span>
        `;
        wordsColumn.appendChild(wordItem);
    });
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
                            // Access from dataset tree
                            const dataIndex = context.dataIndex;
                            if (context.dataset && context.dataset.tree && context.dataset.tree[dataIndex]) {
                                const treeItem = context.dataset.tree[dataIndex];
                                if (treeItem.percentage) {
                                    return `Probability: ${treeItem.percentage}%`;
                                }
                            }
                            return 'Probability: 0%';
                        }
                    }
                }
            }
        }
    });
}
