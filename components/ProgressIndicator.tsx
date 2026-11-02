"use client";
import { SCENES, sceneIndex, type Scene } from "@/lib/sceneMachine";

const TITLES: Record<Scene, string> = {
  intro: "Happy Birthday",
  film: "The Birthday Film",
  playground: "Pineappleverse",
  finale: "Make a Wish",
};

export function ProgressIndicator({ scene }: { scene: Scene }) {
  const i = sceneIndex(scene);
  return (
    <div className="flex flex-col items-center gap-1" aria-live="polite">
      <span className="font-display text-sm tracking-wide text-cream/95" style={{ fontFamily: "var(--font-display)" }}>
        {TITLES[scene]}
      </span>
      <span className="flex items-center gap-1.5" aria-label={`Scene ${i + 1} of ${SCENES.length}`}>
        <span className="text-[11px] font-bold tracking-[0.2em] text-honey">
          {String(i + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")}
        </span>
        <span className="ml-1 flex gap-1" aria-hidden="true">
          {SCENES.map((s, j) => (
            <span
              key={s}
              className="block h-1.5 rounded-full transition-all duration-500"
              style={{
                width: j === i ? 18 : 6,
                background: j <= i ? "var(--pineapple)" : "rgba(255,245,223,0.3)",
                boxShadow: j === i ? "0 0 10px rgba(255,215,94,0.8)" : undefined,
              }}
            />
          ))}
        </span>
      </span>
    </div>
  );
}
