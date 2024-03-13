import type { PropType as __PropType } from 'vue';
import type { Document } from '@getlupa/client-sdk/Types';
import type { DocumentSearchBoxPanel } from '../../../types/search-box/SearchBoxPanel';
import type { SearchBoxOptionLabels } from '../../../types/search-box/SearchBoxOptions';
declare const _sfc_main: import("vue").DefineComponent<{
    item: {
        type: __PropType<Document>;
        required: true;
    };
    inputValue: {
        type: __PropType<string>;
        required: true;
    };
    panelOptions: {
        type: __PropType<DocumentSearchBoxPanel>;
        required: true;
    };
    labels: {
        type: __PropType<SearchBoxOptionLabels>;
        required: false;
    };
    highlighted: {
        type: __PropType<boolean>;
        required: false;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "product-click"[], "product-click", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    item: {
        type: __PropType<Document>;
        required: true;
    };
    inputValue: {
        type: __PropType<string>;
        required: true;
    };
    panelOptions: {
        type: __PropType<DocumentSearchBoxPanel>;
        required: true;
    };
    labels: {
        type: __PropType<SearchBoxOptionLabels>;
        required: false;
    };
    highlighted: {
        type: __PropType<boolean>;
        required: false;
    };
}>> & {
    "onProduct-click"?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
