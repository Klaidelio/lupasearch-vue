import type { PropType as __PropType } from 'vue';
import { ChatOptions } from '../../types/chat/ChatOptions';
import { ChatMessage } from '../../types/chat/SearchChatRequest';
declare const _sfc_main: import("vue").DefineComponent<{
    content: {
        type: __PropType<string>;
        required: true;
    };
    options: {
        type: __PropType<ChatOptions>;
        required: true;
    };
    history: {
        type: __PropType<ChatMessage[]>;
        required: false;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    content: {
        type: __PropType<string>;
        required: true;
    };
    options: {
        type: __PropType<ChatOptions>;
        required: true;
    };
    history: {
        type: __PropType<ChatMessage[]>;
        required: false;
    };
}>>, {}, {}>;
export default _sfc_main;
