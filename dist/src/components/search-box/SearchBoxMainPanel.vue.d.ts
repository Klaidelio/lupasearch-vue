import type { PropType as __PropType } from 'vue';
import type { SearchBoxPanelOptions } from '../../types/search-box/SearchBoxOptions';
declare const _sfc_main: import("vue").DefineComponent<{
    options: {
        type: __PropType<SearchBoxPanelOptions>;
        required: true;
    };
    inputValue: {
        type: __PropType<string>;
        required: true;
    };
    isSearchContainer: {
        type: __PropType<boolean>;
        required: false;
    };
    focused: {
        type: __PropType<boolean>;
        required: false;
    };
    history: {
        type: __PropType<string[]>;
        required: false;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("fetched" | "itemSelect" | "go-to-results" | "clear-history-item" | "clear-history")[], "fetched" | "itemSelect" | "go-to-results" | "clear-history-item" | "clear-history", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    options: {
        type: __PropType<SearchBoxPanelOptions>;
        required: true;
    };
    inputValue: {
        type: __PropType<string>;
        required: true;
    };
    isSearchContainer: {
        type: __PropType<boolean>;
        required: false;
    };
    focused: {
        type: __PropType<boolean>;
        required: false;
    };
    history: {
        type: __PropType<string[]>;
        required: false;
    };
}>> & {
    onFetched?: (...args: any[]) => any;
    onItemSelect?: (...args: any[]) => any;
    "onGo-to-results"?: (...args: any[]) => any;
    "onClear-history-item"?: (...args: any[]) => any;
    "onClear-history"?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
