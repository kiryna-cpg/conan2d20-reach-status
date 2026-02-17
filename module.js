/**
 * Conan 2d20 - Reach Status
 * Automatically applies a Reach status (1..3) to an Actor based on the equipped weapon Reach (item.system.range),
 * so the Token displays a visual Reach icon.
 *
 * Additional features:
 * - Module Setting: optionally hide the Reach 1 icon (enabled by default).
 * - Manual status: "No Reach" (GM/owner can toggle it from the Token HUD).
 * - Mutual exclusivity: Reach 1/2/3 and No Reach cannot be active at the same time.
 */

const MODULE_ID = "conan2d20-reach-status";
const MAX_REACH = 3;

const NO_REACH_ID = "conan-no-reach";
const REACH_IDS = Array.from({ length: MAX_REACH }, (_, i) => `conan-reach-${i + 1}`);
const ALL_STATUS_IDS = [NO_REACH_ID, ...REACH_IDS];

let _enforcingExclusivity = false;

/**
 * Module base path derived from import.meta.url to avoid hardcoding folder names.
 */
const MODULE_PATH = new URL(".", import.meta.url).pathname
  .replace(/^\/+/, "")
  .replace(/\/$/, "");

/**
 * Clamp a number between min and max (compatibility helper).
 */
function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

/**
 * Build status effect definitions to be registered into CONFIG.statusEffects.
 * Reach statuses are not shown in the HUD (they are applied automatically).
 * The "No Reach" status is shown in the HUD and is manual.
 * @returns {Array<object>}
 */
function buildStatusEffects() {
  const reachStatuses = Array.from({ length: MAX_REACH }, (_, i) => {
    const n = i + 1;
    return {
      id: `conan-reach-${n}`,
      name: `Reach ${n}`,
      label: `Reach ${n}`,
      img: `${MODULE_PATH}/icons/reach-${n}.webp`,
      hud: false
    };
  });

  const noReachStatus = {
    id: NO_REACH_ID,
    name: "No Reach",
    label: "No Reach",
    img: `${MODULE_PATH}/icons/no-reach.webp`,
    hud: true
  };

  return [...reachStatuses, noReachStatus];
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "showReach1", {
    name: "Show Reach 1 Icon",
    hint: "If disabled, equipped weapons with Reach 1 will not display a Reach icon (to reduce visual clutter).",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => {
      // Re-evaluate currently present scene actors when the setting changes.
      if (!canvas?.ready) return;
      const actors = new Set(canvas.tokens.placeables.map(t => t.actor).filter(Boolean));
      for (const actor of actors) debouncedSetReach(actor);
    }
  });

  const effects = buildStatusEffects();
  const existingIds = new Set((CONFIG.statusEffects ?? []).map(e => e.id));

  CONFIG.statusEffects = (CONFIG.statusEffects ?? []).concat(
    effects.filter(e => !existingIds.has(e.id))
  );
});

/**
 * Determine whether an ActiveEffect includes a given statusId.
 * In Foundry v13, statusIds are stored in the "statuses" SetField.
 */
function effectHasStatus(effect, statusId) {
  const statuses = effect?.statuses ?? effect?._source?.statuses;
  if (!statuses) return false;
  if (statuses instanceof Set) return statuses.has(statusId);
  if (Array.isArray(statuses)) return statuses.includes(statusId);
  // Some older shims may serialize Set-like objects differently.
  return false;
}

/**
 * Check whether an Actor currently has a given statusId active.
 */
function actorHasStatus(actor, statusId) {
  return actor.effects.some(e => e.active && effectHasStatus(e, statusId));
}

/**
 * Apply mutual exclusivity: activate exactly one of our statuses, deactivate the rest.
 * If activeId is null, all of our statuses are deactivated.
 */
async function applyExclusiveStatus(actor, activeId) {
  if (!actor) return;

  _enforcingExclusivity = true;
  try {
    for (const id of ALL_STATUS_IDS) {
      await actor.toggleStatusEffect(id, { active: id === activeId });
    }
  } finally {
    _enforcingExclusivity = false;
  }
}

/**
 * Determine whether an Item is an equipped weapon.
 * Conan 2d20 uses a sheet toggle ("item-toggle-equip") which typically persists to a boolean field (e.g. system.equipped).
 * @param {Item} item
 * @returns {boolean}
 */
