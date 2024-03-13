import type { PropType as __PropType } from 'vue';
import type { ResultFacetOptions } from '../../../../types/search-results/SearchResultsOptions';
import type { FacetGroupHierarchy, FilterGroupItemTypeHierarchy } from '@getlupa/client-sdk/Types';
declare const _sfc_main: import("vue").DefineComponent<{
    options: {
        type: __PropType<ResultFacetOptions>;
        required: true;
    };
    facet: {
        type: __PropType<FacetGroupHierarchy>;
        required: true;
    };
    currentFilters: {
        type: __PropType<FilterGroupItemTypeHierarchy>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "select"[], "select", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    options: {
        type: __PropType<ResultFacetOptions>;
        required: true;
    };
    facet: {
        type: __PropType<FacetGroupHierarchy>;
        required: true;
    };
    currentFilters: {
        type: __PropType<FilterGroupItemTypeHierarchy>;
        required: true;
    };
}>> & {
    onSelect?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
