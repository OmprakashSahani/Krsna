import { useMemo, useSyncExternalStore } from "react";
import { vi } from "vitest";

const change = "test-navigation";
function subscribe(listener: () => void) {
  window.addEventListener(change, listener);
  window.addEventListener("popstate", listener);
  return () => {
    window.removeEventListener(change, listener);
    window.removeEventListener("popstate", listener);
  };
}
const snapshot = () => window.location.pathname + window.location.search;

const nativePushState = window.history.pushState.bind(window.history);
window.history.pushState = (data, unused, url) => {
  nativePushState(data, unused, url);
  window.dispatchEvent(new Event(change));
};

export function setTestUrl(url: string) {
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(change));
}

const router = {
  push: (url: string) => {
    window.history.pushState(null, "", url);
  },
  replace: setTestUrl,
};

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => useSyncExternalStore(subscribe, snapshot, snapshot).split("?")[0],
  useSearchParams: () => {
    const url = useSyncExternalStore(subscribe, snapshot, snapshot);
    const search = url.includes("?") ? url.slice(url.indexOf("?")) : "";
    return useMemo(() => new URLSearchParams(search), [search]);
  },
}));
