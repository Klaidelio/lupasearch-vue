import type { AnchorPosition } from '../types/search-results/SearchResultsProductCardOptions';
import type { FacetStyle } from '../types/search-results/SearchResultsOptions';
export declare const DEFAULT_OPTIONS_RESULTS: {
    options: {
        environment: string;
    };
    queryKey: string;
    containerSelector: string;
    searchTitlePosition: string;
    labels: {
        pageSize: string;
        sortBy: string;
        itemCount: string;
        filteredItemCount: string;
        currency: string;
        showMore: string;
        searchResults: string;
        emptyResults: string;
        mobileFilterButton: string;
        htmlTitleTemplate: string;
        noResultsSuggestion: string;
        didYouMean: string;
        similarQuery: string;
        similarQueries: string;
        similarResultsLabel: string;
    };
    grid: {
        columns: {
            xl: number;
            l: number;
            md: number;
            sm: number;
            xs: number;
        };
    };
    pagination: {
        sizeSelection: {
            position: {
                top: boolean;
                bottom: boolean;
            };
            sizes: number[];
        };
        pageSelection: {
            position: {
                top: boolean;
                bottom: boolean;
            };
            display: number;
            displayMobile: number;
        };
    };
    sort: any[];
    filters: {
        currentFilters: {
            visibility: {
                mobileSidebar: boolean;
                mobileToolbar: boolean;
            };
            labels: {
                title: string;
                clearAll: string;
            };
        };
        facets: {
            labels: {
                title: string;
                showAll: string;
                facetFilter: string;
                facetClear: string;
            };
            filterable: {
                minValues: number;
            };
            hierarchy: {
                maxInitialLevel: number;
                topLevelValueCountLimit: number;
                filterable: boolean;
            };
            facetValueCountLimit: number;
            showDocumentCount: boolean;
            style: {
                type: FacetStyle;
            };
        };
    };
    toolbar: {
        layoutSelector: boolean;
        itemSummary: boolean;
        clearFilters: boolean;
    };
    isInStock: () => boolean;
    badges: {
        anchor: AnchorPosition;
        elements: any[];
    };
    links: {
        details: string;
    };
    elements: any[];
    breadcrumbs: ({
        label: string;
        link: string;
    } | {
        label: string;
        link?: undefined;
    })[];
};
