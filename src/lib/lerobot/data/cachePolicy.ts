// Adapted from OmprakashSahani/lerobot-state-atlas (Apache-2.0),
// commit 39116927d8d0fc56c4a380678a3d645ae0f893ac; modified for the Krsna portfolio integration.

export type RuntimeEnvironment = "development" | "production" | "test";

export function atlasCacheControl(environment: RuntimeEnvironment): string {
  return environment === "development"
    ? "no-store, max-age=0"
    : "public, max-age=31536000, immutable";
}

export function atlasFetchOptions(
  environment: RuntimeEnvironment,
): RequestInit | undefined {
  return environment === "development" ? { cache: "no-store" } : undefined;
}
