import { type Ref } from 'vue';
import type { QueryParams } from '../types/search-results/QueryParams';
import type { InputSuggestionFacet } from '../types/search-box/Common';
import { SortCallbackContext, SsrOptions } from '..';
export declare const useParamsStore: import("pinia").StoreDefinition<"params", import("pinia")._UnwrapAll<Pick<{
    params: Ref<QueryParams>;
    defaultLimit: Ref<number>;
    searchResultsLink: Ref<string>;
    searchString: Ref<string>;
    query: import("vue").ComputedRef<string>;
    page: import("vue").ComputedRef<number>;
    limit: import("vue").ComputedRef<number>;
    sort: import("vue").ComputedRef<string>;
    filters: import("vue").ComputedRef<import("@getlupa/client-sdk/Types").FilterGroup>;
    sortParams: Ref<{
        selectedSortKey: string;
        previousSortKey: string;
    }>;
    add: (newParams: QueryParams, ssr?: SsrOptions) => {
        params: QueryParams;
    };
    removeAllFilters: () => void;
    removeParameters: ({ paramsToRemove, save }: {
        paramsToRemove?: 'all' | string[];
        save?: boolean;
    }) => void;
    handleNoResultsFlag: ({ resultCount, noResultsParam }: {
        resultCount: number;
        noResultsParam?: string;
    }) => void;
    goToResults: ({ searchText, facet }: {
        searchText: string;
        facet?: InputSuggestionFacet;
    }) => void;
    appendParams: ({ params: newParams, paramsToRemove, encode, save, searchResultsLink }: {
        params: {
            name: string;
            value: string;
        }[];
        paramsToRemove?: 'all' | string[];
        encode?: boolean;
        save?: boolean;
        searchResultsLink?: string;
    }) => {
        params: QueryParams;
    };
    setDefaultLimit: (newDefaultLimit: number) => number;
    setSearchResultsLink: (newSearchResultsLink: string) => void;
    setSortSettings: ({ selectedSortKey, previousSortKey }: SortCallbackContext) => void;
}, "params" | "searchResultsLink" | "defaultLimit" | "searchString" | "sortParams">>, Pick<{
    params: Ref<QueryParams>;
    defaultLimit: Ref<number>;
    searchResultsLink: Ref<string>;
    searchString: Ref<string>;
    query: import("vue").ComputedRef<string>;
    page: import("vue").ComputedRef<number>;
    limit: import("vue").ComputedRef<number>;
    sort: import("vue").ComputedRef<string>;
    filters: import("vue").ComputedRef<import("@getlupa/client-sdk/Types").FilterGroup>;
    sortParams: Ref<{
        selectedSortKey: string;
        previousSortKey: string;
    }>;
    add: (newParams: QueryParams, ssr?: SsrOptions) => {
        params: QueryParams;
    };
    removeAllFilters: () => void;
    removeParameters: ({ paramsToRemove, save }: {
        paramsToRemove?: 'all' | string[];
        save?: boolean;
    }) => void;
    handleNoResultsFlag: ({ resultCount, noResultsParam }: {
        resultCount: number;
        noResultsParam?: string;
    }) => void;
    goToResults: ({ searchText, facet }: {
        searchText: string;
        facet?: InputSuggestionFacet;
    }) => void;
    appendParams: ({ params: newParams, paramsToRemove, encode, save, searchResultsLink }: {
        params: {
            name: string;
            value: string;
        }[];
        paramsToRemove?: 'all' | string[];
        encode?: boolean;
        save?: boolean;
        searchResultsLink?: string;
    }) => {
        params: QueryParams;
    };
    setDefaultLimit: (newDefaultLimit: number) => number;
    setSearchResultsLink: (newSearchResultsLink: string) => void;
    setSortSettings: ({ selectedSortKey, previousSortKey }: SortCallbackContext) => void;
}, "sort" | "query" | "page" | "limit" | "filters">, Pick<{
    params: Ref<QueryParams>;
    defaultLimit: Ref<number>;
    searchResultsLink: Ref<string>;
    searchString: Ref<string>;
    query: import("vue").ComputedRef<string>;
    page: import("vue").ComputedRef<number>;
    limit: import("vue").ComputedRef<number>;
    sort: import("vue").ComputedRef<string>;
    filters: import("vue").ComputedRef<import("@getlupa/client-sdk/Types").FilterGroup>;
    sortParams: Ref<{
        selectedSortKey: string;
        previousSortKey: string;
    }>;
    add: (newParams: QueryParams, ssr?: SsrOptions) => {
        params: QueryParams;
    };
    removeAllFilters: () => void;
    removeParameters: ({ paramsToRemove, save }: {
        paramsToRemove?: 'all' | string[];
        save?: boolean;
    }) => void;
    handleNoResultsFlag: ({ resultCount, noResultsParam }: {
        resultCount: number;
        noResultsParam?: string;
    }) => void;
    goToResults: ({ searchText, facet }: {
        searchText: string;
        facet?: InputSuggestionFacet;
    }) => void;
    appendParams: ({ params: newParams, paramsToRemove, encode, save, searchResultsLink }: {
        params: {
            name: string;
            value: string;
        }[];
        paramsToRemove?: 'all' | string[];
        encode?: boolean;
        save?: boolean;
        searchResultsLink?: string;
    }) => {
        params: QueryParams;
    };
    setDefaultLimit: (newDefaultLimit: number) => number;
    setSearchResultsLink: (newSearchResultsLink: string) => void;
    setSortSettings: ({ selectedSortKey, previousSortKey }: SortCallbackContext) => void;
}, "add" | "removeAllFilters" | "removeParameters" | "handleNoResultsFlag" | "goToResults" | "appendParams" | "setDefaultLimit" | "setSearchResultsLink" | "setSortSettings">>;
