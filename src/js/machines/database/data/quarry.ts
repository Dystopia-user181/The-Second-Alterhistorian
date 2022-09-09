import { defineMachine } from "../builder";

export const Quarry = defineMachine({
	name: "quarry",
	description: `Produces Stone and Coal.`,
	inputs: [],
	outputs: [
		{
			capacity: machine => 10 * machine.upgrades.capacity.effect,
			produces: machine => ({
				resource: "stone",
				amount: 0.15 * machine.upgrades.velocity.effect,
			}),
			isUnlocked: machine => machine.upgrades.unlock.maxed,
		},
		{
			capacity: machine => 5 * machine.upgrades.capacity.effect,
			produces: machine => ({
				resource: "coal",
				amount: 0.04 * machine.upgrades.velocity.effect,
			}),
			isUnlocked: machine => machine.upgrades.unlock.maxed,
		},
	],
	upgrades: {
		unlock: {
			name: "unlock",
			cost: 55,
			currencyType: "bricks",
			max: 1,
			title: "Build",
			description: "Build the quarry.",
			effect: count => Boolean(count),
			formatEffect: () => "",
			isUnlocked: machine => !machine.upgrades.unlock.effect,
		},
		capacity: {
			name: "capacity",
			cost: count => Math.pow(4, count) * 10,
			currencyType: "energy",
			max: 4,
			title: "Capacity",
			description: "Increase Stone and Coal capacity",
			effect: count => Math.pow(2, count),
			// FIXME: type effects
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			isUnlocked: machine => machine.upgrades.unlock.effect,
		},
		velocity: {
			name: "velocity",
			cost: count =>
				(count > 4 ? Math.pow(4, count - 5) * 10 : Math.pow(3, count) * 10),
			currencyType: count => (count > 4 ? "vitriol" : "energy"),
			max: 8,
			title: "Velocity",
			description: "Increase Stone and Coal production",
			effect: count => Math.pow(1.55, count) + count * 0.1,
			// FIXME: type effects
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			isUnlocked: machine => machine.upgrades.unlock.effect,
		},
	},
});