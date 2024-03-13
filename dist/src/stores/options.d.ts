import { type Ref } from 'vue';
import type { SearchBoxOptions } from '../types/search-box/SearchBoxOptions';
import type { SearchResultsOptions } from '../types/search-results/SearchResultsOptions';
import type { TrackingOptions } from '../types/General';
import type { FilterGroup } from '@getlupa/client-sdk/Types';
export declare const useOptionsStore: import("pinia").StoreDefinition<"options", import("pinia")._UnwrapAll<Pick<{
    searchBoxOptions: Ref<SearchBoxOptions>;
    searchResultOptions: Ref<SearchResultsOptions>;
    trackingOptions: Ref<TrackingOptions>;
    envOptions: import("vue").ComputedRef<import('../types/General').SdkOptions>;
    classMap: import("vue").ComputedRef<Record<string, string>>;
    initialFilters: import("vue").ComputedRef<FilterGroup>;
    boxRoutingBehavior: import("vue").ComputedRef<import("..").RoutingBehavior>;
    searchResultsRoutingBehavior: import("vue").ComputedRef<import("..").RoutingBehavior>;
    defaultSearchResultPageSize: import("vue").ComputedRef<number>;
    currentResolutionPageSizes: import("vue").ComputedRef<number[]>;
    setSearchBoxOptions: ({ options }: {
        options: SearchBoxOptions;
    }) => void;
    setTrackingOptions: ({ options }: {
        options: TrackingOptions;
    }) => void;
    setSearchResultOptions: ({ options }: {
        options: SearchResultsOptions;
    }) => void;
    setInitialFilters: ({ initialFilters }: {
        initialFilters: FilterGroup;
    }) => void;
}, "searchBoxOptions" | "searchResultOptions" | "trackingOptions">>, Pick<{
    searchBoxOptions: Ref<SearchBoxOptions>;
    searchResultOptions: Ref<SearchResultsOptions>;
    trackingOptions: Ref<TrackingOptions>;
    envOptions: import("vue").ComputedRef<import('../types/General').SdkOptions>;
    classMap: import("vue").ComputedRef<Record<string, string>>;
    initialFilters: import("vue").ComputedRef<FilterGroup>;
    boxRoutingBehavior: import("vue").ComputedRef<import("..").RoutingBehavior>;
    searchResultsRoutingBehavior: import("vue").ComputedRef<import("..").RoutingBehavior>;
    defaultSearchResultPageSize: import("vue").ComputedRef<number>;
    currentResolutionPageSizes: import("vue").ComputedRef<number[]>;
    setSearchBoxOptions: ({ options }: {
        options: SearchBoxOptions;
    }) => void;
    setTrackingOptions: ({ options }: {
        options: TrackingOptions;
    }) => void;
    setSearchResultOptions: ({ options }: {
        options: SearchResultsOptions;
    }) => void;
    setInitialFilters: ({ initialFilters }: {
        initialFilters: FilterGroup;
    }) => void;
}, "initialFilters" | "envOptions" | "classMap" | "boxRoutingBehavior" | "searchResultsRoutingBehavior" | "defaultSearchResultPageSize" | "currentResolutionPageSizes">, Pick<{
    searchBoxOptions: Ref<SearchBoxOptions>;
    searchResultOptions: Ref<SearchResultsOptions>;
    trackingOptions: Ref<TrackingOptions>;
    envOptions: import("vue").ComputedRef<import('../types/General').SdkOptions>;
    classMap: import("vue").ComputedRef<Record<string, string>>;
    initialFilters: import("vue").ComputedRef<FilterGroup>;
    boxRoutingBehavior: import("vue").ComputedRef<import("..").RoutingBehavior>;
    searchResultsRoutingBehavior: import("vue").ComputedRef<import("..").RoutingBehavior>;
    defaultSearchResultPageSize: import("vue").ComputedRef<number>;
    currentResolutionPageSizes: import("vue").ComputedRef<number[]>;
    setSearchBoxOptions: ({ options }: {
        options: SearchBoxOptions;
    }) => void;
    setTrackingOptions: ({ options }: {
        options: TrackingOptions;
    }) => void;
    setSearchResultOptions: ({ options }: {
        options: SearchResultsOptions;
    }) => void;
    setInitialFilters: ({ initialFilters }: {
        initialFilters: FilterGroup;
    }) => void;
}, "setSearchBoxOptions" | "setTrackingOptions" | "setSearchResultOptions" | "setInitialFilters">>;
