import { defineMachine } from "../builder";

import { Currencies } from "@/js/currencies/currencies";

import { Stack } from "@/utils";

export default defineMachine({
	name: "steamEngine",
	inputs: [
		{
			accepts: ["steam"],
			capacity: () => 20,
			consumes: machine => ({
				amount: 0.6 * machine.upgrades.harness.effect,
				maximum:
					(machine.outputDiffs.main * 0.6 * machine.upgrades.harness.effect) /
					machine.upgrades.yield.effect,
			}),
		},
	],
	outputs: [
		{
			id: "main",
			capacity: () => 10,
			produces: machine => ({
				resource: "energy",
				amount: 0.1 * machine.upgrades.harness.effect,
			}),
			requires: machine => ({
				resource: "steam",
				amount: (0.6 * machine.upgrades.harness.effect) / machine.upgrades.yield.effect,
				inputId: 0,
			}),
		},
		{
			capacity: () => 10,
			produces: machine => ({
				resource: "water",
				// FIXME: What is this data thing on outputs?
				amount:
					Stack.volumeOfStack(machine.outputs[0].data) >= machine.outputs[0].config.capacity
						? 0
						: (0.3 * machine.upgrades.harness.effect) / machine.upgrades.yield.effect,
			}),
			requires: machine => ({
				resource: "steam",
				amount: (0.6 * machine.upgrades.harness.effect) / machine.upgrades.yield.effect,
				inputId: 0,
			}),
		},
	],
	upgrades: {
		harness: {
			name: "harness",
			cost: count => Math.pow(5, count) * 6,
			// FIXME: What to do with this invalid "???" that is a display value?
			currencyType: () => (Currencies.fire.isUnlocked ? "lava" : "???"),
			max: 3,
			title: "Harness",
			description: "Increase operation speed",
			effect: count => Math.pow(1.6, count) + count * 0.3,
		},
		yield: {
			name: "yield",
			cost: count => Math.pow(4, count),
			currencyType: "essence",
			max: 3,
			title: "Yielding",
			description: "Decrease steam usage and water byproduct",
			effect: count => Math.pow(1.2, count) + count * 0.3,
		},
	},
	description: `Converts Steam into Energy. James Watt would be proud.`,
});