window.onload = function() {
  // Global game variables
  let players = [];        // players[0] is you; players[1–3] are bots
  let deck = [];           // cards 1–100
  let currentRound = 0;
  const totalRounds = 10;
  const roles = ["Businessman", "Diplomat", "Athlete"];
  let playerRole = "";
  // your hand holds all drawn cards
  let playerHand = [];
  let selectedCardIndex = null;

  // Manual‐keep count (limits)
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
    for (let i = 1; i <= 100; i++) deck.push(i);
    shuffleDeck();
  }

  // ---------------------
  // Navigation Functions
  // ---------------------
  function hideAllPages() {
    document.querySelectorAll("div[id$='Page'], #menu")
            .forEach(el => el.classList.add("hidden"));
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
  // Role Assignment / Reveal
  // ---------------------
  window.assignRoleAndReveal = function() {
    playerRole = roles[Math.floor(Math.random() * roles.length)];
    players[0] = { id: 0, sum: 0, role: playerRole };
    for (let i = 1; i < 4; i++) {
      const botRole = roles[Math.floor(Math.random() * roles.length)];
      players[i] = { id: i, sum: 0, role: botRole, currentCard: null };
    }
    hideAllPages();
    setTimeout(() => {
      document.getElementById("roleRevealPage").classList.remove("hidden");
      document.getElementById("playerRoleDisplay").textContent = playerRole;
    }, 1000);
  };

  // ---------------------
  // Start / Draw
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
        players[i] = {
          id: i,
          sum: 0,
          role: roles[Math.floor(Math.random() * roles.length)],
          currentCard: null
        };
      }
    }
    document.getElementById("playerRole").textContent = playerRole;
    updateDisplay();
    document.getElementById("drawCardBtn").style.display = "block";
  };

  window.drawCard = function() {
    if (currentRound < totalRounds && deck.length >= 4) {
      const drawnCard = deck.pop();
      playerHand.push({ value: drawnCard, used: false });
      updatePlayerHandDisplay();
      // bots each draw a hidden card
      for (let i = 1; i < 4; i++) {
        players[i].currentCard = deck.pop();
      }
      document.getElementById("drawCardBtn").style.display = "none";
      showBotSelection();
    }
  };

  // ---------------------
  // Hand / Selection UI
  // ---------------------
  function updatePlayerHandDisplay() {
    const handDiv = document.getElementById("playerHand");
    handDiv.innerHTML = "";
    playerHand.forEach((card, idx) => {
      const d = document.createElement("div");
      d.className = "handCard" + (card.used ? " used" : "");
      d.textContent = card.value;
      if (!card.used) d.onclick = () => selectHandCard(idx);
      if (idx === selectedCardIndex) d.classList.add("selected");
      handDiv.appendChild(d);
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

  // ---------------------
  // Bot Logic
  // ---------------------
  function botWillingToTrade(bot) {
    if (bot.role === "Businessman") return bot.currentCard < 50;
    if (bot.role === "Athlete")    return bot.currentCard > 50;
    if (bot.role === "Diplomat")   return (bot.currentCard < 40 || bot.currentCard > 60);
    return false;
  }

  // ---------------------
  // 1) Modified: Trade stays open until you “Keep Card”
  // ---------------------
  window.initiateTrade = function(botIndex) {
    if (selectedCardIndex === null) {
      alert("Please select a card from your hand first.");
      return;
    }
    const selectedCard = playerHand[selectedCardIndex];
    const bot = players[botIndex];
    if (botWillingToTrade(bot)) {
      // swap values
      [selectedCard.value, bot.currentCard] = [bot.currentCard, selectedCard.value];
      showMessage("Bot " + botIndex + " accepted the trade!");
    } else {
      showMessage("Bot " + botIndex + " rejected the trade. Keep trying!");
    }
    // ↳ no finalizeRound, no hideBotSelection → you can pick another bot or another card
    selectedCardIndex = null;
    updateDisplay();
  };

  // ---------------------
  // 2) “Keep Card” now just ends the round
  // ---------------------
  window.keepSelectedCard = function() {
    if (selectedCardIndex === null) {
      alert("Please select a card from your hand first.");
      return;
    }
    if (manualKeepCount >= maxManualKeeps) {
      alert("You have reached the maximum of " + maxManualKeeps + " keeps.");
      return;
    }
    manualKeepCount++;
    showMessage("You kept your card.");
    hideBotSelection();
    selectedCardIndex = null;
    finalizeRound();
    updateDisplay();
  };

  // (we no longer mark used or add to players[0].sum here—
  //   we’ll sum everything at the end in showPreAdjustmentTotals)

  function finalizeCard(index) {
    const card = playerHand[index];
    card.used = true;
    players[0].sum += card.value;
  }

  // ---------------------
  // Round Progression
  // ---------------------
  function finalizeRound() {
    // still tally bot cards into their .sum each round
    for (let i = 1; i < players.length; i++) {
      players[i].sum += players[i].currentCard;
      players[i].currentCard = null;
    }

    currentRound++;
    if (currentRound < totalRounds) {
      document.getElementById("drawCardBtn").style.display = "block";
    } else {
      // 3) at end of round 10, show totals before guess
      showPreAdjustmentTotals();
    }
  }

  // ---------------------
  // 3) Show totals (your box + bots) before guessing
  // ---------------------
  function showPreAdjustmentTotals() {
    hideAllPages();
    let preDiv = document.getElementById("preAdjustmentPage");
    if (!preDiv) {
      preDiv = document.createElement("div");
      preDiv.id = "preAdjustmentPage";
      preDiv.classList.add("hidden");
      document.body.appendChild(preDiv);
    }

    // compute your hand total
    const playerTotal = playerHand.reduce((sum, c) => sum + c.value, 0);
    // store it so adjustments work off this
    players[0].sum = playerTotal;

    let html = <h2>All ${totalRounds} Rounds Done!</h2>;
    html += <p>Your Total (pre‑guesses/adjustments): ${playerTotal}</p>;
    for (let i = 1; i < players.length; i++) {
      html += <p>Bot ${i} (${players[i].role}): ${players[i].sum}</p>;
    }
    preDiv.innerHTML = html;
    preDiv.classList.remove("hidden");

    // after 3 s, move to the guess screen
    setTimeout(showGuessSidebar, 3000);
  }

  // ---------------------
  // Messaging & Display
  // ---------------------
  function showMessage(msg) {
    const m = document.getElementById("message");
    m.textContent = msg;
    m.classList.remove("hidden");
    setTimeout(() => m.classList.add("hidden"), 1500);
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

  // ---------------------
  // Guess Adjustments & Results
  // ---------------------
  window.applyGuessAdjustments = function() {
    const guess1 = document.getElementById("guessBot1").value;
    const guess2 = document.getElementById("guessBot2").value;
    const guess3 = document.getElementById("guessBot3").value;
    let adjustment = 0;
    for (let i = 1; i < 4; i++) {
      const guess = (i === 1 ? guess1 : i === 2 ? guess2 : guess3);
      if (guess === players[i].role) {
        if (playerRole === "Diplomat") {
          const avg = players.reduce((a, p) => a + p.sum, 0) / players.length;
          adjustment += (players[0].sum < avg) ? 5 : -5;
        } else {
          adjustment += 5;
        }
      }
    }
    players[0].sum += adjustment;
    showResults(adjustment);
  };

  function showResults(adjustment) {
    const rd = document.getElementById("results");
    let html = <p>Your Role: ${players[0].role}</p>
             + <p>Your Total (post‑adjust): ${players[0].sum}</p>;
    for (let i = 1; i < players.length; i++) {
      html += <p>Bot ${i} (Role: ${players[i].role})</p>;
    }
    html += <p>Guess Adj: ${adjustment >= 0 ? "+" : ""}${adjustment}</p>;
    const sums = players.map(p => p.sum);
    let outcome;
    if (playerRole === "Businessman") {
      outcome = (players[0].sum === Math.max(...sums))
        ? "You win! (Highest sum)" : "You lose. (Not highest)";
    } else if (playerRole === "Athlete") {
      outcome = (players[0].sum === Math.min(...sums))
        ? "You win! (Lowest sum)" : "You lose. (Not lowest)";
    } else {
      outcome = (players[0].sum !== Math.max(...sums) && players[0].sum !== Math.min(...sums))
        ? "You win! (Middle sum)" : "You lose. (Not middle)";
    }
    rd.innerHTML = html + <h2>${outcome}</h2>;
  }

  // Expose
  window.goToMenu = goToMenu;
  window.showHowToPlay = showHowToPlay;
  window.showSettings = showSettings;
  window.showCredits = showCredits;
  window.drawCard = drawCard;
  window.startGame = startGame;
  window.applyGuessAdjustments = applyGuessAdjustments;
};

// Audio
const bgMusic = new Audio("game-176807.mp3");
const gameOverSound = new Audio("game-over-252897.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5;
