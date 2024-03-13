import type { PropType as __PropType } from 'vue';
import type { DisplaySuggestion } from '../../../types/search-box/Common';
import type { SearchBoxOptionLabels } from '../../../types/search-box/SearchBoxOptions';
declare const _sfc_main: import("vue").DefineComponent<{
    suggestion: {
        type: __PropType<DisplaySuggestion>;
        required: true;
    };
    highlight: {
        type: __PropType<boolean>;
        required: false;
    };
    labels: {
        type: __PropType<SearchBoxOptionLabels>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "select"[], "select", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    suggestion: {
        type: __PropType<DisplaySuggestion>;
        required: true;
    };
    highlight: {
        type: __PropType<boolean>;
        required: false;
    };
    labels: {
        type: __PropType<SearchBoxOptionLabels>;
        required: true;
    };
}>> & {
    onSelect?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
