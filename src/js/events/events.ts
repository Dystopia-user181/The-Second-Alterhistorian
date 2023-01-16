import { EventHub } from "@/js/eventhub";

export interface GameEvents {
	// Machines
	MACHINE_ADDED: (value: string) => void
	MACHINE_DELETED: (id: number, value: string) => void

	// Ticks
	GAME_TICK_BEFORE: () => void
	GAME_TICK_AFTER: () => void

	// Keyboard
	ARROW_KEYUP: (direction: string) => void
	ARROW_KEYDOWN: (direction: string) => void
	ENTER_PRESSED: () => void
	ESCAPE_PRESSED: () => void
}

export const GameEventList = [
	"MACHINE_ADDED",
	"MACHINE_DELETED",

	"GAME_TICK_BEFORE",
	"GAME_TICK_AFTER",

	"ARROW_KEYUP",
	"ARROW_KEYDOWN",
] as const;

export type GameEvent = keyof GameEvents;

export const LogicEvent = new EventHub<GameEvents>("GameEvents");