import { EventHub } from "@/js/eventhub";

import { GameEvents } from "@/js/database/events";

export interface UIEvents extends GameEvents {
	UPDATE: (shouldUpdate: boolean, target: string) => void,
	RENDER: (shouldUpdate: boolean, target: string) => void,
	ERROR: (message: string) => void
}

export type UIEventType = keyof UIEvents

export const UIEvent = new EventHub<UIEvents>("UIEvents");