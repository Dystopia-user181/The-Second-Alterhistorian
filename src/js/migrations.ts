/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
type migration = (player: any) => void;

export const migrations: migration[] = [
	player => {
		for (const id in player.towns.home.machines) {
			const machine = player.towns.home.machines[id];
			if (machine.type === "essencePurifier") machine.upgrades[0] = 0;
		}
	},
	player => {
		if (player.holding.resource === "stonePowder") player.holding.resource = "stoneDust";
		for (const id in player.towns.home.machines) {
			const machine = player.towns.home.machines[id];
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
		for (const id in player.towns.home.machines) {
			const machine = player.towns.home.machines[id];
			if (machine.type === "elixirMaker") {
				if (machine.outputs[0]) player.producedElixir += machine.outputs[0].amount;
			}
		}
	},
	player => {
		player.towns.home.display.offset = player.display.offset;
		delete player.display;
	}
];