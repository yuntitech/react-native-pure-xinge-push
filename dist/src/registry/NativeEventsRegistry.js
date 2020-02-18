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
    addUnBindAccountListener(callback) {
        return this.emitter.addListener('unbindAccount', callback);
    }
    addEventListener(name, callback) {
        return this.emitter.addListener(name, callback);
    }
    /**
     * 通知点击处理回调
     * 此处做点击消息跳转
     *
     * @param callback XGPushClickedResult 通知被打开的对象
     */
    addNotifactionClickListener(callback) {
        return this.emitter.addListener('onNotifactionClick', callback);
    }
    // 通知展示
    addNotifactionShowedResultListener(callback) {
        return this.emitter.addListener('onNotifactionShowedResult', callback);
    }
    /**
     * 通知点击回调
     * actionType=1为该消息被清除
     * actionType=0为该消息被点击
     * 此处不能做点击消息跳转
     * 详细方法请参照官网的Android常见问题文档(https://xg.qq.com/docs/android_access/android_faq.html)
     */
    addNotifactionClickedResultListener(callback) {
        return this.emitter.addListener('onNotifactionClickedResult', callback);
    }
    // 消息透传的回调
    addTextMessageListener(callback) {
        return this.emitter.addListener('onTextMessage', callback);
    }
}
exports.NativeEventsRegistry = NativeEventsRegistry;
