import type { PropType as __PropType } from 'vue';
import { SearchResultsProductOptions } from '../../types/search-results/SearchResultsOptions';
import { Document } from '@getlupa/client-sdk/Types';
declare const _sfc_main: import("vue").DefineComponent<{
    options: {
        type: __PropType<SearchResultsProductOptions>;
        required: true;
    };
    searchResults: {
        type: __PropType<Document[]>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    options: {
        type: __PropType<SearchResultsProductOptions>;
        required: true;
    };
    searchResults: {
        type: __PropType<Document[]>;
        required: true;
    };
}>>, {}, {}>;
export default _sfc_main;
