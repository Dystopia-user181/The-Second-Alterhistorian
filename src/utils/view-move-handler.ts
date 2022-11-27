interface ViewMoveHandlerConfigInput {
	offsetX: number,
	offsetY: number,
	zoom: number,
	minOffsetX?: number,
	maxOffsetX?: number,
	minOffsetY?: number,
	maxOffsetY?: number,
	minZoom?: number,
	maxZoom?: number,
	isBlockingMove?: boolean,
	readonly isBlockingZoom?: boolean,
}

interface ViewMoveHandlerConfig extends ViewMoveHandlerConfigInput {
	readonly minOffsetX: number,
	readonly maxOffsetX: number,
	readonly minOffsetY: number,
	readonly maxOffsetY: number,
	readonly minZoom: number,
	readonly maxZoom: number,
}

const ViewEventListenerTypes = ["changeoffset", "changezoom", "resetperspective", "unmount"] as const;
type ViewEventListenerType = typeof ViewEventListenerTypes[number];
interface ViewEventListeners {
	changeoffset: ((newOffsetX: number, newOffsetY: number, oldOffsetX: number, oldOffsetY: number) => void)[],
	changezoom: ((newZoom: number, oldZoom: number) => void)[],
	resetperspective: (() => void)[],
	unmount: (() => void)[],
}

export class ViewMoveHandler {
	config: ViewMoveHandlerConfig;
	el = document.createElement("span");
	_offsetXStart = 0;
	_offsetYStart = 0;
	_mouseXOnDragStart = 0;
	_mouseYOnDragStart = 0;
	_mouseX = 0;
	_mouseY = 0;
	_onUnmount1?: () => void;
	_onUnmount2?: () => void;
	_eventListeners = Object.fromEntries<any>(
		ViewEventListenerTypes.map(key => [key, []])
	) as ViewEventListeners;

	constructor(config: ViewMoveHandlerConfigInput) {
		config.maxOffsetX = config.maxOffsetX ?? Infinity;
		config.maxOffsetY = config.maxOffsetY ?? Infinity;
		config.minOffsetX = config.minOffsetX ?? -config.maxOffsetX;
		config.minOffsetY = config.minOffsetY ?? -config.maxOffsetY;
		config.maxZoom = config.maxZoom ?? Infinity;
		config.minZoom = config.minZoom ?? 1 / config.maxZoom;
		this.config = config as ViewMoveHandlerConfig;
	}

	get offsetX() {
		return this.config.offsetX;
	}

	set offsetX(v: number) {
		this.config.offsetX = v;
	}

	get offsetY() {
		return this.config.offsetY;
	}

	set offsetY(v: number) {
		this.config.offsetY = v;
	}

	get zoom() {
		return this.config.zoom;
	}

	set zoom(v: number) {
		this.config.zoom = v;
	}

	_changeOffset(event: MouseEvent) {
		if (this.config.isBlockingMove) return;
		this.config.isBlockingMove = true;
		this._offsetXStart = this.offsetX;
		this._offsetYStart = this.offsetY;
		this._mouseXOnDragStart = event.clientX;
		this._mouseYOnDragStart = event.clientY;
		const followMouse = (event2: MouseEvent) => {
			const oldOffsetX = this.offsetX, oldOffsetY = this.offsetY;
			// Move board position with edge handling, then move reference point if it hits the edge
			this.offsetX = Math.max(Math.min(this._offsetXStart +
				(this._mouseXOnDragStart - event2.clientX) / this.zoom,
			this.config.maxOffsetX), -this.config.maxOffsetX);
			this._offsetXStart = this.offsetX + (event2.clientX - this._mouseXOnDragStart) / this.zoom;

			this.offsetY = Math.max(Math.min(this._offsetYStart +
				(this._mouseYOnDragStart - event2.clientY) / this.zoom,
			this.config.maxOffsetY), -this.config.maxOffsetY);
			this._offsetYStart = this.offsetY + (event2.clientY - this._mouseYOnDragStart) / this.zoom;
			for (const listener of this._eventListeners.changeoffset) {
				listener(this.offsetX, this.offsetY, oldOffsetX, oldOffsetY);
			}
		};
		document.addEventListener("mousemove", followMouse);
		const stopHolding = () => {
			this.config.isBlockingMove = false;
			document.removeEventListener("mousemove", followMouse);
			document.removeEventListener("mouseup", stopHolding);
			document.removeEventListener("mouseleave", stopHolding);
			delete this._onUnmount2;
		};
		document.addEventListener("mouseup", stopHolding);
		document.addEventListener("mouseleave", stopHolding);
		this._onUnmount2 = () => stopHolding;
	}

	_resetMovingPerspective() {
		this._mouseXOnDragStart = this._mouseX + this.el.offsetLeft;
		this._mouseYOnDragStart = this._mouseY + this.el.offsetTop;
		this._offsetXStart = this.offsetX;
		this._offsetYStart = this.offsetY;
		for (const listener of this._eventListeners.resetperspective) {
			listener();
		}
	}

