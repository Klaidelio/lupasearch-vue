import { type Ref } from 'vue';
import type { SearchQueryResult } from '@getlupa/client-sdk/Types';
import { ResultsLayoutEnum, type ResultsLayout } from '../types/search-results/ResultsLayout';
import type { ProductGrid } from '../types/search-results/SearchResultsOptions';
export declare const useSearchResultStore: import("pinia").StoreDefinition<"searchResult", import("pinia")._UnwrapAll<Pick<{
    isMobileSidebarVisible: Ref<boolean>;
    searchResult: Ref<SearchQueryResult>;
    columnCount: Ref<number>;
    addToCartAmount: Ref<number>;
    facets: import("vue").ComputedRef<import("@getlupa/client-sdk/Types").FacetResult[]>;
    filters: import("vue").ComputedRef<import("@getlupa/client-sdk/Types").FilterGroup>;
    loading: Ref<boolean>;
    layout: Ref<ResultsLayoutEnum>;
    currentQueryText: import("vue").ComputedRef<string>;
    totalItems: import("vue").ComputedRef<number>;
    hasResults: import("vue").ComputedRef<boolean>;
    labeledFilters: import("vue").ComputedRef<import("../types/search-results/Filters").LabeledFilter[]>;
    displayFilters: import("vue").ComputedRef<import("../types/search-results/Filters").LabeledFilter[]>;
    currentFilterCount: import("vue").ComputedRef<number>;
    currentFilterKeys: import("vue").ComputedRef<string[]>;
    hasAnyFilter: import("vue").ComputedRef<boolean>;
    itemRange: import("vue").ComputedRef<number[]>;
    isPageEmpty: import("vue").ComputedRef<boolean>;
    setSidebarState: ({ visible }: {
        visible: boolean;
    }) => void;
    queryFacet: ({ queryKey, facetKey }: {
        queryKey: string;
        facetKey: string;
    }) => Promise<void>;
    add: (newSearchResult: SearchQueryResult) => {
        searchResult: SearchQueryResult;
        pageSize: number;
    } | {
        searchResult: SearchQueryResult;
        pageSize?: undefined;
    };
    setColumnCount: ({ width, grid }: {
        width: number;
        grid: ProductGrid;
    }) => void;
    setAddToCartAmount: (newAddToCartAmount: number) => void;
    setLayout: (newLayout: ResultsLayout) => void;
    setLoading: (state: boolean) => void;
}, "loading" | "searchResult" | "isMobileSidebarVisible" | "columnCount" | "addToCartAmount" | "layout">>, Pick<{
    isMobileSidebarVisible: Ref<boolean>;
    searchResult: Ref<SearchQueryResult>;
    columnCount: Ref<number>;
    addToCartAmount: Ref<number>;
    facets: import("vue").ComputedRef<import("@getlupa/client-sdk/Types").FacetResult[]>;
    filters: import("vue").ComputedRef<import("@getlupa/client-sdk/Types").FilterGroup>;
    loading: Ref<boolean>;
    layout: Ref<ResultsLayoutEnum>;
    currentQueryText: import("vue").ComputedRef<string>;
    totalItems: import("vue").ComputedRef<number>;
    hasResults: import("vue").ComputedRef<boolean>;
    labeledFilters: import("vue").ComputedRef<import("../types/search-results/Filters").LabeledFilter[]>;
    displayFilters: import("vue").ComputedRef<import("../types/search-results/Filters").LabeledFilter[]>;
    currentFilterCount: import("vue").ComputedRef<number>;
    currentFilterKeys: import("vue").ComputedRef<string[]>;
    hasAnyFilter: import("vue").ComputedRef<boolean>;
    itemRange: import("vue").ComputedRef<number[]>;
    isPageEmpty: import("vue").ComputedRef<boolean>;
    setSidebarState: ({ visible }: {
        visible: boolean;
    }) => void;
    queryFacet: ({ queryKey, facetKey }: {
        queryKey: string;
        facetKey: string;
    }) => Promise<void>;
    add: (newSearchResult: SearchQueryResult) => {
        searchResult: SearchQueryResult;
        pageSize: number;
    } | {
        searchResult: SearchQueryResult;
        pageSize?: undefined;
    };
    setColumnCount: ({ width, grid }: {
        width: number;
        grid: ProductGrid;
    }) => void;
    setAddToCartAmount: (newAddToCartAmount: number) => void;
    setLayout: (newLayout: ResultsLayout) => void;
    setLoading: (state: boolean) => void;
}, "filters" | "facets" | "currentQueryText" | "totalItems" | "hasResults" | "labeledFilters" | "displayFilters" | "currentFilterCount" | "currentFilterKeys" | "hasAnyFilter" | "itemRange" | "isPageEmpty">, Pick<{
    isMobileSidebarVisible: Ref<boolean>;
    searchResult: Ref<SearchQueryResult>;
    columnCount: Ref<number>;
    addToCartAmount: Ref<number>;
    facets: import("vue").ComputedRef<import("@getlupa/client-sdk/Types").FacetResult[]>;
    filters: import("vue").ComputedRef<import("@getlupa/client-sdk/Types").FilterGroup>;
    loading: Ref<boolean>;
    layout: Ref<ResultsLayoutEnum>;
    currentQueryText: import("vue").ComputedRef<string>;
    totalItems: import("vue").ComputedRef<number>;
    hasResults: import("vue").ComputedRef<boolean>;
    labeledFilters: import("vue").ComputedRef<import("../types/search-results/Filters").LabeledFilter[]>;
    displayFilters: import("vue").ComputedRef<import("../types/search-results/Filters").LabeledFilter[]>;
    currentFilterCount: import("vue").ComputedRef<number>;
    currentFilterKeys: import("vue").ComputedRef<string[]>;
    hasAnyFilter: import("vue").ComputedRef<boolean>;
    itemRange: import("vue").ComputedRef<number[]>;
    isPageEmpty: import("vue").ComputedRef<boolean>;
    setSidebarState: ({ visible }: {
        visible: boolean;
    }) => void;
    queryFacet: ({ queryKey, facetKey }: {
        queryKey: string;
        facetKey: string;
    }) => Promise<void>;
    add: (newSearchResult: SearchQueryResult) => {
        searchResult: SearchQueryResult;
        pageSize: number;
    } | {
        searchResult: SearchQueryResult;
        pageSize?: undefined;
    };
    setColumnCount: ({ width, grid }: {
        width: number;
        grid: ProductGrid;
    }) => void;
    setAddToCartAmount: (newAddToCartAmount: number) => void;
    setLayout: (newLayout: ResultsLayout) => void;
    setLoading: (state: boolean) => void;
}, "add" | "setSidebarState" | "queryFacet" | "setColumnCount" | "setAddToCartAmount" | "setLayout" | "setLoading">>;
