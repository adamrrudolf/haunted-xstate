import { component, virtual, useMemo } from "haunted";
import { html } from "lit-html";
import useReducer from "./useImmerReducer";
import { diagonals, verticals } from "./matrixTransforms";

import "./style.css";

const SQUARE_WIDTH = 64;
const BORDER_WIDTH = 1;

const GameState = {
  WonX: "Won for X",
  WonO: "Won for O",
  Draw: "Cat's game",
  PlayingX: "X's turn",
  PlayingO: "O's turn"
};

const SpaceState = {
  Empty: "",
  PlayedX: "X",
  PlayedO: "O"
};

const Player = {
  X: "X",
  O: "O"
};

const Action = {
  Play: "play",
  Reset: "reset"
};

const board = virtual(({ size }) => {
  const [{ board, gameState }, dispatch] = useGame(size);

  const boardWidth = useMemo(
    () => SQUARE_WIDTH * board.length + BORDER_WIDTH * board.length * 2,
    [board.length]
  );

  return html`
    <style>
      div {
        box-style: border-box;
      }

      .game {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 auto;
      }

      .board {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        width: ${boardWidth}px;
      }

      .space {
        width: ${SQUARE_WIDTH}px;
        height: ${SQUARE_WIDTH}px;
        border: ${BORDER_WIDTH}px solid black;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .spaceToken {
        flex-vertical-align: middle;
      }

      .input {
        margin-bottom: 1em;
      }
    </style>

    <div class="game">
      <label class="input">
        Board size:
        <input
          type="number"
          value="${size}"
          @change="${({ target }) =>
            dispatch({
              type: Action.Reset,
              payload: asInt(target.value)
            })}"
        />
      </label>
      <div class="board">
        ${board.map((row, rowIndex) =>
          row.map(
            (space, colIndex) =>
              html`
                <button
                  aria-label="Space: ${colIndex}, ${rowIndex}"
                  class="space"
                  @click="${() =>
                    dispatch({
                      type: Action.Play,
                      payload: { rowIndex, colIndex }
                    })}"
                >
                  <span class="spaceToken">${space}</span>
                </button>
              `
          )
        )}
      </div>
      <p>${gameState}</p>
      <button @click="${() => dispatch({ type: Action.Reset })}">Reset</button>
    </div>
  `;
});

function useGame(initialSize) {
  const board = new Array(initialSize).fill(
    new Array(initialSize).fill(SpaceState.Empty)
  );

  return useReducer(
    (state, action) => {
      switch (action.type) {
        case Action.Play:
          const { rowIndex, colIndex } = action.payload;
          const { board, gameState } = state;
          const spaceAlreadyPlayed =
            board[rowIndex][colIndex] !== SpaceState.Empty;

          if (spaceAlreadyPlayed) {
            return;
          }

          if (gameState === GameState.PlayingO) {
            board[rowIndex][colIndex] = SpaceState.PlayedO;

            if (wins(Player.O, board)) {
              state.gameState = GameState.WonO;
              return;
            }

            state.gameState = GameState.PlayingX;
          }

          if (gameState === GameState.PlayingX) {
            board[rowIndex][colIndex] = SpaceState.PlayedX;

            if (wins(Player.X, board)) {
              state.gameState = GameState.WonX;
              return;
            }

            state.gameState = GameState.PlayingO;
          }

          if (draw(board)) {
            state.gameState = GameState.Draw;
          }

          break;
        case Action.Reset:
          const { payload } = action;
          const nextSize = payload || state.size;

          state.board = new Array(nextSize).fill(
            new Array(nextSize).fill(SpaceState.Empty)
          );

          state.gameState = GameState.PlayingX;

          state.size = nextSize;
          break;
        default:
          return;
      }
    },
    { gameState: GameState.PlayingX, board, size: initialSize }
  );
}

function wins(player, board) {
  const rowIsAllPlayed = (row) => row.every((space) => space === player);
  const horizontalWin = board.some(rowIsAllPlayed);
  const verticalWin = verticals(board).some(rowIsAllPlayed);
  const diagonalWin = diagonals(board).some(rowIsAllPlayed);

  return horizontalWin || verticalWin || diagonalWin;
}

function draw(board) {
  const horizontalDraw = board.every(rowHasSomeOfBothPlayers);
  const verticalDraw = verticals(board).every(rowHasSomeOfBothPlayers);
  const diagonalDraw = diagonals(board).every(rowHasSomeOfBothPlayers);

  return horizontalDraw && verticalDraw && diagonalDraw;
}

function rowHasSomeOfBothPlayers(row) {
  const hasX = row.some((space) => space === Player.X);
  const hasO = row.some((space) => space === Player.O);
  return hasX && hasO;
}

function asInt(input) {
  return parseInt(input, 10);
}

customElements.define(
  "tic-tac-toe",
  component((el) => {
    const size = el.getAttribute("size");
    return html` ${board({ size: asInt(size) })} `;
  })
);
