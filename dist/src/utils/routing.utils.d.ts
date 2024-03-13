import type { InputSuggestionFacet } from '../types/search-box/Common';
import type { RoutingBehavior, SsrOptions } from '..';
export declare const emitRoutingEvent: (url: string) => void;
export declare const handleRoutingEvent: (link: string, event?: Event, hasEventRouting?: boolean) => void;
export declare const redirectToResultsPage: (link: string, searchText: string, facet?: InputSuggestionFacet, routingBehavior?: RoutingBehavior) => void;
export declare const getPageUrl: (pathnameOverride?: string, ssr?: SsrOptions) => URL;
