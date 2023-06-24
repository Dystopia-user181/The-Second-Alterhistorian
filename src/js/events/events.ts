import { EventHub } from "@/js/eventhub";

export interface GameEvents {
	// Machines
	MACHINE_ADDED: () => void
	MACHINE_DELETED: (id: number) => void

	// Ticks
	GAME_TICK_BEFORE: () => void
	GAME_TICK_AFTER: () => void

	// Keyboard
	ARROW_KEYUP: (direction: "up" | "down" | "left" | "right") => void
	ARROW_KEYDOWN: (direction: "up" | "down" | "left" | "right") => void
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
	"ENTER_PRESSED",
	"ESCAPE_PRESSED"
] as const;

export type GameEvent = keyof GameEvents;

export const LogicEvent = new EventHub<GameEvents>("GameEvents");