window.shiftDown = false;

window.addEventListener("keydown", e => {
	shiftDown = e.shiftKey;
	const key = e.key.toLowerCase();
	if (key.startsWith("arrow")) {
		EventHub.dispatch(GAME_EVENTS.ARROW_KEYDOWN, key.slice(5));
		return;
	}
	switch(key) {
		case "w":
			EventHub.dispatch(GAME_EVENTS.ARROW_KEYDOWN, "up"); break;
		case "a":
			EventHub.dispatch(GAME_EVENTS.ARROW_KEYDOWN, "left"); break;
		case "s":
			EventHub.dispatch(GAME_EVENTS.ARROW_KEYDOWN, "down"); break;
		case "d":
			EventHub.dispatch(GAME_EVENTS.ARROW_KEYDOWN, "right"); break;
		case "escape":
			EventHub.dispatch(GAME_EVENTS.ESCAPE_PRESSED); break;
	}
});

window.addEventListener("keyup", e => {
	shiftDown = e.shiftKey;
	const key = e.key.toLowerCase();
	if (key.startsWith("arrow")) {
		EventHub.dispatch(GAME_EVENTS.ARROW_KEYUP, key.slice(5));
		return;
	}
	switch(key) {
		case "w":
			EventHub.dispatch(GAME_EVENTS.ARROW_KEYUP, "up"); break;
		case "a":
			EventHub.dispatch(GAME_EVENTS.ARROW_KEYUP, "left"); break;
		case "s":
			EventHub.dispatch(GAME_EVENTS.ARROW_KEYUP, "down"); break;
		case "d":
			EventHub.dispatch(GAME_EVENTS.ARROW_KEYUP, "right"); break;
	}
});

window.addEventListener("contextmenu", e => e.preventDefault());