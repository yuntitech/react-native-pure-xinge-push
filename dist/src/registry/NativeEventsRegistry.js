"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author: kangqiang
 * @Date: 2020/2/12 6:11 下午
 * @Last Modified by: kangqiang
 * @Last Modified time: 2020/2/12 6:11 下午
 */
const react_native_1 = require("react-native");
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
        const bindAccount = 'bindAccount';
        return this.emitter.addListener(bindAccount, data => {
            callback(bindAccount, data);
        });
    }
    addEventListener(name, callback) {
        return this.emitter.addListener(name, callback);
    }
}
exports.NativeEventsRegistry = NativeEventsRegistry;
