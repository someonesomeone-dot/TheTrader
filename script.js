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

  // ---------------------
  // Role Assignment and Reveal
  // ---------------------
  window.assignRoleAndReveal = function() {
    playerRole = roles[Math.floor(Math.random() * roles.length)];
    players[0] = { id: 0, sum: 0, role: playerRole };
    for (let i = 1; i < 4; i++) {
      const botRole = roles[Math.floor(Math.random() * roles.length)];
      players[i] = { id: i, sum: 0, role: botRole, currentCard: null };
    }
    hideAllPages();
    setTimeout(function(){
      document.getElementById("roleRevealPage").classList.remove("hidden");
      document.getElementById("playerRoleDisplay").textContent = playerRole;
    }, 1000);
  };

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
    if (!players[0]) {
      playerRole = "Diplomat";
      players[0] = { id: 0, sum: 0, role: playerRole };
      for (let i = 1; i < 4; i++) {
        players[i] = { id: i, sum: 0, role: roles[Math.floor(Math.random() * roles.length)], currentCard: null };
      }
      document.getElementById("playerRole").textContent = playerRole;
    }
    document.getElementById("playerRole").textContent = playerRole;
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
      document.getElementById("drawCardBtn").style.display = "none";
      showBotSelection();
    }
  };

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

  function selectHandCard(index) {
    if (playerHand[index].used) return;
    selectedCardIndex = index;
    updatePlayerHandDisplay();
  }

  function showBotSelection() {
    document.getElementById("botSelection").classList.remove("hidden");
  }

  function hideBotSelection() {
    document.getElementById("botSelection").classList.add("hidden");
  }

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

  window.initiateTrade = function(botIndex) {
    if (selectedCardIndex === null) {
      alert("Please select a card from your hand first.");
      return;
    }
    hideBotSelection();
    const selectedCard = playerHand[selectedCardIndex];
    const playerCardValue = selectedCard.value;
    const bot = players[botIndex];
    if (botWillingToTrade(bot)) {
      const temp = playerCardValue;
      selectedCard.value = bot.currentCard;
      bot.currentCard = temp;
      showMessage("Bot " + botIndex + " accepted the trade!");
    } else {
      showMessage("Bot " + botIndex + " rejected the trade.");
    }
    selectedCardIndex = null;
    finalizeRound();
    updateDisplay();
  };

  function finalizeCard(index) {
    const card = playerHand[index];
    card.used = true;
    players[0].sum += card.value; // Update player's sum directly when card is kept
  }

  function finalizeRound() {
    currentRound++;
    if (currentRound < totalRounds) {
      document.getElementById("drawCardBtn").style.display = "block";
    } else {
      showGuessSidebar();
    }
  }

  function showMessage(msg) {
    const msgDiv = document.getElementById("message");
    msgDiv.textContent = msg;
    msgDiv.classList.remove("hidden");
    setTimeout(function() {
      msgDiv.classList.add("hidden");
    }, 1500);
  }

  function updateDisplay() {
    document.getElementById("playerSum").textContent = players[0].sum;
    document.getElementById("roundCounter").textContent = currentRound + 1;
    updatePlayerHandDisplay();
  }

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
    resultsHTML += `<p>${outcome}</p>`;
    resultsDiv.innerHTML = resultsHTML;
  }
};
