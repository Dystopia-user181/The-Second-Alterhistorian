import { MachineId } from "@/js/machines";
import { ResourceType } from "@/types/resources";

export const TownTypes = [
	"home"
] as const;

export type TownType = typeof TownTypes[number];

export interface SidebarShopDBEntry {
	type: MachineId
	cost: number
	currencyType?: ResourceType
	isUnlocked?: () => boolean
}

export interface TownUpgradeDBEntry {
	id: number
	cost: number
	currencyType?: ResourceType
	title: string
	description: string
	effect: number | (() => number)
	formatEffect?: (effect: number) => string
	isUnlocked?: () => boolean
}

export interface TownDBEntry {
	defaultMachines: {
		type: MachineId
		x: number
		y: number
	}[]
	sidebarShop: SidebarShopDBEntry[]
	upgrades: Record<string, TownUpgradeDBEntry>
	isUnlocked?: () => boolean
}

export const TownsDatabase = new Map<TownType, TownDBEntry>();