window.EventHub = class EventHub {
	constructor() {
	  this._handlers = {};
	}
  
	on(event, fn, target) {
	  let handlers = this._handlers[event];
	  if (handlers === undefined) {
		handlers = [];
		this._handlers[event] = handlers;
	  }
	  handlers.push({ fn, target });
	}
  
	offAll(target) {
	  for (const handlers of Object.keys(this._handlers)) {
		this._handlers[handlers] = this._handlers[handlers]
		  .filter(handler => handler.target !== target);
	  }
	}
  
	// eslint-disable-next-line max-params
	dispatch(event, args) {
	  const handlers = this._handlers[event];
	  if (handlers === undefined) return;
	  for (const handler of handlers) {
		handler.fn(args);
	  }
	}
  
	// eslint-disable-next-line max-params
	static dispatch(event, ...args) {
	  EventHub.logic.dispatch(event, ...args);
	  GameUI.dispatch(event, ...args);
	}
};
  
EventHub.logic = new EventHub();
EventHub.ui = new EventHub();
  
window.GAME_EVENTS = {
	// Ticks
	GAME_TICK_BEFORE: "GAME_TICK_BEFORE",
	GAME_TICK_AFTER: "GAME_TICK_AFTER",

	// UI Events
	UPDATE: "UPDATE",

	// Keyboard Events
	ARROW_KEYDOWN: "ARROW_KEYDOWN",
	ARROW_KEYUP: "ARROW_KEYUP"
};