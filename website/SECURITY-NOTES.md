# Security Tracking Notes

Tracks known dependency advisories that are currently **deferred** (no fix available
or accepted risk) for the `website/` Docusaurus project. Remove entries once resolved.

## Open / Deferred

### image-size — DoS via infinite loop in ICNS / JXL / HEIF parsers
- **Severity:** High
- **Advisories:** GHSA (image-size ICNS DoS), GHSA (image-size JXL/HEIF DoS) — npm advisory 1138809
- **Affected range:** `<=2.0.2` (all published versions)
- **Resolved version in lockfile:** `2.0.2` (latest release)
- **Fix status:** No patch available as of 2026-08-19.
- **Dependency path (transitive):**
  `@docusaurus/preset-classic > @docusaurus/theme-classic > @docusaurus/plugin-content-blog > @docusaurus/core > @docusaurus/mdx-loader > image-size`
- **Risk assessment:** Low in practice. `image-size` runs at **build time** for a
  static documentation site; it does not process untrusted, user-supplied images at
  runtime. Exploitation would require a maliciously crafted image committed to the docs.
- **Remediation trigger:** When a patched `image-size` release ships (or Docusaurus
  bumps its transitive dependency), add a `resolutions` entry in `package.json`:
  ```json
  "resolutions": {
    "image-size": "^<patched-version>"
  }
  ```
  then run `yarn install` and re-run `yarn audit --groups dependencies` to confirm 0 high findings.
- **Last reviewed:** 2026-08-25
