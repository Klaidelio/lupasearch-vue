export declare const useScreenStore: import("pinia").StoreDefinition<"screen", import("pinia")._UnwrapAll<Pick<{
    screenWidth: import("vue").Ref<number>;
    currentScreenWidth: import("vue").ComputedRef<"xs" | "sm" | "md" | "l" | "xl">;
    isMobileWidth: import("vue").ComputedRef<boolean>;
    setScreenWidth: ({ width }: {
        width: number;
    }) => void;
}, "screenWidth">>, Pick<{
    screenWidth: import("vue").Ref<number>;
    currentScreenWidth: import("vue").ComputedRef<"xs" | "sm" | "md" | "l" | "xl">;
    isMobileWidth: import("vue").ComputedRef<boolean>;
    setScreenWidth: ({ width }: {
        width: number;
    }) => void;
}, "currentScreenWidth" | "isMobileWidth">, Pick<{
    screenWidth: import("vue").Ref<number>;
    currentScreenWidth: import("vue").ComputedRef<"xs" | "sm" | "md" | "l" | "xl">;
    isMobileWidth: import("vue").ComputedRef<boolean>;
    setScreenWidth: ({ width }: {
        width: number;
    }) => void;
}, "setScreenWidth">>;
