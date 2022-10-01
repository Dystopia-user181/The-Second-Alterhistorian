import * as fc from "fast-check";

import { ResourceTypes } from "../types/resources";

import { addToStack, removeFromStack, volumeOfStack } from "./stack";

const resourceData = fc.record({
	amount: fc.integer({ min: 1 }),
	resource: fc.constantFrom(...ResourceTypes),
});

describe("volumeOfStack", () => {
	it("returns 0 when nothing is in the stack", () => {
		expect(volumeOfStack([])).toEqual(0);
	});

	it("returns count of all items when there are resources in the stack", () =>
		fc.assert(
			fc.property(fc.float(), fc.float(), fc.float(), (a, b, c) => {
				expect(
					volumeOfStack([
						{ amount: a, resource: "elixir" },
						{ amount: b, resource: "coal" },
						{ amount: c, resource: "bricks" },
					])
				).toEqual(a + b + c);
			})
		));
});

describe("addToStack", () => {
	const stackValues = fc.tuple(resourceData, resourceData, fc.integer({ min: 1 }));

	describe("when amount to add is less than or equal to 0", () => {
		it("returns 0", () =>
			fc.assert(
				fc.property(
					fc.float({ max: 0, noNaN: true, noDefaultInfinity: true }),
					amount => {
						expect(addToStack([], { amount, resource: "elixir" })).toEqual(0);
					}
				)
			));
	});

	describe("when stack is a resource of the same type", () => {
		const stackValuesSameType = stackValues.filter(
			([existingResource, newResource]) => existingResource.resource === newResource.resource
		);

		it("merges the stack", () =>
			fc.assert(
				fc.property(stackValuesSameType, ([existingResource, newResource]) => {
					const startingAmount = existingResource.amount;
					addToStack([existingResource], newResource);

					expect(existingResource).toEqual({
						...existingResource,
						amount: startingAmount + newResource.amount,
					});
				})
			));
	});

	describe("when stack is a resource of a different type", () => {
		const stackValuesDifferentType = stackValues.filter(
			([existingResource, newResource]) => existingResource.resource !== newResource.resource
		);

		it("adds the new resource to the stack", () =>
			fc.assert(
				fc.property(stackValuesDifferentType, ([existingResource, newResource]) => {
					const stack = [existingResource];
					addToStack(stack, newResource);

					expect(stack).toEqual([newResource, existingResource]);
				})
			));
	});

	describe("when existing stack amount is greater than or equal to the capacity", () => {
		const stackExistingOverCapacity = stackValues.filter(
			([existingResource, , capacity]) => existingResource.amount >= capacity
		);

		it("returns 0", () =>
			fc.assert(
				fc.property(
					stackExistingOverCapacity,
					([existingResource, newResource, capacity]) => {
						expect(addToStack([existingResource], newResource, capacity)).toEqual(0);
					}
				)
			));
	});

	describe("when new amount + existing amount is greater than or equal the capacity", () => {
		const stackValuesOverCapacity = stackValues.filter(
			([existingResource, newResource, capacity]) =>
				// existing amount less than capacity ensures it's testing the actual space left
				existingResource.amount < capacity &&
				existingResource.amount + newResource.amount >= capacity
		);

		it("returns the maximum amount that would fit", () =>
			fc.assert(
				fc.property(
					stackValuesOverCapacity,
					([existingResource, newResource, capacity]) => {
						const startingAmount = existingResource.amount;

						expect(addToStack([existingResource], newResource, capacity)).toEqual(
							Math.min(capacity - startingAmount, newResource.amount)
						);
					}
				)
			));
	});
});

describe("removeFromStack", () => {
	const stackValues = fc.tuple(fc.tuple(resourceData, resourceData), fc.float({ min: 0 }));

	describe("when stack is empty", () => {
		it("returns 0", () =>
			fc.assert(
				fc.property(fc.float(), amount => {
					expect(removeFromStack([], amount)).toEqual(0);
				})
			));
	});

	describe("when amount to remove is 0", () => {
		it("returns 0", () => {
			expect(removeFromStack([{ amount: 50, resource: "bricks" }], 0)).toEqual(0);
		});
	});

	describe("when amount to remove is greater than or equal to stack amount", () => {
		const stackValuesRemoveMore = stackValues.filter(
			([stack, amount]) => amount >= stack[0].amount
		);

		it("returns the existing amount", () =>
			fc.assert(
				fc.property(stackValuesRemoveMore, ([stack, amount]) => {
					const existingAmount = stack[0].amount;
					expect(removeFromStack(stack, amount)).toEqual(existingAmount);
				})
			));

		it("removes the stack item", () =>
			fc.assert(
				fc.property(stackValuesRemoveMore, ([stack, amount]) => {
					const stackSecond = stack[1];

					removeFromStack(stack, amount);

					expect(stack).toEqual([stackSecond]);
				})
			));
	});

	describe("when amount to remove is less than stack amount", () => {
		const stackValuesRemoveMore = stackValues.filter(
			([stack, amount]) => stack[0].amount > amount
		);

		it("returns the existing amount", () =>
			fc.assert(
				fc.property(stackValuesRemoveMore, ([stack, amount]) => {
					expect(removeFromStack(stack, amount)).toEqual(amount);
				})
			));

		it("reduces the stack item by the amount", () =>
			fc.assert(
				fc.property(stackValuesRemoveMore, ([stack, amount]) => {
					const originalAmount = stack[0].amount;

					removeFromStack(stack, amount);

					expect(stack[0].amount).toEqual(originalAmount - amount);
				})
			));
	});

	describe("when amount to remove results a leftover of < Number.EPSILON", () => {
		it("removes the resource from the stack", () =>
			fc.assert(
				fc.property(stackValues, ([stack]) => {
					const amount = stack[0].amount - Number.EPSILON / 2;

					removeFromStack(stack, amount);

					expect(stack.length).toEqual(1);
				})
			));
	});
});