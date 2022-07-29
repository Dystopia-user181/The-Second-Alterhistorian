import { GameDatabase } from "./database/game-database";
import { MachineTypes, Machine } from "./machines";

class Town {
	constructor(config) {
		this.config = config;
		this.sidebarShop = config.sidebarShop.map(x => new SidebarShopItem(x));
	}

	get defaultMachines() {
		console.log(this.config.defaultMachines.map(x => x.type), MachineTypes);
		const machines = mapToObject(this.config.defaultMachines.map(x => MachineTypes[x.type].newMachine(x.x, x.y)), (_, id) => id, x => x);
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

	get canAfford() {
		if (this.maxed) return false;
		if (!this.currencyType) return player.money >= this.cost;
		return player.holding.resource === this.currencyType && player.holding.amount >= this.cost;
	}

	buy() {
		if (!this.canAfford) return;
		if (!this.currencyType) {
			player.money -= this.cost;
		} else {
			player.holding.amount -= this.cost;
		}
		Machine.add(player.currentlyIn, this.config.type, player.display.offset.x + 60, player.display.offset.y + 60);
	}
}

export const Towns = objectMap(GameDatabase.towns, x => x, x => new Town(x));

export const SidebarShop = {
	get current() {
		return Towns[player.currentlyIn].sidebarShop;
	}
}