import {DeviceEventEmitter, NativeModules, Platform} from 'react-native';
import {XGPushEventName} from './XGPushEventName';
import {NativeEventsRegistry} from "./registry/NativeEventsRegistry";

const {RNTXingePush} = NativeModules;

export class XingeTencentPush {

    private nativeEventsRegistry: NativeEventsRegistry
    private retryParamsMap: Map<string, string> = new Map<string, string>()
    private retryLeftMap: Map<string, number> = new Map<string, number>()

    constructor() {
        this.nativeEventsRegistry = new NativeEventsRegistry();
        this.nativeRetryHandler()
    }

    /**
     * 设置是否开启调试模式，底层 SDK 会打印详细信息
     *
     * @param {boolean} enable
     */
    public setDebug(enable: boolean) {
        RNTXingePush.setDebug(enable);
    }

    /**
     * 启动信鸽推送服务，如果是通过点击推送打开的 App，调用 start 后会触发 notification 事件
     *
     * @param {number} accessId
     * @param {string} accessKey
     */
    public start(accessId: number, accessKey: string) {
        if (typeof accessId !== 'number') {
            console.error(`[XingePush start] accessId is not a number.`);
        }
        if (typeof accessKey !== 'string') {
            console.error(`[XingePush start] accessKey is not a string.`);
        }
        RNTXingePush.start(accessId, accessKey);
    }

    /**
     * 停止信鸽推送服务
     */
    public stop() {
        RNTXingePush.stop();
    }

    /**
     * 绑定帐号
     *
     * @param {string} account
     */
    public bindAccount(account: string) {
        if (typeof account !== 'string') {
            console.error(`[XingePush bindAccount] account is not a string.`);
        }
        console.log('##', 'bindAccount ', account)
        this.retryParamsMap.set('bindAccount', account)
        return RNTXingePush.bindAccount(account);
    }

    /**
     * 解绑帐号
     *
     * @param {string} account
     */
    public unbindAccount(account: string) {
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
    public bindTags(tags: string[]) {
        RNTXingePush.bindTags(tags);
    }

    /**
     * 解绑标签
     *
     * @param {Array<string>} tags
     */
    public unbindTags(tags: string[]) {
        RNTXingePush.unbindTags(tags);
    }

    /**
     * 获取当前角标数字
     *
     * @return {Promise} 返回 { badge: 0 }
     */
    getBadge(): Promise<{ badge: number }> {
        return RNTXingePush.getBadge();
    }

    /**
     * 设置当前角标数字
     *
     * @param {number} badge
     */
    setBadge(badge: number) {
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
    public addEventListener(name: XGPushEventName, listener: (data: any) => void) {
        return this.nativeEventsRegistry.addEventListener(name, listener);
    }

    /*************************** Android 独有的配置 **********************************/

    /**
     * 设置是否开启第三方推送通道
     *
     * @param {boolean} enable
     */
    public enableOtherPush(enable: boolean) {
        if (Platform.OS === 'android') {
            RNTXingePush.enableOtherPush(enable);
        }
    }

    /**
     * 设置是否开启华为推送的调试模式
     *
     * @param {boolean} enable
     */
    public setHuaweiDebug(enable: boolean) {
        if (Platform.OS === 'android') {
            RNTXingePush.setHuaweiDebug(enable);
        }
    }

    /**
     * 配置小米推送
     *
     * @param {string} appId
     * @param {string} appKey
     */
    public setXiaomi(appId: string, appKey: string) {
        if (Platform.OS === 'android') {
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
    public setMeizu(appId: string, appKey: string) {
        if (Platform.OS === 'android') {
            if (typeof appId !== 'string') {
                console.error(`[XingePush setMeizu] appId is not a string.`);
            }
            if (typeof appKey !== 'string') {
                console.error(`[XingePush setMeizu] appKey is not a string.`);
            }
            RNTXingePush.setMeizu(appId, appKey);
        }
    }

    private nativeRetryHandler() {
        this.resetRetryLeftMap()
        this.nativeEventsRegistry.addBindAccountListener((eventType, data) => {
            const retryLeft: number = this.retryLeftMap.get(eventType) || 5
            const account = this.retryParamsMap.get(eventType)
            // 绑定成功
            if (data.error === 0) {
                this.eventEmitAndReset(XGPushEventName.BindAccountSuccess, data)
            }
            // 重试
            else if (retryLeft >= 0 && account != null) {
                this.retryLeftMap.set(eventType, retryLeft - 1)
                this.bindAccount(account)
            }
            // 失败
            else {
                this.eventEmitAndReset(XGPushEventName.BindAccountFail, data)
            }
        })
    }

    private eventEmitAndReset(eventType: string, data: any) {
        DeviceEventEmitter.emit(eventType, data)
        this.resetRetryLeftMap()
    }

    private resetRetryLeftMap() {
        this.retryLeftMap.set('bindAccount', 5)
        this.retryParamsMap.delete('bindAccount')

    }
}
