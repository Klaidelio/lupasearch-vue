import type { TrackingOptions } from '../types/General';
import type { TrackableEventData } from '../types/search-box/Common';
import type { Options } from '@getlupa/client-sdk/Types';
declare global {
    interface Window {
        ga: any;
        dataLayer: any;
    }
}
export declare const initTracking: (options: TrackingOptions) => void;
export declare const getLupaTrackingContext: () => {
    userId?: string;
    sessionId?: string;
};
export declare const track: (queryKey?: string, data?: TrackableEventData, options?: Options) => void;
