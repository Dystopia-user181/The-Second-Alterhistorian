import { GameDatabase } from "../game-database";

import { machineUpg } from "./init";

GameDatabase.machines.essencePurifier = {
	name: "essencePurifier",
	inputs: [{
		accepts: recipes.map(x => x.input.resource).filter(x => x !== "none"),
		capacity: () => 10,
		consumes: machine => {
			const prod = getConsumption(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		}
	}, {
		accepts: machine => {
			const accepts = ["wood"];
			if (machine.upgrades.improve.count) accepts.push("coal");
			return accepts;
		},
		capacity: () => 10,
		consumes: machine => machine.outputDiffs.main === 0 ? 0 : getFuelusage(machine)
	}],
	outputs: [{
		id: "main",
		capacity: () => 10,
		produces: machine => getProduction(machine),
		requiresList: machine => [{
			resource: machine.inputResource || "none",
			amount: getConsumption(machine),
			inputId: 0,
		}, {
			resource: machine.inputFuel || "none",
			amount: getFuelusage(machine),
			inputId: 1,
		}]
	}],
	upgrades: machineUpg([{
		name: "improve",
		cost: 15,
		currencyType: "stone",
		max: 1,
		title: "Improve",
		description: upgrade => `Increase speed and fuel efficiency.${upgrade.count > 0 ? "" : " Unlocks ability to use coal as fuel."}`,
		effect: count => [ Math.pow(1.5, count) + count * 0.5, Math.pow(1.1, count) + count * 0.2 ],
		formatEffect: () => ""
	}]),
	customLoop(diff) {
		this.inputResource = this.inputItem(0) ? this.inputItem(0).resource : "none";
		this.inputFuel = this.inputItem(1) ? this.inputItem(1).resource : "none";
		Machine.tickThisMachine(this, diff);
	},
	description: `Basic furnace. Takes in a fuel and the item to be heated.`
};