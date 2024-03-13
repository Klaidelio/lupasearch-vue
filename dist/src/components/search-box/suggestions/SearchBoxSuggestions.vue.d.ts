import type { PropType as __PropType } from 'vue';
import type { DisplaySuggestion } from '../../../types/search-box/Common';
import type { SearchBoxOptionLabels } from '../../../types/search-box/SearchBoxOptions';
declare const _sfc_main: import("vue").DefineComponent<{
    items: {
        type: __PropType<DisplaySuggestion[]>;
        required: true;
    };
    highlight: {
        type: __PropType<boolean>;
        required: true;
    };
    queryKey: {
        type: __PropType<string>;
        required: true;
    };
    labels: {
        type: __PropType<SearchBoxOptionLabels>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "suggestionSelect"[], "suggestionSelect", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    items: {
        type: __PropType<DisplaySuggestion[]>;
        required: true;
    };
    highlight: {
        type: __PropType<boolean>;
        required: true;
    };
    queryKey: {
        type: __PropType<string>;
        required: true;
    };
    labels: {
        type: __PropType<SearchBoxOptionLabels>;
        required: true;
    };
}>> & {
    onSuggestionSelect?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
