import { Machine, Machines } from "@/js/machines/index";
import { player } from "@/js/player";

import { GameUI } from "@/js/ui/game-ui";
import { LogicEvent } from "@/js/events/events";
import { Modals } from "@/js/ui/modals";
import { Towns } from "@/js/towns";
import { UIEvent } from "@/js/ui/events";

let lastTick = Date.now();

export function gameLoop(_diff?: number) {
	const diff = _diff ?? (Date.now() - lastTick) / 1000;
	if (!_diff) lastTick = Date.now();
	LogicEvent.dispatch("GAME_TICK_BEFORE");
	if (!Towns("home").upgrades.win.effectOrDefault(0) || player.finishedEndCutscene)
		Machine.gameLoop(diff, Object.values(Machines));
	player.lastUpdateTime = Date.now();
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