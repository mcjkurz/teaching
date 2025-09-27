# Interactive Teaching Visualizations

A collection of interactive web-based visualizations for teaching machine learning concepts. Built with HTML, CSS, and JavaScript for easy deployment on GitHub Pages.

## 🎯 Purpose

This repository provides intuitive, visual explanations of complex machine learning concepts to help students understand fundamental algorithms and their behaviors.

## 📊 Current Visualizations

### 1. Softmax Temperature
- **Path**: `/visualizations/softmax-temperature.html`
- **Concept**: How temperature affects probability distributions in language models
- **Features**:
  - Interactive temperature slider (0.1 to 3.0)
  - Multiple sentence completion examples
  - Real-time probability bar chart updates
  - Mathematical formula display
  - Visual logits representation

## 🚀 Getting Started

### Local Development
1. Clone this repository
2. Open `index.html` in your web browser
3. Navigate to different visualizations

### GitHub Pages Deployment
This repository is configured for GitHub Pages deployment:
1. Go to your repository settings
2. Navigate to "Pages" section
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Your site will be available at `https://yourusername.github.io/repository-name`

## 🏗️ Project Structure

```
/
├── index.html              # Main landing page
├── styles/
│   ├── main.css           # Global styles
│   └── softmax.css        # Softmax visualization styles
├── scripts/
│   └── softmax.js         # Softmax visualization logic
├── visualizations/
│   └── softmax-temperature.html
└── README.md
```

## 🎨 Design Principles

- **Simple**: Clean, minimalist interface focused on the concept
- **Intuitive**: Interactive elements with immediate visual feedback
- **Educational**: Clear mathematical formulations and explanations
- **Responsive**: Works on desktop and mobile devices
- **Future-proof**: Modular structure for easy addition of new visualizations

## 🔧 Adding New Visualizations

1. Create a new HTML file in `/visualizations/`
2. Add corresponding CSS in `/styles/` if needed
3. Create JavaScript logic in `/scripts/`
4. Update `index.html` to include the new visualization card
5. Update this README

## 📚 Educational Context

### Softmax Temperature
The softmax function with temperature scaling is crucial in understanding:
- Language model output distributions
- Sampling strategies in text generation
- Temperature's effect on randomness vs. determinism
- Probability distribution sharpening/flattening

**Formula**: `P(word_i) = exp(logit_i / T) / Σ_j exp(logit_j / T)`

Where:
- `T` is the temperature parameter
- Lower T (< 1.0) creates sharper distributions
- Higher T (> 1.0) creates more uniform distributions

## 🤝 Contributing

Feel free to contribute new visualizations or improvements:
1. Fork the repository
2. Create a feature branch
3. Add your visualization following the existing patterns
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🔮 Future Visualizations

Planned additions:
- Attention mechanisms
- Gradient descent optimization
- Neural network layer transformations
- Transformer architecture components
- Loss function landscapes
