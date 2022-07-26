import { EventHub } from "@/js/eventhub";

export interface GameEvents {
	// Machines
	MACHINE_ADDED: (value: string) => void
	MACHINE_DELETED: (id: number, value: string) => void

	// Ticks
	GAME_TICK_BEFORE: () => void
	GAME_TICK_AFTER: () => void
}

export type GameEvent = keyof GameEvents

export const LogicEvent = new EventHub<GameEvents>("GameEvents");