# Prisoner's Dilemma Game

A modern web application implementing the classic game theory problem with interactive visualization and artificial intelligence.

## Overview

This project demonstrates fundamental game theory concepts through an engaging, browser-based implementation of the Prisoner's Dilemma. Built with vanilla JavaScript, it features real-time data visualization, strategic AI opponents, and comprehensive analytics.

## Features

### Game Modes
- **Human vs Human**: Traditional two-player gameplay
- **Human vs AI**: Play against Tit-for-Tat strategy implementation

### Core Functionality
- Dynamic scoreboard with live chart updates
- Configurable game length (1-5 rounds or custom)
- Real-time strategic analysis and psychological insights
- Responsive design optimized for all devices
- Comprehensive game statistics and history tracking

### Visual Elements
- Interactive Chart.js visualizations
- Smooth CSS3 animations and transitions
- Modern glassmorphism UI design
- Mobile-responsive layout

## Game Mechanics

**Standard Payoff Matrix:**
```
                Player 2
              C       D
Player 1  C  (3,3)   (0,5)
          D  (5,0)   (1,1)
```

Where C = Cooperate, D = Defect (Betray)

## Technical Implementation

**Frontend Stack:**
- HTML5 with semantic markup
- CSS3 with advanced animations
- Vanilla JavaScript (ES6+)
- Chart.js for data visualization

**Architecture:**
- Modular JavaScript design
- Event-driven user interactions  
- State management system
- Responsive CSS Grid/Flexbox layout

## Installation & Usage

1. Clone the repository
2. Open `index.html` in a modern web browser
3. No build process or dependencies required

## AI Strategy

The AI implements the **Tit-for-Tat** strategy:
- Cooperates on the first round
- Subsequently mirrors the opponent's previous move
- Proven effective in evolutionary game theory tournaments

## Educational Applications

This implementation serves as a practical demonstration of:
- **Nash Equilibrium** concepts
- **Pareto Efficiency** vs individual rationality
- **Iterated game dynamics**
- **Strategic decision-making** under uncertainty

## Browser Support

Compatible with all modern browsers supporting ES6+ features:
- Chrome 60+
- Firefox 55+  
- Safari 12+
- Edge 79+

## License

Open source - feel free to fork, modify, and distribute.

---

*Built for educational purposes and game theory research.*
