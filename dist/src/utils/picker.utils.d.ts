export declare const pick: <T extends Record<string, unknown>, U extends keyof T>(obj: T, keys: U[]) => Pick<T, U>;
export declare const getHint: (suggestion: string, inputValue: string) => string;
export declare const reverseKeyValue: (obj: Record<string, string>) => Record<string, string>;
export declare const pickClosestNumber: (numbers: number[], closestTo: number) => number;
export declare const getPageCount: (total: number, limit: number) => number;
