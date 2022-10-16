import { ResourceData } from "@/types/resources";

export function volumeOfStack(stack : ResourceData[]) : number {
	return stack.reduce((v, item) => v + item.amount, 0);
}

// WARNING: This modifies `stack`
export function addToStack(stack : ResourceData[], item : ResourceData, capacity = Infinity,
	precalculations : { spaceLeft?: number } = {}) : number {
	if (item.amount <= 0) return 0;
	const spaceLeft = precalculations.spaceLeft ?? capacity - volumeOfStack(stack);
	if (spaceLeft <= 0) return 0;
	const amount = Math.min(spaceLeft, item.amount);
	if (stack[0] && stack[0].resource === item.resource) {
		stack[0].amount += amount;
	} else {
		stack.unshift({
			resource: item.resource,
			amount
		});
	}
	return amount;
}

// WARNING: This modifies `stack`
export function removeFromStack(stack : ResourceData[], amount : number) : number {
	if (!stack.length) return 0;
	if (amount <= 0) return 0;

	const removed = stack[stack.length - 1];

	if (removed.amount <= amount) {
		stack.pop();
		return removed.amount;
	}

	removed.amount -= amount;
	if (removed.amount < Number.EPSILON) {
		stack.pop();
	}
	return amount;
}