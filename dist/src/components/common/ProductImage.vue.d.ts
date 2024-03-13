import type { PropType as __PropType } from 'vue';
import type { ImageDocumentElement } from '../../types/DocumentElement';
import type { Document } from '@getlupa/client-sdk/Types';
declare const _sfc_main: import("vue").DefineComponent<{
    item: {
        type: __PropType<Document>;
        required: true;
    };
    options: {
        type: __PropType<ImageDocumentElement>;
        required: true;
    };
    wrapperClass: {
        type: __PropType<string>;
        required: false;
    };
    imageClass: {
        type: __PropType<string>;
        required: false;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    item: {
        type: __PropType<Document>;
        required: true;
    };
    options: {
        type: __PropType<ImageDocumentElement>;
        required: true;
    };
    wrapperClass: {
        type: __PropType<string>;
        required: false;
    };
    imageClass: {
        type: __PropType<string>;
        required: false;
    };
}>>, {}, {}>;
export default _sfc_main;
