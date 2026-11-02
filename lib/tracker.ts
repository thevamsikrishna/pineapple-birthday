"use client";
/**
 * Tiny visit tracker. Queues events and ships them with sendBeacon so nothing blocks the
 * experience. Disabled when the owner opens the site with ?owner=1 once (remembered per browser),
 * or when the server has TRACKING=off.
 */
export type TrackEventName =
  | "unlocked"
  | "scene_enter"
  | "scene_leave"
  | "film_play"
  | "film_ended"
  | "film_skip"
  | "surprise_found"
  | "candles_out"
  | "card_saved"
  | "visit_end";

const OWNER_KEY = "pb-owner";
const VISIT_KEY = "pb-visit";
const queue: Record<string, unknown>[] = [];
let flushTimer: number | null = null;
let visitStart = 0;
let currentScene: string | null = null;
let sceneStart = 0;

function safeGet(store: Storage, key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function isOwner(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("owner") === "1") {
      localStorage.setItem(OWNER_KEY, "1");
      return true;
    }
    if (params.get("owner") === "0") localStorage.removeItem(OWNER_KEY);
  } catch {
    /* ignore */
  }
  return safeGet(localStorage, OWNER_KEY) === "1";
}

function visitId(): string {
  let id = safeGet(sessionStorage, VISIT_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    try {
      sessionStorage.setItem(VISIT_KEY, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

function flush() {
  if (flushTimer) {
    window.clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (!queue.length) return;
  const body = JSON.stringify({ events: queue.splice(0, 20) });
  const blob = new Blob([body], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/track", blob)) {
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

export function track(
  event: TrackEventName,
  data: { scene?: string; detail?: string; seconds?: number } = {},
) {
  if (typeof window === "undefined" || isOwner()) return;
  if (!visitStart) visitStart = Date.now();
  queue.push({ visit: visitId(), event, at: Date.now(), ...data });
  if (event === "visit_end") flush();
  else if (!flushTimer) flushTimer = window.setTimeout(flush, 1500);
}

/** Call whenever the scene changes; emits scene_leave (with time spent) + scene_enter. */
export function trackScene(scene: string) {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (currentScene && currentScene !== scene)
    track("scene_leave", {
      scene: currentScene,
      seconds: (now - sceneStart) / 1000,
    });
  if (currentScene !== scene) {
    currentScene = scene;
    sceneStart = now;
    track("scene_enter", {
      scene,
      seconds: visitStart ? (now - visitStart) / 1000 : 0,
    });
  }
}

/** Installs the end-of-visit beacon once. */
export function installVisitEnd() {
  if (typeof window === "undefined") return () => {};
  const onEnd = () => {
    if (document.visibilityState === "hidden") {
      track("visit_end", {
        scene: currentScene ?? undefined,
        seconds: visitStart ? (Date.now() - visitStart) / 1000 : 0,
      });
    }
  };
  document.addEventListener("visibilitychange", onEnd);
  window.addEventListener("pagehide", onEnd);
  return () => {
    document.removeEventListener("visibilitychange", onEnd);
    window.removeEventListener("pagehide", onEnd);
  };
}
