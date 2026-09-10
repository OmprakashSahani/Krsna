# LeRobot State Atlas integration foundation

## Source and license

- Repository: https://github.com/OmprakashSahani/lerobot-state-atlas
- Pinned source commit: `39116927d8d0fc56c4a380678a3d645ae0f893ac`
- Source license: Apache-2.0. The exact upstream license is retained at
  [licenses/lerobot-state-atlas-APACHE-2.0.txt](../licenses/lerobot-state-atlas-APACHE-2.0.txt).
- The pinned upstream tree contains no NOTICE file. Krsna's existing MIT LICENSE and NOTICE are unchanged.
- Copied/adapted TypeScript modules and tests carry a short source, commit, license, and modification notice.

## Phase 1 scope and file inventory

This phase prepares the data and analytical layer only. No route, viewer component,
portfolio styling, navigation change, deployment, or upstream modification is included.

Each source below maps from upstream `apps/web/lib/<path>` to
`src/lib/lerobot/<path>`:

- `atlas-schema/types.ts`
- `atlas-schema/validate.ts`
- `coordinates/runtimeSpacing.ts`
- `data/cachePolicy.ts`
- `data/episodeSelection.ts`
- `data/loadBundle.ts`
- `data/metrics.ts`
- `data/prepareCoverage.ts`
- `data/radiusQuery.ts`
- `data/uncommonEpisodes.ts`
- `playback/controller.ts`

Upstream `apps/web/tests/<name>.test.ts` files adapted into
`src/lib/lerobot/tests/`:

- `atlas-data.test.ts`
- `load-bundle.test.ts`
- `cache-policy.test.ts`
- `coverage-scaling.test.ts`
- `metrics.test.ts`
- `radius-query.test.ts`
- `runtime-spacing.test.ts`
- `uncommon-episodes.test.ts`
- `playback.test.ts`
- `trajectory-state.test.ts`
- `episode-videos.test.ts`

Additional Krsna regression tests: `demo-bundle.test.ts` and
`loading-contract.test.ts`. Additional boundary cases extend `radius-query.test.ts`.
The exact upstream `apps/web/public/atlas-data/demo-v1/manifest.json` is retained
as `src/lib/lerobot/tests/fixtures/demo-v1-manifest.json` solely for legacy-schema tests.
It is not publicly deployed.

## Intentional adaptations

1. Source imports change from `@/lib/...` to `@/lib/lerobot/...`.
2. The default bundle URL and permitted override namespace change from
   `/atlas-data/demo-v2` and `/atlas-data/` to
   `/lerobot-state-atlas/demo-v2` and `/lerobot-state-atlas/`.
   The existing `NEXT_PUBLIC_ATLAS_BUNDLE_BASE` option remains available, but accepts
   only safe root-relative paths inside the new namespace.
3. Bundle-base segment validation rejects trailing control characters too.
   The upstream anchored regular expression could accept a final newline.
4. A shared asset-path guard keeps coverage, optional trajectory/video metadata,
   and video assets bundle-relative. It rejects external/root-relative URLs,
   traversal, empty/dot segments, backslashes, percent escapes, query strings,
   fragments, and control characters before fetching the asset. Upstream did not
   guard manifest payload filenames this way. This tightens invalid-input behavior
   without changing valid bundle data or analytical calculations.
5. Tests use Krsna's existing Node-default Vitest setup and native assertions.
   Public JSON imports use relative paths; the legacy manifest is a test fixture.
6. The loader's self-contained timing result and `loadDemoBundleForBenchmark`
   export are retained to minimize source divergence. No benchmark publisher,
   staging script, environment experiment, or benchmark activation code is ported.

All other analytical source is unchanged apart from the provenance notice/imports.
No new calculations or episode-selection API were introduced. The decoded explicit
episode IDs and matching optional-state records are tested using reordered,
non-contiguous IDs. UI selection/focus behavior remains for a future phase.

## Dependencies

Exact new direct dependencies:

- Runtime: `three@0.180.0`, `@react-three/fiber@9.6.1`.
- Development: `@types/three@0.180.0`.

No existing dependency version is intentionally changed. No Spark, Drei, Zod,
plotting library, jest-dom, or direct Zustand dependency is added. Fiber itself
depends transitively on Zustand. No viewer code imports these runtime dependencies
in this phase.

## Static demo provenance and integrity

