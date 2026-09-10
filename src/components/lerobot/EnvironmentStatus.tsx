// Adapted from OmprakashSahani/lerobot-state-atlas (Apache-2.0),
// commit 39116927d8d0fc56c4a380678a3d645ae0f893ac; modified for the Krsna portfolio integration.


import styles from "./viewer.module.css";
export function EnvironmentStatus() {
  return (
    <section className={styles["control-section"] + " " + styles["environment-status"]} aria-labelledby="environment-heading">
      <div className={styles["section-title-row"]}><h2 id="environment-heading">Environment</h2><span>Independent layer</span></div>
      <dl>
        <div><dt>Current state</dt><dd>Analytical grid active</dd></div>
        <div><dt>Gaussian Splat status</dt><dd><span className={styles["unavailable"]}>Unavailable</span></dd></div>
      </dl>
      <p role="note">No validated Gaussian Splat scan or environment-to-robot calibration is bundled with this demo. No real reconstruction or calibrated environment alignment is claimed. The robot workspace viewer remains fully available.</p>
    </section>
  );
}
