import { cookies } from "next/headers";
import { BirthdayExperience } from "@/components/BirthdayExperience";
import { UnlockGate } from "@/components/UnlockGate";
import { configuredPassword, tokenIsValid, UNLOCK_COOKIE } from "@/lib/gate";

export const dynamic = "force-dynamic";

/**
 * The single page. When a password is configured, visitors see the gate until the unlock
 * cookie is set; then the four-scene experience renders. Without a configured password in
 * development the site opens directly (so `npm run dev` just works); in production it stays locked.
 */
export default async function Page() {
  const password = configuredPassword();
  const jar = await cookies();
  const unlocked = password
    ? tokenIsValid(jar.get(UNLOCK_COOKIE)?.value, password)
    : process.env.NODE_ENV !== "production";
  if (!unlocked) return <UnlockGate configured={!!password} />;
  return (
    <main className="h-full w-full">
      <BirthdayExperience />
    </main>
  );
}
