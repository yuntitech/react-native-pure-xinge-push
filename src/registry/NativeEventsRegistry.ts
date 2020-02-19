/*
 * @Author: kangqiang
 * @Date: 2020/2/12 6:11 下午
 * @Last Modified by: kangqiang
 * @Last Modified time: 2020/2/12 6:11 下午
 */
import {EmitterSubscription, EventEmitter, NativeEventEmitter, NativeModules} from 'react-native'
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

    public addBindAccountListener(callback: (eventType: XGPushEventName, data: any) => void)
        : EmitterSubscription {
        return this.emitter.addListener('bindAccount', data => {
            callback(data.error === 0 ? XGPushEventName.BindAccountSuccess : XGPushEventName.BindAccountFail, data)
        })
    }

    public addRegisterListener(callback: (eventType: XGPushEventName, data: any) => void): EmitterSubscription {
        return this.emitter.addListener('register', data => {
            callback(data.error === 0 ? XGPushEventName.RegisterSuccess : XGPushEventName.RegisterFail, data)
        })
    }

    public addEventListener(name: XGPushEventName, callback: (data: any) => void): EmitterSubscription {
        return this.emitter.addListener(name, callback)
    }

}
