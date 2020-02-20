package com.github.musicode.xingepush.utils

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.tencent.android.tpush.XGPushClickedResult
import com.tencent.android.tpush.XGPushTextMessage


fun XGPushClickedResult.toBodyMap(): WritableMap {
    val result = Arguments.createMap()
    result.putString("title", title)
    result.putString("content", content)
    result.putString("customContent", customContent)
    result.putInt("actionType", actionType.toInt())
    result.putBoolean("clicked", true)
    return result
}

fun XGPushTextMessage.toWritableMap(): WritableMap {
    val result = Arguments.createMap()
    result.putString("title", title)
    result.putString("content", content)
    result.putString("customContent", customContent)
    return result
}