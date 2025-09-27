// Game state variables
let gameState = {
    mode: 'pvp', // 'pvp' or 'ai'
    currentRound: 0,
    totalRounds: 10,
    player1Score: 0,
    player2Score: 0,
    player1Choices: [],
    player2Choices: [],
    gameHistory: [],
    gameActive: false,
    player1Choice: null,
    player2Choice: null,
    aiLastChoice: 'cooperate', // For tit-for-tat strategy
    tensionLevel: 20,
    player1Mood: 'neutral',
    player2Mood: 'neutral',
    roundTimer: null,
    choicePreviewActive: false
};

// Strategic hints for different situations
const strategicHints = [
    "In the first round, cooperation often builds trust...",
    "Tit-for-tat strategy: cooperate first, then copy opponent's last move.",
    "Betrayal can be profitable short-term, but damages long-term trust.",
    "Mutual cooperation yields the best collective outcome.",
    "Consider your opponent's pattern - are they predictable?",
    "Sometimes forgiveness after betrayal can reset the relationship.",
    "The shadow of the future makes cooperation more likely.",
    "In the final rounds, the temptation to betray increases.",
    "Trust is hard to build but easy to destroy.",
    "Your reputation affects how others play against you."
];

// Psychology insights
const psychologyTexts = [
    "Players often mirror each other's behavior in repeated games...",
    "The fear of being betrayed can lead to defensive strategies...",
    "Successful players balance self-interest with cooperation...",
    "Early cooperation signals trustworthiness and long-term thinking...",
    "Betrayal creates emotional responses that affect future decisions...",
    "The endgame effect: cooperation often breaks down in final rounds...",
    "Social learning: players adapt their strategies based on outcomes...",
    "Risk-averse players tend to cooperate more than risk-seekers..."
];

// Drama texts for different outcomes
const dramaTexts = {
    'cooperate-cooperate': ["🤝 Perfect Harmony!", "✨ Trust Prevails!", "🌟 Mutual Success!"],
    'cooperate-betray': ["💔 Trust Betrayed!", "😢 The Sucker's Payoff!", "💸 Exploited!"],
    'betray-cooperate': ["💰 Opportunistic Strike!", "👑 Exploitation Success!", "⚡ Taking Advantage!"],
    'betray-betray': ["💥 Mutual Destruction!", "🔥 Trust Breakdown!", "⚔️ War of All!"]
};

// Scenario-based contexts for decision making
const gameScenarios = [
    {
        title: "🤝 Business Partnership",
        description: "You and your business partner must decide whether to share crucial market intelligence that could benefit both companies or keep it secret for competitive advantage.",
        stakes: "Your partnership's future and market position depend on trust",
        cooperateAction: "Share Information",
        betrayAction: "Keep Secret", 
        cooperateTooltip: "Build partnership trust and mutual success",
        betrayTooltip: "Gain competitive advantage but risk partnership"
    },
    {
        title: "🏠 Roommate Dilemma", 
        description: "You and your roommate need to decide whether to contribute to expensive apartment maintenance or let the other person handle (and pay for) it.",
        stakes: "Living conditions and friendship are at stake",
        cooperateAction: "Pay Share",
        betrayAction: "Skip Payment",
        cooperateTooltip: "Maintain apartment and friendship", 
        betrayTooltip: "Save money but burden roommate"
    },
    {
        title: "🚗 Traffic Merge",
        description: "At a busy intersection, you and another driver must decide whether to yield and take turns or aggressively try to go first.",
        stakes: "Traffic flow and road safety depend on cooperation",
        cooperateAction: "Yield Turn",
        betrayAction: "Cut In Line",
        cooperateTooltip: "Keep traffic flowing smoothly",
        betrayTooltip: "Get ahead but create traffic jam"
    },
    {
        title: "📚 Study Group",
        description: "Before an important exam, you and your study partner must decide whether to share your best notes and preparation materials.",
        stakes: "Your grades and academic reputation are on the line",
        cooperateAction: "Share Notes", 
        betrayAction: "Keep Private",
        cooperateTooltip: "Help each other succeed",
        betrayTooltip: "Maintain grade advantage"
    },
    {
        title: "💼 Team Project",
        description: "You and a colleague must decide how much effort to put into a shared project that will affect both your performance reviews.",
        stakes: "Career advancement and team reputation depend on collaboration",
        cooperateAction: "Work Hard",
        betrayAction: "Slack Off",
        cooperateTooltip: "Ensure project success for both",
        betrayTooltip: "Let partner do the work"
    },
    {
        title: "🌍 Environmental Choice",
        description: "You and your neighbor must decide whether to invest in expensive eco-friendly upgrades that benefit the whole community.",
        stakes: "Environmental impact and community leadership are at stake",
        cooperateAction: "Go Green",
        betrayAction: "Stay Cheap", 
        cooperateTooltip: "Lead environmental change together",
        betrayTooltip: "Save money, let others pay for change"
    },
    {
        title: "🎮 Gaming Alliance",
        description: "In an online game, you and another player must decide whether to share rare resources or hoard them for personal advantage.",
        stakes: "Your gaming reputation and alliance strength depend on trust",
        cooperateAction: "Share Resources",
        betrayAction: "Hoard Items",
        cooperateTooltip: "Strengthen alliance for long-term success",
        betrayTooltip: "Maximize personal gaming advantage"
    }
];

