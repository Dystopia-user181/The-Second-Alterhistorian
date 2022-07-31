import { GameDatabase } from "../game-database";

// import { machineUpg } from "./init";

GameDatabase.machines.inputMerger = {
	name: "inputMerger",
	inputs: [{
		accepts: () => Object.keys(player.unlockedCurrencies).filter(x => player.unlockedCurrencies[x]),
		capacity: () => 20,
		consumes: machine => ({
			amount: machine.inputItem(0) && machine.inputResource === machine.inputItem(0).resource ? 4 : 0,
			maximum: machine.outputDiffs.main * 4
		})
	}, {
		accepts: () => Object.keys(player.unlockedCurrencies).filter(x => player.unlockedCurrencies[x]),
		capacity: () => 20,
		consumes: machine => ({
			amount: machine.inputItem(1) && machine.inputResource === machine.inputItem(1).resource ? 4 : 0,
			maximum: machine.outputDiffs.main * 4
		})
	}, {
		accepts: () => Object.keys(player.unlockedCurrencies).filter(x => player.unlockedCurrencies[x]),
		capacity: () => 20,
		consumes: machine => ({
			amount: machine.inputItem(2) && machine.inputResource === machine.inputItem(2).resource ? 4 : 0,
			maximum: machine.outputDiffs.main * 4
		})
	}],
	outputs: [{
		id: "main",
		capacity: () => 60,
		produces: machine => ({
			resource: machine.inputResource,
			amount: machine.inputs[0].config.consumes.amount + machine.inputs[1].config.consumes.amount
				+ machine.inputs[2].config.consumes.amount
		}),
		requiresList: machine => {
			const req = [];
			if (machine.inputItem(0) && machine.inputResource === machine.inputItem(0).resource) req.push({
				resource: machine.inputResource,
				amount: 4,
				inputId: 0
			});
			if (machine.inputItem(1) && machine.inputResource === machine.inputItem(1).resource) req.push({
				resource: machine.inputResource,
				amount: 4,
				inputId: 1
			});
			if (machine.inputItem(2) && machine.inputResource === machine.inputItem(2).resource) req.push({
				resource: machine.inputResource,
				amount: 4,
				inputId: 2
			});
			return req;
		}
	}],
	customLoop(diff) {
		this.inputResource = this.inputItem(0) ? this.inputItem(0).resource : (
			this.inputItem(1) ? this.inputItem(1).resource : ""
		);
		Machine.tickThisMachine(this, diff);
	},
	description: `Merges inputs into one stream. Prioritizes smaller Inputs if there are different resources.`
};