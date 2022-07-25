import MachineUpgradeModal from "./../../components/modals/MachineUpgradeModal.vue";

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
		Modal.queue.shift();
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

window.Modal = Modal;

Modal.machineUpgrades = new Modal(MachineUpgradeModal);