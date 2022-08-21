import { LogicEvent } from "@/js/database/events.ts";

window.shiftDown = false;

window.addEventListener("keydown", e => {
	shiftDown = e.shiftKey;
	const key = e.key.toLowerCase();
	if (key.startsWith("arrow")) {
		LogicEvent.dispatch("ARROW_KEYDOWN", key.slice(5));
		return;
	}
	switch (key) {
		case "w":
			LogicEvent.dispatch("ARROW_KEYDOWN", "up");
			break;
		case "a":
			LogicEvent.dispatch("ARROW_KEYDOWN", "left");
			break;
		case "s":
			LogicEvent.dispatch("ARROW_KEYDOWN", "down");
			break;
		case "d":
			LogicEvent.dispatch("ARROW_KEYDOWN", "right");
			break;
		case "escape":
			LogicEvent.dispatch("ESCAPE_PRESSED");
			break;
	}
});

window.addEventListener("keyup", e => {
	shiftDown = e.shiftKey;
	const key = e.key.toLowerCase();
	if (key.startsWith("arrow")) {
		LogicEvent.dispatch("ARROW_KEYUP", key.slice(5));
		return;
	}
	switch (key) {
		case "w":
			LogicEvent.dispatch("ARROW_KEYUP", "up");
			break;
		case "a":
			LogicEvent.dispatch("ARROW_KEYUP", "left");
			break;
		case "s":
			LogicEvent.dispatch("ARROW_KEYUP", "down");
			break;
		case "d":
			LogicEvent.dispatch("ARROW_KEYUP", "right");
			break;
	}
});

window.addEventListener("contextmenu", e => e.preventDefault());