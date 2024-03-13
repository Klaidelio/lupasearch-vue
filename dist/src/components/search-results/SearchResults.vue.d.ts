import type { PropType as __PropType } from 'vue';
import type { SearchResultsOptions } from '../../types/search-results/SearchResultsOptions';
import type { FilterGroup, SearchQueryResult } from '@getlupa/client-sdk/Types';
declare const _sfc_main: import("vue").DefineComponent<{
    options: {
        type: __PropType<SearchResultsOptions>;
        required: true;
    };
    initialFilters: {
        type: __PropType<FilterGroup>;
        required: false;
    };
    isProductList: {
        type: __PropType<boolean>;
        required: false;
    };
    isContainer: {
        type: __PropType<boolean>;
        required: false;
    };
    initialData: {
        type: __PropType<SearchQueryResult>;
        required: false;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    options: {
        type: __PropType<SearchResultsOptions>;
        required: true;
    };
    initialFilters: {
        type: __PropType<FilterGroup>;
        required: false;
    };
    isProductList: {
        type: __PropType<boolean>;
        required: false;
    };
    isContainer: {
        type: __PropType<boolean>;
        required: false;
    };
    initialData: {
        type: __PropType<SearchQueryResult>;
        required: false;
    };
}>>, {}, {}>;
export default _sfc_main;
