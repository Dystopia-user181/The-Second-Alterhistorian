import { GameDatabase } from "@/js/database/index";

import { arr } from "@/utils";


GameDatabase.machines = {};

export function machineUpg(array) {
	return arr(array).mapToObject(x => x.name, (x, id) => ({ ...x, id }));
}