import type { QueryParams } from '../types/search-results/QueryParams';
export declare const parseParams: (searchParams?: URLSearchParams) => QueryParams;
export declare const appendParam: (url: URL, { name, value }: {
    name: string;
    value: string | string[];
}, encode?: boolean) => void;
export declare const getRemovableParams: (url: URL, paramsToRemove?: 'all' | string[]) => string[] | undefined;
export declare const removeParams: (url: URL, params?: string[]) => void;
export declare const encodeParam: (param: string) => string;
