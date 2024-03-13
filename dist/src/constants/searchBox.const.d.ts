export declare const DEFAULT_SEARCH_BOX_OPTIONS: {
    inputSelector: string;
    options: {
        environment: string;
    };
    showTotalCount: boolean;
    minInputLength: number;
    inputAttributes: {
        name: string;
    };
    debounce: number;
    labels: {
        placeholder: string;
        noResults: string;
        moreResults: string;
        currency: string;
        defaultFacetLabel: string;
    };
    links: {
        searchResults: string;
    };
    panels: ({
        type: string;
        queryKey: string;
        highlight: boolean;
        limit: number;
        searchBySuggestion?: undefined;
        links?: undefined;
        titleKey?: undefined;
        elements?: undefined;
    } | {
        type: string;
        queryKey: string;
        limit: number;
        searchBySuggestion: boolean;
        links: {
            details: string;
        };
        titleKey: string;
        elements: any[];
        highlight?: undefined;
    })[];
    history: {
        labels: {
            clear: string;
        };
    };
};
