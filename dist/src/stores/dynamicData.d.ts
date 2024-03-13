import { type Ref } from 'vue';
import type { SearchQueryResult } from '@getlupa/client-sdk/Types';
export declare const useDynamicDataStore: import("pinia").StoreDefinition<"dynamicData", import("pinia")._UnwrapAll<Pick<{
    dynamicDataIdMap: Ref<Record<string, Document>>;
    loading: Ref<boolean>;
    enhanceSearchResultsWithDynamicData: ({ result, mode }: {
        result?: SearchQueryResult;
        mode?: 'searchBox' | 'searchResults';
    }) => Promise<{}>;
}, "dynamicDataIdMap" | "loading">>, Pick<{
    dynamicDataIdMap: Ref<Record<string, Document>>;
    loading: Ref<boolean>;
    enhanceSearchResultsWithDynamicData: ({ result, mode }: {
        result?: SearchQueryResult;
        mode?: 'searchBox' | 'searchResults';
    }) => Promise<{}>;
}, never>, Pick<{
    dynamicDataIdMap: Ref<Record<string, Document>>;
    loading: Ref<boolean>;
    enhanceSearchResultsWithDynamicData: ({ result, mode }: {
        result?: SearchQueryResult;
        mode?: 'searchBox' | 'searchResults';
    }) => Promise<{}>;
}, "enhanceSearchResultsWithDynamicData">>;
