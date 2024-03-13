import type { AnalyticsEventType } from '../types/AnalyticsOptions';
import type { TrackableEventData } from '../types/search-box/Common';
import type { PublicQuery, SearchQueryResult } from '@getlupa/client-sdk/Types';
export declare const useTrackingStore: import("pinia").StoreDefinition<"tracking", import("pinia")._UnwrapAll<Pick<{
    trackSearch: ({ queryKey, query, type }: {
        queryKey: string;
        query: PublicQuery;
        type?: AnalyticsEventType;
    }) => void;
    trackResults: ({ queryKey, results }: {
        queryKey: string;
        results: SearchQueryResult;
    }) => void;
    trackEvent: ({ queryKey, data }: {
        queryKey: string;
        data: TrackableEventData;
    }) => void;
}, never>>, Pick<{
    trackSearch: ({ queryKey, query, type }: {
        queryKey: string;
        query: PublicQuery;
        type?: AnalyticsEventType;
    }) => void;
    trackResults: ({ queryKey, results }: {
        queryKey: string;
        results: SearchQueryResult;
    }) => void;
    trackEvent: ({ queryKey, data }: {
        queryKey: string;
        data: TrackableEventData;
    }) => void;
}, never>, Pick<{
    trackSearch: ({ queryKey, query, type }: {
        queryKey: string;
        query: PublicQuery;
        type?: AnalyticsEventType;
    }) => void;
    trackResults: ({ queryKey, results }: {
        queryKey: string;
        results: SearchQueryResult;
    }) => void;
    trackEvent: ({ queryKey, data }: {
        queryKey: string;
        data: TrackableEventData;
    }) => void;
}, "trackSearch" | "trackResults" | "trackEvent">>;
