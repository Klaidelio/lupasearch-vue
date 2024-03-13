import type { PropType as __PropType } from 'vue';
import type { SearchBoxOptionLabels } from '../../types/search-box/SearchBoxOptions';
declare const _sfc_main: import("vue").DefineComponent<{
    labels: {
        type: __PropType<SearchBoxOptionLabels>;
        required: true;
    };
    showTotalCount: {
        type: __PropType<boolean>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "go-to-results"[], "go-to-results", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    labels: {
        type: __PropType<SearchBoxOptionLabels>;
        required: true;
    };
    showTotalCount: {
        type: __PropType<boolean>;
        required: true;
    };
}>> & {
    "onGo-to-results"?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