// Relationship status tracking
let relationshipLevel = 50; // 0-100, starts neutral

// Mood system
const moods = {
    happy: { emoji: '😊', text: 'Happy' },
    neutral: { emoji: '😐', text: 'Neutral' },
    suspicious: { emoji: '🤨', text: 'Suspicious' },
    angry: { emoji: '😠', text: 'Angry' },
    disappointed: { emoji: '😞', text: 'Disappointed' },
    confident: { emoji: '😎', text: 'Confident' },
    worried: { emoji: '😰', text: 'Worried' }
};

// Payoff matrix: [player1_payoff, player2_payoff]
const payoffMatrix = {
    'cooperate-cooperate': [3, 3],
    'cooperate-betray': [0, 5],
    'betray-cooperate': [5, 0],
    'betray-betray': [1, 1]
};

// Chart instance
let scoreChart = null;

// Sound effects (using Web Audio API for better browser compatibility)
const soundEffects = {
    buttonClick: () => playTone(800, 100, 'square'),
    cooperate: () => playTone(600, 200, 'sine'),
    betray: () => playTone(300, 200, 'sawtooth'),
    roundComplete: () => playChord([400, 500, 600], 300),
    victory: () => playVictoryFanfare(),
    gameStart: () => playTone(1000, 150, 'triangle')
};

// Web Audio API setup
let audioContext;
try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
    console.log('Web Audio API not supported');
}

function playTone(frequency, duration, waveType = 'sine', volume = 0.1) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = waveType;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
}

function playChord(frequencies, duration) {
    frequencies.forEach((freq, i) => {
        setTimeout(() => playTone(freq, duration, 'sine', 0.05), i * 50);
    });
}

function playVictoryFanfare() {
    const melody = [523, 659, 784, 1047]; // C, E, G, C
    melody.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 200, 'triangle', 0.08), i * 100);
    });
}

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeChart();
});

function initializeEventListeners() {
    // Game controls
    document.getElementById('startGame').addEventListener('click', startNewGame);
    document.getElementById('resetGame').addEventListener('click', resetGame);
    
    // Game mode and rounds selection
    document.getElementById('gameMode').addEventListener('change', function() {
        gameState.mode = this.value;
        updatePlayerInterface();
    });
    
    document.getElementById('totalRounds').addEventListener('change', function() {
        const customInput = document.getElementById('customRounds');
        if (this.value === 'custom') {
            customInput.style.display = 'inline-block';
            customInput.focus();
        } else {
            customInput.style.display = 'none';
            gameState.totalRounds = parseInt(this.value);
        }
    });
    
    document.getElementById('customRounds').addEventListener('change', function() {
        gameState.totalRounds = parseInt(this.value) || 10;
    });
    
    // Initialize the interactive elements after DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                updateGameStatus();
                updateStrategicHint();
                updateTensionMeter();
                updatePlayerMoods();
                updatePsychologyPanel();
            }, 100);
        });
    } else {
        setTimeout(() => {
            updateGameStatus();
            updateStrategicHint();
            updateTensionMeter();
            updatePlayerMoods();
            updatePsychologyPanel();
        }, 100);
    }
}

function startNewGame() {
    // Play game start sound
    soundEffects.gameStart();
    
    // Reset game state
    gameState.currentRound = 1;
    gameState.player1Score = 0;
    gameState.player2Score = 0;
    gameState.player1Choices = [];
    gameState.player2Choices = [];
    gameState.gameHistory = [];
    gameState.gameActive = true;
    gameState.player1Choice = null;
    gameState.player2Choice = null;
    gameState.aiLastChoice = 'cooperate';
    gameState.tensionLevel = 20;
    gameState.player1Mood = 'neutral';
    gameState.player2Mood = 'neutral';
    
    // Reset relationship level
    relationshipLevel = 50;
    
    // Get total rounds
    const roundsSelect = document.getElementById('totalRounds');
    if (roundsSelect.value === 'custom') {
        gameState.totalRounds = parseInt(document.getElementById('customRounds').value) || 10;
    } else {
        gameState.totalRounds = parseInt(roundsSelect.value);
    }
    
    // Show scenario section and set up first scenario
    document.getElementById('scenarioSection').style.display = 'block';
    loadNewScenario();
    
    // Update UI with animations
    const gameArea = document.getElementById('gameArea');
    gameArea.style.display = 'block';
    gameArea.classList.add('fade-in');
    
    // Show game-related sections
    document.getElementById('scoreboard').style.display = 'block';
    document.getElementById('chartSection').style.display = 'block';
    document.getElementById('roundsHistory').style.display = 'block';
    document.getElementById('statistics').style.display = 'none';
    
    document.getElementById('currentRound').textContent = gameState.currentRound;
    document.getElementById('displayTotalRounds').textContent = gameState.totalRounds;
    
    // Initialize interactive elements
    updateGameStatus();
    updateStrategicHint();
    updateTensionMeter();
    updatePlayerMoods();
    updatePsychologyPanel();
    
    document.getElementById('roundResult').style.display = 'none';
    
    // Clear previous choices
    clearChoiceDisplays();
    updateScoreboard();
    updatePlayerInterface();
    clearHistory();
    initializeChart();
    
    // Enable player buttons
    enablePlayerButtons();
    
    // Add entrance animations to player areas
    document.querySelector('.player1').classList.add('slide-in-left');
    setTimeout(() => {
        if (gameState.mode === 'pvp') {
            document.querySelector('.player2').classList.add('slide-in-right');
        }
    }, 200);
    
    console.log('New game started:', gameState);
}

