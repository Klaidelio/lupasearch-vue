import type { PropType as __PropType } from 'vue';
import type { SortOptions } from '../../../../types/search-results/SearchResultsSort';
import { SearchResultEventCallbacks } from '../../../../types/search-results/SearchResultsOptions';
declare const _sfc_main: import("vue").DefineComponent<{
    options: {
        type: __PropType<SortOptions>;
        required: true;
    };
    callbacks: {
        type: __PropType<SearchResultEventCallbacks>;
        required: false;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    options: {
        type: __PropType<SortOptions>;
        required: true;
    };
    callbacks: {
        type: __PropType<SearchResultEventCallbacks>;
        required: false;
    };
}>>, {}, {}>;
export default _sfc_main;