Files are copied byte-for-byte from upstream
`apps/web/public/atlas-data/demo-v2/` into
`public/lerobot-state-atlas/demo-v2/`.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| manifest.json | 2900 | `ad5415af2240b6279f2da4b3277286378d73aef5e5162c717d1fc4d5a16e5a6b` |
| coverage.json | 26564 | `1903ee315de47413d7dd42e85d50a83c5825b002563e4cce3f304de8bc51d90c` |
| trajectories.json | 333950 | `eb58ee7806fe1c3f1b682be8a03a2594ff53dd523f74202be90f1018baa5d476` |

Their Git blob IDs also match the pinned upstream tree:

- manifest.json: `ddde9da425f0921e01d3e22ff541503809118450`
- coverage.json: `8f1adb5d5bb79dac02b0012663bac6ec9bffbced`
- trajectories.json: `fbdb65f11e5ae279bd9cbddf294509e4ac1ea20d`

Total: 363414 bytes. Initial manifest plus coverage: 29464 bytes.
The tests verify exact sizes, SHA-256 values, and payload references in the manifest.
Runtime loading retains schema validation; it does not recompute SHA-256.

The unchanged schema v1.2 manifest records:

- Dataset `DreamMachines/actuator_unboxing_4h_diverse`, requested ref `v3.0`,
  resolved revision `e973df866c80f52884cc68355579043cab828e78`.
- Exporter source commit `12be4de8c9f256afe952b950fa1079d2ab173ac2`,
  clean working tree. This is export provenance, distinct from the integration's
  pinned web-source commit; it must not be rewritten.
- Coverage episodes 0–9, 5124 frames at 50 FPS, 10248 tool visits,
  1224 arm-specific entries (660 left, 564 right), 1205 shared grid cells.
- Trajectories only for episode 0 (515 samples) and episode 1 (445 samples).
  Episodes 2–9 remain coverage-only.
- Positions are precomputed in the right-handed shared-world frame, in metres.
  The 0.8m default arm spacing is explicitly uncalibrated.
- Recorded orientation and raw gripper values are optional capabilities with
  independent degradation. Gripper width and open/closed polarity are not calibrated.

No video metadata, MP4, scanned environment, URDF, or Python runtime is included.

## Semantic and loading contracts

- Initial loading requests and validates manifest, then coverage. Trajectories
  load only through explicit `loadTrajectories` calls.
- Missing optional video/trajectory declarations produce the existing descriptive
  unavailable errors without an asset request.
- Voxel centers use `origin + (index + 0.5) * voxelSize` with Float32 preparation.
- Visits remain per-arm exported counts; log visits use `Math.log1p`.
  Distinct counts use CSR; radius results use an exact episode-ID union.
- Metric domains and analysis include both arms, independent of UI visibility.
- Radius membership uses inclusive Euclidean center distance, epsilon `1e-7`
  for positive radius and zero epsilon for radius zero.
- Runtime spacing translates world Y by
  `±(runtimeSpacing - exportedSpacing) / 2`; no revoxelization or double transform.
- Playback advances by elapsed seconds × FPS × speed and selects the clamped,
  floored recorded sample. Episode identity remains the explicit source ID.
- Uncommonness uses `ln(E / c_v) / ln(E)` for E > 1, otherwise zero,
  averaged across an episode's touched arm-specific entries. Local scope does not
  replace E with a local episode count. Raw visits do not affect scores.
  Ordering is score descending, touched-entry count descending, ID ascending.
  Multiplication by 100 is a future presentation concern; scores remain unchanged.
- The upstream scoring entry point rejects nonpositive episode counts. The
  single-episode case is defined as zero; no valid zero-episode bundle is supported.
- Optional video timing retains timestamp-relative bounds and the 0.1s drift threshold.

## Phase 2 viewer foundation

The temporary server-component host is
`src/app/projects/lerobot-state-atlas/page.tsx`. It adds one project H1, the
requested description, static canonical/Open Graph/Twitter metadata, and the
client viewer. Krsna's global header/footer remain in place. Homepage/project
navigation and existing design pages remain unchanged.

The following files map from pinned upstream `apps/web/components/viewer/`
to `src/components/lerobot/`, with the same provenance notice as Phase 1:

- `ViewerEntry.tsx`
- `AtlasDataProvider.tsx`
- `ViewerStore.tsx`
- `AtlasViewer.tsx`
- `ViewerCanvas.tsx`
- `RobotDataLayer.tsx`
- `VoxelLayer.tsx`
- `BaseReferenceLayer.tsx`
- `InteractionLayer.tsx`
- `EndEffectorMarker.tsx`
- `EpisodeAnalysisPanel.tsx`
- `EnvironmentLayer.tsx`
- `EnvironmentStatus.tsx`

