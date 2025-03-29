window.onload = function() {
  // Global game variables
  let players = []; // players[0] is you; players[1-3] are bots
  let deck = [];    // Cards from 1 to 100
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
    // (Legacy role selection code can remain here if needed.)
  };

  // ---------------------
  // Role Assignment (Automatic)
  // ---------------------
  // This function is called when the player clicks "Start Game" from the main menu.
  // It immediately assigns a random role and shows the Role Assignment page.
  window.assignRole = function() {
    hideAllPages();
    document.getElementById("roleAssignmentPage").classList.remove("hidden");
    // Assign random role to player and bots
    playerRole = roles[Math.floor(Math.random() * roles.length)];
    players[0] = { id: 0, sum: 0, role: playerRole };
    for (let i = 1; i < 4; i++) {
      players[i] = { id: i, sum: 0, role: roles[Math.floor(Math.random() * roles.length)], currentCard: null };
    }
    // Display the assigned role with an explanation.
    let roleMsg = "";
    if (playerRole === "Businessman") {
      roleMsg = "Businessman (Aim for the highest total)";
    } else if (playerRole === "Diplomat") {
      roleMsg = "Diplomat (Aim for a middle total)";
    } else {
      roleMsg = "Athlete (Aim for the lowest total)";
    }
    const roleAnnouncement = document.getElementById("roleAnnouncement");
    roleAnnouncement.innerText = roleMsg;
    document.getElementById("assignedRole").classList.remove("hidden");
    // Disable the button so role cannot be changed.
    document.getElementById("assignRoleBtn").disabled = true;
    // After 10 seconds, automatically transition to the game.
    setTimeout(() => {
      startGame();
    }, 10000);
  };
  // Expose assignRole globally.
  window.assignRole = assignRole;

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
    // If for some reason player role is not set, assign default.
    if (!players[0]) {
      players[0] = { id: 0, sum: 0, role: "Diplomat" };
      for (let i = 1; i < 4; i++) {
        players[i] = { id: i, sum: 0, role: roles
