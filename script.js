window.onload = function() {
  // …[all your existing globals, utility, nav, role‐reveal, draw, display, bots, etc.]…

  // ---------------------
  // Trade (no more auto‑finalize)
  // ---------------------
  window.initiateTrade = function(botIndex) {
    if (selectedCardIndex === null) {
      alert("Please select a card from your hand first.");
      return;
    }
    hideBotSelection();
    const selectedCard = playerHand[selectedCardIndex];
    const bot = players[botIndex];

    if (botWillingToTrade(bot)) {
      [selectedCard.value, bot.currentCard] = [bot.currentCard, selectedCard.value];
      showMessage("Bot " + botIndex + " accepted the trade!");
    } else {
      showMessage("Bot " + botIndex + " rejected the trade. Your card remains available.");
    }

    // ← removed: finalizeCard() & finalizeRound() here
    selectedCardIndex = null;
    updateDisplay();
  };

  // ---------------------
  // Keep Selected Card → finalize round
  // ---------------------
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
  window.keepSelectedCard = keepSelectedCard;

  // ---------------------
  // Finalize Round & Show Pre‑Adjustment Total
  // ---------------------
  function finalizeRound() {
    // add bots’ cards as before
    for (let i = 1; i < players.length; i++) {
      players[i].sum += players[i].currentCard;
      players[i].currentCard = null;
    }

    currentRound++;
    if (currentRound < totalRounds) {
      document.getElementById("drawCardBtn").style.display = "block";
    } else {
      showGuessSidebar();
    }
  }

  function showGuessSidebar() {
    hideAllPages();
    const endPage = document.getElementById("endGamePage");
    endPage.classList.remove("hidden");

    // 1) show raw total
    const preT = document.getElementById("preAdjustTotal");
    preT.textContent = "Your total before adjustments: " + players[0].sum;

    // 2) hide the guess inputs initially
    const guessSect = document.getElementById("guessSection");
    guessSect.classList.add("hidden");

    // 3) after 2 sec, reveal guesses
    setTimeout(() => {
      guessSect.classList.remove("hidden");
    }, 2000);
  }

  // …[rest of your applyGuessAdjustments, showResults, audio, etc.]…
};
