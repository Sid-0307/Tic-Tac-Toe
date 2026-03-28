var OPCODE_GAME_START = 1;
var OPCODE_MOVE = 2;
var OPCODE_GAME_STATE_UPDATE = 3;
var OPCODE_GAME_OVER = 4;
var OPCODE_TIMER_UPDATE = 5;
var OPCODE_PLAYER_DISCONNECTED = 6;
var LEADERBOARD_ID = "tictactoe_global";
var TURN_DURATION_SECONDS = 30;
var WIN_POINTS = 200;
var DRAW_POINTS = 50;
var WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];
function checkWinner(board) {
  for (var i = 0; i < WIN_LINES.length; i++) {
    var a = WIN_LINES[i][0], b = WIN_LINES[i][1], c = WIN_LINES[i][2];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}
function getOtherPlayerId(state, userId) {
  for (var i = 0; i < state.playerOrder.length; i++) {
    if (state.playerOrder[i] !== userId)
      return state.playerOrder[i];
  }
  return null;
}
function encodeState(state) {
  var playersWire = {};
  for (var i = 0; i < state.playerOrder.length; i++) {
    var uid = state.playerOrder[i];
    var p = state.players[uid];
    playersWire[uid] = { symbol: p.symbol, username: p.username, score: p.score };
  }
  return JSON.stringify({
    board: state.board,
    currentTurn: state.currentTurn,
    players: playersWire,
    playerOrder: state.playerOrder,
    winner: state.winner,
    gameOver: state.gameOver,
    turnTimeRemaining: state.turnTimeRemaining,
    moveCount: state.moveCount,
    started: state.started
  });
}
function broadcastAll(dispatcher, opcode, payload, presences) {
  if (presences.length === 0)
    return;
  dispatcher.broadcastMessage(opcode, payload, presences, null, true);
}
function writeLeaderboard(nk, logger, userId, username, score, metadata) {
  try {
    nk.leaderboardRecordWrite(LEADERBOARD_ID, userId, username, score, 0, metadata);
  } catch (e) {
    logger.error("Failed to write leaderboard record: %s", String(e));
  }
}
function collectPresences(state) {
  var presences = [];
  for (var i = 0; i < state.playerOrder.length; i++) {
    presences.push(state.players[state.playerOrder[i]].presence);
  }
  return presences;
}
function buildPlayersPayload(state) {
  var result = {};
  for (var i = 0; i < state.playerOrder.length; i++) {
    var uid = state.playerOrder[i];
    var p = state.players[uid];
    result[uid] = { symbol: p.symbol, username: p.username, score: p.score };
  }
  return result;
}
function matchInit(ctx, logger, nk, params) {
  logger.info("matchInit called");
  try {
    nk.leaderboardCreate(LEADERBOARD_ID, false, 1, 0, "", {});
    logger.info("Leaderboard ready: %s", LEADERBOARD_ID);
  } catch (e) {
    logger.warn("Leaderboard create (may already exist): %s", String(e));
  }
  var state = {
    board: [null, null, null, null, null, null, null, null, null],
    currentTurn: "",
    players: {},
    playerOrder: [],
    winner: null,
    gameOver: false,
    turnTimeRemaining: TURN_DURATION_SECONDS,
    turnStartTime: 0,
    moveCount: 0,
    started: false
  };
  return { state: state, tickRate: 1, label: "tictactoe" };
}
function matchJoinAttempt(ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
  logger.info("matchJoinAttempt: %s", presence.userId);
  if (state.playerOrder.length >= 2) {
    return { state: state, accept: false, rejectMessage: "Match is full" };
  }
  return { state: state, accept: true };
}
function matchJoin(ctx, logger, nk, dispatcher, tick, state, presences) {
  logger.info("matchJoin: %d presence(s) joining", presences.length);
  for (var i = 0; i < presences.length; i++) {
    var presence = presences[i];
    if (state.players[presence.userId])
      continue;
    var symbol = state.playerOrder.length === 0 ? "X" : "O";
    state.players[presence.userId] = {
      symbol: symbol,
      username: presence.username || presence.userId,
      score: 0,
      presence: presence
    };
    state.playerOrder.push(presence.userId);
    logger.info("Player joined: %s as %s", presence.userId, symbol);
  }
  if (state.playerOrder.length === 2 && !state.started) {
    state.started = true;
    var firstIndex = Math.random() < 0.5 ? 0 : 1;
    state.currentTurn = state.playerOrder[firstIndex];
    state.turnStartTime = Date.now();
    state.turnTimeRemaining = TURN_DURATION_SECONDS;
    logger.info("Game starting! First turn: %s", state.currentTurn);
    broadcastAll(dispatcher, OPCODE_GAME_START, encodeState(state), collectPresences(state));
  }
  return { state: state };
}
function matchLeave(ctx, logger, nk, dispatcher, tick, state, presences) {
  logger.info("matchLeave: %d presence(s) leaving", presences.length);
  for (var i = 0; i < presences.length; i++) {
    var presence = presences[i];
    if (!state.gameOver && state.started) {
      var remainingId = getOtherPlayerId(state, presence.userId);
      if (remainingId && state.players[remainingId]) {
        state.winner = remainingId;
        state.gameOver = true;
        state.players[remainingId].score += WIN_POINTS;
        var remainingPlayer = state.players[remainingId];
        var leavingPlayer = state.players[presence.userId];
        var disconnectPayload = JSON.stringify({
          disconnectedUserId: presence.userId,
          disconnectedUsername: leavingPlayer ? leavingPlayer.username : presence.userId,
          winner: remainingId,
          winnerName: remainingPlayer.username
        });
        broadcastAll(
          dispatcher,
          OPCODE_PLAYER_DISCONNECTED,
          disconnectPayload,
          [remainingPlayer.presence]
        );
        writeLeaderboard(
          nk,
          logger,
          remainingId,
          remainingPlayer.username,
          WIN_POINTS,
          { wins: 1, losses: 0, draws: 0 }
        );
        if (leavingPlayer) {
          writeLeaderboard(
            nk,
            logger,
            presence.userId,
            leavingPlayer.username,
            0,
            { wins: 0, losses: 1, draws: 0 }
          );
        }
      }
    }
  }
  return { state: state };
}
function matchLoop(ctx, logger, nk, dispatcher, tick, state, messages) {
  if (state.started && !state.gameOver && state.playerOrder.length === 2) {
    var elapsed = Math.floor((Date.now() - state.turnStartTime) / 1e3);
    state.turnTimeRemaining = Math.max(0, TURN_DURATION_SECONDS - elapsed);
    var allPresences = collectPresences(state);
    broadcastAll(dispatcher, OPCODE_TIMER_UPDATE, JSON.stringify({
      remaining: state.turnTimeRemaining,
      currentTurn: state.currentTurn
    }), allPresences);
    if (state.turnTimeRemaining === 0) {
      logger.info("Timer expired for: %s, forfeiting turn", state.currentTurn);
      var nextId = getOtherPlayerId(state, state.currentTurn);
      if (nextId) {
        state.currentTurn = nextId;
        state.turnStartTime = Date.now();
        state.turnTimeRemaining = TURN_DURATION_SECONDS;
        broadcastAll(dispatcher, OPCODE_GAME_STATE_UPDATE, encodeState(state), allPresences);
      }
    }
  }
  for (var mi = 0; mi < messages.length; mi++) {
    var message = messages[mi];
    if (message.opCode !== OPCODE_MOVE)
      continue;
    var moveData;
    try {
      var dataStr = typeof message.data === "string" ? message.data : String(message.data);
      moveData = JSON.parse(dataStr);
    } catch (e) {
      logger.warn("Failed to parse move payload: %s", String(e));
      continue;
    }
    var senderId = message.sender.userId;
    var position = moveData.position;
    if (state.gameOver) {
      logger.warn("Move rejected: game is over");
      continue;
    }
    if (senderId !== state.currentTurn) {
      logger.warn("Move rejected: not %s's turn (current: %s)", senderId, state.currentTurn);
      continue;
    }
    if (typeof position !== "number" || position < 0 || position > 8 || state.board[position] !== null) {
      logger.warn("Move rejected: invalid position %d", position);
      continue;
    }
    var playerInfo = state.players[senderId];
    state.board[position] = playerInfo.symbol;
    state.moveCount++;
    logger.info("Move: %s placed %s at %d", senderId, playerInfo.symbol, position);
    var movePresences = collectPresences(state);
    var winningSymbol = checkWinner(state.board);
    var isDraw = !winningSymbol && state.moveCount === 9;
    if (winningSymbol || isDraw) {
      state.gameOver = true;
      var winnerId = null;
      var winnerName = "";
      var points = 0;
      if (isDraw) {
        state.winner = "draw";
        points = DRAW_POINTS;
        logger.info("Game over: DRAW");
        for (var di = 0; di < state.playerOrder.length; di++) {
          var duid = state.playerOrder[di];
          state.players[duid].score += DRAW_POINTS;
          writeLeaderboard(
            nk,
            logger,
            duid,
            state.players[duid].username,
            DRAW_POINTS,
            { wins: 0, losses: 0, draws: 1 }
          );
        }
      } else {
        for (var wi = 0; wi < state.playerOrder.length; wi++) {
          if (state.players[state.playerOrder[wi]].symbol === winningSymbol) {
            winnerId = state.playerOrder[wi];
            break;
          }
        }
        if (winnerId) {
          state.winner = winnerId;
          winnerName = state.players[winnerId].username;
          state.players[winnerId].score += WIN_POINTS;
          points = WIN_POINTS;
          logger.info("Game over: winner = %s", winnerId);
          writeLeaderboard(
            nk,
            logger,
            winnerId,
            winnerName,
            WIN_POINTS,
            { wins: 1, losses: 0, draws: 0 }
          );
          var loserId = getOtherPlayerId(state, winnerId);
          if (loserId) {
            writeLeaderboard(
              nk,
              logger,
              loserId,
              state.players[loserId].username,
              0,
              { wins: 0, losses: 1, draws: 0 }
            );
          }
        }
      }
      broadcastAll(dispatcher, OPCODE_GAME_OVER, JSON.stringify({
        winner: state.winner,
        winnerName: winnerName,
        points: points,
        board: state.board,
        isDraw: isDraw,
        players: buildPlayersPayload(state)
      }), movePresences);
    } else {
      var nextPlayer = getOtherPlayerId(state, senderId);
      if (nextPlayer) {
        state.currentTurn = nextPlayer;
        state.turnStartTime = Date.now();
        state.turnTimeRemaining = TURN_DURATION_SECONDS;
      }
      broadcastAll(dispatcher, OPCODE_GAME_STATE_UPDATE, encodeState(state), movePresences);
    }
  }
  return { state: state };
}
function matchTerminate(ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
  logger.info("matchTerminate called");
  return { state: state };
}
function matchSignal(ctx, logger, nk, dispatcher, tick, state, data) {
  return { state: state, data: "" };
}
function matchmakerMatched(ctx, logger, nk, matches) {
  logger.info("Matchmaker matched: %d players", matches.length);
  try {
    var matchId = nk.matchCreate("tictactoe", {});
    logger.info("Created match: %s", matchId);
    return matchId;
  } catch (e) {
    logger.error("Failed to create match: %s", String(e));
  }
}
function InitModule(ctx, logger, nk, initializer) {
  logger.info("Initializing tictactoe module");
  initializer.registerMatch("tictactoe", {
    matchInit: matchInit,
    matchJoinAttempt: matchJoinAttempt,
    matchJoin: matchJoin,
    matchLeave: matchLeave,
    matchLoop: matchLoop,
    matchTerminate: matchTerminate,
    matchSignal: matchSignal
  });
  initializer.registerMatchmakerMatched(matchmakerMatched);
  logger.info("tictactoe module initialized successfully");
}
