import { type Ref } from 'vue';
import { type PublicQuery, type SearchQueryResult } from '@getlupa/client-sdk/Types';
import type { SearchBoxOptions } from '../types/search-box/SearchBoxOptions';
import type { DisplaySuggestion } from '../types/search-box/Common';
import type { SdkOptions } from '../types/General';
export declare const useSearchBoxStore: import("pinia").StoreDefinition<"searchBox", import("pinia")._UnwrapAll<Pick<{
    options: Ref<SearchBoxOptions>;
    docResults: Ref<Record<string, SearchQueryResult>>;
    suggestionResults: Ref<Record<string, DisplaySuggestion[]>>;
    highlightedIndex: Ref<number>;
    inputValue: Ref<string>;
    resultsVisible: import("vue").ComputedRef<boolean>;
    panelItemCounts: import("vue").ComputedRef<({
        queryKey: string;
        count: number;
        panel: import('../types/search-box/SearchBoxPanel').SuggestionSearchBoxPanel;
        input: string;
    } | {
        queryKey: string;
        count: number;
        panel: import('../types/search-box/SearchBoxPanel').DocumentSearchBoxPanel;
        input: string;
    })[]>;
    totalCount: import("vue").ComputedRef<number>;
    highlightedItem: import("vue").ComputedRef<{
        queryKey: string;
        index: number;
        panel: import('../types/search-box/SearchBoxPanel').DocumentSearchBoxPanel | import('../types/search-box/SearchBoxPanel').SuggestionSearchBoxPanel;
    }>;
    highlightedDocument: import("vue").ComputedRef<{
        doc: any;
        link?: undefined;
        queryKey?: undefined;
        id?: undefined;
        title?: undefined;
    } | {
        doc: import("@getlupa/client-sdk/Types").Document;
        link: string;
        queryKey: string;
        id: unknown;
        title: string;
    }>;
    hasAnyResults: import("vue").ComputedRef<boolean>;
    querySuggestions: ({ queryKey, publicQuery, options }: {
        queryKey: string;
        publicQuery: PublicQuery;
        options?: SdkOptions;
    }) => Promise<{
        suggestions: import("@getlupa/client-sdk/Types").Suggestion[];
    }>;
    queryDocuments: ({ queryKey, publicQuery, options }: {
        queryKey: string;
        publicQuery: PublicQuery;
        options?: SdkOptions;
    }) => Promise<{
        queryKey: string;
        result: {
            items: any[];
        };
    } | {
        queryKey: string;
        result: SearchQueryResult;
    }>;
    highlightChange: ({ action }: {
        action: 'down' | 'up' | 'clear';
    }) => {
        highlightIndex: number;
    };
    saveInputValue: ({ input }: {
        input: string;
    }) => void;
    saveOptions: ({ newOptions }: {
        newOptions: SearchBoxOptions;
    }) => void;
    resetHighlightIndex: () => void;
}, "options" | "docResults" | "suggestionResults" | "highlightedIndex" | "inputValue">>, Pick<{
    options: Ref<SearchBoxOptions>;
    docResults: Ref<Record<string, SearchQueryResult>>;
    suggestionResults: Ref<Record<string, DisplaySuggestion[]>>;
    highlightedIndex: Ref<number>;
    inputValue: Ref<string>;
    resultsVisible: import("vue").ComputedRef<boolean>;
    panelItemCounts: import("vue").ComputedRef<({
        queryKey: string;
        count: number;
        panel: import('../types/search-box/SearchBoxPanel').SuggestionSearchBoxPanel;
        input: string;
    } | {
        queryKey: string;
        count: number;
        panel: import('../types/search-box/SearchBoxPanel').DocumentSearchBoxPanel;
        input: string;
    })[]>;
    totalCount: import("vue").ComputedRef<number>;
    highlightedItem: import("vue").ComputedRef<{
        queryKey: string;
        index: number;
        panel: import('../types/search-box/SearchBoxPanel').DocumentSearchBoxPanel | import('../types/search-box/SearchBoxPanel').SuggestionSearchBoxPanel;
    }>;
    highlightedDocument: import("vue").ComputedRef<{
        doc: any;
        link?: undefined;
        queryKey?: undefined;
        id?: undefined;
        title?: undefined;
    } | {
        doc: import("@getlupa/client-sdk/Types").Document;
        link: string;
        queryKey: string;
        id: unknown;
        title: string;
    }>;
    hasAnyResults: import("vue").ComputedRef<boolean>;
    querySuggestions: ({ queryKey, publicQuery, options }: {
        queryKey: string;
        publicQuery: PublicQuery;
        options?: SdkOptions;
    }) => Promise<{
        suggestions: import("@getlupa/client-sdk/Types").Suggestion[];
    }>;
    queryDocuments: ({ queryKey, publicQuery, options }: {
        queryKey: string;
        publicQuery: PublicQuery;
        options?: SdkOptions;
    }) => Promise<{
        queryKey: string;
        result: {
            items: any[];
        };
    } | {
        queryKey: string;
        result: SearchQueryResult;
    }>;
    highlightChange: ({ action }: {
        action: 'down' | 'up' | 'clear';
    }) => {
        highlightIndex: number;
    };
    saveInputValue: ({ input }: {
        input: string;
    }) => void;
    saveOptions: ({ newOptions }: {
        newOptions: SearchBoxOptions;
    }) => void;
    resetHighlightIndex: () => void;
}, "totalCount" | "resultsVisible" | "panelItemCounts" | "highlightedItem" | "highlightedDocument" | "hasAnyResults">, Pick<{
    options: Ref<SearchBoxOptions>;
    docResults: Ref<Record<string, SearchQueryResult>>;
    suggestionResults: Ref<Record<string, DisplaySuggestion[]>>;
    highlightedIndex: Ref<number>;
    inputValue: Ref<string>;
    resultsVisible: import("vue").ComputedRef<boolean>;
    panelItemCounts: import("vue").ComputedRef<({
        queryKey: string;
        count: number;
        panel: import('../types/search-box/SearchBoxPanel').SuggestionSearchBoxPanel;
        input: string;
    } | {
        queryKey: string;
        count: number;
        panel: import('../types/search-box/SearchBoxPanel').DocumentSearchBoxPanel;
        input: string;
    })[]>;
    totalCount: import("vue").ComputedRef<number>;
    highlightedItem: import("vue").ComputedRef<{
        queryKey: string;
        index: number;
        panel: import('../types/search-box/SearchBoxPanel').DocumentSearchBoxPanel | import('../types/search-box/SearchBoxPanel').SuggestionSearchBoxPanel;
    }>;
    highlightedDocument: import("vue").ComputedRef<{
        doc: any;
        link?: undefined;
        queryKey?: undefined;
        id?: undefined;
        title?: undefined;
    } | {
        doc: import("@getlupa/client-sdk/Types").Document;
        link: string;
        queryKey: string;
        id: unknown;
        title: string;
    }>;
    hasAnyResults: import("vue").ComputedRef<boolean>;
    querySuggestions: ({ queryKey, publicQuery, options }: {
        queryKey: string;
        publicQuery: PublicQuery;
        options?: SdkOptions;
    }) => Promise<{
        suggestions: import("@getlupa/client-sdk/Types").Suggestion[];
    }>;
    queryDocuments: ({ queryKey, publicQuery, options }: {
        queryKey: string;
        publicQuery: PublicQuery;
        options?: SdkOptions;
    }) => Promise<{
        queryKey: string;
        result: {
            items: any[];
        };
    } | {
        queryKey: string;
        result: SearchQueryResult;
    }>;
    highlightChange: ({ action }: {
        action: 'down' | 'up' | 'clear';
    }) => {
        highlightIndex: number;
    };
    saveInputValue: ({ input }: {
        input: string;
    }) => void;
    saveOptions: ({ newOptions }: {
        newOptions: SearchBoxOptions;
    }) => void;
    resetHighlightIndex: () => void;
}, "querySuggestions" | "queryDocuments" | "highlightChange" | "saveInputValue" | "saveOptions" | "resetHighlightIndex">>;