function updatePlayerInterface() {
    const player2Header = document.getElementById('player2Header');
    const player2Label = document.getElementById('player2Label');
    const player2Buttons = document.getElementById('player2Buttons');
    const player2Element = document.querySelector('.player2');
    
    if (gameState.mode === 'ai') {
        player2Header.textContent = '🤖 AI (Tit-for-Tat)';
        player2Label.textContent = 'AI:';
        player2Buttons.style.display = 'none';
        player2Element.classList.add('ai');
        
        // Add AI animation class
        player2Element.style.background = 'linear-gradient(135deg, rgba(123, 31, 162, 0.1), rgba(248, 249, 250, 0.95))';
    } else {
        player2Header.textContent = '🔴 Player 2';
        player2Label.textContent = 'Player 2:';
        player2Buttons.style.display = 'flex';
        player2Element.classList.remove('ai');
        player2Element.style.background = 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(248, 249, 250, 0.95))';
    }
    
    // Add entrance animation
    player2Element.classList.remove('slide-in-right');
    setTimeout(() => player2Element.classList.add('slide-in-right'), 10);
}

function makeChoice(player, choice) {
    if (!gameState.gameActive) return;
    
    // Play sound effect
    soundEffects.buttonClick();
    
    if (player === 1) {
        gameState.player1Choice = choice;
        const choiceElement = document.getElementById('player1Choice');
        choiceElement.textContent = choice === 'cooperate' ? '🤝 Cooperate' : '⚔️ Betray';
        choiceElement.className = `choice ${choice}`;
        
        // Add choice animation
        choiceElement.classList.add('bounce-in');
        
        // Play choice sound
        choice === 'cooperate' ? soundEffects.cooperate() : soundEffects.betray();
        
        // Disable player 1 buttons with animation
        const player1Buttons = document.querySelector('.player1 .player-buttons').children;
        for (let btn of player1Buttons) {
            btn.disabled = true;
            btn.classList.add('pulse');
        }
        
        // Add visual feedback to player 1 area
        document.querySelector('.player1').classList.add('glow');
    } else if (player === 2) {
        gameState.player2Choice = choice;
        const choiceElement = document.getElementById('player2Choice');
        choiceElement.textContent = choice === 'cooperate' ? '🤝 Cooperate' : '⚔️ Betray';
        choiceElement.className = `choice ${choice}`;
        
        // Add choice animation
        choiceElement.classList.add('bounce-in');
        
        // Play choice sound
        choice === 'cooperate' ? soundEffects.cooperate() : soundEffects.betray();
        
        // Disable player 2 buttons
        const player2Buttons = document.querySelector('.player2 .player-buttons').children;
        for (let btn of player2Buttons) {
            btn.disabled = true;
            btn.classList.add('pulse');
        }
        
        // Add visual feedback to player 2 area
        document.querySelector('.player2').classList.add('glow');
    }
    
    // In AI mode, make AI choice immediately after player 1 chooses
    if (gameState.mode === 'ai' && player === 1) {
        setTimeout(() => makeAIChoice(), 1000); // Small delay for realism
        return; // Don't check for round completion yet, AI will handle it
    }
    
    // Check if both players have made their choices (PvP mode only)
    if (gameState.player1Choice && gameState.player2Choice) {
        setTimeout(() => processRound(), 1500);
    }
}

function makeAIChoice() {
    let aiChoice;
    
    // Tit-for-Tat strategy
    if (gameState.currentRound === 1) {
        // AI cooperates on first round
        aiChoice = 'cooperate';
    } else {
        // AI copies the last move of player 1
        aiChoice = gameState.player1Choices[gameState.player1Choices.length - 1] || 'cooperate';
    }
    
    gameState.player2Choice = aiChoice;
    gameState.aiLastChoice = aiChoice;
    
    const choiceElement = document.getElementById('player2Choice');
    
    // AI thinking animation
    choiceElement.textContent = '🤔 Thinking...';
    choiceElement.className = 'choice thinking';
    
    setTimeout(() => {
        choiceElement.textContent = aiChoice === 'cooperate' ? '🤝 Cooperate' : '⚔️ Betray';
        choiceElement.className = `choice ${aiChoice}`;
        choiceElement.classList.add('bounce-in');
        
        // Play AI choice sound
        aiChoice === 'cooperate' ? soundEffects.cooperate() : soundEffects.betray();
        
        // Add glow effect to AI player
        document.querySelector('.player2').classList.add('glow');
        
        // Process round after AI choice is made
        setTimeout(() => processRound(), 1500);
    }, 800);
    
    console.log('AI chose:', aiChoice);
}

