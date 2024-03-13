import type { PropType as __PropType } from 'vue';
import { ChatOptions } from '../../types/chat/ChatOptions';
declare const _sfc_main: import("vue").DefineComponent<{
    options: {
        type: __PropType<ChatOptions>;
        required: true;
    };
    phrase: {
        type: __PropType<string>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "loaded"[], "loaded", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    options: {
        type: __PropType<ChatOptions>;
        required: true;
    };
    phrase: {
        type: __PropType<string>;
        required: true;
    };
}>> & {
    onLoaded?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
