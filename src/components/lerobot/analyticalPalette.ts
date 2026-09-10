// Scale interpolation adapted from OmprakashSahani/lerobot-state-atlas
// (Apache-2.0), commit 39116927d8d0fc56c4a380678a3d645ae0f893ac.
// Presentation only. Keep the shared metric domain and original linear stop
// interpolation; analytical values and normalization remain unchanged.
export const ARM_COLORS = { left: "#28766e", right: "#a65f45" } as const;
export const QUERY_COLOR = "#80651f";
export const METRIC_COLORS = ["#4f7896", "#378c83", "#6f9d63", "#c2a24f"] as const;

const stops = METRIC_COLORS.map((hex) => [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)));

export function analyticalColorScale(value: number, minimum: number, maximum: number) {
  const amount = maximum === minimum ? 1 : (value - minimum) / (maximum - minimum);
  const scaled = Math.max(0, Math.min(1, amount)) * (stops.length - 1);
  const low = Math.floor(scaled);
  const high = Math.min(stops.length - 1, low + 1);
  const mix = scaled - low;
  return stops[low].map((channel, index) =>
    (channel + (stops[high][index] - channel) * mix) / 255,
  ) as [number, number, number];
}
