// Adapted from OmprakashSahani/lerobot-state-atlas (Apache-2.0),
// commit 39116927d8d0fc56c4a380678a3d645ae0f893ac; modified for the Krsna portfolio integration.

export function formatEpisodeSelection(
  episodeIds: readonly number[],
  episodeCount: number,
): string {
  if (episodeIds.length === 1) {
    return `episode ${episodeIds[0]}`;
  }

  const isContiguous = episodeIds.every(
    (episodeId, index) => index === 0 || episodeId === episodeIds[index - 1] + 1,
  );
  if (episodeIds.length > 1 && isContiguous) {
    return `episodes ${episodeIds[0]}–${episodeIds[episodeIds.length - 1]}`;
  }

  return `${episodeCount} selected ${episodeCount === 1 ? "episode" : "episodes"}`;
}
