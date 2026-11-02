"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { StarField } from "./effects/StarField";
import { MomoMascot } from "./MomoMascot";
import { track } from "@/lib/tracker";

/** The password door in front of the four scenes. Not a scene: it only renders when locked. */
export function UnlockGate({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "wrong" | "error">(
    "idle",
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim() || status === "checking") return;
    setStatus("checking");
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        track("unlocked");
        router.refresh();
        return;
      }
      setStatus(res.status === 401 ? "wrong" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <main
      className="relative h-full w-full overflow-hidden"
      style={{
        height: "100dvh",
        background:
          "radial-gradient(120% 80% at 50% 110%, #5b4ab8 0%, #2a2457 38%, var(--indigo) 75%)",
      }}
    >
      <StarField />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
        <MomoMascot
          size={120}
          tapClip="wave"
          label="Momo the monkey, guarding the door"
        />
        <p className="eyebrow mt-4">A tiny world of surprises</p>
        <h1 className="display mt-2 text-3xl text-cream sm:text-4xl">
          Psst… what’s the secret word?
        </h1>
        <p className="mt-2 max-w-[22rem] text-sm text-cream/75">
          Momo only opens the door for one person. Type the password you were
          given.
        </p>
        {configured ? (
          <form
            onSubmit={submit}
            className="mt-6 flex w-full max-w-[22rem] flex-col gap-3"
          >
            <label className="sr-only" htmlFor="pb-password">
              Password
            </label>
            <input
              id="pb-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="Password"
              className="glass h-12 w-full rounded-full px-5 text-center text-base text-cream placeholder:text-cream/40"
              data-testid="gate-password"
              aria-invalid={status === "wrong"}
              aria-describedby="pb-gate-status"
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === "checking"}
              data-testid="gate-submit"
            >
              {status === "checking" ? "Opening…" : "Open the door"}
            </button>
            <p
              id="pb-gate-status"
              className="min-h-[1.25rem] text-sm text-candy"
              role="status"
            >
              {status === "wrong"
                ? "That’s not it. Try again."
                : status === "error"
                  ? "Something went wrong. Please try again."
                  : ""}
            </p>
          </form>
        ) : (
          <p
            className="mt-6 max-w-[24rem] rounded-2xl bg-candy/15 px-4 py-3 text-sm text-cream"
            data-testid="gate-unconfigured"
          >
            The door has no password yet. Set <code>BIRTHDAY_PASSWORD</code> in
            the hosting environment variables (see README) and redeploy.
          </p>
        )}
      </div>
    </main>
  );
}
