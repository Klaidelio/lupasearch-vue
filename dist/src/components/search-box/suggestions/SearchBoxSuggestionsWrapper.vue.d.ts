import type { PropType as __PropType } from 'vue';
import type { SuggestionSearchBoxPanel } from '../../../types/search-box/SearchBoxPanel';
import type { SdkOptions } from '../../../types/General';
import type { SearchBoxOptionLabels } from '../../../types/search-box/SearchBoxOptions';
declare const _sfc_main: import("vue").DefineComponent<{
    panel: {
        type: __PropType<SuggestionSearchBoxPanel>;
        required: true;
    };
    options: {
        type: __PropType<SdkOptions>;
        required: true;
    };
    inputValue: {
        type: __PropType<string>;
        required: true;
    };
    debounce: {
        type: __PropType<number>;
        required: false;
    };
    labels: {
        type: __PropType<SearchBoxOptionLabels>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("fetched" | "itemSelect")[], "fetched" | "itemSelect", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    panel: {
        type: __PropType<SuggestionSearchBoxPanel>;
        required: true;
    };
    options: {
        type: __PropType<SdkOptions>;
        required: true;
    };
    inputValue: {
        type: __PropType<string>;
        required: true;
    };
    debounce: {
        type: __PropType<number>;
        required: false;
    };
    labels: {
        type: __PropType<SearchBoxOptionLabels>;
        required: true;
    };
}>> & {
    onFetched?: (...args: any[]) => any;
    onItemSelect?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
