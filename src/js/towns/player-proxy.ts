import { computed, ComputedRef, markRaw } from "vue";

import { SidebarShopDBEntry, TownDBEntry, TownsDatabase, TownType, TownUpgradeDBEntry } from "./database";

import { Machine, MachineTypes } from "@/js/machines/index";
import { player } from "@/js/player";

import { arr, formatX, objectMap, run } from "@/utils";


class SidebarShopItem {
	config: SidebarShopDBEntry;
	townId: string;
	id: number;
	constructor(config: SidebarShopDBEntry, townId: TownType, id: number) {
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
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (!this.currencyType) return player.money >= this.cost;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		return player.holding.resource === this.currencyType && player.holding.amount > 0;
	}

	get canAffordWhole() {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (!this.currencyType) return player.money >= this.cost;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		return player.holding.resource === this.currencyType && player.holding.amount >= this.cost;
	}

	get prepay(): number {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		return player.towns[this.townId].machinesPrepay[this.id] as number;
	}

	set prepay(x) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
		player.towns[this.townId].machinesPrepay[this.id] = x;
	}

	buy() {
		if (!this.canAfford) return;
		const cost = this.cost;
		const currencyType = this.currencyType;
		if (!this.canAffordWhole) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.prepay += player.holding.amount;
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			player.holding.amount = 0;
			return;
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		if (!Machine.add(
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			player.currentlyIn,
			this.config.type,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			player.towns[player.currentlyIn].display.offset.x,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			player.towns[player.currentlyIn].display.offset.y
		))
			return;

		if (currencyType) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			player.holding.amount -= cost;
			this.prepay = 0;
		} else {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			player.money -= cost;
		}
	}
}

class TownUpgrade {
	config: TownUpgradeDBEntry;
	townId: TownType;
	_: {
		bits: ComputedRef<number>
	};

	constructor(config: TownUpgradeDBEntry, townId: TownType) {
		this.config = config;
		this.townId = townId;
		this._ = markRaw({
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			bits: computed(() => player.towns[this.townId].upgrades as number)
		});
	}

	get id() {
		return this.config.id;
	}

	get bits() {
		return this._.bits.value;
	}

	set bits(x) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		player.towns[this.townId].upgrades = x;
	}

	get cost() {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (!this.currencyType) return player.money >= this.cost;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		return player.holding.resource === this.currencyType && player.holding.amount > 0;
	}

	get canAffordWhole() {
		if (this.isBought) return false;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (!this.currencyType) return player.money >= this.cost;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		return player.holding.resource === this.currencyType && player.holding.amount >= this.cost;
	}

	get prepay() {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		return player.towns[this.townId].upgradesPrepay[this.id] as number;
	}

	set prepay(x) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		player.towns[this.townId].upgradesPrepay[this.id] = x;
	}

	effectOrDefault(def : number) {
		return this.isBought ? this.effect : def;
	}

	buy() {
		if (!this.canAfford || this.isBought) return;
		const cost = this.cost;
		const currencyType = this.currencyType;
		if (!this.canAffordWhole) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.prepay += player.holding.amount;
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			player.holding.amount = 0;
			return;
		}
		if (currencyType) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			player.holding.amount -= cost;
			this.prepay = 0;
		} else {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			player.money -= cost;
		}
		this.bits |= 1 << this.id;
	}
}

class Town {
	config: TownDBEntry;
	sidebarShop: SidebarShopItem[];
	upgrades: Record<string, TownUpgrade>;

	constructor(config: TownDBEntry | undefined, townId: TownType) {
		if (config === undefined) throw "Unrecognised Town Type";
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
		return Array<number>(this.sidebarShop.length).fill(0);
	}

	get defaultUpgradesPrepay() {
		return Array<number>(Object.keys(this.upgrades).length).fill(0);
	}

	get isUnlocked() {
		return this.config.isUnlocked === undefined ? true : run(this.config.isUnlocked);
	}

	get isFullyUpgraded() {
		return Object.values(this.upgrades).every(upgrade => !upgrade.isUnlocked || upgrade.isBought);
	}

	get hasPartialBuyableUpgrades() {
		return !this.hasWholeBuyableUpgrades &&
			Object.values(this.upgrades).find(x => x.canAfford) !== undefined;
	}

	get hasWholeBuyableUpgrades() {
		return Object.values(this.upgrades).find(x => x.canAffordWhole) !== undefined;
	}
}

class TownsLazyLoader {
	towns: Map<TownType, Town>;
	constructor() {
		this.towns = new Map<TownType, Town>();
	}

	createAccessor() {
		return (id: TownType | "current") => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			if (id === "current") return this.towns.get(player.currentlyIn as TownType) as Town;
			if (this.towns.get(id) === undefined) {
				if (TownsDatabase.get(id) === undefined) throw `Unrecognised Town "${id}"`;
				this.towns.set(id, new Town(TownsDatabase.get(id), id));
			}
			return this.towns.get(id) as Town;
		};
	}
}
export const Towns = new TownsLazyLoader().createAccessor();

export const SidebarShop = {
	get currentMachines() {
		return Towns("current").sidebarShop;
	},

	get currentUpgrades() {
		return Towns("current").upgrades;
	}
};