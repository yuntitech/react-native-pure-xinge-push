export interface XGPushClickedResult extends XGPushCommonResult {
    msgId: number;
    activityName: string;
    actionType: number;
}
export interface XGPushShowedResult extends XGPushCommonResult {
    msgId: number;
    notificationActionType: number;
}
export interface XGPushTextMessage extends XGPushCommonResult {
}
interface XGPushCommonResult {
    title: string;
    content: string;
    customContent: string;
}
export {};
