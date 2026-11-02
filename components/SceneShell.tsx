"use client";
import type { ReactNode } from "react";
import { AudioToggle } from "./AudioToggle";
import { ProgressIndicator } from "./ProgressIndicator";
import type { Scene } from "@/lib/sceneMachine";

export interface SceneNav {
  next: () => void;
  back: () => void;
  home: () => void;
  goTo: (scene: Scene) => void;
  replayAdventure: () => void;
}

export function SceneShell({
  scene,
  nav,
  musicEnabled,
  onToggleMusic,
  children,
}: {
  scene: Scene;
  nav: SceneNav;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  children: ReactNode;
}) {
  const showBack = scene !== "intro";
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ height: "100dvh" }}>
      {children}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between px-3 pt-3" style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}>
        <div className="pointer-events-auto flex gap-2">
          {showBack && (
            <>
              <button type="button" className="icon-btn" aria-label="Home: back to the birthday intro" title="Home" onClick={nav.home}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 11 12 3l9 8" />
                  <path d="M5 10v10h5v-6h4v6h5V10" />
                </svg>
              </button>
              <button type="button" className="icon-btn" aria-label="Back to the previous scene" title="Back" onClick={nav.back}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
        <div className="pointer-events-auto glass px-4 py-1.5">
          <ProgressIndicator scene={scene} />
        </div>
        <div className="pointer-events-auto">
          <AudioToggle enabled={musicEnabled} onToggle={onToggleMusic} />
        </div>
      </header>
    </div>
  );
}
