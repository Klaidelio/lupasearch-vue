import type { DisplaySuggestion } from '../types/search-box/Common';
import type { Suggestion } from '@getlupa/client-sdk/Types';
export declare const flattenSuggestions: (suggestions: Suggestion[], inputValue: string) => DisplaySuggestion[];
