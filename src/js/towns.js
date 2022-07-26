import { GameDatabase } from "./database/game-database";
import { MachineTypes } from "./machines";

class Town {
	constructor(config) {
		this.config = config;
	}

	get defaultMachines() {
		return this.config.defaultMachines.map(x => MachineTypes[x.type].newMachine(x.x, x.y));
	}
}

export const Towns = objectMap(GameDatabase.towns, x => x, x => new Town(x));