function processRound() {
    // Calculate payoffs
    const key = `${gameState.player1Choice}-${gameState.player2Choice}`;
    const payoffs = payoffMatrix[key];
    
    const player1Points = payoffs[0];
    const player2Points = payoffs[1];
    
    // Update scores
    gameState.player1Score += player1Points;
    gameState.player2Score += player2Points;
    
    // Store choices
    gameState.player1Choices.push(gameState.player1Choice);
    gameState.player2Choices.push(gameState.player2Choice);
    
    // Update strategy patterns
    updateStrategyPattern(1, gameState.player1Choice);
    updateStrategyPattern(2, gameState.player2Choice);
    
    // Update tension level
    const tensionChange = calculateTensionChange(gameState.player1Choice, gameState.player2Choice);
    gameState.tensionLevel = Math.max(0, Math.min(100, gameState.tensionLevel + tensionChange));
    updateTensionMeter();
    
    // Update player moods
    updateMoodsBasedOnOutcome(gameState.player1Choice, gameState.player2Choice, player1Points, player2Points);
    updatePlayerMoods();
    
    // Update relationship level based on choices
    updateRelationshipLevel(gameState.player1Choice, gameState.player2Choice);
    
    // Store round history
    gameState.gameHistory.push({
        round: gameState.currentRound,
        player1Choice: gameState.player1Choice,
        player2Choice: gameState.player2Choice,
        player1Points: player1Points,
        player2Points: player2Points,
        player1Total: gameState.player1Score,
        player2Total: gameState.player2Score
    });
    
    // Update UI
    updateScoreboard();
    updateChart();
    updateHistory();
    
    // Show round result with drama
    showRoundResultWithDrama(player1Points, player2Points, key);
    
    console.log(`Round ${gameState.currentRound} processed:`, {
        choices: key,
        payoffs: payoffs,
        scores: [gameState.player1Score, gameState.player2Score],
        tension: gameState.tensionLevel
    });
}

function showRoundResultWithDrama(p1Points, p2Points, key) {
    const resultDiv = document.getElementById('roundResult');
    const resultText = document.getElementById('resultText');
    const dramaText = document.getElementById('dramaText');
    const outcomeEffects = document.getElementById('outcomeEffects');
    const strategyAnalysis = document.getElementById('strategyAnalysis');
    
    // Play appropriate sound
    soundEffects.roundComplete();
    
    // Show drama text
    const dramas = dramaTexts[key];
    const selectedDrama = dramas[Math.floor(Math.random() * dramas.length)];
    dramaText.textContent = selectedDrama;
    
    // Show outcome effects
    switch(key) {
        case 'cooperate-cooperate':
            outcomeEffects.textContent = '✨🌟✨';
            break;
        case 'cooperate-betray':
            outcomeEffects.textContent = '💔⚡💔';
            break;
        case 'betray-cooperate':
            outcomeEffects.textContent = '💰👑💰';
            break;
        case 'betray-betray':
            outcomeEffects.textContent = '💥🔥💥';
            break;
    }
    
    // Original result text
    let message = `Player 1: ${gameState.player1Choice === 'cooperate' ? '🤝' : '⚔️'} (${p1Points} points) | `;
    message += `${gameState.mode === 'ai' ? 'AI' : 'Player 2'}: ${gameState.player2Choice === 'cooperate' ? '🤝' : '⚔️'} (${p2Points} points)`;
    resultText.textContent = message;
    
    // Strategy analysis
    let analysis = getStrategyAnalysis(key);
    strategyAnalysis.textContent = analysis;
    
    resultDiv.style.display = 'block';
    resultDiv.classList.add('fade-in');
    
    document.getElementById('gameStatus').textContent = `Round ${gameState.currentRound} completed!`;
    
    // Automatically proceed to next round after showing results
    setTimeout(() => {
        nextRound();
    }, 4000); // Give players 4 seconds to see the results
}

function getStrategyAnalysis(key) {
    const analyses = {
        'cooperate-cooperate': [
            "Mutual trust leads to optimal collective outcome!",
            "Both players chose the path of cooperation - wise decision!",
            "Trust begets trust - a positive feedback loop!"
        ],
        'cooperate-betray': [
            "Classic exploitation - one player took advantage of trust.",
            "The cooperator got burned - will they learn from this?",
            "Trust was rewarded with betrayal - a harsh lesson."
        ],
        'betray-cooperate': [
            "Opportunistic move - short-term gain at the cost of trust.",
            "The betrayer maximized immediate payoff but damaged reputation.",
            "Successful exploitation - but at what long-term cost?"
        ],
        'betray-betray': [
            "Mutual destruction - nobody wins in this scenario.",
            "Fear and suspicion led to the worst collective outcome.",
            "The Nash equilibrium in action - individually rational, collectively irrational."
        ]
    };
    
    const options = analyses[key];
    return options[Math.floor(Math.random() * options.length)];
}

