/*
 * @Author: kangqiang
 * @Date: 2020/2/12 6:11 下午
 * @Last Modified by: kangqiang
 * @Last Modified time: 2020/2/12 6:11 下午
 */
import {NativeModules, NativeEventEmitter, EventEmitter, EmitterSubscription} from 'react-native'
import {XGPushEventName} from "../XGPushEventName";

const {RNTXingePush} = NativeModules;

export class NativeEventsRegistry {
    private emitter: EventEmitter

    constructor() {
        try {
            this.emitter = new NativeEventEmitter(RNTXingePush);
        } catch (e) {
            this.emitter = ({
                addListener: () => {
                    return {
                        remove: () => undefined,
                    }
                },
            } as any) as EventEmitter
        }
    }

    public addBindAccountListener(callback: (eventType: string, data: any) => void): EmitterSubscription {
        const bindAccount = 'bindAccount'
        return this.emitter.addListener(bindAccount, data => {
            callback(bindAccount, data)
        })
    }

    public addEventListener(name: XGPushEventName, callback: (data: any) => void): EmitterSubscription {
        return this.emitter.addListener(name, callback)
    }

}
