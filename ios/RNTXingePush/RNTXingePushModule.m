
#import "RNTXingePushModule.h"
#import <React/RCTUtils.h>

static NSString *XingePushEvent_Start = @"start";
static NSString *XingePushEvent_Stop = @"stop";
static NSString *XingePushEvent_Resgiter = @"register";
static NSString *XingePushEvent_ResgiterSuccess = @"registerSuccess";
static NSString *XingePushEvent_RegisterFail = @"registerFail";

static NSString *XingePushEvent_BindAccountSuccess = @"bindAccountSuccess";
static NSString *XingePushEvent_BindAccountFail = @"bindAccountFail";
static NSString *XingePushEvent_BindAccount = @"bindAccount";
static NSString *XingePushEvent_BindTags = @"bindTags";
static NSString *XingePushEvent_UnbindAccount = @"unbindAccount";
static NSString *XingePushEvent_UnbindTags = @"unbindTags";

static NSString *XingePushEvent_Message = @"message";
static NSString *XingePushEvent_Notification = @"notification";

static NSString *XingePushEvent_RemoteNotification = @"XingePushEvent_RemoteNotification";

static NSDictionary *RNTXingePush_LaunchUserInfo = nil;

// 获取自定义键值对
static NSMutableDictionary* XingePush_GetCustomContent(NSDictionary *userInfo) {
  
  NSMutableDictionary *customContent = [[NSMutableDictionary alloc] init];
  
  NSEnumerator *enumerator = [userInfo keyEnumerator];
  id key;
  while ((key = [enumerator nextObject])) {
    if (![key isEqual: @"xg"] && ![key isEqual: @"aps"]) {
      customContent[key] = userInfo[key];
    }
  }
  
  return customContent;
};

// 获取推送消息
static NSMutableDictionary* XingePush_GetNotification(NSDictionary *userInfo) {
  
  NSDictionary *customContent = XingePush_GetCustomContent(userInfo);
  
  NSDictionary *alert = userInfo[@"aps"][@"alert"];
  
  NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];
  dict[@"custom_content"] = customContent;
  dict[@"body"] = @{
    @"title": alert[@"title"] ?: @"",
    @"subtitle": alert[@"subtitle"] ?: @"",
    @"content": alert[@"body"] ?: @""
  };
  
  return dict;
  
};




@implementation RNTXingePushModule

// 在主工程 AppDelegate.m 里调下面几个 did 开头的方法

#pragma mark - 开启服务
// didFinishLaunchingWithOptions return YES 之前调用
+ (void)didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  // 为了更好的了解每一条推送消息的运营效果，需要将用户对消息的行为上报
  [[XGPush defaultManager] reportXGNotificationInfo:launchOptions];
  // 点击推送启动 App
  if ([launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey]) {
    RNTXingePush_LaunchUserInfo = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
  }
  else {
    RNTXingePush_LaunchUserInfo = nil;
  }
}


/**
 1. 这个方法在 iOS7~iOS10 时, 用于代替之前的didReceiveRemoteNotification: , 处理所有的通知. 比didReceiveRemoteNotification还多一个功能, 就是 App 处于关闭状态时, 启动时会调用这个方法
 2. 在 iOS10 之后, 如果实现了 UserNotification 框架的下面两个方法, 那么didReceiveRemoteNotification:fetchCompletionHandler这个只会处理静默通知, 其他的通知交给 UN 框架;
 如果未实现 UN 框架的功能, 那么所有通知都会来到这个方法.
 UserNotification框架的方法:
 - willPresentNotification:withCompletionHandler 用于在前台接收到消息后处理, 是否弹窗, iOS10 之前前台无法弹窗.
 - didReceiveNotificationResponse:withCompletionHandler 用于处理用户点击通知等与通知交互的行为
 
 普通推送：收到推送后（有文字有声音），点开通知，进入APP后，才执行 - application:didReceiveRemoteNotification:fetchCompletionHandler:
 静默推送：aps中有这个字段且content-available: 1 , 收到推送（没有文字没有声音），不用点开通知，不用打开APP，就能执 application:didReceiveRemoteNotification:fetchCompletionHandler
 
 */
