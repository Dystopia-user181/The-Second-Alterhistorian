import { TownDBEntry, TownType } from "./towns";
import { ResourceType } from "@/types/resources";

// Things aren't typed yet but it needs to be used; as things get typed, delete these
export interface Player {
	money: number,
	holding: {
		resource?: ResourceType,
		amount?: number
	},
	towns: Record<TownType, TownDBEntry>
}