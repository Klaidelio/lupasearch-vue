import type { PropType as __PropType } from 'vue';
import type { InputSuggestion } from '../../types/search-box/Common';
import type { SearchBoxInputOptions } from '../../types/search-box/SearchBoxOptions';
declare const _sfc_main: import("vue").DefineComponent<{
    options: {
        type: __PropType<SearchBoxInputOptions>;
        required: true;
    };
    canClose: {
        type: __PropType<boolean>;
        required: false;
    };
    emitInputOnFocus: {
        type: __PropType<boolean>;
        required: false;
    };
    suggestedValue: {
        type: __PropType<InputSuggestion>;
        required: true;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("input" | "focus")[], "input" | "focus", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    options: {
        type: __PropType<SearchBoxInputOptions>;
        required: true;
    };
    canClose: {
        type: __PropType<boolean>;
        required: false;
    };
    emitInputOnFocus: {
        type: __PropType<boolean>;
        required: false;
    };
    suggestedValue: {
        type: __PropType<InputSuggestion>;
        required: true;
    };
}>> & {
    onInput?: (...args: any[]) => any;
    onFocus?: (...args: any[]) => any;
}, {}, {}>;
export default _sfc_main;
