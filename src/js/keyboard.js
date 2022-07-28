window.shiftDown = false;

window.addEventListener("keydown", e => {
	shiftDown = e.shiftKey;
	const key = e.key.toLowerCase();
	if (key.startsWith("arrow")) EventHub.dispatch(GAME_EVENTS.ARROW_KEYDOWN, key.slice(5));
});

window.addEventListener("keyup", e => {
	shiftDown = e.shiftKey;
	const key = e.key.toLowerCase();
	if (key.startsWith("arrow")) EventHub.dispatch(GAME_EVENTS.ARROW_KEYUP, key.slice(5));
});

window.addEventListener("contextmenu", e => e.preventDefault());