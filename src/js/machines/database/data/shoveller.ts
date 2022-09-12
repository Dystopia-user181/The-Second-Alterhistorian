import { defineMachine } from "../builder";

import { formatX } from "@/utils";

export default defineMachine({
	name: "shoveller",
	inputs: [],
	outputs: [
		{
			capacity: machine => 16 * machine.upgrades.capacity.effect,
			produces: machine => ({
				resource: "earth",
				amount: 0.3 * machine.upgrades.velocity.effect,
			}),
		},
		{
			capacity: 10,
			produces: machine => ({
				resource: "wood",
				amount: 0.2 * machine.upgrades.wood.effect,
			}),
			// FIXME: type effects
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			isUnlocked: machine => machine.upgrades.wood.effect,
		},
	],
	upgrades: {
		capacity: {
			name: "capacity",
			cost: count => Math.pow(6, count) * 5,
			max: 6,
			title: "Capacity",
			description: "Increase Earth capacity",
			effect: count => Math.pow(2, count - 1) + count + 0.5,
		},
		velocity: {
			name: "velocity",
			cost: count => Math.pow(4, count) * 5,
			max: 7,
			title: "Velocity",
			description: "Increase Earth production",
			effect: count => Math.pow(1.5, count) + count,
		},
		wood: {
			name: "wood",
			cost: count => 40 * Math.pow(5, count),
			max: 3,
			title: upg => (upg.count ? "Persistence" : "Wood"),
			description: upg => (upg.count ? "Increase Wood production" : "Attach a primitive axe to cut down trees"),
			effect: count => (Math.pow(1.4, count) - 1) * 2.5,
			// FIXME: type effects
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			formatEffect: effect => (effect ? formatX(effect, 2, 1) : "Not unlocked"),
		},
	},
	description: `Produces Earth.`,
});