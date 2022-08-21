import { EventHub } from "@/js/eventhub";

export interface UIEvents {
	UPDATE: void | ((shouldUpdate: boolean, target: string) => void),
	RENDER: void | ((shouldUpdate: boolean, target: string) => void),
}

export type UIEvent = keyof UIEvents

export const UIEvent = new EventHub<UIEvents>("UIEvents");