import { GameDatabase } from "./database/game-database";
import { MachineTypes, Machine } from "./machines";

class Town {
	constructor(config, townId) {
		this.config = config;
		this.sidebarShop = config.sidebarShop.map(x => new SidebarShopItem(x));
		this.upgrades = objectMap(config.upgrades, x => x, x => new TownUpgrade(x, townId));
	}

	get defaultMachines() {
		const machines = mapToObject(this.config.defaultMachines.map(x => MachineTypes[x.type].newMachine(x.x, x.y)),
			(_, id) => id, x => x);
		for (const machine of Object.values(machines)) {
			machine.isDefault = true;
		}
		return machines;
	}
}

class SidebarShopItem {
	constructor(config) {
		this.config = config;
	}

	get cost() {
		return run(this.config.cost);
	}

	get currencyType() {
		return run(this.config.currencyType);
	}

	get associatedMachine() {
		return MachineTypes[this.config.type];
	}

	get isUnlocked() {
		return this.config.isUnlocked === undefined ? true : run(this.config.isUnlocked);
	}

	get canAfford() {
		if (this.maxed) return false;
		if (!this.currencyType) return player.money >= this.cost;
		return player.holding.resource === this.currencyType && player.holding.amount >= this.cost;
	}

	buy() {
		if (!this.canAfford) return;
		const cost = this.cost;
		const currencyType = this.currencyType;
		if (!Machine.add(player.currentlyIn, this.config.type, player.display.offset.x + 60, player.display.offset.y + 60))
			return;

		if (!currencyType) {
			player.money -= cost;
		} else {
			player.holding.amount -= cost;
		}
	}
}

class TownUpgrade {
	constructor(config, townId) {
		this.config = config;
		this.townId = townId;
	}

	get id() {
		return this.config.id;
	}

	get bits() {
		return player.towns[this.townId].upgrades
	}

	set bits(x) {
		player.towns[this.townId].upgrades = x;
	}

	get cost() {
		return run(this.config.cost);
	}

	get currencyType() {
		return run(this.config.currencyType);
	}

	get isBought() {
		return Boolean(this.bits & (1 << this.id));
	}

	get effect() {
		return run(this.config.effect);
	}

	get formattedEffect() {
		return !this.config.formatEffect ? formatX(this.effect, 2, 1) : this.config.formatEffect(this.effect);
	}

	get title() {
		return run(this.config.title);
	}

	get description() {
		return run(this.config.description);
	}

	get isUnlocked() {
		return this.config.isUnlocked === undefined ? true : run(this.config.isUnlocked);
	}

	get canAfford() {
		if (this.maxed) return false;
		if (!this.currencyType) return player.money >= this.cost;
		return player.holding.resource === this.currencyType && player.holding.amount >= this.cost;
	}

	effectOrDefault(def) {
		return this.isBought ? this.effect : def;
	}

	buy() {
		if (!this.canAfford || this.isBought) return;
		if (!this.currencyType) {
			player.money -= this.cost;
		} else {
			player.holding.amount -= this.cost;
		}
		this.bits |= 1 << this.id;
	}
}

export const Towns = objectMap(GameDatabase.towns, x => x, (x, id) => new Town(x, id));
window.Towns = Towns;

export const SidebarShop = {
	get currentMachines() {
		return Towns[player.currentlyIn].sidebarShop;
	},

	get currentUpgrades() {
		return Towns[player.currentlyIn].upgrades;
	}
}