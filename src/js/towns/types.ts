import { MachineData } from "@/js/machines/database/config";

export interface PlayerTown {
	machines: Record<number, MachineData>,
	upgrades: number,
	machinesPrepay: number[],
	upgradesPrepay: number[],
	display: {
		offset: { x: number, y: number },
		zoom: number
	},
}