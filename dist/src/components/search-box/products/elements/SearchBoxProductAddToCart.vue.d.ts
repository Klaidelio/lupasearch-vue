import type { PropType as __PropType } from 'vue';
import type { AddToCartElement } from '../../../../types/DocumentElement';
import type { Document } from '@getlupa/client-sdk/Types';
declare const _sfc_main: import("vue").DefineComponent<{
    item: {
        type: __PropType<Document>;
        required: true;
    };
    options: {
        type: __PropType<AddToCartElement>;
        required: true;
    };
    inStock: {
        type: __PropType<boolean>;
        required: false;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "productEvent"[], "productEvent", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    item: {
        type: __PropType<Document>;
        required: true;
    };
    options: {
        type: __PropType<AddToCartElement>;
        required: true;
    };
    inStock: {
        type: __PropType<boolean>;
        required: false;
    };
}>> & {
    onProductEvent?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
