export declare const useHistoryStore: import("pinia").StoreDefinition<"history", import("pinia")._UnwrapAll<Pick<{
    items: import("vue").Ref<string[]>;
    count: import("vue").ComputedRef<number>;
    add: ({ item }: {
        item?: string;
    }) => string[];
    remove: ({ item }: {
        item: string;
    }) => string[];
    clear: () => void;
}, "items">>, Pick<{
    items: import("vue").Ref<string[]>;
    count: import("vue").ComputedRef<number>;
    add: ({ item }: {
        item?: string;
    }) => string[];
    remove: ({ item }: {
        item: string;
    }) => string[];
    clear: () => void;
}, "count">, Pick<{
    items: import("vue").Ref<string[]>;
    count: import("vue").ComputedRef<number>;
    add: ({ item }: {
        item?: string;
    }) => string[];
    remove: ({ item }: {
        item: string;
    }) => string[];
    clear: () => void;
}, "clear" | "add" | "remove">>;
