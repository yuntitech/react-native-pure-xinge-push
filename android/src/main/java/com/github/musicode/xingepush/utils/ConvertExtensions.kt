package com.github.musicode.xingepush.utils

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.tencent.android.tpush.XGPushClickedResult
import com.tencent.android.tpush.XGPushTextMessage


fun XGPushClickedResult.toBodyMap(): WritableMap {
    val body = Arguments.createMap()
    body.putString("title", title)
    body.putString("content", content)
    body.putString("customContent", customContent)
    body.putInt("actionType", actionType.toInt())
    val result = Arguments.createMap()
    result.putMap("body", body)
    return result
}

fun XGPushTextMessage.toWritableMap(): WritableMap {
    val result = Arguments.createMap()
    result.putString("title", title)
    result.putString("content", content)
    result.putString("customContent", customContent)
    return result
}