import type { PropType as __PropType } from 'vue';
import { SearchResultsSimilarResultsLabels } from '../../../../types/search-results/SearchResultsOptions';
import { SearchResultsProductCardOptions } from '../../../../types/search-results/SearchResultsProductCardOptions';
declare const _sfc_main: import("vue").DefineComponent<{
    columnSize: {
        type: __PropType<string>;
        required: true;
    };
    labels: {
        type: __PropType<SearchResultsSimilarResultsLabels>;
        required: true;
    };
    productCardOptions: {
        type: __PropType<SearchResultsProductCardOptions>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    columnSize: {
        type: __PropType<string>;
        required: true;
    };
    labels: {
        type: __PropType<SearchResultsSimilarResultsLabels>;
        required: true;
    };
    productCardOptions: {
        type: __PropType<SearchResultsProductCardOptions>;
        required: true;
    };
}>>, {}, {}>;
export default _sfc_main;
