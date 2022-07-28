import MachineUpgradeModal from "./../../components/modals/MachineUpgradeModal.vue";
import MachineProductionModal from "./../../components/modals/MachineProductionModal.vue";
import MessageModal from "./../../components/modals/MessageModal.vue";
import RemoveMachineModal from "./../../components/modals/RemoveMachineModal.vue";

export class Modal {
	constructor(component, priority = 0) {
		this._component = component;
		this._modalConfig = {};
		this._priority = priority;
	}
	
	show(modalConfig) {
		this._props = Object.assign({}, modalConfig || {});
	
		const modalQueue = Modal.queue;
		// Add this modal to the front of the queue and sort based on priority to ensure priority is maintained.
		modalQueue.unshift(this);
		Modal.sortModalQueue();
		return {
			then: (func) => {
				this.afterHide = func;
			}
		}
	}
	
	get isOpen() {
		return Modal.current === this;
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
	
	static sortModalQueue() {
		const modalQueue = Modal.queue;
		modalQueue.sort((x, y) => y.priority - x.priority);
		// Filter out multiple instances of the same modal.
		const singleQueue = [...new Set(modalQueue)];
		Modal.queue = singleQueue;
		Modal.current = singleQueue[0];
	}
	
	static hide() {
		const closed = Modal.queue.shift();
		if (closed) {
			if (closed.afterHide) closed.afterHide();
			delete closed.afterHide;
		}
		if (Modal.queue.length === 0) Modal.current = undefined;
		else Modal.current = Modal.queue[0];
	}
	
	static hideAll() {
		while (Modal.queue.length) {
			if (Modal.queue[0].hide) {
				Modal.queue[0].hide();
			} else {
				Modal.hide();
			}
		}
		Modal.current = undefined;
	}
	
	static get isOpen() {
		return Modal.current instanceof this;
	}

	static queue = []
}

Modal.machineUpgrades = new Modal(MachineUpgradeModal);
Modal.machineProduction = new Modal(MachineProductionModal);
Modal.removeMachine = new Modal(RemoveMachineModal);
Modal.message = new class extends Modal {
	show(text) {
		if (!this.queue) this.queue = [];
		if (!this.queue.length) this.text = text;
		this.queue.push(text);
		return super.show();
	}
  
	hide() {
		if (this.queue.length <= 1) {
			Modal.hide();
		}
		this.queue.shift();
		if (this.queue && this.queue.length === 0) this.text = undefined;
		else this.text = this.queue[0];
	}
}(MessageModal, 2);