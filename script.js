window.onload = function() {
  // Global game variables
  let players = []; // players[0] is you; players[1-3] are bots
  let deck = [];    // Cards numbered 1-100
  let currentRound = 0;
  const totalRounds = 10;
  const roles = ["Businessman", "Diplomat", "Athlete"];
  let playerRole = "";
  let playerHand = []; // Array of card objects: { value, used }
  let selectedCardIndex = null;
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
  function hideAllPages() {
    document.querySelectorAll("div.page, #menu").forEach(page => page.classList.add("hidden"));
  }
  window.goToMenu = function() {
    hideAllPages();
    document.getElementById("menu").classList.remove("hidden");
    document.getElementById("gameOverMusic").pause();
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
  // Role Assignment (Automatic)
  // ---------------------
  // When the player clicks "Get My Role", assign a random role and then show it for 10 seconds before proceeding.
  window.assignRole = function() {
    hideAllPages();
    document.getElementById("roleAssignmentPage").classList.remove("hidden");
    // Assign random role to player and bots
    playerRole = roles[Math.floor(Math.random() * roles.length)];
    players[0] = { id: 0, sum: 0, role: playerRole };
    for (let i = 1; i < 4; i++) {
      players[i] = { id: i, sum: 0, role: roles[Math.floor(Math.random() * roles.length)], currentCard: null };
    }
    // Display the assigned role in big text with explanation in brackets.
    const roleMsg = playerRole === "Businessman" ? "Businessman (Aim for the highest total)" :
                    playerRole === "Diplomat" ? "Diplomat (Aim for a middle total)" :
                    "Athlete (Aim for the lowest total)";
    const roleAnnouncement = document.getElementById("roleAnnouncement");
    roleAnnouncement.innerText = roleMsg;
    roleAnnouncement.style.fontSize = "2em";
    document.getElementById("assignedRole").classList.remove("hidden");
    // Disable the "Get My Role" button so it cannot be pressed again.
    document.getElementById("assignRoleBtn").disabled = true;
    // After 10 seconds, automatically fade into the game.
    setTimeout(() => {
      // Optional: add a fade-out effect here (using CSS transitions)
      startGame();
    }, 10000);
  };

  // ---------------------
  // Role Selection (Legacy if needed)
  // ---------------------
  function generateRoleBoxes() {
    const boxesContainer = document.getElementById("roleBoxes");
    boxesContainer.innerHTML = "";
    // (Optional: if you want to let the player pick, you can uncomment the below.)
    /*
    for (let i = 0; i < 10; i++) {
      const box = document.createElement("div");
      box.className = "roleBox";
      box.textContent = i + 1;
      box.onclick = assignPlayerRole;
      boxesContainer.appendChild(box);
    }
    */
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
    // If player role not set, assign default.
    if (!players[0]) {
      players[0] = { id: 0, sum: 0, role: "Diplomat" };
      for (let i = 1; i < 4; i++) {
        players[i] = { id: i, sum: 0, role: roles[Math.floor(Math.random() * roles.length)], currentCard: null };
      }
      playerRole = players[0].role;
    }
    document.getElementById("playerRole").innerText = playerRole;
    updateDisplay();
    // Start background music
    document.getElementById("bgMusic").play();
    // Ensure the draw card button is visible.
    document.getElementById("drawCardBtn").style.display = "block";
  };

  // When the player clicks "Draw Card": add a new card to the hand,
  // then hide the draw card button and show the bot selection panel.
  window.drawCard = function() {
    if (currentRound < totalRounds && deck.length >= 4) {
      document.getElementById("drawCardBtn").style.display = "none";
      const drawnCard = deck.pop();
      playerHand.push({ value: drawnCard, used: false });
      updatePlayerHandDisplay();
      // Each bot draws a hidden card for this round.
      for (let i = 1; i < 4; i++) {
        players[i].currentCard = deck.pop();
      }
      // Show bot selection panel so the player can choose a trade.
      document.getElementById("botSelection").classList.remove("hidden");
    }
  };

  // Update the player's hand display.
  function updatePlayerHandDisplay() {
    const handDiv = document.getElementById("playerHand");
    handDiv.innerHTML = "";
    playerHand.forEach((card, index) => {
      const cardDiv = document.createElement("div");
      cardDiv.className = "handCard";
      cardDiv.textContent = card.value;
      if (!card.used) {
        cardDiv.onclick = () => selectHandCard(index);
      }
      if (index === selectedCardIndex) {
        cardDiv.classList.add("selected");
      }
      if (card.used) {
        cardDiv.classList.add("used");
      }
      handDiv.appendChild(cardDiv);
    });
  }

  // When the player clicks a card in hand.
  function selectHandCard(index) {
    if (playerHand[index].used) return;
    selectedCardIndex = index;
    updatePlayerHandDisplay();
  }

  // Show bot selection panel.
  function showBotSelection() {
    document.getElementById("botSelection").classList.remove("hidden");
  }
  function hideBotSelection() {
    document.getElementById("botSelection").classList.add("hidden");
  }

  // Called when the player clicks on a bot button to trade.
  window.initiateTrade = function(botIndex) {
    if (selectedCardIndex === null) {
      alert("Please select a card from your hand first.");
      return;
    }
    hideBotSelection();
    const selectedCard = playerHand[selectedCardIndex];
    const bot = players[botIndex];
    // Remove any confirmation dialog; simply decide trade outcome.
    // For simplicity, let’s assume the bot’s decision is based on its own hidden card:
    if (botWillingToTrade(bot)) {
      // Trade accepted: swap the player's card with a new card from the deck.
      let newCard = deck.pop();
      // Mark the traded card as used (finalizing it so it cannot be re-traded).
      selectedCard.used = true;
      players[0].sum += newCard;
      showMessage("Trade accepted! You received: " + newCard);
    } else {
      // Trade rejected: finalize the selected card.
      showMessage("Trade rejected! Your card is kept: " + selectedCard.value);
      selectedCard.used = true;
      players[0].sum += selectedCard.value;
    }
    selectedCardIndex = null;
    finalizeRound();
    updateDisplay();
  };

  // Manual "Keep Selected Card" action.
  window.keepSelectedCard = function() {
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
  };

  // Finalize (keep) a card: mark as used and add its value to player's total.
  function finalizeCard(index) {
    const card = playerHand[index];
    card.used = true;
    players[0].sum += card.value;
  }

  // Finalize the round: increment round counter, clear temporary selections,
  // and show the draw card button for the next round (or proceed to end game).
  function finalizeRound() {
    currentRound++;
    if (currentRound < totalRounds) {
      document.getElementById("drawCardBtn").style.display = "block";
    } else {
      endGame();
    }
    // Clear bots' temporary cards.
    for (let i = 1; i < 4; i++) {
      players[i].currentCard = null;
    }
    selectedCardIndex = null;
    updatePlayerHandDisplay();
  }

  // Display a temporary message.
  function showMessage(msg) {
    const msgDiv = document.getElementById("message");
    msgDiv.innerText = msg;
    msgDiv.classList.remove("hidden");
    setTimeout(() => {
      msgDiv.classList.add("hidden");
    }, 1500);
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

  // Update control displays.
  function updateDisplay() {
    document.getElementById("playerSum").innerText = players[0].sum;
    document.getElementById("roundCounter").innerText = currentRound + 1;
  }

  // ---------------------
  // End Game Functions
  // ---------------------
  function showGuessSidebar() {
    hideAllPages();
    document.getElementById("endGamePage").classList.remove("hidden");
  }
  window.applyGuessAdjustments = function() {
    const guess1 = document.getElementById("guessBot1").value;
    const guess2 = document.getElementById("guessBot2").value;
    const guess3 = document.getElementById("guessBot3").value;
    let adjustment = 0;
    for (let i = 1; i < 4; i++) {
      let guess = i === 1 ? guess1 : i === 2 ? guess2 : guess3;
      if (guess === players[i].role) {
        if (playerRole === "Diplomat") {
          const avg = players.reduce((acc, p) => acc + p.sum, 0) / players.length;
          adjustment += players[0].sum < avg ? 5 : -5;
        } else {
          adjustment += 5;
        }
      }
    }
    players[0].sum += adjustment;
    showResults(adjustment);
  };
  function showResults(adjustment) {
    const resultsDiv = document.getElementById("results");
    let resultsHTML = `<p>Your Role: ${players[0].role}</p>`;
    resultsHTML += `<p>Your Total Sum (after adjustments): ${players[0].sum}</p>`;
    for (let i = 1; i < players.length; i++) {
      resultsHTML += `<p>Bot ${i} (Role: ${players[i].role}) Total Sum: ${players[i].sum}</p>`;
    }
    resultsHTML += `<p>Guess Adjustment: ${adjustment >= 0 ? '+' : ''}${adjustment} points</p>`;
    const sums = players.map(p => p.sum);
    let outcome = "";
    if (players[0].role === "Businessman") {
      outcome = players[0].sum === Math.max(...sums) ? "You win! (Highest sum achieved)" : "You lose. (You did not achieve the highest sum)";
    } else if (players[0].role === "Athlete") {
      outcome = players[0].sum === Math.min(...sums) ? "You win! (Lowest sum achieved)" : "You lose. (You did not achieve the lowest sum)";
    } else if (players[0].role === "Diplomat") {
      outcome = (players[0].sum !== Math.max(...sums) && players[0].sum !== Math.min(...sums)) ? "You win! (Your sum is in the middle)" : "You lose. (Your sum is not in the middle)";
    }
    resultsHTML += `<h2>${outcome}</h2>`;
    resultsDiv.innerHTML = resultsHTML;
  }
  function endGame() {
    // Stop background music and play game-over music.
    document.getElementById("bgMusic").pause();
    document.getElementById("gameOverMusic").play();
    showGuessSidebar();
  }

  // ---------------------
  // Settings: Volume Control
  // ---------------------
  const volumeControl = document.getElementById("volumeControl");
  volumeControl.addEventListener("input", function() {
    document.getElementById("bgMusic").volume = this.value;
  });

  // Expose functions globally.
  window.goToMenu = goToMenu;
  window.showHowToPlay = showHowToPlay;
  window.showRoleSelection = showRoleSelection;
  window.showSettings = showSettings;
  window.showCredits = showCredits;
  window.drawCard = drawCard;
  window.initiateTrade = initiateTrade;
  window.keepSelectedCard = keepSelectedCard;
  window.applyGuessAdjustments = applyGuessAdjustments;
  window.startGame = startGame;
};
