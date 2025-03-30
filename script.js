window.onload = function() {
  // Global game variables
  let players = []; // players[0] is you; players[1-3] are bots
  let deck = [];    // Cards numbered 1-100
  let currentRound = 0;
  const totalRounds = 10;
  const roles = ["Businessman", "Diplomat", "Athlete"];
  let playerRole = "";
  // Each card is stored as an object: { value: number, used: boolean }
  let playerHand = [];
  let selectedCardIndex = null; // Index in playerHand of selected card

  // Manual keep count (limited to 2 per game)
  let manualKeepCount = 0;
  const maxManualKeeps = 2;

  // ---------------------
  // Utility Functions
  // ---------------------
  function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  function initializeDeck() {
    deck = [];
    for (let i = 1; i <= 100; i++) {
      deck.push(i);
    }
    shuffleDeck();
  }

  // ---------------------
  // Navigation Functions
  // ---------------------
  // Hide all pages including menu to start fresh.
  function hideAllPages() {
    document.querySelectorAll("div[id$='Page'], #menu").forEach(page => page.classList.add("hidden"));
  }

  window.goToMenu = function() {
    hideAllPages();
    document.getElementById("menu").classList.remove("hidden");
  };

  window.showHowToPlay = function() {
    hideAllPages();
    document.getElementById("howToPlayPage").classList.remove("hidden");
  };

  window.showSettings = function() {
    hideAllPages();
    document.getElementById("settingsPage").classList.remove("hidden");
  };

  window.showCredits = function() {
    hideAllPages();
    document.getElementById("creditsPage").classList.remove("hidden");
  };

  window.showRoleSelection = function() {
    hideAllPages();
    document.getElementById("roleSelectionPage").classList.remove("hidden");
    generateRoleBoxes();
  };

  // ---------------------
  // Role Selection Functions
  // ---------------------
  function generateRoleBoxes() {
    const boxesContainer = document.getElementById("roleBoxes");
    boxesContainer.innerHTML = "";
    // Generate 10 boxes (visual selection)
    for (let i = 0; i < 10; i++) {
      const box = document.createElement("div");
      box.className = "roleBox";
      box.textContent = i + 1;
      box.onclick = assignPlayerRole;
      boxesContainer.appendChild(box);
    }
  }

  function assignPlayerRole() {
    const randomIndex = Math.floor(Math.random() * roles.length);
    playerRole = roles[randomIndex];
    // Initialize player and bots:
    players[0] = { id: 0, sum: 0, role: playerRole };
    for (let i = 1; i < 4; i++) {
      const botRole = roles[Math.floor(Math.random() * roles.length)];
      // Bots will draw a card each round (hidden)
      players[i] = { id: i, sum: 0, role: botRole, currentCard: null };
    }
    document.getElementById("playerRoleDisplay").textContent = playerRole;
    document.getElementById("playerRole").textContent = playerRole;
    document.getElementById("selectedRole").classList.remove("hidden");
  }

  // ---------------------
  // Game Functions
  // ---------------------
  window.startGame = function() {
    hideAllPages();
    document.getElementById("gamePage").classList.remove("hidden");
    currentRound = 0;
    playerHand = [];
    selectedCardIndex = null;
    manualKeepCount = 0;
    initializeDeck();
    // If player role not set, assign default:
    if (!players[0]) {
      players[0] = { id: 0, sum: 0, role: "Diplomat" };
      for (let i = 1; i < 4; i++) {
        players[i] = { id: i, sum: 0, role: roles[Math.floor(Math.random() * roles.length)], currentCard: null };
      }
      playerRole = players[0].role;
      document.getElementById("playerRole").textContent = playerRole;
    }
    updateDisplay();
    document.getElementById("drawCardBtn").style.display = "block";
  };

  // When player clicks "Draw Card", add a new card to the hand.
  window.drawCard = function() {
    if (currentRound < totalRounds && deck.length >= 4) {
      const drawnCard = deck.pop();
      playerHand.push({ value: drawnCard, used: false });
      updatePlayerHandDisplay();
      // Each bot draws a hidden card for this round.
      for (let i = 1; i < 4; i++) {
        players[i].currentCard = deck.pop();
      }
      // Allow player to select a card from hand for trading.
      document.getElementById("drawCardBtn").style.display = "none";
      showBotSelection();
    }
  };

  // Update player's hand display (all drawn cards, marking used ones).
  function updatePlayerHandDisplay() {
    const handDiv = document.getElementById("playerHand");
    handDiv.innerHTML = "";
    playerHand.forEach((card, index) => {
      const cardDiv = document.createElement("div");
      cardDiv.className = "handCard";
      if (card.used) {
        cardDiv.classList.add("used");
      }
      cardDiv.textContent = card.value;
      if (!card.used) {
        cardDiv.onclick = () => selectHandCard(index);
      }
      if (index === selectedCardIndex) {
        cardDiv.classList.add("selected");
      }
      handDiv.appendChild(cardDiv);
    });
  }

  // When player clicks a card in hand.
  function selectHandCard(index) {
    if (playerHand[index].used) return;
    selectedCardIndex = index;
    updatePlayerHandDisplay();
  }

  // Show bot selection options.
  function showBotSelection() {
    document.getElementById("botSelection").classList.remove("hidden");
  }

  // Hide bot selection panel.
  function hideBotSelection() {
    document.getElementById("botSelection").classList.add("hidden");
  }

  // Bot decision function: based solely on its own hidden card.
  function botWillingToTrade(bot) {
    if (bot.role === "Businessman") {
      return bot.currentCard < 50;
    } else if (bot.role === "Athlete") {
      return bot.currentCard > 50;
    } else if (bot.role === "Diplomat") {
      return (bot.currentCard < 40 || bot.currentCard > 60);
    }
    return false;
  }

  // Called when player selects a bot to trade with.
  window.initiateTrade = function(botIndex) {
    if (selectedCardIndex === null) {
      alert("Please select a card from your hand first.");
      return;
    }
    hideBotSelection();
    const selectedCard = playerHand[selectedCardIndex];
    const playerCardValue = selectedCard.value;
    const bot = players[botIndex];
    // Bot decides based on its own card (without knowing your card).
    if (botWillingToTrade(bot)) {
      // Trade accepted: swap cards.
      const temp = playerCardValue;
      selectedCard.value = bot.currentCard;
      bot.currentCard = temp;
      showMessage("Bot " + botIndex + " accepted the trade!");
      // In accepted trades, do NOT finalize the card so you may trade it again.
    } else {
      // Trade rejected: automatically keep (finalize) your selected card.
      showMessage("Bot " + botIndex + " rejected the trade. Your card is kept.");
      finalizeCard(selectedCardIndex);
    }
    selectedCardIndex = null;
    finalizeRound();
    updateDisplay();
  };

  // Manual "Keep Selected Card" action.
  function keepSelectedCard() {
    if (selectedCardIndex === null) {
      alert("Please select a card from your hand first.");
      return;
    }
    if (manualKeepCount >= maxManualKeeps) {
      alert("You have reached the maximum of " + maxManualKeeps + " manual keeps.");
      return;
    }
    manualKeepCount++;
    showMessage("You kept your card.");
    finalizeCard(selectedCardIndex);
    selectedCardIndex = null;
    finalizeRound();
    updateDisplay();
  }
  // Expose keepSelectedCard to global scope.
  window.keepSelectedCard = keepSelectedCard;

  // Finalize (keep) a card: mark it as used and add its value to player's total.
  function finalizeCard(index) {
    const card = playerHand[index];
    card.used = true;
    players[0].sum += card.value;
  }

  // Finalize round: increment round counter and show draw button if rounds remain.
  function finalizeRound() {
    currentRound++;
    if (currentRound < totalRounds) {
      document.getElementById("drawCardBtn").style.display = "block";
    } else {
      showGuessSidebar();
    }
  }

  // Display temporary message.
  function showMessage(msg) {
    const msgDiv = document.getElementById("message");
    msgDiv.textContent = msg;
    msgDiv.classList.remove("hidden");
    setTimeout(function() {
      msgDiv.classList.add("hidden");
    }, 1500);
  }

  // Update control displays.
  function updateDisplay() {
    document.getElementById("playerSum").textContent = players[0].sum;
    document.getElementById("roundCounter").textContent = currentRound + 1;
    updatePlayerHandDisplay();
  }

  // End Game: Show Guess Sidebar.
  function showGuessSidebar() {
    hideAllPages();
    document.getElementById("endGamePage").classList.remove("hidden");
  }

  // Apply guess adjustments based on player input.
  window.applyGuessAdjustments = function() {
    const guess1 = document.getElementById("guessBot1").value;
    const guess2 = document.getElementById("guessBot2").value;
    const guess3 = document.getElementById("guessBot3").value;
    let adjustment = 0;
    for (let i = 1; i < 4; i++) {
      let guess;
      if (i === 1) guess = guess1;
      if (i === 2) guess = guess2;
      if (i === 3) guess = guess3;
      if (guess === players[i].role) {
        if (playerRole === "Diplomat") {
          const avg = players.reduce((a, p) => a + p.sum, 0) / players.length;
          if (players[0].sum < avg) {
            adjustment += 5;
          } else {
            adjustment -= 5;
          }
        } else {
          adjustment += 5;
        }
      }
    }
    players[0].sum += adjustment;
    showResults(adjustment);
  };

  // Display final results.
  function showResults(adjustment) {
    const resultsDiv = document.getElementById("results");
    let resultsHTML = `<p>Your Role: ${players[0].role}</p>`;
    resultsHTML += `<p>Your Total Sum (after adjustments): ${players[0].sum}</p>`;
    for (let i = 1; i < players.length; i++) {
      resultsHTML += `<p>Bot ${i} (Role: ${players[i].role})</p>`;
    }
    resultsHTML += `<p>Guess Adjustment: ${adjustment >= 0 ? '+' : ''}${adjustment} points</p>`;
    const sums = players.map(p => p.sum);
    let outcome = "";
    if (players[0].role === "Businessman") {
      outcome = (players[0].sum === Math.max(...sums)) ?
        "You win! (Highest sum achieved)" : "You lose. (You did not achieve the highest sum)";
    } else if (players[0].role === "Athlete") {
      outcome = (players[0].sum === Math.min(...sums)) ?
        "You win! (Lowest sum achieved)" : "You lose. (You did not achieve the lowest sum)";
    } else if (players[0].role === "Diplomat") {
      outcome = (players[0].sum !== Math.max(...sums) && players[0].sum !== Math.min(...sums)) ?
        "You win! (Your sum is in the middle)" : "You lose. (Your sum is not in the middle)";
    }
    resultsHTML += `<h2>${outcome}</h2>`;
    resultsDiv.innerHTML = resultsHTML;
  }

  // Expose functions globally.
  window.goToMenu = goToMenu;
  window.showHowToPlay = showHowToPlay;
  window.showRoleSelection = showRoleSelection;
  window.showSettings = showSettings;
  window.showCredits = showCredits;
  window.drawCard = drawCard;
  window.startGame = startGame;
  window.applyGuessAdjustments = applyGuessAdjustments;
};
