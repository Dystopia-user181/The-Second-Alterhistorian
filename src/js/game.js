let lastTick = Date.now();

export function gameLoop(diff) {
	if (!diff) {
		diff = (Date.now() - lastTick) / 1000;
		lastTick = Date.now();
	}
	EventHub.dispatch(GAME_EVENTS.GAME_TICK_BEFORE);
	if (player.holding.amount < 0.5 || player.holding.resource !== "elixir") Machine.gameLoop(diff);
	GameUI.update();
	EventHub.dispatch(GAME_EVENTS.GAME_TICK_AFTER);
}

window.gameLoopInterval = setInterval(gameLoop, 16);