+ (void)didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  
  [[XGPush defaultManager] reportXGNotificationInfo:userInfo];
  [[NSNotificationCenter defaultCenter] postNotificationName:XingePushEvent_RemoteNotification object:userInfo];
  
  completionHandler(UIBackgroundFetchResultNewData);
  
}

#pragma mark - 信鸽 XGPushDelegate 代理

#pragma mark - 推送消息回调代理
// iOS 10 新增 API
// iOS 10 会走新 API, iOS 10 以前会走到老 API
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0

// App 用户点击通知
// App 用户选择通知中的行为
// App 用户在通知中心清除消息
// 无论本地推送还是远程推送都会走这个回调
- (void)xgPushUserNotificationCenter:(UNUserNotificationCenter *)center
      didReceiveNotificationResponse:(UNNotificationResponse *)response
               withCompletionHandler:(void (^)(void))completionHandler __IOS_AVAILABLE(10.0) {
  
  UNNotification *notification = response.notification;
  NSDictionary *userInfo = notification.request.content.userInfo;
  
  [[XGPush defaultManager] reportXGNotificationResponse:response];
  
  NSMutableDictionary *dict = XingePush_GetNotification(userInfo);
  dict[@"clicked"] = @YES;
  [self sendEventWithName:XingePushEvent_Notification body:dict];
  
  completionHandler();
}

// App 在前台弹通知需要调用这个接口, 不使用这个方法, 前台收到消息不会进行弹窗
- (void)xgPushUserNotificationCenter:(UNUserNotificationCenter *)center
             willPresentNotification:(UNNotification *)notification
               withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler __IOS_AVAILABLE(10.0) {
  
  NSDictionary *userInfo = notification.request.content.userInfo;
  
  [[XGPush defaultManager] reportXGNotificationInfo:userInfo];
  
  NSMutableDictionary *dict = XingePush_GetNotification(userInfo);
  dict[@"presented"] = @YES;
  [self sendEventWithName:XingePushEvent_Notification body:dict];
  
  completionHandler(UNNotificationPresentationOptionBadge | UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert);
}

#endif


#pragma mark - 各种事件回调
// 信鸽服务启动的回调
- (void)xgPushDidFinishStart:(BOOL)isSuccess error:(NSError *)error {
  [self sendEventWithName:XingePushEvent_Start body:@{
    @"error": @(isSuccess ? 0 : error ? error.code : 0)
  }];
}

// 信鸽服务停止的回调
- (void)xgPushDidFinishStop:(BOOL)isSuccess error:(NSError *)error {
  [self sendEventWithName:XingePushEvent_Stop body:@{
    @"error": @(isSuccess ? 0 : error ? error.code : 0)
  }];
}

// 启动信鸽服务成功后，会触发此回调
- (void)xgPushDidRegisteredDeviceToken:(NSString *)deviceToken error:(NSError *)error {
  NSString *token = deviceToken ?: @"";
  [self sendEventWithName:XingePushEvent_Resgiter body:@{
    @"deviceToken": token,
    @"error": @(token.length > 0 ? 0 : error ? error.code : 0)
  }];
}

// 绑定帐号的回调
- (void)xgPushDidBindWithIdentifier:(NSString *)identifier type:(XGPushTokenBindType)type error:(NSError *)error {
  [self sendEventWithName:XingePushEvent_BindAccount body:@{
    @"error": @(error ? error.code : 0)
  }];
}

// 绑定标签的回调
- (void)xgPushDidBindWithIdentifiers:(NSArray *)identifiers type:(XGPushTokenBindType)type error:(NSError *)error {
  [self sendEventWithName:XingePushEvent_BindTags body:@{
    @"error": @(error ? error.code : 0)
  }];
}

// 解除绑定帐号的回调
- (void)xgPushDidUnbindWithIdentifier:(NSString *)identifier type:(XGPushTokenBindType)type error:(NSError *)error {
  [self sendEventWithName:XingePushEvent_UnbindAccount body:@{
    @"error": @(error ? error.code : 0)
  }];
}

// 解除绑定标签的回调
- (void)xgPushDidUnbindWithIdentifiers:(NSArray *)identifiers type:(XGPushTokenBindType)type error:(NSError *)error {
  [self sendEventWithName:XingePushEvent_UnbindTags body:@{
    @"error": @(error ? error.code : 0)
  }];
}

