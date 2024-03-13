import { SearchResultsOptions } from '..';
import { FilterGroup } from '@getlupa/client-sdk/Types';
export declare const getSearchParams: (url?: string, params?: URLSearchParams, baseUrl?: string) => URLSearchParams;
export declare const getInitialSearchResults: (options: SearchResultsOptions, defaultData?: {
    filters?: FilterGroup;
    pageSize?: number;
}) => Promise<import("@getlupa/client-sdk/Types").SearchQueryResult | import("@getlupa/client-sdk/Types").SdkError>;
