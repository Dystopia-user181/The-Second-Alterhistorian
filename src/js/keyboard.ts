import { GameUI } from "@/js/ui/game-ui";

const isKeydown: Record<string, boolean> = {};

window.shiftDown = false;

window.addEventListener("keydown", e => {
	shiftDown = e.shiftKey;
	const key = e.key.toLowerCase();
	if (isKeydown[key]) return;

	isKeydown[key] = true;

	if (key.startsWith("arrow")) {
		GameUI.dispatch("ARROW_KEYDOWN", key.slice(5));
		return;
	}
	switch (key) {
		case "w":
			GameUI.dispatch("ARROW_KEYDOWN", "up");
			break;
		case "a":
			GameUI.dispatch("ARROW_KEYDOWN", "left");
			break;
		case "s":
			GameUI.dispatch("ARROW_KEYDOWN", "down");
			break;
		case "d":
			GameUI.dispatch("ARROW_KEYDOWN", "right");
			break;
		case "escape":
			GameUI.dispatch("ESCAPE_PRESSED");
			break;
		case "enter":
			GameUI.dispatch("ENTER_PRESSED");
	}
});

window.addEventListener("keyup", e => {
	shiftDown = e.shiftKey;
	const key = e.key.toLowerCase();
	if (!isKeydown[key]) return;

	isKeydown[key] = false;

	if (key.startsWith("arrow")) {
		GameUI.dispatch("ARROW_KEYUP", key.slice(5));
		return;
	}

	switch (key) {
		case "w":
			GameUI.dispatch("ARROW_KEYUP", "up");
			break;
		case "a":
			GameUI.dispatch("ARROW_KEYUP", "left");
			break;
		case "s":
			GameUI.dispatch("ARROW_KEYUP", "down");
			break;
		case "d":
			GameUI.dispatch("ARROW_KEYUP", "right");
			break;
	}
});

window.addEventListener("contextmenu", e => e.preventDefault());