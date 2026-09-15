import type { Metadata } from "next";
import {
  ProjectExternalLink,
  ProjectIntro,
  ProjectPageHeader,
  ProjectRailSection,
  ProjectStorySection,
} from "@/components/projects/ProjectPage";
import styles from "@/components/projects/project-page.module.css";
import localStyles from "./lerobot-state-atlas.module.css";

const description = "Robot workspace intelligence: an editorial account of LeRobot dataset analysis, forward kinematics, spatial coverage, and ongoing environment reconstruction work.";

export const metadata: Metadata = {
  title: "LeRobot State Atlas",
  description,
  alternates: { canonical: "/projects/lerobot-state-atlas" },
  openGraph: { type: "website", title: "LeRobot State Atlas — Omprakash Sahani", description, siteName: "Omprakash Sahani" },
  twitter: { card: "summary", title: "LeRobot State Atlas — Omprakash Sahani", description },
};

export default function LeRobotStateAtlasPage() {
  return (
    <main id="main-content" className={styles.projectPage}>
      <ProjectPageHeader title="LeRobot State Atlas" backHref="/" backLabel="Return to homepage" />

      <article className={styles.projectComposition} aria-labelledby="project-title">
        <div className={localStyles.introLayout}>
          <ProjectIntro
            headingId="project-title"
            eyebrow="Project / Robot Learning"
            title="LeRobot State Atlas"
            subtitle="Robot Workspace Intelligence"
          >
            <p>LeRobot State Atlas is a robotics-data analysis and visualization project I am developing to understand how recorded robot demonstrations occupy physical workspace.</p>
            <p>It converts robot state trajectories into end-effector motion and spatial coverage so repeated, sparse, and unusual regions can be inspected.</p>
          </ProjectIntro>

          <figure className={localStyles.introMedia}>
            <video
              src="/videos/projects/lerobot-state-atlas/gaussian-splat-demo.mp4"
              aria-label="Gaussian Splat workspace reconstruction demo"
              controls
              playsInline
              preload="metadata"
            />
            <figcaption>Gaussian Splat · Workspace Reconstruction</figcaption>
          </figure>
        </div>

        <div className={styles.bodyGrid}>
          <div className={styles.narrative}>
            <ProjectStorySection headingId="overview-heading" title="Overview">
              <p>LeRobot State Atlas is a robotics-data analysis and visualization project I am developing to understand how recorded robot demonstrations occupy physical workspace. It converts robot state trajectories into end-effector motion, aggregates them into spatial coverage, and makes it easier to inspect repeated, sparse, and unusual regions across demonstrations.</p>
            </ProjectStorySection>

            <ProjectStorySection headingId="problem-heading" title="The Problem">
              <p>Robot datasets can contain thousands of frames, but raw trajectories alone do not make it obvious where the robot spends most of its time, which areas are rarely reached, how demonstrations differ, or where additional data may be useful. I wanted a way to inspect those patterns spatially instead of treating the dataset only as rows of state values.</p>
            </ProjectStorySection>

            <ProjectStorySection headingId="approach-heading" title="Approach">
              <p>The pipeline loads selected LeRobot episodes and maps robot joint state through a compatible TRLC-DK1 follower URDF. Forward kinematics computes the left and right tool motion. Configurable arm-base transforms place the two arms in shared workspace coordinates before the workspace is voxelized.</p>
              <p>From there, I analyze tool-point visits, distinct-episode coverage, local spatial regions, and trajectories. Radius queries use exact distances between voxel centres. The shared placement is configurable; it does not establish calibrated physical geometry.</p>
            </ProjectStorySection>

            <ProjectStorySection headingId="built-heading" title="What I Built">
              <p>I implemented the dataset inspection and processing workflow, a forward-kinematics workspace pipeline, and static and interactive workspace visualizations. I added bounded multi-episode aggregation, voxel-centred radius queries, trajectory playback and timeline scrubbing, and episode-level uncommon-space exploration. Deterministic browser-data export supports a Next.js web viewer and live demo. I also developed Gaussian environment viewing and diagnostics for local development; that environment layer is not yet available in the production demo.</p>
            </ProjectStorySection>

            <ProjectStorySection headingId="evidence-heading" title="Evidence">
              <p>A validation run on selected episodes 0 through 9 produced:</p>
              <dl className={styles.metrics}>
                <div><dt>Episodes</dt><dd>10</dd></div>
                <div><dt>Dataset frames</dt><dd>5,124</dd></div>
                <div><dt>Tool-point visits</dt><dd>10,248</dd></div>
                <div><dt>Arm-specific occupied voxels</dt><dd>1,224</dd></div>
              </dl>
              <p className={localStyles.evidenceNote}>Validation uses a 0.020 m voxel size.</p>
              <p className={localStyles.evidenceNote}>These counts describe the selected validation episodes, not the entire source dataset. Each frame contributes one tool-point visit per arm; occupied voxels are counted separately for each arm.</p>
            </ProjectStorySection>

            <ProjectStorySection headingId="current-work-heading" title="Current Work">
              <p>I am currently extending the atlas toward reconstructed environment context using Gaussian Splatting, together with viewing diagnostics, camera constraints, and the calibration work required to relate the reconstructed scene to the robot workspace.</p>
            </ProjectStorySection>

            <ProjectStorySection headingId="boundaries-heading" title="Boundaries">
              <p>Shared-world arm placement remains configurable. The 0.8 m baseline spacing is a visualization assumption, not calibrated geometry. Environment reconstruction and robot-to-environment registration remain active work; the system is not a validated digital twin.</p>
            </ProjectStorySection>
          </div>

          <aside className={styles.projectRail} aria-label="Project facts">
            <ProjectRailSection headingId="links-heading" title="Links">
              <div className={styles.projectLinks}>
                <ProjectExternalLink href="https://github.com/OmprakashSahani/lerobot-state-atlas">GitHub Repository</ProjectExternalLink>
                <ProjectExternalLink href="https://lerobot-state-atlas.vercel.app">Live Demo</ProjectExternalLink>
              </div>
            </ProjectRailSection>

            <ProjectRailSection headingId="facts-heading" title="Project">
              <dl className={styles.facts}>
                <div><dt>Area</dt><dd>Robot Learning · ML Systems</dd></div>
                <div><dt>Status</dt><dd>Active development</dd></div>
                <div><dt>License</dt><dd>Apache-2.0</dd></div>
              </dl>
            </ProjectRailSection>

            <ProjectRailSection headingId="features-heading" title="Features">
              <ul className={styles.railList}>
                <li>Dataset inspection</li>
                <li>Forward kinematics</li>
                <li>Dual-arm workspace coverage</li>
                <li>Multi-episode aggregation</li>
                <li>Trajectory playback</li>
                <li>Exact spatial queries</li>
                <li>Uncommon-space analysis</li>
                <li>Gaussian environment viewing <span className={localStyles.developmentNote}>(development)</span></li>
              </ul>
            </ProjectRailSection>

            <ProjectRailSection headingId="tools-heading" title="Tools">
              <div className={styles.toolGroups}>
                <div>
                  <h3 className={styles.railLabel}>Core</h3>
                  <ul className={styles.railList}><li>Python</li><li>LeRobot</li><li>PyTorch</li><li>Plotly</li></ul>
                </div>
                <div>
                  <h3 className={styles.railLabel}>Web</h3>
                  <ul className={styles.railList}><li>Next.js</li><li>React</li><li>Three.js</li><li>React Three Fiber</li></ul>
                </div>
                <div className={localStyles.environmentTools}>
                  <h3 className={styles.railLabel}>Environment</h3>
                  <ul className={styles.railList}><li>Spark / Gaussian Splat</li></ul>
                </div>
              </div>
            </ProjectRailSection>

            <ProjectRailSection headingId="workflow-heading" title="Development Workflow" className={localStyles.workflow}>
              <dl className={styles.facts}>
                <div><dt>Codex</dt><dd>GPT-6 Astra · High</dd></div>
                <div><dt>ChatGPT</dt><dd>GPT-5.6 Sol</dd></div>
              </dl>
            </ProjectRailSection>

            <ProjectRailSection headingId="guidance-heading" title="Project Guidance" className={localStyles.guidance}>
              <p className={localStyles.guideName}>Dominique Paul</p>
              <p>CEO, Dream Machines</p>
              <p className={localStyles.guidanceNote}>Guiding the project direction and requirements.</p>
            </ProjectRailSection>
          </aside>
        </div>
      </article>

      <div className={styles.footerRule} />
    </main>
  );
}
