import { EmitterSubscription } from 'react-native';
import { XGPushShowedResult, XGPushClickedResult, XGPushTextMessage } from '../interfaces/Results';
import { XGPushEventName } from "../XGPushEventName";
export declare class NativeEventsRegistry {
    private emitter;
    constructor();
    addBindAccountListener(callback: (eventType: string, data: any) => void): EmitterSubscription;
    addUnBindAccountListener(callback: (code: number) => void): EmitterSubscription;
    addEventListener(name: XGPushEventName, callback: (data: any) => void): EmitterSubscription;
    /**
     * 通知点击处理回调
     * 此处做点击消息跳转
     *
     * @param callback XGPushClickedResult 通知被打开的对象
     */
    addNotifactionClickListener(callback: (data: XGPushClickedResult) => void): EmitterSubscription;
    addNotifactionShowedResultListener(callback: (data: XGPushShowedResult) => void): EmitterSubscription;
    /**
     * 通知点击回调
     * actionType=1为该消息被清除
     * actionType=0为该消息被点击
     * 此处不能做点击消息跳转
     * 详细方法请参照官网的Android常见问题文档(https://xg.qq.com/docs/android_access/android_faq.html)
     */
    addNotifactionClickedResultListener(callback: (data: XGPushClickedResult) => void): EmitterSubscription;
    addTextMessageListener(callback: (data: XGPushTextMessage) => void): EmitterSubscription;
}
