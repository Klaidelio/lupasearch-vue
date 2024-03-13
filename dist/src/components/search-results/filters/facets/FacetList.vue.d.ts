import type { PropType as __PropType } from 'vue';
import type { FacetStyle, ResultFacetOptions } from '../../../../types/search-results/SearchResultsOptions';
import type { FacetResult, FilterGroup } from '@getlupa/client-sdk/Types';
declare const _sfc_main: import("vue").DefineComponent<{
    options: {
        type: __PropType<ResultFacetOptions>;
        required: true;
    };
    facets: {
        type: __PropType<FacetResult[]>;
        required: true;
    };
    currentFilters: {
        type: __PropType<FilterGroup>;
        required: false;
    };
    facetStyle: {
        type: __PropType<FacetStyle>;
        required: false;
    };
    clearable: {
        type: __PropType<boolean>;
        required: false;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("clear" | "select")[], "clear" | "select", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    options: {
        type: __PropType<ResultFacetOptions>;
        required: true;
    };
    facets: {
        type: __PropType<FacetResult[]>;
        required: true;
    };
    currentFilters: {
        type: __PropType<FilterGroup>;
        required: false;
    };
    facetStyle: {
        type: __PropType<FacetStyle>;
        required: false;
    };
    clearable: {
        type: __PropType<boolean>;
        required: false;
    };
}>> & {
    onSelect?: (...args: any[]) => any;
    onClear?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
