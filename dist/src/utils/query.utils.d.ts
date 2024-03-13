import type { QueryParams } from '../types/search-results/QueryParams';
import type { SearchResultsSortOptions } from '../types/search-results/SearchResultsSort';
import type { FilterGroup, PublicQuery } from '@getlupa/client-sdk/Types';
export declare const createPublicQuery: (queryParams: QueryParams, sortOptions?: SearchResultsSortOptions[], defaultPageSize?: number) => PublicQuery;
export declare const getPublicQuery: (publicQuery: PublicQuery, initialFilters: FilterGroup, isProductList: boolean) => PublicQuery;
