import { EventHub } from "@/js/eventhub";

import { GameEvents } from "@/js/database/events";

export interface UIEvents extends GameEvents {
	UPDATE: void | ((shouldUpdate: boolean, target: string) => void),
	RENDER: void | ((shouldUpdate: boolean, target: string) => void),
}

export type UIEvent = keyof UIEvents

export const UIEvent = new EventHub<UIEvents>("UIEvents");