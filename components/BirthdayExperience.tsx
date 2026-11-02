"use client";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { initialState, reducer, transitionFor, type ExperienceAction, type Scene, type TransitionKind } from "@/lib/sceneMachine";
import { audio } from "@/lib/audioController";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { SceneShell, type SceneNav } from "./SceneShell";
import { SparkleTransition } from "./effects/SparkleTransition";
import { BirthdayIntroScene } from "./scenes/BirthdayIntroScene";
import { BirthdayFilmScene } from "./scenes/BirthdayFilmScene";
import { PineappleverseScene } from "./scenes/PineappleverseScene";
import { WishFinaleScene } from "./scenes/WishFinaleScene";

const TRANSITION_MS: Record<Exclude<TransitionKind, "none">, number> = {
  sparkles: 900,
  "pineapple-portal": 800,
  "gold-light": 850,
  "firework-wipe": 900,
};

/**
 * The single-page shell: owns the state machine, choreographs scene transitions,
 * and keeps the one global audio preference in sync with the Web Audio controller.
 */
export function BirthdayExperience() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [overlay, setOverlay] = useState<TransitionKind>("none");
  const reduced = useReducedMotion();
  const pending = useRef<number | null>(null);

  // Mirror the audio controller's enabled flag into state (and vice versa).
  useEffect(() => {
    const unsubscribe = audio.subscribe((enabled) => dispatch({ type: "SET_MUSIC", enabled }));
    return () => {
      unsubscribe();
    };
  }, []);

  const toggleMusic = useCallback(() => {
    void audio.toggle();
  }, []);

  /** Navigates with the scene-change choreography: cover → swap → reveal. */
  const travel = useCallback(
    (action: ExperienceAction, target: Scene) => {
      if (target === state.scene && action.type !== "REPLAY_ADVENTURE") return;
      const kind = transitionFor(state.scene, target);
      if (reduced) {
        dispatch(action);
        return;
      }
      if (pending.current) window.clearTimeout(pending.current);
      setOverlay(kind);
      audio.sfx(kind === "pineapple-portal" ? "portal" : "whoosh");
      pending.current = window.setTimeout(() => dispatch(action), (kind === "none" ? 0 : TRANSITION_MS[kind]) * 0.5);
    },
    [reduced, state.scene],
  );

  const nav: SceneNav = useMemo(() => {
    const order: Scene[] = ["intro", "film", "playground", "finale"];
    const i = order.indexOf(state.scene);
    return {
      next: () => i < order.length - 1 && travel({ type: "NEXT" }, order[i + 1]),
      back: () => i > 0 && travel({ type: "BACK" }, order[i - 1]),
      home: () => travel({ type: "HOME" }, "intro"),
      goTo: (scene) => travel({ type: "GO_TO", scene }, scene),
      replayAdventure: () => travel({ type: "REPLAY_ADVENTURE" }, "intro"),
    };
  }, [state.scene, travel]);

  useEffect(() => () => {
    if (pending.current) window.clearTimeout(pending.current);
  }, []);

  const onOverlayDone = useCallback(() => setOverlay("none"), []);

  const sceneKey = `${state.scene}-${state.runId}`;

  return (
    <SceneShell scene={state.scene} nav={nav} musicEnabled={state.musicEnabled} onToggleMusic={toggleMusic}>
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={sceneKey}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.1 : 0.45, ease: "easeOut" }}
        >
          {state.scene === "intro" && <BirthdayIntroScene nav={nav} musicEnabled={state.musicEnabled} onEnableMusic={() => audio.setEnabled(true)} />}
          {state.scene === "film" && <BirthdayFilmScene nav={nav} musicEnabled={state.musicEnabled} filmStatus={state.filmStatus} dispatch={dispatch} />}
          {state.scene === "playground" && <PineappleverseScene nav={nav} collected={state.collected} dispatch={dispatch} />}
          {state.scene === "finale" && (
            <WishFinaleScene nav={nav} candlesOut={state.candlesOut} fireworksTriggered={state.fireworksTriggered} dispatch={dispatch} />
          )}
        </motion.div>
      </AnimatePresence>
      {overlay !== "none" && <SparkleTransition kind={overlay} onDone={onOverlayDone} />}
    </SceneShell>
  );
}
