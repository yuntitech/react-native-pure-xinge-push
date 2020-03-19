"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
const XGPushEventName_1 = require("./XGPushEventName");
const NativeEventsRegistry_1 = require("./registry/NativeEventsRegistry");
const { RNTXingePush } = react_native_1.NativeModules;
class XingeTencentPush {
    constructor() {
        this.retryParamsMap = new Map();
        this.retryLeftMap = new Map();
        this.nativeEventCallback = (eventType, data) => {
            const retryLeft = this.retryLeftMap.get(eventType) || -1;
            // 成功
            if ([XGPushEventName_1.XGPushEventName.BindAccountSuccess,
                XGPushEventName_1.XGPushEventName.RegisterSuccess].includes(eventType)) {
                this.eventEmitAndReset(eventType, data);
            }
            // 重试
            else if (retryLeft >= 0) {
                this.retryHandler(eventType, retryLeft, data);
            }
            // 失败
            else {
                this.eventEmitAndReset(eventType, data);
            }
        };
        this.nativeEventsRegistry = new NativeEventsRegistry_1.NativeEventsRegistry();
        this.nativeRetryHandler();
    }
    /**
     * 设置是否开启调试模式，底层 SDK 会打印详细信息
     *
     * @param {boolean} enable
     */
    setDebug(enable) {
        RNTXingePush.setDebug(enable);
    }
    /**
     * 启动信鸽推送服务，如果是通过点击推送打开的 App，调用 start 后会触发 notification 事件
     * Android仅设置了配置未调用启动与注册代码
     *
     * @param {number} accessId
     * @param {string} accessKey
     */
    start(accessId, accessKey) {
        if (typeof accessId !== 'number') {
            console.error(`[XingePush start] accessId is not a number.`);
        }
        if (typeof accessKey !== 'string') {
            console.error(`[XingePush start] accessKey is not a string.`);
        }
        this.retryParamsMap.set(XGPushEventName_1.XGPushEventName.RegisterFail, { accessId, accessKey });
        RNTXingePush.start(accessId, accessKey);
    }
    /**
     * 启动并注册
     */
    registerPush() {
        if (react_native_1.Platform.OS === 'android') {
            RNTXingePush.registerPush();
        }
    }
    /**
     * 停止信鸽推送服务
     */
    stop() {
        RNTXingePush.stop();
    }
    /**
     * 绑定帐号
     *
     * @param {string} account
     */
    bindAccount(account) {
        if (typeof account !== 'string') {
            console.error(`[XingePush bindAccount] account is not a string.`);
        }
        this.retryParamsMap.set(XGPushEventName_1.XGPushEventName.BindAccountFail, account);
        return RNTXingePush.bindAccount(account);
    }
    /**
     * 解绑帐号
     *
     * @param {string} account
     */
    unbindAccount(account) {
        if (typeof account !== 'string') {
            console.error(`[XingePush unbindAccount] account is not a string.`);
        }
        RNTXingePush.unbindAccount(account);
    }
    /**
     * 绑定标签
     *
     * @param {Array<string>} tags
     */
    bindTags(tags) {
        RNTXingePush.bindTags(tags);
    }
    /**
     * 解绑标签
     *
     * @param {Array<string>} tags
     */
    unbindTags(tags) {
        RNTXingePush.unbindTags(tags);
    }
    /**
     * 获取当前角标数字
     *
     * @return {Promise} 返回 { badge: 0 }
     */
    getBadge() {
        return RNTXingePush.getBadge();
    }
    /**
     * 设置当前角标数字
     *
     * @param {number} badge
     */
    setBadge(badge) {
        if (typeof badge !== 'number') {
            console.error(`[XingePush setBadge] badge is not a number.`);
        }
        RNTXingePush.setBadge(badge);
    }
    /**
     * 监听 信鸽事件回调
     * @param name 通知名
     * @param listener 回调处理函数
     */
    addEventListener(name, listener) {
        return this.nativeEventsRegistry.addEventListener(name, listener);
    }
    /*************************** Android 独有的配置 **********************************/
    /**
     * 设置是否开启第三方推送通道
     *
     * @param {boolean} enable
     */
    enableOtherPush(enable) {
        if (react_native_1.Platform.OS === 'android') {
            RNTXingePush.enableOtherPush(enable);
        }
    }
    /**
     * 设置是否开启华为推送的调试模式
     *
     * @param {boolean} enable
     */
    setHuaweiDebug(enable) {
        if (react_native_1.Platform.OS === 'android') {
            RNTXingePush.setHuaweiDebug(enable);
        }
    }
    /**
     * 配置小米推送
     *
     * @param {string} appId
     * @param {string} appKey
     */
    setXiaomi(appId, appKey) {
        if (react_native_1.Platform.OS === 'android') {
            if (typeof appId !== 'string') {
                console.error(`[XingePush setXiaomi] appId is not a string.`);
            }
            if (typeof appKey !== 'string') {
                console.error(`[XingePush setXiaomi] appKey is not a string.`);
            }
            RNTXingePush.setXiaomi(appId, appKey);
        }
    }
    /**
     * 配置魅族推送
     *
     * @param {string} appId
     * @param {string} appKey
     */
    setMeizu(appId, appKey) {
        if (react_native_1.Platform.OS === 'android') {
            if (typeof appId !== 'string') {
                console.error(`[XingePush setMeizu] appId is not a string.`);
            }
            if (typeof appKey !== 'string') {
                console.error(`[XingePush setMeizu] appKey is not a string.`);
            }
            RNTXingePush.setMeizu(appId, appKey);
        }
    }
    /**
     * 推送进程唤起主进程消息处理
     */
    handleNotificationIfNeeded() {
        if (react_native_1.Platform.OS === 'android') {
            return RNTXingePush.handleNotificationIfNeeded();
        }
        else {
            return Promise.reject({
                message: 'android only',
            });
        }
    }
    /**
     *  ReactInstanceManager onReactContextInitialized原生不好处理
     */
    appLaunched() {
        if (react_native_1.Platform.OS === 'android') {
            RNTXingePush.appLaunched();
        }
    }
    nativeRetryHandler() {
        this.resetRetryLeftMap();
        this.nativeEventsRegistry.addBindAccountListener(this.nativeEventCallback);
        this.nativeEventsRegistry.addRegisterListener(this.nativeEventCallback);
    }
    retryHandler(eventType, retryLeft, data) {
        this.retryLeftMap.set(eventType, retryLeft - 1);
        const account = this.retryParamsMap.get(eventType);
        switch (eventType) {
            case XGPushEventName_1.XGPushEventName.RegisterFail:
                if (react_native_1.Platform.OS === 'android') {
                    this.registerPush();
                }
                else {
                    const accessConfig = this.retryParamsMap.get(eventType);
                    accessConfig != null ? this.start(accessConfig.accessId, accessConfig.accessKey) :
                        this.eventEmitAndReset(eventType, data);
                }
                break;
            case XGPushEventName_1.XGPushEventName.BindAccountFail:
                account != null ? this.bindAccount(account) : this.eventEmitAndReset(eventType, data);
                break;
            default:
                break;
        }
    }
    eventEmitAndReset(eventType, data) {
        react_native_1.DeviceEventEmitter.emit(eventType, data);
        this.resetRetryLeftMap();
    }
    resetRetryLeftMap() {
        this.retryLeftMap.set(XGPushEventName_1.XGPushEventName.BindAccountFail, 5);
        this.retryLeftMap.set(XGPushEventName_1.XGPushEventName.RegisterFail, 5);
        this.retryParamsMap.delete(XGPushEventName_1.XGPushEventName.BindAccountFail);
        this.retryParamsMap.delete(XGPushEventName_1.XGPushEventName.RegisterFail);
    }
}
exports.XingeTencentPush = XingeTencentPush;
