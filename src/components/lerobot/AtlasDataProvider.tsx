// Adapted from OmprakashSahani/lerobot-state-atlas (Apache-2.0),
// commit 39116927d8d0fc56c4a380678a3d645ae0f893ac; modified for the Krsna portfolio integration.

"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { AtlasData } from "@/lib/lerobot/atlas-schema/types";
import { loadDemoBundle } from "@/lib/lerobot/data/loadBundle";

type AtlasDataState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AtlasData };

const AtlasDataContext = createContext<AtlasDataState | null>(null);

export function AtlasDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AtlasDataState>({ status: "loading" });
  const requestRef = useRef<Promise<AtlasData> | null>(null);

  useEffect(() => {
    let active = true;
    // Share the initial request across React Strict Mode's effect replay.
    const request = requestRef.current ??= loadDemoBundle();
    request
      .then((data) => {
        if (active) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "The atlas data could not be loaded.",
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AtlasDataContext.Provider value={state}>
      {children}
    </AtlasDataContext.Provider>
  );
}

export function useAtlasData() {
  const value = useContext(AtlasDataContext);
  if (!value) {
    throw new Error("useAtlasData must be used inside AtlasDataProvider.");
  }
  return value;
}
