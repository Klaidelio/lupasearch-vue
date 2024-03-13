import type { PropType as __PropType } from 'vue';
import type { ResultFacetOptions } from '../../../../types/search-results/SearchResultsOptions';
import type { FacetGroupTypeStats, FilterGroupItemTypeRange } from '@getlupa/client-sdk/Types';
declare const _sfc_main: import("vue").DefineComponent<{
    options: {
        type: __PropType<ResultFacetOptions>;
        required: true;
    };
    facet: {
        type: __PropType<FacetGroupTypeStats>;
        required: false;
    };
    currentFilters: {
        type: __PropType<FilterGroupItemTypeRange>;
        required: false;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "select"[], "select", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    options: {
        type: __PropType<ResultFacetOptions>;
        required: true;
    };
    facet: {
        type: __PropType<FacetGroupTypeStats>;
        required: false;
    };
    currentFilters: {
        type: __PropType<FilterGroupItemTypeRange>;
        required: false;
    };
}>> & {
    onSelect?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
