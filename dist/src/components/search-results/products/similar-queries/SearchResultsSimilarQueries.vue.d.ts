import type { PropType as __PropType } from 'vue';
import type { SearchResultsSimilarQueriesLabels } from '../../../../types/search-results/SearchResultsOptions';
import type { SearchResultsProductCardOptions } from '../../../../types/search-results/SearchResultsProductCardOptions';
declare const _sfc_main: import("vue").DefineComponent<{
    labels: {
        type: __PropType<SearchResultsSimilarQueriesLabels>;
        required: true;
    };
    columnSize: {
        type: __PropType<string>;
        required: true;
    };
    productCardOptions: {
        type: __PropType<SearchResultsProductCardOptions>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    labels: {
        type: __PropType<SearchResultsSimilarQueriesLabels>;
        required: true;
    };
    columnSize: {
        type: __PropType<string>;
        required: true;
    };
    productCardOptions: {
        type: __PropType<SearchResultsProductCardOptions>;
        required: true;
    };
}>>, {}, {}>;
export default _sfc_main;
