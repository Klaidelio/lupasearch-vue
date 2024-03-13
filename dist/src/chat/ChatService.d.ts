import { SdkOptions } from '..';
import { ChatMessage, SearchChatBestProductMatchesRequest, SearchChatPraseAlternativesRequest, SearchChatRequest, SearchChatTextRequest } from '../types/chat/SearchChatRequest';
import { SearchChatResponse } from '../types/chat/SearchChatResponse';
import { ChatContent } from '../types/chat/ChatLog';
import { ChatSettings } from '../types/chat/ChatOptions';
declare const _default: {
    suggestSearchChatPhrases: (options: SdkOptions, request: SearchChatRequest, chatSettings?: ChatSettings) => Promise<Partial<SearchChatResponse> & {
        success: boolean;
        errors: any;
    }>;
    suggestPhraseAlternatives: (options: SdkOptions, request: SearchChatPraseAlternativesRequest, chatSettings?: ChatSettings) => Promise<Partial<SearchChatResponse> & {
        success: boolean;
        errors: any;
    }>;
    suggestBestProductMatches: (options: SdkOptions, request: SearchChatBestProductMatchesRequest, chatSettings?: ChatSettings) => Promise<{
        products?: string[];
        success: boolean;
        errors: any;
    }>;
    prepareChatHistory: (chatLog: ChatContent[]) => ChatMessage[];
    getTextResponseChunkStream: (options: SdkOptions, request: SearchChatTextRequest, onChunkReceived: (chunk: string) => void, chatSettings?: ChatSettings) => void;
};
export default _default;
