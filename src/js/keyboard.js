import { GameUI } from "@/js/ui/game-ui";
import { LogicEvent } from "@/js/database/events.ts";

const isKeydown = {};

window.shiftDown = false;

window.addEventListener("keydown", e => {
	shiftDown = e.shiftKey;
	const key = e.key.toLowerCase();
	if (isKeydown[key]) return;
	isKeydown[key] = true;
	if (key.startsWith("arrow")) {
		LogicEvent.dispatch("ARROW_KEYDOWN", key.slice(5));
		GameUI.dispatch("ARROW_KEYDOWN", key.slice(5));
		return;
	}
	switch (key) {
		case "w":
			LogicEvent.dispatch("ARROW_KEYDOWN", "up");
			GameUI.dispatch("ARROW_KEYDOWN", "up");
			break;
		case "a":
			LogicEvent.dispatch("ARROW_KEYDOWN", "left");
			GameUI.dispatch("ARROW_KEYDOWN", "left");
			break;
		case "s":
			LogicEvent.dispatch("ARROW_KEYDOWN", "down");
			GameUI.dispatch("ARROW_KEYDOWN", "down");
			break;
		case "d":
			LogicEvent.dispatch("ARROW_KEYDOWN", "right");
			GameUI.dispatch("ARROW_KEYDOWN", "right");
			break;
		case "escape":
			LogicEvent.dispatch("ESCAPE_PRESSED");
			GameUI.dispatch("ESCAPE_PRESSED");
			break;
		case "enter":
			LogicEvent.dispatch("ENTER_PRESSED");
			GameUI.dispatch("ENTER_PRESSED");
	}
});

window.addEventListener("keyup", e => {
	shiftDown = e.shiftKey;
	const key = e.key.toLowerCase();
	isKeydown[key] = false;
	if (key.startsWith("arrow")) {
		LogicEvent.dispatch("ARROW_KEYUP", key.slice(5));
		GameUI.dispatch("ARROW_KEYUP", key.slice(5));
		return;
	}
	switch (key) {
		case "w":
			LogicEvent.dispatch("ARROW_KEYUP", "up");
			GameUI.dispatch("ARROW_KEYUP", "up");
			break;
		case "a":
			LogicEvent.dispatch("ARROW_KEYUP", "left");
			GameUI.dispatch("ARROW_KEYUP", "left");
			break;
		case "s":
			LogicEvent.dispatch("ARROW_KEYUP", "down");
			GameUI.dispatch("ARROW_KEYUP", "down");
			break;
		case "d":
			LogicEvent.dispatch("ARROW_KEYUP", "right");
			GameUI.dispatch("ARROW_KEYUP", "right");
			break;
	}
});

window.addEventListener("contextmenu", e => e.preventDefault());