document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("grid-container");
  const turnIndicator = document.getElementById("turn-indicator");
  const resetButton = document.getElementById("reset-button");
  const modal = document.getElementById("modal");
  const confirmReset = document.getElementById("confirm-reset");
  const cancelReset = document.getElementById("cancel-reset");
  const player1ScoreDisplay = document.getElementById("player1-score");
  const player2ScoreDisplay = document.getElementById("player2-score");
  const player1NameInput = document.getElementById("player1-name");
  const player2NameInput = document.getElementById("player2-name");

  let currentPlayer = "X";
  let player1Score = parseInt(localStorage.getItem("player1Score")) || 0;
  let player2Score = parseInt(localStorage.getItem("player2Score")) || 0;
  let boardSize = 3;
  let gameMode = "two-players";
  let cells = [];

  const winningConditions = {
    3: [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ],
    4: [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
      [12, 13, 14, 15],
      [0, 4, 8, 12],
      [1, 5, 9, 13],
      [2, 6, 10, 14],
      [3, 7, 11, 15],
      [0, 5, 10, 15],
      [3, 6, 9, 12],
    ],
    5: [
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24],
      [0, 5, 10, 15, 20],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20],
    ],
  };

  // Initialize scores
  updateScores();
  createBoard(boardSize);

  // Add event listeners
  const boardSizeSelector = document.getElementById("board-size");
  const gameModeSelector = document.getElementById("game-mode");

  boardSizeSelector.addEventListener("change", (event) => {
    boardSize = parseInt(event.target.value);
    createBoard(boardSize);
  });

  gameModeSelector.addEventListener("change", (event) => {
    gameMode = event.target.value;
    resetBoard();
  });

  // Switch player turn
  function switchPlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X"; //to switch the player
    turnIndicator.textContent = `${
      currentPlayer === "X" ? getPlayer1Name() : getPlayer2Name()
    }'s turn (${currentPlayer})`; //to indicate the turn
  }

  // Reset the game board
  function resetBoard() {
    cells.forEach((cell) => (cell.textContent = ""));
    currentPlayer = "X";
    turnIndicator.textContent = `${getPlayer1Name()}'s turn (X)`;
  }

  resetButton.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  confirmReset.addEventListener("click", () => {
    resetBoard();
    modal.style.display = "none";
  });

  cancelReset.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Create the game board based on the selected size
  function createBoard(size) {
    gridContainer.innerHTML = "";
    gridContainer.className = "grid";
    gridContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    gridContainer.style.height = "600px";
    gridContainer.style.width = "600px";
    cells = Array.from({ length: size * size }, (_, index) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.index = index;
      cell.addEventListener("click", handleClick);
      gridContainer.appendChild(cell);
      if (size === 4) cell.style.fontSize = "120px";
      if (size === 5) cell.style.fontSize = "90px";
      return cell;
    });
    resetBoard();
  }

  // Handle cell clicks
  function handleClick(event) {
    const cell = event.target;
    if (cell.textContent === "") {
      cell.textContent = currentPlayer;
      verify();
    }
  }
  // Computer makes a move
  function computerMove() {
    const emptyCells = cells.filter((cell) => cell.textContent === "");
    const xCells = cells.filter((cell) => cell.textContent === "X");
    const oCells = cells.filter((cell) => cell.textContent === "O");

    // Check if computer can win in the next move
    let winningMove = findWinningMove("O");
    if (winningMove !== -1) {
      cells[winningMove].textContent = "O";
      verify();
      return;
    }

    // Block the player from winning in the next move
    let blockingMove = findWinningMove("X");
    if (blockingMove !== -1) {
      cells[blockingMove].textContent = "O";
      verify();
      return;
    }

    // Otherwise, make a random move
    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const cell = emptyCells[randomIndex];
      cell.textContent = "O";
      verify();
    }
  }

  function findWinningMove(player) {
    for (const condition of winningConditions[boardSize]) {
      let countPlayer = 0;
      let emptyIndex = -1;

      for (let i = 0; i < condition.length; i++) {
        const index = parseInt(condition[i]);
        if (cells[index].textContent === player) {
          countPlayer++;
        } else if (cells[index].textContent === "") {
          emptyIndex = index;
        }
      }

      if (countPlayer === boardSize - 1 && emptyIndex !== -1) {
        return emptyIndex;
      }
    }
    return -1;
  }

  //function to verify the tie, winning and give alert
  function verify() {
    if (checkWin()) {
      if (gameMode === "two-players") {
        setTimeout(() => {
          alertResult(
            `${
              currentPlayer === "X" ? getPlayer1Name() : getPlayer2Name()
            } wins!`
          );
        }, 300);
      }
      else {
        setTimeout(() => {
          alertResult(
            `${
              currentPlayer === "X" ? "Victory is yours!" :"You'll win the next one!"
            }`
          );
        }, 300);
      }
      updateScore(currentPlayer);
      setTimeout(resetBoard, 5000);
    } else if (isBoardFull()) {
      setTimeout(() => {
        alertResult("It’s a deadlock!");
      }, 300);
      setTimeout(resetBoard, 5000);
    } else {
      switchPlayer();
      if (gameMode === "solo" && currentPlayer === "O") {
        setTimeout(computerMove, 500);
      }
    }
  }

  //check the winning condition
  function checkWin() {
    const winningCondition = winningConditions[boardSize].find((condition) => {
      return condition.every((index) => {
        return cells[index].textContent === currentPlayer;
      });
    });
    //to highlight in red the winning cells
    if (winningCondition) {
      winningCondition.forEach((index) => {
        cells[index].classList.add("winning-cell");
      });
      setTimeout(() => {
        winningCondition.forEach((index) => {
          cells[index].classList.remove("winning-cell");
        });
      }, 5000);
    }
    return Boolean(winningCondition);
  }

  // Check if the board is full (tie condition)
  function isBoardFull() {
    return cells.every((cell) => cell.textContent !== "");
  }

  // Update player scores
  function updateScore(winner) {
    if (winner === "X") {
      player1Score++;
      localStorage.setItem("player1Score", player1Score);
    } else {
      player2Score++;
      localStorage.setItem("player2Score", player2Score);
    }
    updateScores();
  }

  // Update scores display and highlight leader
  function updateScores() {
    player1ScoreDisplay.textContent = `${getPlayer1Name()}: ${player1Score}`;
    player2ScoreDisplay.textContent = `${getPlayer2Name()}: ${player2Score}`;
    highlightLeader();
  }

  // Highlight the leading player
  function highlightLeader() {
    if (player1Score > player2Score) {
      player1ScoreDisplay.classList.add("leader");
      player2ScoreDisplay.classList.remove("leader");
    } else if (player2Score > player1Score) {
      player2ScoreDisplay.classList.add("leader");
      player1ScoreDisplay.classList.remove("leader");
    } else {
      player1ScoreDisplay.classList.remove("leader");
      player2ScoreDisplay.classList.remove("leader");
    }
  }

  // function to reset scores
  function resetScores() {
    player1Score = 0;
    player2Score = 0;
    localStorage.setItem("player1Score", player1Score);
    localStorage.setItem("player2Score", player2Score);
    updateScores();
    resetBoard();
  }
  const resetScoreButton = document.getElementById("reset-score");
  const modalResetScore = document.getElementById("modal-reset-score");

  resetScoreButton.addEventListener("click", () => {
    modalResetScore.style.display = "flex";
  });
  document
    .getElementById("confirm-reset-score")
    .addEventListener("click", () => {
      resetScores();
      modalResetScore.style.display = "none";
    });
  document
    .getElementById("cancel-reset-score")
    .addEventListener("click", () => {
      modalResetScore.style.display = "none";
    });

  // Get player 1's name
  function getPlayer1Name() {
    return player1NameInput.value.trim() || "Player 1";
  }

  // Get player 2's name
  function getPlayer2Name() {
    return player2NameInput.value.trim() || "Player 2";
  }

  // Update player names in the turn indicator and scores
  function updatePlayerNames() {
    turnIndicator.textContent = `${
      currentPlayer === "X" ? getPlayer1Name() : getPlayer2Name()
    }'s turn (${currentPlayer})`;
    updateScores();
  }
  player1NameInput.addEventListener("input", updatePlayerNames);
  player2NameInput.addEventListener("input", updatePlayerNames);

  //modal for alert-Result
  function alertResult(message) {
    var modal = document.getElementById("alert-result");
    var messageElement = document.getElementById("alert-result-message");
    var okButton = document.getElementById("alert-result-ok");

    // Set the message in the modal
    messageElement.innerText = message;

    // Show the modal
    modal.style.display = "flex"; // Use 'flex' to apply justify-content and align-items from CSS

    // Hide the modal when the OK button is clicked
    okButton.onclick = function () {
      modal.style.display = "none";
    };
  }
});
