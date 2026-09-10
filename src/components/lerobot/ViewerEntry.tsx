// Adapted from OmprakashSahani/lerobot-state-atlas (Apache-2.0),
// commit 39116927d8d0fc56c4a380678a3d645ae0f893ac; modified for the Krsna portfolio integration.

"use client";

import styles from "./viewer.module.css";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useState } from "react";

import { AtlasDataProvider } from "./AtlasDataProvider";
import { ViewerStore } from "./ViewerStore";

function ViewerLoading() {
  return (
    <div className={styles["viewer-status"]} role="status" aria-live="polite">
      <span className={styles["status-pulse"]} aria-hidden="true" />
      Loading 3D viewer…
    </div>
  );
}

const AtlasViewer = dynamic(
  () => import("./AtlasViewer").then((module) => module.AtlasViewer),
  {
    ssr: false,
    loading: ViewerLoading,
  },
);

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    if (!window.WebGL2RenderingContext) return false;
    const context = canvas.getContext("webgl2");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

function ViewerContent() {
  const [support, setSupport] = useState<"checking" | "ready" | "missing">(
    "checking",
  );

  useEffect(() => {
    const detectionFrame = window.requestAnimationFrame(() => {
      setSupport(hasWebGL() ? "ready" : "missing");
    });

    return () => window.cancelAnimationFrame(detectionFrame);
  }, []);

  if (support === "checking") {
    return <ViewerLoading />;
  }

  if (support === "missing") {
    return <WebGLFallback />;
  }
  return (
    <AtlasDataProvider>
      <ViewerStore>
        <AtlasViewer />
      </ViewerStore>
    </AtlasDataProvider>
  );
}

function WebGLFallback() {
  return (
    <section className={styles["viewer-fallback"]} role="alert">
      <p className={styles["eyebrow"]}>WebGL unavailable</p>
      <h2>The interactive scene needs WebGL 2.</h2>
      <p>This browser or graphics configuration cannot create the viewer. Source data and methodology remain available on GitHub.</p>
      <a href="https://github.com/OmprakashSahani/lerobot-state-atlas" target="_blank" rel="noopener noreferrer">
        View source and methodology<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </section>
  );
}

class ViewerErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? (
      <section className={styles["viewer-fallback"]} role="alert">
        <h2>Viewer unavailable</h2>
        <p>The interactive viewer could not be started. Reload the page to try again.</p>
        <button className={styles["compact-button"]} type="button" onClick={() => window.location.reload()}>Retry viewer</button>
      </section>
    ) : this.props.children;
  }
}

export function ViewerEntry() {
  return (
    <div className={styles["viewer-root"]}>
      <ViewerErrorBoundary><ViewerContent /></ViewerErrorBoundary>
    </div>
  );
}
