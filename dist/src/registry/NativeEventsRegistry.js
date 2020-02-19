"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author: kangqiang
 * @Date: 2020/2/12 6:11 下午
 * @Last Modified by: kangqiang
 * @Last Modified time: 2020/2/12 6:11 下午
 */
const react_native_1 = require("react-native");
const XGPushEventName_1 = require("../XGPushEventName");
const { RNTXingePush } = react_native_1.NativeModules;
class NativeEventsRegistry {
    constructor() {
        try {
            this.emitter = new react_native_1.NativeEventEmitter(RNTXingePush);
        }
        catch (e) {
            this.emitter = {
                addListener: () => {
                    return {
                        remove: () => undefined,
                    };
                },
            };
        }
    }
    addBindAccountListener(callback) {
        return this.emitter.addListener('bindAccount', data => {
            callback(data.error === 0 ? XGPushEventName_1.XGPushEventName.BindAccountSuccess : XGPushEventName_1.XGPushEventName.BindAccountFail, data);
        });
    }
    addRegisterListener(callback) {
        return this.emitter.addListener('register', data => {
            callback(data.error === 0 ? XGPushEventName_1.XGPushEventName.RegisterSuccess : XGPushEventName_1.XGPushEventName.RegisterFail, data);
        });
    }
    addEventListener(name, callback) {
        return this.emitter.addListener(name, callback);
    }
}
exports.NativeEventsRegistry = NativeEventsRegistry;
