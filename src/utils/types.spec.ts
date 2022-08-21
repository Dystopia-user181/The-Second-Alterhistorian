import { isArray, isObject } from "./types";

describe("isArray", () => {
	it("returns true for arrays", () => {
		expect(isArray([])).toEqual(true);
		expect(isArray(["asdf"])).toEqual(true);
		expect(isArray([5, {}, "test", () => 10])).toEqual(true);
	});

	it("returns false for non-arrays", () => {
		expect(isArray("asd")).toEqual(false);
		expect(isArray(1)).toEqual(false);
		expect(isArray({})).toEqual(false);
		expect(isArray(() => "test")).toEqual(false);
	});
});

describe("isObject", () => {
	it("returns true for objects", () => {
		expect(isObject({})).toEqual(true);
		expect(isObject({ anything: "anything" })).toEqual(true);
		expect(isObject(Math)).toEqual(true);
	});

	it("returns false for non-objects", () => {
		expect(isObject("asd")).toEqual(false);
		expect(isObject(1)).toEqual(false);
		expect(isObject(() => "test")).toEqual(false);
		expect(isObject([])).toEqual(false);
	});
});