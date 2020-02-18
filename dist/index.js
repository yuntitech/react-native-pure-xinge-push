"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const XingePush_1 = require("./src/XingePush");
exports.XingePush = new XingePush_1.XingeTencentPush();
__export(require("./src/XGPushEventName"));