Intentional viewer adaptations:

- All analytical imports target the unchanged Phase 1 `src/lib/lerobot/` modules.
- Benchmark activation, Spark adapter, local environment hooks/configuration, and
  their canvas props are removed. Environment status reports the procedural grid
  and the absence of a validated scan; no experiment controls remain.
- Viewer H1s become H2s, leaving one route H1. The unsupported-WebGL fallback links
  to the upstream repository rather than the absent standalone methodology route.
- WebGL 2 detection stays at the client boundary; `next/dynamic` keeps the Three
  viewer out of SSR. The temporary detection context is released. A React error
  boundary handles viewer startup failures with an accessible retry fallback.
- The provider shares its initial loading promise across Strict Mode effect
  replay. Upstream's per-viewer lazy trajectory promise remains shared across
  playback and episode-analysis controls. No trajectories or video load initially.
- `viewer.module.css` contains only scoped viewer styles adapted from the upstream
  viewer rules. The temporary layout fits Krsna's shell, stacks at tablet/mobile
  widths, and retains readable controls. Standalone site styles are excluded.
  The upstream internal palette and analytical color normalization are retained;
  the final portfolio frame and visual redesign are deferred to Phase 3.

No dependencies, Phase 1 analytical modules/tests, or public payloads change in
Phase 2. No Python, URDF handling, kinematics, checkpoint comparison, scanned
environment assets, or additional routes are ported.

Viewer tests added under `src/components/lerobot/`:

- `AtlasViewer.test.tsx`: adapted viewer-only cases from upstream
  `content-accessibility.test.tsx`, using native Vitest/DOM assertions instead of
  adding jest-dom. Standalone content assertions are excluded.
- `EndEffectorMarker.test.tsx`: upstream symbolic orientation/gripper tests.
- `ViewerEntry.test.tsx`: adapted entry fallback tests plus startup failure,
  disabled viewer SSR, one-H1 route, and route metadata checks.
- `ViewerIntegration.test.tsx`: real provider/store/analytical modules with only
  the canvas mocked, covering initial/lazy requests, error/retry, metrics,
  visibility, spacing, selection/query/scoring, explicit episode identity,
  playback timing/speed/scrubbing/restart, and unavailable video.
- `VoxelLayer.test.tsx`: actual mesh picking callback, instance/arm identity,
  unshifted Float32 selection centers, and rendered runtime-spacing offsets.

The combined suite passes 276 tests (48 new tests plus the unchanged 228-test
Phase 1 suite, including the original 78 Krsna tests). Lint, TypeScript, production
build, and diff checks pass; both npm audits report zero vulnerabilities. The
production build statically prerenders the new route. Component tests mock WebGL
and do not establish rendering correctness on their own.

Real-browser verification uses temporary Playwright/Chromium tooling under `/tmp`,
outside Krsna's dependency tree, with SwiftShader software WebGL 2. At 1440×900,
768×900, and 390×900, the scene renders, real pointer clicks select voxels, manual
orbit/pan/zoom/reset and lazy playback work, and no horizontal page overflow or
fatal console errors are observed. Production browser requests are exactly
`manifest.json`, `coverage.json`, then one `trajectories.json` after activation;
opening unavailable media adds no request. Software WebGL validates browser integration, not physical-device
GPU performance. The long control stack and dark internal styling are intentional
Phase 2 presentation limitations.

## Updating the integration

Phase 1 validation: the original 78 tests passed before integration; the combined
suite passes 228 tests across 16 files (150 new analytical/data tests in 13 files).
Lint, TypeScript checking, production build, and tracked diff checks pass. Both
production-only and full npm audits report zero vulnerabilities. No existing
locked package version changed; npm only added the required dependency tree and
reclassified three existing packages as shared production dependencies.
The build required a rerun outside the sandbox after its TypeScript subprocess
output could not be read. The successful build contains only the existing routes.

1. Select and record a new upstream commit explicitly; do not track moving source
   at build or request time.
2. Compare the listed source/tests with both pinned revisions, preserving local
   import/path adaptations and reviewing any analytical changes separately.
3. Preserve the license and upstream export provenance. For changed public bytes,
   use a new bundle version/directory before enabling immutable caching.
4. Verify source blob identity, sizes, and SHA-256 values; update regression
   constants only after reviewing the new exported data.
5. Rerun semantic tests and the original Krsna suite, lint, type checking, build,
   diff checks, and dependency audits. Review lockfile changes for unrelated churn.
6. Do not modify the standalone repository or its deployment as part of a Krsna update.
