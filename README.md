# Conan 2d20 - Reach Status

Small module for the Foundry VTT system **“Robert E. Howard’s Conan: Adventures in an Age Undreamed Of”**.

This module automatically applies a **Reach** status icon to Tokens based on the **equipped weapon Reach** (`item.system.range`). It also provides a manual **No Reach** status for convenience.

---

## Features

- Automatically applies a Reach status based on the equipped weapon:
  - Reach is read from: `item.system.range`
  - Uses the **highest Reach** among equipped weapons
- Reach statuses available (automatic, HUD-hidden):
  - `Reach 1`, `Reach 2`, `Reach 3`
- Module Setting (Module Settings):
  - **Show Reach 1 Icon** (enabled by default)
    - When disabled, Reach 1 weapons do **not** show a Reach icon (reduces visual clutter)
- Manual status (HUD-visible):
  - **No Reach**
  - When active, it **suppresses** automatic Reach application
- Mutual exclusivity:
  - Only one of these can be active at a time:
    - `No Reach`, `Reach 1`, `Reach 2`, `Reach 3`

---

## Requirements

- Foundry VTT: v13 (**tested with 13.351**)
- System: Robert E. Howard’s Conan 2d20 (**tested with 2.4.3**)

---

## Installation

### Install via Manifest URL (recommended)

1. Foundry → **Add-on Modules** → **Install Module**
2. Paste this Manifest URL:

```txt
https://raw.githubusercontent.com/kiryna-cpg/conan2d20-reach-status/main/module.json
```

3. Install, then enable it in your world:
   - **World → Manage Modules → enable “Conan 2d20 - Reach Status”**

---

## Configuration

Go to:

**Game Settings → Configure Settings → Module Settings → Conan 2d20 - Reach Status**

### Show Reach 1 Icon (default: ON)

If disabled, equipped weapons with Reach 1 will **not** display the Reach 1 icon.

---

## What this module does

This module registers custom status effects and manages them automatically:

- Automatic statuses (not shown in HUD):
  - `Reach 1`, `Reach 2`, `Reach 3`
- Manual status (shown in HUD):
  - `No Reach`

Automatic behavior:
- On equip/unequip or weapon updates, the module:
  - reads `item.system.range` for equipped weapons
  - determines the highest Reach
  - applies the matching Reach status (unless suppressed by **No Reach**)
- If **Show Reach 1 Icon** is disabled, Reach 1 does not apply an icon.

Manual behavior:
- If the GM or token owner activates **No Reach** from the Token HUD:
  - Reach icons will not be applied automatically
  - No Reach remains mutually exclusive with Reach 1/2/3

---

## Icons / Assets

Place these files in:

`modules/conan2d20-reach-status/icons/`

- `reach-1.webp`
- `reach-2.webp`
- `reach-3.webp`
- `no-reach.webp`

---

## Compatibility notes

- This module uses Foundry core status effects (Active Effects) to display token icons.
- This module is intentionally minimal:
  - It provides **visual Reach indicators only**
  - It does **not** change roll difficulty, apply combat automation, or modify rules logic

---

## Support / Issues

Report issues or request improvements here:

```txt
ttps://github.com/kiryna-cpg/conan2d20-reach-status/issues
```

When reporting, include:

- Foundry version
- Conan 2d20 system version
- Steps to reproduce + console logs (F12)

---

## License

MIT. See `LICENSE`.
