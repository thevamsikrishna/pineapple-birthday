/**
 * Tiny, dependency-free state machine for the four-scene experience.
 * Pure functions so it is trivially unit-testable.
 */
export const SCENES = ["intro", "film", "playground", "finale"] as const;
export type Scene = (typeof SCENES)[number];

export type FilmStatus = "idle" | "loading" | "playing" | "paused" | "ended" | "error";
export type Collectible = "singing-pineapple" | "balloon" | "gift";
export const ALL_COLLECTIBLES: Collectible[] = ["singing-pineapple", "balloon", "gift"];

export type TransitionKind = "sparkles" | "pineapple-portal" | "gold-light" | "firework-wipe" | "none";

export interface ExperienceState {
  scene: Scene;
  previousScene: Scene | null;
  transition: TransitionKind;
  musicEnabled: boolean;
  filmStatus: FilmStatus;
  collected: Collectible[];
  candlesOut: [boolean, boolean, boolean];
  fireworksTriggered: boolean;
  /** Increments whenever the visitor replays the adventure, so scenes can remount. */
  runId: number;
}

export const initialState: ExperienceState = {
  scene: "intro",
  previousScene: null,
  transition: "none",
  musicEnabled: false,
  filmStatus: "idle",
  collected: [],
  candlesOut: [false, false, false],
  fireworksTriggered: false,
  runId: 0,
};

export type ExperienceAction =
  | { type: "GO_TO"; scene: Scene }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "HOME" }
  | { type: "TOGGLE_MUSIC" }
  | { type: "SET_MUSIC"; enabled: boolean }
  | { type: "FILM_STATUS"; status: FilmStatus }
  | { type: "COLLECT"; item: Collectible }
  | { type: "BLOW_CANDLE"; index: 0 | 1 | 2 }
  | { type: "BLOW_ALL" }
  | { type: "RELIGHT_CANDLES" }
  | { type: "FIREWORKS_DONE" }
  | { type: "REPLAY_ADVENTURE" };

export function sceneIndex(scene: Scene): number {
  return SCENES.indexOf(scene);
}

/** The choreography between two scenes, per the brief's transition table. */
export function transitionFor(from: Scene, to: Scene): TransitionKind {
  if (from === "intro" && to === "film") return "sparkles";
  if (from === "film" && to === "playground") return "pineapple-portal";
  if (from === "playground" && to === "finale") return "gold-light";
  if (from === "finale" && to === "intro") return "firework-wipe";
  return "sparkles";
}

function moveTo(state: ExperienceState, scene: Scene): ExperienceState {
  if (scene === state.scene) return state;
  return {
    ...state,
    previousScene: state.scene,
    scene,
    transition: transitionFor(state.scene, scene),
    // Leaving the film scene resets playback status so a fresh poster shows on return.
    filmStatus: scene === "film" ? state.filmStatus : "idle",
  };
}

export function allCandlesOut(state: Pick<ExperienceState, "candlesOut">): boolean {
  return state.candlesOut.every(Boolean);
}

export function allSurprisesFound(state: Pick<ExperienceState, "collected">): boolean {
  return ALL_COLLECTIBLES.every((c) => state.collected.includes(c));
}

export function reducer(state: ExperienceState, action: ExperienceAction): ExperienceState {
  switch (action.type) {
    case "GO_TO":
      return moveTo(state, action.scene);
    case "NEXT": {
      const i = sceneIndex(state.scene);
      return i < SCENES.length - 1 ? moveTo(state, SCENES[i + 1]) : state;
    }
    case "BACK": {
      const i = sceneIndex(state.scene);
      return i > 0 ? moveTo(state, SCENES[i - 1]) : state;
    }
    case "HOME":
      return moveTo(state, "intro");
    case "TOGGLE_MUSIC":
      return { ...state, musicEnabled: !state.musicEnabled };
    case "SET_MUSIC":
      return state.musicEnabled === action.enabled ? state : { ...state, musicEnabled: action.enabled };
    case "FILM_STATUS":
      return state.filmStatus === action.status ? state : { ...state, filmStatus: action.status };
    case "COLLECT":
      // Guard against double-collection on repeated taps.
      if (state.collected.includes(action.item)) return state;
      return { ...state, collected: [...state.collected, action.item] };
    case "BLOW_CANDLE": {
      if (state.candlesOut[action.index]) return state;
      const candlesOut = [...state.candlesOut] as [boolean, boolean, boolean];
      candlesOut[action.index] = true;
      const fireworksTriggered = state.fireworksTriggered || candlesOut.every(Boolean);
      return { ...state, candlesOut, fireworksTriggered };
    }
    case "BLOW_ALL":
      return { ...state, candlesOut: [true, true, true], fireworksTriggered: true };
    case "RELIGHT_CANDLES":
      return { ...state, candlesOut: [false, false, false], fireworksTriggered: false };
    case "FIREWORKS_DONE":
      return state;
    case "REPLAY_ADVENTURE":
      return {
        ...initialState,
        musicEnabled: state.musicEnabled, // music preference persists across replays
        previousScene: state.scene,
        transition: transitionFor(state.scene, "intro"),
        runId: state.runId + 1,
      };
    default:
      return state;
  }
}