function nextRound() {
    if (gameState.currentRound >= gameState.totalRounds) {
        endGame();
        return;
    }
    
    // Prepare for next round
    gameState.currentRound++;
    gameState.player1Choice = null;
    gameState.player2Choice = null;
    
    // Load new scenario for the new round
    loadNewScenario();
    
    // Update UI
    document.getElementById('currentRound').textContent = gameState.currentRound;
    updateGameStatus();
    updateStrategicHint();
    updatePsychologyPanel();
    document.getElementById('roundResult').style.display = 'none';
    
    // Clear choice displays
    clearChoiceDisplays();
    
    // Enable buttons
    enablePlayerButtons();
    
    // Add some dramatic pause for next round
    setTimeout(() => {
        document.getElementById('gameStatus').textContent = getContextualGameStatus();
    }, 1000);
}

function endGame() {
    gameState.gameActive = false;
    document.getElementById('gameArea').style.display = 'none';
    
    // Show final statistics
    showFinalStatistics();
    
    console.log('Game ended:', gameState);
}

function showFinalStatistics() {
    const statsDiv = document.getElementById('statistics');
    
    // Play victory sound
    soundEffects.victory();
    
    // Determine winner
    let winner = 'Tie';
    let winnerElement = null;
    
    if (gameState.player1Score > gameState.player2Score) {
        winner = 'Player 1';
        winnerElement = document.querySelector('.player1');
    } else if (gameState.player2Score > gameState.player1Score) {
        winner = gameState.mode === 'ai' ? 'AI' : 'Player 2';
        winnerElement = document.querySelector('.player2');
    }
    
    // Add victory animation to winner
    if (winnerElement) {
        winnerElement.classList.add('victory-dance');
        winnerElement.style.border = '3px solid gold';
        winnerElement.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.6)';
    }
    
    // Calculate cooperation percentages
    const p1Cooperations = gameState.player1Choices.filter(choice => choice === 'cooperate').length;
    const p2Cooperations = gameState.player2Choices.filter(choice => choice === 'cooperate').length;
    
    const p1CooperationRate = ((p1Cooperations / gameState.totalRounds) * 100).toFixed(1);
    const p2CooperationRate = ((p2Cooperations / gameState.totalRounds) * 100).toFixed(1);
    
    // Update statistics display with animations
    document.getElementById('winner').textContent = winner;
    document.getElementById('p1Cooperation').textContent = `${p1CooperationRate}%`;
    document.getElementById('p2Cooperation').textContent = `${p2CooperationRate}%`;
    document.getElementById('totalRoundsPlayed').textContent = gameState.totalRounds;
    
    // Animate statistics appearance
    statsDiv.style.display = 'block';
    statsDiv.classList.add('bounce-in');
    
    // Add confetti effect for winner
    if (winner !== 'Tie') {
        createConfetti();
    }
    
    // Animate individual stats
    const statValues = statsDiv.querySelectorAll('.stat-value');
    statValues.forEach((stat, index) => {
        setTimeout(() => {
            stat.classList.add('bounce-in');
        }, index * 100);
    });
}

// Confetti effect function
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#ffd700', '#ff6b6b'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.zIndex = '1000';
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            
            document.body.appendChild(confetti);
            
            // Animate confetti fall
            const fallDuration = 3000 + Math.random() * 2000;
            const horizontalMovement = (Math.random() - 0.5) * 200;
            
            confetti.animate([
                { transform: 'translateY(0px) translateX(0px) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight + 20}px) translateX(${horizontalMovement}px) rotate(720deg)`, opacity: 0 }
            ], {
                duration: fallDuration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                confetti.remove();
            };
        }, i * 100);
    }
}

function updateScoreboard() {
    document.getElementById('player1Score').textContent = gameState.player1Score;
    document.getElementById('player2Score').textContent = gameState.player2Score;
}

function clearChoiceDisplays() {
    document.getElementById('player1Choice').textContent = 'Waiting...';
    document.getElementById('player1Choice').className = 'choice';
    document.getElementById('player2Choice').textContent = 'Waiting...';
    document.getElementById('player2Choice').className = 'choice';
    
    // Remove glow effects
    document.querySelector('.player1').classList.remove('glow', 'victory-dance');
    document.querySelector('.player2').classList.remove('glow', 'victory-dance');
    
    // Reset winner styling
    document.querySelector('.player1').style.border = '';
    document.querySelector('.player1').style.boxShadow = '';
    document.querySelector('.player2').style.border = '';
    document.querySelector('.player2').style.boxShadow = '';
}