/**
 消息格式
 {
 "aps":{
 "alert":{
 "title":"I am title",
 "subtitle":"I am subtitle",
 "body":"I am body"
 },
 "sound":"default",
 "badge":1
 }
 }
 */

- (void)didReceiveRemoteNotification:(NSNotification *)notification {
  
  NSDictionary *userInfo = notification.object;
  NSDictionary *aps = userInfo[@"aps"];
  
  int contentAvailable = 0;
  if ([aps objectForKey:@"content-available"]) {
    contentAvailable = [[NSString stringWithFormat:@"%@", aps[@"content-available"]] intValue];
  }
  
  if (contentAvailable == 1) {
    // 静默消息
    // 静默推送可以让 App在后台不启动应用时就能运行一段代码, 从服务器拉取消息, 执行didReceiveRemoteNotification:fetchCompletionHandler
    [self sendEventWithName:XingePushEvent_Message body:XingePush_GetCustomContent(userInfo)];
  }
  else {
    // 推送消息
    NSMutableDictionary *dict = XingePush_GetNotification(userInfo);
    dict[@"presented"] = @YES;
    
    [self sendEventWithName:XingePushEvent_Notification body:dict];
  }
  
}


#pragma mark - RN 方法

RCT_EXPORT_MODULE(RNTXingePush);

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (instancetype)init {
  if (self = [super init]) {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(didReceiveRemoteNotification:)
                                                 name:XingePushEvent_RemoteNotification
                                               object:nil];
  }
  return self;
}

- (void)dealloc {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[
    XingePushEvent_Start,
    XingePushEvent_Stop,
    XingePushEvent_Resgiter,
    XingePushEvent_ResgiterSuccess,
    XingePushEvent_RegisterFail,
    XingePushEvent_BindAccount,
    XingePushEvent_BindAccountSuccess,
    XingePushEvent_BindAccountFail,
    XingePushEvent_BindTags,
    XingePushEvent_UnbindAccount,
    XingePushEvent_UnbindTags,
    XingePushEvent_Message,
    XingePushEvent_Notification
  ];
}

RCT_EXPORT_METHOD(start:(NSInteger)appID appKey:(NSString *)appKey) {
  [[XGPush defaultManager]startXGWithAppID:(uint32_t)appID appKey:appKey delegate:self];
  [XGPushTokenManager defaultTokenManager].delegate = self;
  if (RNTXingePush_LaunchUserInfo != nil) {
    NSMutableDictionary *dict = XingePush_GetNotification(RNTXingePush_LaunchUserInfo);
    dict[@"clicked"] = @YES;
    [self sendEventWithName:XingePushEvent_Notification body:dict];
    RNTXingePush_LaunchUserInfo = nil;
  }
}

RCT_EXPORT_METHOD(stop) {
  [[XGPush defaultManager] stopXGNotification];
}

RCT_EXPORT_METHOD(bindAccount:(NSString *)account) {
  [[XGPushTokenManager defaultTokenManager] bindWithIdentifier:account type:XGPushTokenBindTypeAccount];
}

RCT_EXPORT_METHOD(unbindAccount:(NSString *)account) {
  [[XGPushTokenManager defaultTokenManager] unbindWithIdentifer:account type:XGPushTokenBindTypeAccount];
}

RCT_EXPORT_METHOD(bindTags:(NSArray *)tags) {
  [[XGPushTokenManager defaultTokenManager] bindWithIdentifiers:tags type:XGPushTokenBindTypeTag];
}

RCT_EXPORT_METHOD(unbindTags:(NSArray *)tags) {
  [[XGPushTokenManager defaultTokenManager] unbindWithIdentifers:tags type:XGPushTokenBindTypeTag];
}

RCT_EXPORT_METHOD(setBadge:(NSInteger)badge) {
  // 这里本地角标
  [[XGPush defaultManager] setXgApplicationBadgeNumber:badge];
  // 上报服务器，方便实现 +1 操作
  [[XGPush defaultManager] setBadge:badge];
}

RCT_EXPORT_METHOD(getBadge:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
  NSInteger badge = [[XGPush defaultManager] xgApplicationBadgeNumber];
  resolve(@{
    @"badge": @(badge)
  });
}

RCT_EXPORT_METHOD(setDebug:(BOOL)enable) {
  [[XGPush defaultManager] setEnableDebug:enable];
}

@end
