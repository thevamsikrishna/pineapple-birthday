import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { configuredPassword, tokenIsValid, UNLOCK_COOKIE } from "@/lib/gate";

export const runtime = "nodejs";

/**
 * Visit tracking sink. Receives small JSON events from lib/tracker.ts and:
 *   1. logs one structured line per event (visible in `vercel logs` / the Vercel dashboard), and
 *   2. if TRACK_WEBHOOK_URL is set, forwards a readable message there (Discord webhook format by
 *      default; set TRACK_WEBHOOK_FORMAT=json to receive the raw event instead).
 * Only unlocked visitors can post, so the feed is not spammable. No IP addresses or fingerprints
 * are stored: just the event, the scene, elapsed seconds, a per-visit id and a coarse device label.
 */
interface TrackEvent {
  visit: string;
  event: string;
  scene?: string;
  seconds?: number;
  detail?: string;
  at?: number;
}

const SCENE_NAMES: Record<string, string> = {
  intro: "1 · Intro",
  film: "2 · Birthday film",
  playground: "3 · Pineappleverse",
  finale: "4 · Make a wish",
};

function deviceLabel(ua: string): string {
  if (/iPhone|iPad/i.test(ua)) return "iPhone/iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  return "other";
}

function describe(e: TrackEvent, device: string, country: string): string {
  const scene = e.scene ? (SCENE_NAMES[e.scene] ?? e.scene) : "";
  const secs =
    e.seconds !== undefined ? ` after ${Math.round(e.seconds)}s` : "";
  const who = `[${e.visit.slice(0, 6)} · ${device}${country ? " · " + country : ""}]`;
  switch (e.event) {
    case "unlocked":
      return `🔓 ${who} entered the password and opened the site`;
    case "scene_enter":
      return `👀 ${who} opened scene ${scene}${secs}`;
    case "scene_leave":
      return `⏱️ ${who} left scene ${scene} after ${Math.round(e.seconds ?? 0)}s on it`;
    case "film_play":
      return `▶️ ${who} pressed play on the film`;
    case "film_ended":
      return `🎬 ${who} watched the whole film`;
    case "film_skip":
      return `⏭️ ${who} skipped the film${secs}`;
    case "surprise_found":
      return `🎁 ${who} found a surprise: ${e.detail}`;
    case "candles_out":
      return `🕯️ ${who} blew out all the candles (${e.detail})`;
    case "card_saved":
      return `💌 ${who} saved the birthday card`;
    case "visit_end":
      return `👋 ${who} closed the site after ${Math.round(e.seconds ?? 0)}s total, last scene ${scene}`;
    default:
      return `• ${who} ${e.event}${scene ? " · " + scene : ""}${secs}`;
  }
}

export async function POST(req: Request) {
  if (process.env.TRACKING === "off")
    return NextResponse.json({ ok: true, skipped: true });
  const password = configuredPassword();
  if (password) {
    const jar = await cookies();
    if (!tokenIsValid(jar.get(UNLOCK_COOKIE)?.value, password))
      return NextResponse.json({ ok: false }, { status: 401 });
  }
  let events: TrackEvent[] = [];
  try {
    const body = (await req.json()) as { events?: TrackEvent[] };
    events = Array.isArray(body.events) ? body.events.slice(0, 20) : [];
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const device = deviceLabel(req.headers.get("user-agent") ?? "");
  const country = req.headers.get("x-vercel-ip-country") ?? "";
  const lines: string[] = [];
  for (const e of events) {
    if (!e || typeof e.visit !== "string" || typeof e.event !== "string")
      continue;
    const record = { ts: new Date().toISOString(), device, country, ...e };
    console.log(`[pineapple-track] ${JSON.stringify(record)}`);
    lines.push(describe(e, device, country));
  }
  const webhook = process.env.TRACK_WEBHOOK_URL;
  if (webhook && lines.length) {
    try {
      const json = process.env.TRACK_WEBHOOK_FORMAT === "json";
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          json
            ? { device, country, events }
            : { content: lines.join("\n").slice(0, 1900) },
        ),
      });
    } catch (err) {
      console.error("[pineapple-track] webhook failed", err);
    }
  }
  return NextResponse.json({ ok: true, received: lines.length });
}
