// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any[]) => any;

/** Type guard to check whether the input is an array */
export const isArray = (value: any): value is unknown[] => Array.isArray(value);

/** Type guard to check whether the input is an object */
export const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);