import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  isSessionTokenValid,
} from "./session-token";

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function hasActiveSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return isSessionTokenValid(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

/**
 * Defense-in-depth for Server Actions: proxy.ts already gates every page
 * except /login, but Server Actions are POST requests to their own page
 * route, so their protection depends on that matcher staying correct.
 * Call this at the top of every mutating action so a future matcher
 * change can't silently open one up.
 */
export async function requireSession(): Promise<void> {
  if (!(await hasActiveSession())) {
    redirect("/login");
  }
}
