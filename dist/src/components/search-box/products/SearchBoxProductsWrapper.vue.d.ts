import type { PropType as __PropType } from 'vue';
import type { SearchBoxOptionLabels } from '../../../types/search-box/SearchBoxOptions';
import type { DocumentSearchBoxPanel } from '../../../types/search-box/SearchBoxPanel';
import type { SdkOptions } from '../../../types/General';
declare const _sfc_main: import("vue").DefineComponent<{
    panel: {
        type: __PropType<DocumentSearchBoxPanel>;
        required: true;
    };
    inputValue: {
        type: __PropType<string>;
        required: true;
    };
    options: {
        type: __PropType<SdkOptions>;
        required: true;
    };
    labels: {
        type: __PropType<SearchBoxOptionLabels>;
        required: false;
    };
    debounce: {
        type: __PropType<number>;
        required: false;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "fetched"[], "fetched", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    panel: {
        type: __PropType<DocumentSearchBoxPanel>;
        required: true;
    };
    inputValue: {
        type: __PropType<string>;
        required: true;
    };
    options: {
        type: __PropType<SdkOptions>;
        required: true;
    };
    labels: {
        type: __PropType<SearchBoxOptionLabels>;
        required: false;
    };
    debounce: {
        type: __PropType<number>;
        required: false;
    };
}>> & {
    onFetched?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
