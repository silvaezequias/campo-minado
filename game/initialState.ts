import { Difficulties, GameState } from "./game";
import { DIFFICULTIES, generateBoard, getCellSize } from "./util";

const defaultDifficulty: Difficulties = "easy";
const defaultSettings = DIFFICULTIES[defaultDifficulty];

export const initialState: GameState = {
  time: 0,
  currentState: "START",
  isFlagMode: false,
  previewCells: new Set(),
  settings: defaultSettings,
  difficulty: defaultDifficulty,

  cellSize: getCellSize(defaultSettings.columns),
  board: generateBoard({
    enableBombs: false,
    settings: defaultSettings,
  }),
};
