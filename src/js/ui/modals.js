import { ref, shallowRef } from "vue";

import GlossaryModal from "@/components/modals/GlossaryModal.vue";
import H2PModal from "@/components/modals/H2PModal.vue";
import HardResetModal from "@/components/modals/HardResetModal.vue";
import InfoModal from "@/components/modals/InfoModal.vue";
import MachineInfoModal from "@/components/modals/MachineInfoModal.vue";
import MachineProductionModal from "@/components/modals/MachineProductionModal.vue";
import MachineUpgradeModal from "@/components/modals/MachineUpgradeModal.vue";
import MessageModal from "@/components/modals/MessageModal.vue";
import RemoveMachineModal from "@/components/modals/RemoveMachineModal.vue";
import SettingsModal from "@/components/modals/SettingsModal.vue";


class Modal {
	constructor(component, priority = 0) {
		this._component = component;
		this._modalConfig = {};
		this._priority = priority;
	}

	show(modalConfig) {
		this._props = Object.assign({}, modalConfig || {});

		const modalQueue = Modals.queue;
		// Add this modal to the front of the queue and sort based on priority to ensure priority is maintained.
		modalQueue.unshift(this);
		Modals.sortModalQueue();
		return {
			then: func => {
				this.afterHide = func;
			}
		};
	}

	get isOpen() {
		return Modals.current === this;
	}

	get component() {
		return this._component;
	}

	get props() {
		return this._props;
	}

	get priority() {
		return this._priority;
	}
}

export const Modals = {
	current: shallowRef(undefined),
	queue: [],
	hide() {
		const closed = Modals.queue.shift();
		if (closed) {
			if (closed.afterHide) closed.afterHide();
			delete closed.afterHide;
		}
		if (Modals.queue.length === 0) Modals.current.value = undefined;
		else Modals.current.value = Modals.queue[0];
	},
	hideAll() {
		while (Modals.queue.length) {
			if (Modals.queue[0].hide) {
				Modals.queue[0].hide();
			} else {
				Modals.hide();
			}
		}
		Modals.current = undefined;
	},
	sortModalQueue() {
		const modalQueue = Modals.queue;
		modalQueue.sort((x, y) => y.priority - x.priority);
		// Filter out multiple instances of the same Modals.
		const singleQueue = [...new Set(modalQueue)];
		Modals.queue = singleQueue;
		Modals.current.value = singleQueue[0];
	},
	get isOpen() {
		return Modals.current.value !== undefined;
	}
};

Modals.glossary = new Modal(GlossaryModal);
Modals.h2p = new Modal(H2PModal);
Modals.hardReset = new Modal(HardResetModal);
Modals.info = new Modal(InfoModal);
Modals.machineInfo = new Modal(MachineInfoModal);
Modals.machineUpgrades = new Modal(MachineUpgradeModal);
Modals.machineProduction = new Modal(MachineProductionModal);
Modals.removeMachine = new Modal(RemoveMachineModal);
Modals.settings = new Modal(SettingsModal);
Modals.message = new class extends Modal {
	show(text) {
		if (!this.queue) this.queue = [];
		if (!this.queue.length) this.text.value = text;
		this.queue.push(text);
		return super.show();
	}

	hide() {
		if (this.queue.length <= 1) {
			Modals.hide();
		}
		this.queue.shift();
		if (this.queue && this.queue.length === 0) this.text.value = undefined;
		else this.text.value = this.queue[0];
	}

	text = ref("");
}(MessageModal, 2);

window.Modals = Modals;