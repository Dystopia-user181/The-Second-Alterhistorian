export const migrations = [
	player => {
		for (const machine of Object.values(player.towns.home.machines)) {
			if (machine.type === "essencePurifier") machine.upgrades[0] = 0;
		}
	},
	player => {
		if (player.holding.resource === "stonePowder") player.holding.resource = "stoneDust";
		for (const machine of Object.values(player.towns.home.machines)) {
			if (machine.inputs) {
				for (const item of machine.inputs.flat()) {
					if (item.resource === "stonePowder") item.resource = "stoneDust";
				}
			}
			if (machine.outputs) {
				for (const item of machine.outputs.flat()) {
					if (item.resource === "stonePowder") item.resource = "stoneDust";
				}
			}
		}
	},
	player => {
		for (const machine of Object.values(player.towns.home.machines)) {
			if (machine.type === "elixirMaker") {
				if (machine.outputs[0]) player.producedElixir += machine.outputs[0].amount;
			}
		}
	}
];