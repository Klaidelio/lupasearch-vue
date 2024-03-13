import type { HierarchyFacetAction, RangeFacetAction, TermFacetAction } from '../types/search-results/FacetAction';
import type { FilterType } from '../types/search-results/Filters';
import type { FilterGroup } from '@getlupa/client-sdk/Types';
type AppendParams = ({ params, paramsToRemove, encode }: {
    params: {
        name: string;
        value: string | string[];
    }[];
    paramsToRemove?: string[];
    encode?: boolean;
}) => unknown;
export declare const getFacetKey: (key: string, type: FilterType) => string;
export declare const getFacetParam: (key: string, value: string[] | string, type?: string) => {
    name: string;
    value: string[] | string;
};
export declare const toggleTermFilter: (appendParams: AppendParams, facetAction: TermFacetAction, currentFilters?: FilterGroup) => void;
export declare const toggleHierarchyFilter: (appendParams: AppendParams, facetAction: HierarchyFacetAction, currentFilters?: FilterGroup, removeAllLevels?: boolean) => void;
export declare const toggleRangeFilter: (appendParams: AppendParams, facetAction: RangeFacetAction, currentFilters?: FilterGroup) => void;
export declare const toggleTermParam: (params?: string[], param?: string) => string[];
export declare const toggleLastPram: (params?: string[], param?: string) => string[];
export declare const toggleHierarchyParam: (params?: string[], param?: string, removeAllLevels?: boolean) => string[];
export {};
