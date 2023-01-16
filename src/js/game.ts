import { Machine, Machines } from "@/js/machines/index";
import { player } from "@/js/player";

import { GameUI } from "@/js/ui/game-ui";
import { LogicEvent } from "@/js/events/events";
import { Modals } from "@/js/ui/modals";
import { UIEvent } from "@/js/ui/events";

let lastTick = Date.now();

export function gameLoop(_diff?: number) {
	let diff = _diff;
	if (!_diff) {
		diff = (Date.now() - lastTick) / 1000;
		lastTick = Date.now();
	}
	LogicEvent.dispatch("GAME_TICK_BEFORE");
	if (player.holding.amount < 0.5 || player.holding.resource !== "elixir")
		Machine.gameLoop(diff, Object.values(Machines));
	GameUI.update();
	LogicEvent.dispatch("GAME_TICK_AFTER");
}

window.gameLoopInterval = setInterval(() => gameLoop(), 30);

function render() {
	GameUI.render();
}

window.renderInterval = setInterval(() => render(), 16);

UIEvent.on(0, "ERROR", x => {
	Modals.message.showText(x);
	clearInterval(gameLoopInterval);
	clearInterval(saveInterval);
});