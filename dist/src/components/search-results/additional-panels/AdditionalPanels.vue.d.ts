import type { PropType as __PropType } from 'vue';
import type { SearchResultsAdditionalPanels } from '../../../types/search-results/SearchResultsOptions';
import type { SdkOptions } from '../../../types/General';
declare const _sfc_main: import("vue").DefineComponent<{
    options: {
        type: __PropType<SearchResultsAdditionalPanels>;
        required: true;
    };
    sdkOptions: {
        type: __PropType<SdkOptions>;
        required: true;
    };
    location: {
        type: __PropType<"top" | "bottom">;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    options: {
        type: __PropType<SearchResultsAdditionalPanels>;
        required: true;
    };
    sdkOptions: {
        type: __PropType<SdkOptions>;
        required: true;
    };
    location: {
        type: __PropType<"top" | "bottom">;
        required: true;
    };
}>>, {}, {}>;
export default _sfc_main;
