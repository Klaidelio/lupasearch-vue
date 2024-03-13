import type { PropType as __PropType } from 'vue';
import type { Document } from '@getlupa/client-sdk/Types';
import type { SearchBoxOptionLabels } from '../../../types/search-box/SearchBoxOptions';
import type { DocumentSearchBoxPanel } from '../../../types/search-box/SearchBoxPanel';
declare const _sfc_main: import("vue").DefineComponent<{
    items: {
        type: __PropType<Document[]>;
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
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "product-click"[], "product-click", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    items: {
        type: __PropType<Document[]>;
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
}>> & {
    "onProduct-click"?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