function isEquippedWeapon(item) {
  if (item.type !== "weapon") return false;

  const equipped =
    item.system?.equipped ??
    item.system?.isEquipped ??
    item.system?.equippedWeapon;

  return equipped === true;
}

/**
 * Get the highest Reach among equipped weapons for the given Actor (Reach stored in item.system.range).
 * @param {Actor} actor
 * @returns {number}
 */
function getEquippedReach(actor) {
  const weapons = actor.items.filter(isEquippedWeapon);
  if (!weapons.length) return 0;

  const reaches = weapons.map(w => Number(w.system?.range ?? 0) || 0);
  return Math.max(...reaches, 0);
}

/**
 * Activate the Reach status matching the current equipped Reach and deactivate all others.
 * - If "No Reach" is manually active, it overrides automation.
 * - If "Show Reach 1 Icon" is disabled, Reach 1 results in no automatic icon.
 */
async function setReachStatus(actor) {
  if (!actor) return;

  // Manual override: if "No Reach" is active, ensure all Reach statuses are off and do not auto-apply.
  if (actorHasStatus(actor, NO_REACH_ID)) {
    await applyExclusiveStatus(actor, NO_REACH_ID);
    await redrawActorTokenEffects(actor);
    return;
  }

  const showReach1 = game.settings.get(MODULE_ID, "showReach1");
  const reach = clampNumber(getEquippedReach(actor), 0, MAX_REACH);

  let targetId = null;
  if (reach === 1 && showReach1) targetId = "conan-reach-1";
  else if (reach >= 2) targetId = `conan-reach-${reach}`;
  else targetId = null;

  await applyExclusiveStatus(actor, targetId);
  await redrawActorTokenEffects(actor);
}

/**
 * Ensure active tokens redraw their effect icons promptly.
 */
async function redrawActorTokenEffects(actor) {
  if (!canvas?.ready || typeof actor.getActiveTokens !== "function") return;
  for (const token of actor.getActiveTokens()) {
    await token.drawEffects();
  }
}

const debouncedSetReach = foundry.utils.debounce((actor) => setReachStatus(actor), 100);

/**
 * Recompute Reach status whenever a weapon item changes.
 */
Hooks.on("updateItem", (item) => {
  const actor = item.parent;
  if (!actor || item.type !== "weapon") return;
  debouncedSetReach(actor);
});

Hooks.on("createItem", (item) => {
  const actor = item.parent;
  if (actor && item.type === "weapon") debouncedSetReach(actor);
});

Hooks.on("deleteItem", (item) => {
  const actor = item.parent;
  if (actor && item.type === "weapon") debouncedSetReach(actor);
});

/**
 * Enforce mutual exclusivity when a user manually toggles one of our statuses.
 * If "No Reach" is enabled, automation will be suppressed by setReachStatus.
 */
Hooks.on("createActiveEffect", async (effect) => {
  if (_enforcingExclusivity) return;

  const actor = effect.parent;
  if (!actor || actor.documentName !== "Actor") return;

  // Identify which of our statuses was activated.
  const activated = ALL_STATUS_IDS.find(id => effectHasStatus(effect, id));
  if (!activated) return;

  await applyExclusiveStatus(actor, activated);

  // If "No Reach" was just activated, make sure it takes effect immediately.
  // If a Reach status was manually activated, keep it exclusive (even though the module may overwrite it later on item updates).
  await redrawActorTokenEffects(actor);
});

Hooks.on("deleteActiveEffect", (effect) => {
  if (_enforcingExclusivity) return;

  const actor = effect.parent;
  if (!actor || actor.documentName !== "Actor") return;

  // If one of our statuses was removed manually, recompute automation (e.g. No Reach toggled off).
  const wasOurs = ALL_STATUS_IDS.some(id => effectHasStatus(effect, id));
  if (!wasOurs) return;

  debouncedSetReach(actor);
});

/**
 * On canvas ready, apply Reach status to actors currently present in the scene.
 */
Hooks.on("canvasReady", () => {
  const actors = new Set(canvas.tokens.placeables.map(t => t.actor).filter(Boolean));
  for (const actor of actors) debouncedSetReach(actor);
});
