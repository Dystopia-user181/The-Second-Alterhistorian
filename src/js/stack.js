export const Stack = {
	volumeOfStack(stack) {
		return stack.reduce((v, item) => v + item.amount, 0);
	},
	addToStack(stack, item, capacity = Infinity) {
		const spaceLeft = capacity - Stack.volumeOfStack(stack);
		if (item.amount <= 0) return 0;
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
		const removed = isBottom ? last(stack) : stack[0];
		if (removed.amount <= amount) {
			isBottom ? stack.pop() : stack.shift();
			return removed.amount;
		} else {
			removed.amount -= amount;
			if (last(stack).amount < 1e-100) isBottom ? stack.pop() : stack.shift();
			return amount;
		}
	}
}

window.Stack = Stack;