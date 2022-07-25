import { GameDatabase } from "../game-database";

GameDatabase.machines = {};

export function machineUpg(array) {
	return mapToObject(array, x => x.name, (x, id) => ({ ...x, id }));
}