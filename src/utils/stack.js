import { arr } from "./extensions";

export const Stack = {
	volumeOfStack(stack) {
		return stack.reduce((v, item) => v + item.amount, 0);
	},
	addToStack(stack, item, capacity = Infinity, additionalData = {}) {
		if (item.amount <= 0) return 0;
		const spaceLeft = additionalData.spaceLeft ?? capacity - Stack.volumeOfStack(stack);
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
	},
	removeFromStack(stack, amount, isBottom = true) {
		if (!stack.length) return 0;
		const removed = isBottom ? arr(stack).last : stack[0];
		if (removed.amount <= amount) {
			if (isBottom) stack.pop();
			else stack.shift();
			return removed.amount;
		}

		removed.amount -= amount;
		if (arr(stack).last.amount < Number.EPSILON) {
			if (isBottom) stack.pop();
			else stack.shift();
		}
		return amount;
	}
};