import { Machine, Machines } from "@/js/machines/index";
import { player } from "@/js/player";


let lastTick = Date.now();

export function gameLoop(_diff) {
	let diff = _diff;
	if (!_diff) {
		diff = (Date.now() - lastTick) / 1000;
		lastTick = Date.now();
	}
	EventHub.dispatch(GAME_EVENTS.GAME_TICK_BEFORE);
	if (player.holding.amount < 0.5 || player.holding.resource !== "elixir")
		Machine.gameLoop(diff, Object.values(Machines));
	GameUI.update();
	EventHub.dispatch(GAME_EVENTS.GAME_TICK_AFTER);
}

window.gameLoopInterval = setInterval(gameLoop, 30);

function render() {
	GameUI.render();
}

window.renderInterval = setInterval(render, 16);