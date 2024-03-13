import { RedirectionOptions } from '../types/redirections/RedirectionOptions';
import { RedirectionRules } from '@getlupa/client-sdk/Types';
import { type Ref } from 'vue';
import { SdkOptions } from '../types/General';
import { RoutingBehavior } from '../types/search-results/RoutingBehavior';
export declare const useRedirectionStore: import("pinia").StoreDefinition<"redirections", import("pinia")._UnwrapAll<Pick<{
    redirections: Ref<RedirectionRules>;
    redirectOnKeywordIfConfigured: (input: string, routingBehavior?: RoutingBehavior) => boolean;
    initiate: (config?: RedirectionOptions, options?: SdkOptions) => Promise<void>;
}, "redirections">>, Pick<{
    redirections: Ref<RedirectionRules>;
    redirectOnKeywordIfConfigured: (input: string, routingBehavior?: RoutingBehavior) => boolean;
    initiate: (config?: RedirectionOptions, options?: SdkOptions) => Promise<void>;
}, never>, Pick<{
    redirections: Ref<RedirectionRules>;
    redirectOnKeywordIfConfigured: (input: string, routingBehavior?: RoutingBehavior) => boolean;
    initiate: (config?: RedirectionOptions, options?: SdkOptions) => Promise<void>;
}, "redirectOnKeywordIfConfigured" | "initiate">>;
