import { Machine, MachineTypes } from "@/js/machines/index";
import { GameDatabase } from "@/js/database/index";
import { player } from "@/js/player";

import { arr, formatX, objectMap, run } from "@utils";


class SidebarShopItem {
	constructor(config, townId, id) {
		this.config = config;
		this.townId = townId;
		this.id = id;
	}

	get cost() {
		return run(this.config.cost) - this.prepay;
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
		if (!this.currencyType) return player.money >= this.cost;
		return player.holding.resource === this.currencyType && player.holding.amount;
	}

	get canAffordWhole() {
		if (!this.currencyType) return player.money >= this.cost;
		return player.holding.resource === this.currencyType && player.holding.amount >= this.cost;
	}

	get prepay() {
		return player.towns[this.townId].machinesPrepay[this.id];
	}

	set prepay(x) {
		player.towns[this.townId].machinesPrepay[this.id] = x;
	}

	buy() {
		if (!this.canAfford) return;
		const cost = this.cost;
		const currencyType = this.currencyType;
		if (!this.canAffordWhole) {
			this.prepay += player.holding.amount;
			player.holding.amount = 0;
			return;
		}
		if (!Machine.add(
			player.currentlyIn,
			this.config.type,
			player.display.offset.x + 60,
			player.display.offset.y + 60
		))
			return;

		if (currencyType) {
			player.holding.amount -= cost;
			this.prepay = 0;
		} else {
			player.money -= cost;
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
		return player.towns[this.townId].upgrades;
	}

	set bits(x) {
		player.towns[this.townId].upgrades = x;
	}

	get cost() {
		return run(this.config.cost) - player.towns[this.townId].upgradesPrepay[this.id];
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
		return this.config.formatEffect ? this.config.formatEffect(this.effect) : formatX(this.effect, 2, 1);
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
		if (this.isBought) return false;
		if (!this.currencyType) return player.money >= this.cost;
		return player.holding.resource === this.currencyType && player.holding.amount;
	}

	get canAffordWhole() {
		if (this.isBought) return false;
		if (!this.currencyType) return player.money >= this.cost;
		return player.holding.resource === this.currencyType && player.holding.amount >= this.cost;
	}

	get prepay() {
		return player.towns[this.townId].upgradesPrepay[this.id];
	}

	set prepay(x) {
		player.towns[this.townId].upgradesPrepay[this.id] = x;
	}

	effectOrDefault(def) {
		return this.isBought ? this.effect : def;
	}

	buy() {
		if (!this.canAfford || this.isBought) return;
		const cost = this.cost;
		const currencyType = this.currencyType;
		if (!this.canAffordWhole) {
			this.prepay += player.holding.amount;
			player.holding.amount = 0;
			return;
		}
		if (currencyType) {
			player.holding.amount -= cost;
			this.prepay = 0;
		} else {
			player.money -= cost;
		}
		this.bits |= 1 << this.id;
	}
}

class Town {
	constructor(config, townId) {
		this.config = config;
		this.sidebarShop = config.sidebarShop.map((x, id) => new SidebarShopItem(x, townId, id));
		this.upgrades = objectMap(config.upgrades, x => x, x => new TownUpgrade(x, townId));
	}

	get defaultMachines() {
		const machines = arr(this.config.defaultMachines.map(x => MachineTypes[x.type].newMachine(x.x, x.y)))
			.mapToObject((_, id) => id, x => x);
		for (const machine of Object.values(machines)) {
			machine.isDefault = true;
		}
		return machines;
	}

	get defaultMachinesPrepay() {
		return Array(this.sidebarShop.length).fill(0);
	}

	get defaultUpgradesPrepay() {
		return Array(Object.keys(this.upgrades).length).fill(0);
	}

	get isUnlocked() {
		return this.config.isUnlocked === undefined ? true : run(this.config.isUnlocked);
	}
}

class TownsLazyLoader {
	constructor() {
		this._towns = GameDatabase.towns;
		this.towns = {};
	}

	createAccessor() {
		return id => {
			if (!this.towns[id]) this.towns[id] = new Town(this._towns[id], id);
			return this.towns[id];
		};
	}
}
export const Towns = new TownsLazyLoader().createAccessor();

export const SidebarShop = {
	get currentMachines() {
		return Towns(player.currentlyIn).sidebarShop;
	},

	get currentUpgrades() {
		return Towns(player.currentlyIn).upgrades;
	}
};