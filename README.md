# Conan 2d20 - Reach Status

Small module for Foundry VTT and the system **“Robert E. Howard’s Conan: Adventures in an Age Undreamed Of”**.

The module provides **visual Reach indicators** on tokens by applying custom status effects based on an Actor’s available weapons/attacks.

## Features

- **Automatic Reach status (Reach 1–3)**
  - **Player Characters** (`actor.type = character`): highest Reach among **equipped** weapons.
  - **NPCs** (`actor.type = npc`): highest Reach among `npcattack` (and `weapon`) items.
  - Reach value is read from `item.system.range`.

- **Module setting**
  - **Show Reach 1 Icon** (default: enabled)
    - When disabled, **Reach 1 is not applied automatically** (reduces on-screen clutter).
    - Manual overrides (GM) on NPC tokens are not affected.

- **Manual statuses**
  - **No Reach**
    - When enabled, it suppresses automatic Reach application for that Actor.

- **Mutual exclusivity**
  - Only one of the following can be active at a time:
    - `No Reach`, `Reach 1`, `Reach 2`, `Reach 3`

- **NPC manual override (GM)**
  - For NPC tokens, the GM can manually select `Reach 1–3` from the Token HUD.
  - The override is stored on the Actor (linked) or on the TokenDocument (unlinked).

## Requirements

- Foundry VTT: v13 (tested with **13.351**)
- System: Conan 2d20 (tested with **2.4.3**)

## Installation

### Install via Manifest URL

1. Foundry → **Add-on Modules** → **Install Module**
2. Paste the Manifest URL:

```txt
https://raw.githubusercontent.com/kiryna-cpg/conan2d20-reach-status/main/module.json
```

3. Install and enable it:
   - **World → Manage Modules → enable “Conan 2d20 - Reach Status”**

## Configuration

**Game Settings → Configure Settings → Module Settings → Conan 2d20 - Reach Status**

- **Show Reach 1 Icon** (default: ON)

## Assets

Place these files under:

`modules/conan2d20-reach-status/icons/`

- `reach-1.webp`
- `reach-2.webp`
- `reach-3.webp`
- `no-reach.webp`

## Compatibility

This module uses Foundry’s core status effects to display token icons. It is intentionally limited to **visual indicators** and does not modify rules logic or roll difficulty.

## Support

Issues and feature requests:

```txt
https://github.com/kiryna-cpg/conan2d20-reach-status/issues
```

When reporting an issue, include Foundry version, system version, reproduction steps, and console logs (F12).

## License

MIT. See `LICENSE`.
