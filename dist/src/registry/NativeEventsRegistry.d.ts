import { EmitterSubscription } from 'react-native';
import { XGPushEventName } from "../XGPushEventName";
export declare class NativeEventsRegistry {
    private emitter;
    constructor();
    addBindAccountListener(callback: (eventType: string, data: any) => void): EmitterSubscription;
    addEventListener(name: XGPushEventName, callback: (data: any) => void): EmitterSubscription;
}