function enablePlayerButtons() {
    // Enable player 1 buttons
    const player1Buttons = document.querySelector('.player1 .player-buttons').children;
    for (let btn of player1Buttons) {
        btn.disabled = false;
        btn.classList.remove('pulse');
        
        // Add hover animation
        btn.addEventListener('mouseenter', () => {
            if (!btn.disabled) {
                btn.classList.add('pulse');
            }
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.classList.remove('pulse');
        });
    }
    
    // Enable player 2 buttons (only in PvP mode)
    if (gameState.mode === 'pvp') {
        const player2Buttons = document.querySelector('.player2 .player-buttons').children;
        for (let btn of player2Buttons) {
            btn.disabled = false;
            btn.classList.remove('pulse');
            
            // Add hover animation
            btn.addEventListener('mouseenter', () => {
                if (!btn.disabled) {
                    btn.classList.add('pulse');
                }
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.classList.remove('pulse');
            });
        }
    }
}

function resetGame() {
    gameState.gameActive = false;
    gameState.currentRound = 0;
    gameState.player1Score = 0;
    gameState.player2Score = 0;
    gameState.player1Choices = [];
    gameState.player2Choices = [];
    gameState.gameHistory = [];
    
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('statistics').style.display = 'none';
    
    updateScoreboard();
    clearHistory();
    initializeChart();
    
    console.log('Game reset');
}

function initializeChart() {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded - hiding chart section');
        const chartSection = document.getElementById('chartSection');
        if (chartSection) {
            chartSection.style.display = 'none';
        }
        return;
    }
    
    const ctx = document.getElementById('scoreChart').getContext('2d');
    
    if (scoreChart) {
        scoreChart.destroy();
    }
    
    try {
        scoreChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Player 1',
                data: [],
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                tension: 0.4,
                fill: false,
                pointBackgroundColor: '#007bff',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                borderWidth: 3
            }, {
                label: gameState.mode === 'ai' ? 'AI' : 'Player 2',
                data: [],
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.4,
                fill: false,
                pointBackgroundColor: '#dc3545',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutCubic'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Score',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#555'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Round',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#555'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Score Progression Throughout the Game',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#333'
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                point: {
                    hoverBorderWidth: 4
                }
            }
        }
    });
    } catch (error) {
        console.error('Error initializing Chart.js:', error);
        const chartSection = document.getElementById('chartSection');
        if (chartSection) {
            chartSection.style.display = 'none';
        }
    }
}

function updateChart() {
    if (!scoreChart || typeof Chart === 'undefined') return;
    
    const roundLabels = [];
    const player1Data = [];
    const player2Data = [];
    
    for (let i = 0; i < gameState.gameHistory.length; i++) {
        const round = gameState.gameHistory[i];
        roundLabels.push(`Round ${round.round}`);
        player1Data.push(round.player1Total);
        player2Data.push(round.player2Total);
    }
    
    scoreChart.data.labels = roundLabels;
    scoreChart.data.datasets[0].data = player1Data;
    scoreChart.data.datasets[1].data = player2Data;
    scoreChart.data.datasets[1].label = gameState.mode === 'ai' ? 'AI' : 'Player 2';
    
    // Enhanced animation for chart updates
    scoreChart.update('active');
    
    // Add sparkle effect to the chart container
    const chartContainer = document.querySelector('.chart-container');
    chartContainer.classList.add('glow');
    setTimeout(() => {
        chartContainer.classList.remove('glow');
    }, 1000);
}

function updateScoreboard() {
    const player1ScoreElement = document.getElementById('player1Score');
    const player2ScoreElement = document.getElementById('player2Score');
    
    // Animate score changes
    animateNumber(player1ScoreElement, parseInt(player1ScoreElement.textContent) || 0, gameState.player1Score);
    animateNumber(player2ScoreElement, parseInt(player2ScoreElement.textContent) || 0, gameState.player2Score);
    
    // Add pulse effect to scoreboard
    document.querySelector('.scoreboard').classList.add('pulse');
    setTimeout(() => {
        document.querySelector('.scoreboard').classList.remove('pulse');
    }, 1000);
}

function animateNumber(element, from, to) {
    const duration = 800;
    const steps = 20;
    const stepValue = (to - from) / steps;
    const stepTime = duration / steps;
    let currentValue = from;
    let currentStep = 0;
    
    const timer = setInterval(() => {
        currentStep++;
        currentValue += stepValue;
        
        if (currentStep >= steps) {
            currentValue = to;
            clearInterval(timer);
        }
        
        element.textContent = Math.round(currentValue);
        element.classList.add('score-update');
        
        setTimeout(() => {
            element.classList.remove('score-update');
        }, 100);
    }, stepTime);
}