	_changeZoom(event: WheelEvent) {
		if (this.config.isBlockingZoom) return;
		const magnitude = Math.pow(0.995, Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 40));
		const oldZoom = this.zoom;
		this.zoom *= magnitude;
		this.zoom = Math.max(Math.min(this.zoom, this.config.maxZoom), this.config.minZoom);
		const newZoom = this.zoom;
		const mouseOffsetX = this._mouseX - this.el.offsetWidth / 2;
		const mouseOffsetY = this._mouseY - this.el.offsetHeight / 2;
		this.offsetX += mouseOffsetX * (1 / oldZoom - 1 / newZoom);
		this.offsetY += mouseOffsetY * (1 / oldZoom - 1 / newZoom);
		this.offsetX = Math.max(Math.min(this.offsetX, this.config.maxOffsetX), -this.config.maxOffsetX);
		this.offsetY = Math.max(Math.min(this.offsetY, this.config.maxOffsetY), -this.config.maxOffsetY);
		for (const listener of this._eventListeners.changezoom) {
			listener(newZoom, oldZoom);
		}
		this._resetMovingPerspective();
	}

	mount(el: HTMLElement) {
		this.el = el;
		const mouseDown = (event: MouseEvent) => setTimeout(() => this._changeOffset(event), 0);
		const mouseMove = (event: MouseEvent) => {
			this._mouseX = event.clientX - this.el.offsetLeft;
			this._mouseY = event.clientY - this.el.offsetTop;
		};
		const wheel = (event: WheelEvent) => this._changeZoom(event);
		el.addEventListener("mousedown", mouseDown);
		el.addEventListener("mousemove", mouseMove);
		el.addEventListener("wheel", wheel);
		this._onUnmount1 = () => {
			el.removeEventListener("mousedown", mouseDown);
			el.removeEventListener("mousemove", mouseMove);
			el.removeEventListener("wheel", wheel);
		};
	}

	unmount() {
		this._onUnmount1?.();
		this._onUnmount2?.();
		for (const listener of this._eventListeners.unmount) {
			listener();
		}
	}

	addEventListener<T extends keyof ViewEventListeners>(
		type: T,
		func: ViewEventListeners[T][number]
	) {
		// I don't know why but type inferring is taking the union of all possible types of functions
		// instead of just getting the function type for specific T
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		this._eventListeners[type].push(func as any);
	}

	removeEventListener<T extends ViewEventListenerType>(
		type: T,
		func: ViewEventListeners[T][number]
	) {
		for (let i = 0; i < this._eventListeners[type].length; i++) {
			while (this._eventListeners[type][i] === func) this._eventListeners[type].splice(i, 1);
		}
	}
}


interface HoldMoveHandlerConfig {
	x: number,
	y: number,
}

const HoldEventListenerTypes = ["stopholding"] as const;
type HoldEventListenerType = typeof HoldEventListenerTypes[number];
interface HoldEventListeners {
	stopholding: (() => void)[]
}

export class HoldMoveHandler {
	config: HoldMoveHandlerConfig;
	parentView: ViewMoveHandler;
	isActive = false;
	_mouseXOnDragStart = 0;
	_mouseYOnDragStart = 0;
	_originalX = 0;
	_originalY = 0;
	_eventListeners = Object.fromEntries<any>(
		HoldEventListenerTypes.map(key => [key, []])
	) as HoldEventListeners;

	constructor(config: HoldMoveHandlerConfig, parentView: ViewMoveHandler) {
		this.config = config;
		this.parentView = parentView;
	}

	resetPerspective = () => {
		if (!this.isActive) return;
		this._mouseXOnDragStart = this.parentView._mouseX + this.parentView.el.offsetLeft;
		this._mouseYOnDragStart = this.parentView._mouseY + this.parentView.el.offsetTop;
		this._originalX = this.config.x;
		this._originalY = this.config.y;
	};

	trigger() {
		const view = this.parentView;
		if (view.config.isBlockingMove) return;
		this.isActive = true;
		view.config.isBlockingMove = true;
		this._mouseXOnDragStart = view._mouseX;
		this._mouseYOnDragStart = view._mouseY;
		this._originalX = this.config.x;
		this._originalY = this.config.y;
		view.addEventListener("resetperspective", () => this.resetPerspective());
		const followMouse = (event: MouseEvent) => {
			this.config.x = Math.min(Math.max(
				this._originalX + (event.clientX - this._mouseXOnDragStart) / view.zoom, view.config.minOffsetX),
			view.config.maxOffsetX);
			this.config.y = Math.min(Math.max(
				this._originalY + (event.clientY - this._mouseYOnDragStart) / view.zoom, view.config.minOffsetX),
			view.config.maxOffsetY);
		};
		document.addEventListener("mousemove", followMouse);
		const stopHolding = () => {
			this.isActive = false;
			view.config.isBlockingMove = false;
			view.removeEventListener("resetperspective", () => this.resetPerspective());
			document.removeEventListener("mousemove", followMouse);
			document.removeEventListener("mouseup", stopHolding);
			document.removeEventListener("mouseleave", stopHolding);
			for (const listener of this._eventListeners.stopholding) {
				listener();
			}
		};
		document.addEventListener("mouseup", stopHolding);
		document.addEventListener("mouseleave", stopHolding);
		view.addEventListener("unmount", stopHolding);
	}

	addEventListener<T extends keyof HoldEventListeners>(
		type: T,
		func: HoldEventListeners[T][number]
	) {
		// I don't know why but type inferring is taking the union of all possible types of functions
		// instead of just getting the function type for specific T
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		this._eventListeners[type].push(func as any);
	}

	removeEventListener<T extends HoldEventListenerType>(
		type: T,
		func: HoldEventListeners[T][number]
	) {
		for (let i = 0; i < this._eventListeners[type].length; i++) {
			while (this._eventListeners[type][i] === func) this._eventListeners[type].splice(i, 1);
		}
	}
}