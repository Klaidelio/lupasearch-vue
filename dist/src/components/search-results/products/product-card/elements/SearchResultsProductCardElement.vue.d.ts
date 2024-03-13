import type { PropType as __PropType } from 'vue';
import type { Document } from '@getlupa/client-sdk/Types';
import type { DocumentElement } from '../../../../../types/DocumentElement';
import type { SearchResultsOptionLabels } from '../../../../../types/search-results/SearchResultsOptions';
declare const _sfc_main: import("vue").DefineComponent<{
    item: {
        type: __PropType<Document>;
        required: true;
    };
    element: {
        type: __PropType<DocumentElement>;
        required: true;
    };
    labels: {
        type: __PropType<SearchResultsOptionLabels>;
        required: false;
    };
    inStock: {
        type: __PropType<boolean>;
        required: false;
    };
    link: {
        type: __PropType<string>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "productEvent"[], "productEvent", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    item: {
        type: __PropType<Document>;
        required: true;
    };
    element: {
        type: __PropType<DocumentElement>;
        required: true;
    };
    labels: {
        type: __PropType<SearchResultsOptionLabels>;
        required: false;
    };
    inStock: {
        type: __PropType<boolean>;
        required: false;
    };
    link: {
        type: __PropType<string>;
        required: true;
    };
}>> & {
    onProductEvent?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