// Add dynamic CSS for score animations
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .score-update {
            animation: scoreFlash 0.3s ease-out !important;
        }
        
        @keyframes scoreFlash {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); color: #ffd700; }
            100% { transform: scale(1); }
        }
        
        .chart-container.glow {
            box-shadow: 0 0 30px rgba(102, 126, 234, 0.3) !important;
        }
    `;
    document.head.appendChild(style);
}

// Initialize dynamic styles when page loads
document.addEventListener('DOMContentLoaded', addDynamicStyles);

// New interactive functions
function updateGameStatus() {
    const gameStatusElement = document.getElementById('gameStatus');
    if (!gameStatusElement) return;
    
    // Use contextual status messages instead of generic ones
    const contextualMessage = getContextualGameStatus();
    gameStatusElement.textContent = contextualMessage;
}

function updateStrategicHint() {
    const hintElement = document.getElementById('hintText');
    if (!hintElement) return;
    
    let hint;
    
    if (gameState.currentRound === 1) {
        hint = "In the first round, cooperation often builds trust...";
    } else if (gameState.currentRound >= gameState.totalRounds - 1) {
        hint = "Final rounds: the temptation to betray increases!";
    } else if (gameState.tensionLevel > 70) {
        hint = "High tension detected - consider de-escalation strategies.";
    } else {
        hint = strategicHints[Math.floor(Math.random() * strategicHints.length)];
    }
    
    hintElement.textContent = hint;
}

function updateTensionMeter() {
    const tensionFill = document.getElementById('tensionFill');
    const tensionEmoji = document.getElementById('tensionEmoji');
    
    if (!tensionFill || !tensionEmoji) return;
    
    tensionFill.style.width = gameState.tensionLevel + '%';
    
    if (gameState.tensionLevel < 30) {
        tensionEmoji.textContent = '😌';
    } else if (gameState.tensionLevel < 60) {
        tensionEmoji.textContent = '😐';
    } else if (gameState.tensionLevel < 80) {
        tensionEmoji.textContent = '😬';
    } else {
        tensionEmoji.textContent = '😤';
    }
}

function updatePlayerMoods() {
    updatePlayerMood(1, gameState.player1Mood);
    updatePlayerMood(2, gameState.player2Mood);
}

function updatePlayerMood(player, mood) {
    const moodElement = document.getElementById(`player${player}Mood`);
    const moodData = moods[mood];
    
    moodElement.innerHTML = `
        <span class="mood-emoji">${moodData.emoji}</span>
        <span class="mood-text">${moodData.text}</span>
    `;
}

function updateStrategyPattern(player, choice) {
    const iconsElement = document.getElementById(`player${player}Icons`);
    const icon = choice === 'cooperate' ? '🤝' : '⚔️';
    
    // Add new icon
    const iconSpan = document.createElement('span');
    iconSpan.className = 'strategy-icon';
    iconSpan.textContent = icon;
    iconSpan.style.animationDelay = '0.1s';
    
    iconsElement.appendChild(iconSpan);
    
    // Keep only last 5 choices
    while (iconsElement.children.length > 5) {
        iconsElement.removeChild(iconsElement.firstChild);
    }
}

function updatePsychologyPanel() {
    const psychologyText = document.getElementById('psychologyText');
    const randomInsight = psychologyTexts[Math.floor(Math.random() * psychologyTexts.length)];
    psychologyText.textContent = randomInsight;
}

function showChoicePreview(player, choice) {
    if (gameState.choicePreviewActive) return;
    
    gameState.choicePreviewActive = true;
    const battleEffects = document.getElementById('battleEffects');
    
    if (choice === 'cooperate') {
        battleEffects.textContent = '🕊️';
        battleEffects.style.color = '#28a745';
    } else {
        battleEffects.textContent = '⚡';
        battleEffects.style.color = '#dc3545';
    }
    
    battleEffects.classList.add('pulse');
}

function hideChoicePreview() {
    gameState.choicePreviewActive = false;
    const battleEffects = document.getElementById('battleEffects');
    battleEffects.textContent = '';
    battleEffects.classList.remove('pulse');
}

function calculateTensionChange(p1Choice, p2Choice) {
    const key = `${p1Choice}-${p2Choice}`;
    switch(key) {
        case 'cooperate-cooperate':
            return -15; // Reduces tension
        case 'betray-betray':
            return +25; // High tension
        case 'cooperate-betray':
        case 'betray-cooperate':
            return +10; // Moderate tension increase
        default:
            return 0;
    }
}

function updateMoodsBasedOnOutcome(p1Choice, p2Choice, p1Points, p2Points) {
    // Player 1 mood
    if (p1Choice === 'cooperate' && p2Choice === 'cooperate') {
        gameState.player1Mood = 'happy';
    } else if (p1Choice === 'cooperate' && p2Choice === 'betray') {
        gameState.player1Mood = 'disappointed';
    } else if (p1Choice === 'betray' && p2Choice === 'cooperate') {
        gameState.player1Mood = 'confident';
    } else {
        gameState.player1Mood = 'angry';
    }
    
    // Player 2 mood (similar logic)
    if (gameState.mode !== 'ai') {
        if (p2Choice === 'cooperate' && p1Choice === 'cooperate') {
            gameState.player2Mood = 'happy';
        } else if (p2Choice === 'cooperate' && p1Choice === 'betray') {
            gameState.player2Mood = 'disappointed';
        } else if (p2Choice === 'betray' && p1Choice === 'cooperate') {
            gameState.player2Mood = 'confident';
        } else {
            gameState.player2Mood = 'angry';
        }
    } else {
        // AI mood based on strategy
        gameState.player2Mood = Math.random() > 0.5 ? 'neutral' : 'suspicious';
    }
}

function updateHistory() {
    const tbody = document.getElementById('historyBody');
    const lastRound = gameState.gameHistory[gameState.gameHistory.length - 1];
    
    if (!lastRound) return;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${lastRound.round}</td>
        <td>${lastRound.player1Choice === 'cooperate' ? '🤝 Cooperate' : '⚔️ Betray'}</td>
        <td>${lastRound.player2Choice === 'cooperate' ? '🤝 Cooperate' : '⚔️ Betray'}</td>
        <td>${lastRound.player1Points}</td>
        <td>${lastRound.player2Points}</td>
    `;
    
    tbody.appendChild(row);
    
    // Scroll to bottom of history
    row.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function clearHistory() {
    document.getElementById('historyBody').innerHTML = '';
}

