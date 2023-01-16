import { EventHub } from "@/js/eventhub";

import { GameEventList, GameEvents } from "@/js/events/events";

export interface UIEvents extends GameEvents {
	UPDATE: () => void,
	RENDER: () => void,
	ERROR: (message: string) => void
}

export const UIEventList = [...GameEventList,
	"UPDATE", "RENDER", "ERROR"] as const;

export type UIEventType = keyof UIEvents;

export const UIEvent = new EventHub<UIEvents>("UIEvents");