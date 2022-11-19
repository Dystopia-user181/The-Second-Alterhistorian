import { AnyFunction } from "@/utils/types";

interface EventHandler {
	fn?: (value: unknown) => void,
	target: unknown
}

export class EventHub<T extends Record<E, AnyFunction>, E extends keyof T = keyof T> {
	private _handlers: Partial<Record<keyof T, EventHandler[]>>;
	private _name: string;

	constructor(name: string) {
		this._handlers = {};
		this._name = name;
	}

	on<K extends E>(target: unknown, event: K, fn?: T[K]): void {
		let handlers = this._handlers[event];

		if (handlers === undefined) {
			handlers = [];
			this._handlers[event] = handlers;
		}

		handlers.push({ fn, target });
	}

	offAll(target: unknown) {
		for (const handlers of Object.keys(this._handlers)) {
			const key = handlers as E;
			this._handlers[key] = this._handlers[key]?.filter(handler => handler.target !== target) ?? [];
		}
	}

	dispatch<K extends E>(event: K, ...args: T[K] extends AnyFunction ? Parameters<T[K]> : never) {
		const handlers = this._handlers[event];

		if (handlers === undefined) return;

		handlers.forEach(handler => handler.fn?.(args));
	}
}