// Additional utility functions
function getRandomChoice() {
    return Math.random() < 0.5 ? 'cooperate' : 'betray';
}

function formatChoice(choice) {
    return choice === 'cooperate' ? '🤝 Cooperate' : '⚔️ Betray';
}

// Scenario Management Functions
function loadNewScenario() {
    const scenario = gameScenarios[Math.floor(Math.random() * gameScenarios.length)];
    
    // Update scenario display
    document.getElementById('scenarioTitle').textContent = scenario.title;
    document.getElementById('scenarioDescription').textContent = scenario.description;
    document.getElementById('stakesText').textContent = scenario.stakes;
    
    // Update button texts for both players
    updateButtonTexts(scenario);
    
    // Update relationship status
    updateRelationshipDisplay();
}

function updateButtonTexts(scenario) {
    // Player 1 buttons
    document.getElementById('player1CooperateText').textContent = scenario.cooperateAction;
    document.getElementById('player1BetrayText').textContent = scenario.betrayAction;
    document.getElementById('player1CooperateTooltip').textContent = scenario.cooperateTooltip;
    document.getElementById('player1BetrayTooltip').textContent = scenario.betrayTooltip;
    
    // Player 2 buttons (if in PvP mode)
    if (gameState.mode === 'pvp') {
        document.getElementById('player2CooperateText').textContent = scenario.cooperateAction;
        document.getElementById('player2BetrayText').textContent = scenario.betrayAction;
        document.getElementById('player2CooperateTooltip').textContent = scenario.cooperateTooltip;
        document.getElementById('player2BetrayTooltip').textContent = scenario.betrayTooltip;
    }
}

function updateRelationshipDisplay() {
    const relationshipBar = document.getElementById('relationshipBar');
    const relationshipText = document.getElementById('relationshipText');
    
    // Update relationship bar width
    if (relationshipBar) {
        relationshipBar.style.width = relationshipLevel + '%';
    }
    
    // Update relationship text
    let relationshipStatus;
    if (relationshipLevel >= 80) {
        relationshipStatus = 'Strong Trust';
    } else if (relationshipLevel >= 60) {
        relationshipStatus = 'Good Relations';
    } else if (relationshipLevel >= 40) {
        relationshipStatus = 'Neutral';
    } else if (relationshipLevel >= 20) {
        relationshipStatus = 'Strained';
    } else {
        relationshipStatus = 'Hostile';
    }
    
    if (relationshipText) {
        relationshipText.textContent = relationshipStatus;
    }
}

function updateRelationshipLevel(p1Choice, p2Choice) {
    if (p1Choice === 'cooperate' && p2Choice === 'cooperate') {
        relationshipLevel = Math.min(100, relationshipLevel + 8); // Both cooperate: +8
    } else if (p1Choice === 'betray' && p2Choice === 'betray') {
        relationshipLevel = Math.max(0, relationshipLevel - 12); // Both betray: -12
    } else {
        relationshipLevel = Math.max(0, relationshipLevel - 5); // Mixed: -5
    }
    
    updateRelationshipDisplay();
}

function getContextualGameStatus() {
    const contextualMessages = [
        "Consider the consequences of your choice...",
        "What would you do in this real-world situation?",
        "Trust and reputation are built over time...", 
        "Short-term gain vs. long-term relationships...",
        "Your decision affects future interactions...",
        "Think about the other person's perspective...",
        "Cooperation often leads to better outcomes for all...",
        "But sometimes you need to protect your own interests..."
    ];
    
    return contextualMessages[Math.floor(Math.random() * contextualMessages.length)];
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gameState,
        payoffMatrix,
        makeChoice,
        processRound,
        startNewGame,
        resetGame,
        loadNewScenario,
        updateRelationshipLevel
    };
}
