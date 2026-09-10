// Adapted from OmprakashSahani/lerobot-state-atlas (Apache-2.0),
// commit 39116927d8d0fc56c4a380678a3d645ae0f893ac; modified for the Krsna portfolio integration.

import { describe, expect, it } from "vitest";

import {
  atlasCacheControl,
  atlasFetchOptions,
} from "@/lib/lerobot/data/cachePolicy";

describe("atlas cache policy", () => {
  it("disables storage for development responses and fetches", () => {
    expect(atlasCacheControl("development")).toBe("no-store, max-age=0");
    expect(atlasFetchOptions("development")).toEqual({ cache: "no-store" });
  });

  it("keeps production responses immutable without disabling fetch caching", () => {
    expect(atlasCacheControl("production")).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(atlasFetchOptions("production")).toBeUndefined();
  });
});
