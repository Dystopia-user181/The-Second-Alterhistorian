import { MachineData } from "@/js/machines/database/config";

export interface PlayerTown {
	machines: Record<number, MachineData>,
	upgrades: 0,
	machinesPrepay: number[],
	upgradesPrepay: number[],
	display: {
		offset: { x: number, y: number },
		zoom: number
	},
}