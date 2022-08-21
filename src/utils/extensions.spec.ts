import { deepAssign, deepClone, shallowClone } from "./extensions";

describe("shallowClone", () => {
	it("shallow clones arrays", () => {
		const obj = { val: 10 };
		const subject = [obj, 5];

		const clone = shallowClone(subject);
		obj.val = 100;

		expect(clone).toEqual(subject);
	});

	it("shallow clones objects", () => {
		const testObj = { val: "test" };
		const subject = { one: { obj: testObj }, two: 5 };

		const clone = shallowClone(subject);
		clone.one.obj.val = "change";

		expect(clone).toEqual(subject);
	});
});

describe("deepClone", () => {
	it("deep clones arrays", () => {
		const obj = { val: 10 };
		const subject = [obj, 5];

		const clone = deepClone(subject);
		obj.val = 100;

		expect(clone).not.toEqual(subject);
	});

	it("deep clones objects", () => {
		const testObj = { val: "test" };
		const subject = { one: { obj: testObj }, two: 5 };

		const clone = deepClone(subject);
		clone.one.obj.val = "change";

		expect(clone).not.toEqual(subject);
	});
});

describe("message", () => {
	it("deep assigns a blank object", () => {
		const target = {};
		const source = { one: 1, two: { three: () => 128 } };

		deepAssign(target, source);

		expect(target).toStrictEqual(source);
	});

	it("overwrites existing values", () => {
		const target = { one: 5, two: { three: () => 8 } };
		const source = { one: 1, two: { three: () => 64 } };

		deepAssign(target, source);

		expect(target).toStrictEqual(source);
	});

	it("deep clones inner objects", () => {
		const innerSourceObject = { three: 1024 };

		const target = { one: 5, two: { three: 8 } };
		const source = { one: 1, two: innerSourceObject };

		deepAssign(target, source);
		target.two.three = 2;

		expect(source.two.three).not.toStrictEqual(target.two.three);
	});

	it("does not apply to a different object type", () => {
		const target = { five: 5, other: (name: string) => name.toUpperCase() };
		const source = { one: 1, two: { three: () => 256 } };

		// @ts-expect-error - target is a different type than source
		deepAssign(target, source);
	});
});