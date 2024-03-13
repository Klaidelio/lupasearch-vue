import type { PropType as __PropType } from 'vue';
import type { ProductClickTrackingSettings } from '../../../../types/AnalyticsOptions';
import type { SearchResultsProductCardOptions } from '../../../../types/search-results/SearchResultsProductCardOptions';
import type { Document } from '@getlupa/client-sdk/Types';
declare const _sfc_main: import("vue").DefineComponent<{
    product: {
        type: __PropType<Document>;
        required: true;
    };
    options: {
        type: __PropType<SearchResultsProductCardOptions>;
        required: true;
    };
    isAdditionalPanel: {
        type: __PropType<boolean>;
        required: false;
    };
    clickTrackingSettings: {
        type: __PropType<ProductClickTrackingSettings>;
        required: false;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    product: {
        type: __PropType<Document>;
        required: true;
    };
    options: {
        type: __PropType<SearchResultsProductCardOptions>;
        required: true;
    };
    isAdditionalPanel: {
        type: __PropType<boolean>;
        required: false;
    };
    clickTrackingSettings: {
        type: __PropType<ProductClickTrackingSettings>;
        required: false;
    };
}>>, {}, {}>;
export default _sfc_main;
