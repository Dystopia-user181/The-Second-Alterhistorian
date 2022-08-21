import { deepClone, shallowClone } from "./extensions";

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