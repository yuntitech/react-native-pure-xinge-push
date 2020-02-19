import { EmitterSubscription } from 'react-native';
import { XGPushEventName } from "../XGPushEventName";
export declare class NativeEventsRegistry {
    private emitter;
    constructor();
    addBindAccountListener(callback: (eventType: XGPushEventName, data: any) => void): EmitterSubscription;
    addRegisterListener(callback: (eventType: XGPushEventName, data: any) => void): EmitterSubscription;
    addEventListener(name: XGPushEventName, callback: (data: any) => void): EmitterSubscription;
}
