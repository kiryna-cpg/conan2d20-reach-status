# Changelog
All notable changes to this project will be documented in this file.

## [0.0.2] - 2026-02-17
### Added
- Module Setting: **Show Reach 1 Icon** (enabled by default).
- Manual status effect: **No Reach** (`no-reach.webp`), HUD-visible and user-toggleable.
- Mutual exclusivity across Reach statuses and No Reach (only one can be active at a time).
- Manual override behavior: when **No Reach** is active, automatic Reach application is suppressed.

### Changed
- Reach range reduced to **1–3** (system maximum).
- Asset path handling made more robust (module-relative pathing).

### Fixed
- Prevented status stacking by enforcing exclusivity between Reach statuses.

## [0.0.1] - 2026-02-17
### Added
- Initial release.
- Automatic Reach status application (Reach 1–5 prototype) based on equipped weapon `system.range`.
