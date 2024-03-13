import type { InputSuggestionFacet } from '../types/search-box/Common';
export declare const generateLink: (linkPattern: string, document: Record<string, unknown>) => string;
export declare const generateResultLink: (link: string, searchText?: string, facet?: InputSuggestionFacet) => string;
export declare const getPathName: (resultPageLink: string) => string;
export declare const getRelativePath: (link: string) => string;
export declare const linksMatch: (link1?: string, link2?: string) => boolean;
