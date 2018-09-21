/**
 * MIT License
 * Copyright (c) 2014-present
 * ArlSoft Tecnologia <contato@arlsoft.com.br>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

#import "BrComArlsoftPushclientModule.h"
#import "TiEvaluator.h"
#import "TiUtils.h"
#import "TiApp.h"
#import <sys/utsname.h>

#ifndef UIUserNotificationTypeNone
#define UIUserNotificationTypeNone    (0)
#endif
#ifndef UIUserNotificationTypeBadge
#define UIUserNotificationTypeBadge   (1 << 0)
#endif
#ifndef UIUserNotificationTypeSound
#define UIUserNotificationTypeSound   (1 << 1)
#endif
#ifndef UIUserNotificationTypeAlert
#define UIUserNotificationTypeAlert   (1 << 2)
#endif

#ifndef kCFCoreFoundationVersionNumber_iOS_7_0
#define kCFCoreFoundationVersionNumber_iOS_7_0 847.2
#endif

NSString* const CONST_EVENT_SUCCESS = @"PushClient_Success";
NSString* const CONST_EVENT_ERROR = @"PushClient_Error";
NSString* const CONST_EVENT_CALLBACK = @"PushClient_Callback";

NSNumber* const CONST_ERROR_SENDER_ID = 1;
NSNumber* const CONST_ERROR_NOT_SUPPORTED = 2;
NSNumber* const CONST_ERROR_REGISTER = 3;
NSNumber* const CONST_ERROR_UNREGISTER = 4;
NSNumber* const CONST_ERROR_PLAY_SERVICES = 5;

NSNumber* const CONST_MODE_FOREGROUND = 1;
NSNumber* const CONST_MODE_CLICK = 2;
NSNumber* const CONST_MODE_BACKGROUND = 3;
NSNumber* const CONST_MODE_ACTION = 4;

NSNumber* const CONST_NOTIFICATION_TYPE_BADGE = 1;
NSNumber* const CONST_NOTIFICATION_TYPE_ALERT = 2;
NSNumber* const CONST_NOTIFICATION_TYPE_SOUND = 3;
NSNumber* const CONST_NOTIFICATION_TYPE_NEWSSTAND = 4;

NSNumber* const CONST_NOTIFICATION_ACTIVATION_MODE_FOREGROUND = 0;
NSNumber* const CONST_NOTIFICATION_ACTIVATION_MODE_BACKGROUND = 1;

NSString* const CONST_MESSAGE_UNSUPPORTED_SIMULATOR = @
"Unable to run with iOS Simulator";
NSString* const CONST_MESSAGE_UNSUPPORTED_DEBUG = @
"Unable to run with iOS in DEBUG mode";
NSString* const CONST_MESSAGE_UNSUPPORTED_DEV = @
"Unable to run with iOS DEV profile due to Titanium Mobile issue TIMOB-17030";

BOOL pushNotificationRegistered = NO;

@implementation BrComArlsoftPushclientModule

MAKE_SYSTEM_STR(EVENT_SUCCESS,CONST_EVENT_SUCCESS);
MAKE_SYSTEM_STR(EVENT_ERROR,CONST_EVENT_ERROR);
MAKE_SYSTEM_STR(EVENT_CALLBACK,CONST_EVENT_CALLBACK);

MAKE_SYSTEM_PROP(ERROR_SENDER_ID,CONST_ERROR_SENDER_ID);
MAKE_SYSTEM_PROP(ERROR_NOT_SUPPORTED,CONST_ERROR_NOT_SUPPORTED);
MAKE_SYSTEM_PROP(ERROR_REGISTER,CONST_ERROR_REGISTER);
MAKE_SYSTEM_PROP(ERROR_UNREGISTER,CONST_ERROR_UNREGISTER);
MAKE_SYSTEM_PROP(ERROR_PLAY_SERVICES,CONST_ERROR_PLAY_SERVICES);

MAKE_SYSTEM_PROP(MODE_FOREGROUND,CONST_MODE_FOREGROUND);
MAKE_SYSTEM_PROP(MODE_CLICK,CONST_MODE_CLICK);
MAKE_SYSTEM_PROP(MODE_BACKGROUND,CONST_MODE_BACKGROUND);
MAKE_SYSTEM_PROP(MODE_ACTION,CONST_MODE_ACTION);

MAKE_SYSTEM_PROP(NOTIFICATION_TYPE_BADGE,CONST_NOTIFICATION_TYPE_BADGE);
MAKE_SYSTEM_PROP(NOTIFICATION_TYPE_ALERT,CONST_NOTIFICATION_TYPE_ALERT);
MAKE_SYSTEM_PROP(NOTIFICATION_TYPE_SOUND,CONST_NOTIFICATION_TYPE_SOUND);
MAKE_SYSTEM_PROP(NOTIFICATION_TYPE_NEWSSTAND,CONST_NOTIFICATION_TYPE_NEWSSTAND);

MAKE_SYSTEM_PROP(NOTIFICATION_ACTIVATION_MODE_FOREGROUND,CONST_NOTIFICATION_ACTIVATION_MODE_FOREGROUND);
MAKE_SYSTEM_PROP(NOTIFICATION_ACTIVATION_MODE_BACKGROUND,CONST_NOTIFICATION_ACTIVATION_MODE_BACKGROUND);

+(void)myLog:(NSString*) format, ...
{
    va_list argList;
    va_start(argList, format);
    NSString* formattedMessage = [[NSString alloc] initWithFormat: format arguments: argList];
    va_end(argList);
    NSLog(@"[INFO] %@", formattedMessage);
}

#pragma mark Internal

// this is generated for your module, please do not change it
-(id)moduleGUID
{
	return @"1c3e11de-52ae-4c19-89e5-655a44dd0483";
}

// this is generated for your module, please do not change it
-(NSString*)moduleId
{
	return @"br.com.arlsoft.pushclient";
}

-(BOOL)isSimulator
{
	struct utsname u;
	uname(&u);

	if ((!strcmp(u.machine, "i386")) || (!strcmp(u.machine, "x86_64")))
	{
		return YES;
	}
	else
	{
		return NO;
	}
}

-(BOOL)isDevelopmentApp
{
	// Special case of simulator
	if ([self isSimulator])
	{
		return YES;
	}

	// There is no provisioning profile in AppStore Apps
	NSString *profilePath = [[NSBundle mainBundle] pathForResource:@"embedded" ofType:@"mobileprovision"];

	// Check provisioning profile existence
	if (profilePath)
	{
		// Get hex representation
		NSData *profileData = [NSData dataWithContentsOfFile:profilePath];
		NSString *profileString = [NSString stringWithFormat:@"%@", profileData];

		// Remove brackets at beginning and end
		profileString = [profileString stringByReplacingCharactersInRange:NSMakeRange(0, 1) withString:@""];
		profileString = [profileString stringByReplacingCharactersInRange:NSMakeRange(profileString.length - 1, 1) withString:@""];

		// Remove spaces
		profileString = [profileString stringByReplacingOccurrencesOfString:@" " withString:@""];

		// Convert hex values to readable characters
		NSMutableString *profileText = [NSMutableString new];
		for (int i = 0; i < profileString.length; i += 2)
		{
			NSString *hexChar = [profileString substringWithRange:NSMakeRange(i, 2)];
			int value = 0;
			sscanf([hexChar cStringUsingEncoding:NSASCIIStringEncoding], "%x", &value);
			[profileText appendFormat:@"%c", (char)value];
		}

		// Remove whitespaces and new lines characters
		NSArray *profileWords = [profileText componentsSeparatedByCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
		NSString *profileClearText = [profileWords componentsJoinedByString:@""];

		// Look for debug value
		NSRange debugRange = [profileClearText rangeOfString:@"<key>get-task-allow</key><true/>"];
		if (debugRange.location != NSNotFound)
		{
			return YES;
		}
	}

	// Return NO by default to avoid security leaks
	return NO;
}

-(BOOL)isPushNotificationsUndefined
{
	UIApplication * app = [UIApplication sharedApplication];

	if ([[TiApp app] respondsToSelector: @selector(application:didRegisterForRemoteNotificationsWithDeviceToken:)]) {
		return NO;
	}
	else {
		return YES;
	}
}

-(BOOL)runningInBackground
{
	UIApplicationState state = [UIApplication sharedApplication].applicationState;
	BOOL result = (state == UIApplicationStateBackground);

	return result;
}

-(BOOL)runningInForeground
{
	UIApplicationState state = [UIApplication sharedApplication].applicationState;
	BOOL result = (state == UIApplicationStateActive);

	return result;
}

-(BOOL)isInactive
{
	UIApplicationState state = [UIApplication sharedApplication].applicationState;
	BOOL result = (state == UIApplicationStateInactive);

	return result;
}

#pragma mark Lifecycle

-(void)startup
{
	// this method is called when the module is first loaded
	// you *must* call the superclass
	[super startup];
}

// This is called when the application receives the applicationWillResignActive message
-(void)suspend:(id)sender
{
}

// This is called when the application receives the applicationDidBecomeActive message
-(void)resumed:(id)sender
{
}

-(void)shutdown:(id)sender
{
	// this method is called when the module is being unloaded
	// typically this is during shutdown. make sure you don't do too
	// much processing here or the app will be quit forceably

	// you *must* call the superclass
	[super shutdown:sender];
}

#pragma mark Cleanup 

-(void)dealloc
{
	// release any resources that have been retained by the module
	[[NSNotificationCenter defaultCenter] removeObserver:self];
	[super dealloc];
}

#pragma mark Internal Memory Management

-(void)didReceiveMemoryWarning:(NSNotification*)notification
{
	// optionally release any resources that can be dynamically
	// reloaded once memory is available - such as caches
	[super didReceiveMemoryWarning:notification];
}

#pragma mark Listener Notifications

-(void)_listenerAdded:(NSString *)type count:(int)count
{
}

-(void)_listenerRemoved:(NSString *)type count:(int)count
{
}

-(id)appProxy
{
	if (_appProxy==nil)
	{
		_appProxy = [[TiAppiOSProxyHack alloc] _initWithPageContext:[self executionContext]];
        [self rememberProxy:_appProxy];
	}
	return _appProxy;
}

-(id)createAction:(id)args
{
    id appProxy = [self appProxy];
    return [appProxy createAction:args];
}

-(id)createCategory:(id)args
{
    id appProxy = [self appProxy];
    return [appProxy createCategory:args];
}

#pragma mark Public APIs
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"

-(void)registerPush:(id)args
{
	ENSURE_SINGLE_ARG(args,NSDictionary);

	UIApplication * app = [UIApplication sharedApplication];

	//Simulator detection
	if ([self isSimulator])
	{
		if ([self _hasListeners:CONST_EVENT_ERROR])
		{
			NSMutableDictionary * event = [TiUtils dictionaryWithCode:CONST_ERROR_NOT_SUPPORTED message:CONST_MESSAGE_UNSUPPORTED_SIMULATOR];
			[self fireEvent:CONST_EVENT_ERROR withObject:event];
		}
	}
	else if ([[TiApp app] debugMode])
	{
		if ([self _hasListeners:CONST_EVENT_ERROR])
		{
			NSMutableDictionary * event = [TiUtils dictionaryWithCode:CONST_ERROR_NOT_SUPPORTED message:CONST_MESSAGE_UNSUPPORTED_DEBUG];
			[self fireEvent:CONST_EVENT_ERROR withObject:event];
		}
	}
	else if ([self isDevelopmentApp] && [self isPushNotificationsUndefined])
	{
		if ([self _hasListeners:CONST_EVENT_ERROR])
		{
			NSMutableDictionary * event = [TiUtils dictionaryWithCode:CONST_ERROR_NOT_SUPPORTED message:CONST_MESSAGE_UNSUPPORTED_DEV];
			[self fireEvent:CONST_EVENT_ERROR withObject:event];
		}
	}
	else
	{
        NSArray *typesRequested = [args objectForKey:@"APNTypes"];

        // Register for push notifications
        [[TiApp app] registerApplicationDelegate:self];

        if ([app respondsToSelector:NSSelectorFromString(@"registerUserNotificationSettings:")])
        {
            Class settings = NSClassFromString(@"UIUserNotificationSettings");
            if (settings) {
                NSUInteger settingsParam = UIUserNotificationTypeNone;

                if (typesRequested!=nil)
                {
                    for (id thisTypeRequested in typesRequested)
                    {
                        NSInteger value = [TiUtils intValue:thisTypeRequested];
                        switch(value)
                        {
                            case 1: //NOTIFICATION_TYPE_BADGE
                            {
                                settingsParam |= UIUserNotificationTypeBadge;
                                break;
                            }
                            case 2: //NOTIFICATION_TYPE_ALERT
                            {
                                settingsParam |= UIUserNotificationTypeAlert;
                                break;
                            }
                            case 3: //NOTIFICATION_TYPE_SOUND
                            {
                                settingsParam |= UIUserNotificationTypeSound;
                                break;
                            }
                        }
                    }
                }
                
                NSArray *categories;
                NSMutableSet *categoriesParam = nil;
                ENSURE_ARG_OR_NIL_FOR_KEY(categories, args, @"Categories", NSArray);
                
                if (categories != nil) {
                    categoriesParam = [NSMutableSet set];
                    for (id category in categories) {
                        //ENSURE_TYPE(category, TiAppiOSNotificationCategoryProxy);
                        //[categoriesSet addObject:[(TiAppiOSNotificationCategoryProxy*)category notificationCategory]];
                        id retObj = [category performSelector:NSSelectorFromString(@"notificationCategory")];
                        [categoriesParam addObject:retObj];
                    }
                }
                
                // Prepare class selector
                SEL sel = NSSelectorFromString(@"settingsForTypes:categories:");
                
                // Obtain a method signature of selector on UIUserNotificationSettings class
                NSMethodSignature *signature = [settings methodSignatureForSelector:sel];
                
                // Create an invocation on a signature -- must be used because of primitive (enum) arguments on selector
                NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:signature];
                invocation.selector = sel;
                invocation.target = settings;
                
                // Set arguments
                [invocation setArgument:&settingsParam atIndex:2];
                [invocation setArgument:&categoriesParam atIndex:3];
                
                // Obtain an instance by firing an invocation
                NSObject *settingsInstance;
                [invocation invoke];
                [invocation getReturnValue:&settingsInstance];
                
                // Retain an instance so it can live after quitting method and prevent crash :-)
                CFRetain((__bridge CFTypeRef)(settingsInstance));
                
                // Finally call the desired method with proper settings
                if (settingsInstance)
                    [app performSelector:NSSelectorFromString(@"registerUserNotificationSettings:") withObject:settingsInstance];
                
                [app performSelector:NSSelectorFromString(@"registerForRemoteNotifications")];
            }
        } else {
            UIRemoteNotificationType ourNotifications = [app enabledRemoteNotificationTypes];
            
            if (typesRequested!=nil)
            {
                for (id thisTypeRequested in typesRequested)
                {
                    NSInteger value = [TiUtils intValue:thisTypeRequested];
                    switch(value)
                    {
                        case 1: //NOTIFICATION_TYPE_BADGE
                        {
                            ourNotifications |= UIRemoteNotificationTypeBadge;
                            break;
                        }
                        case 2: //NOTIFICATION_TYPE_ALERT
                        {
                            ourNotifications |= UIRemoteNotificationTypeAlert;
                            break;
                        }
                        case 3: //NOTIFICATION_TYPE_SOUND
                        {
                            ourNotifications |= UIRemoteNotificationTypeSound;
                            break;
                        }
                        case 4: //NOTIFICATION_TYPE_NEWSSTAND
                        {
                            ourNotifications |= UIRemoteNotificationTypeNewsstandContentAvailability;
                            break;
                        }
                    }
                }
            }

            [app registerForRemoteNotificationTypes:ourNotifications];
        }

		// Avoid duplicated callback with duplicated registering
		if (pushNotificationRegistered == NO) {
			pushNotificationRegistered = YES;

			// check to see upon registration if we were started with a push
			// notification and if so, go ahead and fire our callback event
			id currentNotification = [[TiApp app] remoteNotification];
			if (currentNotification!=nil && [currentNotification count] > 0)
			{
				if ([self _hasListeners:CONST_EVENT_CALLBACK])
				{
					NSMutableDictionary * event = [TiUtils dictionaryWithCode:0 message:nil];
					[event setObject:currentNotification forKey:@"data"];
					[event setObject:[NSNumber numberWithInt:CONST_MODE_CLICK] forKey:@"mode"];
					[self fireEvent:CONST_EVENT_CALLBACK withObject:event];
				}
			}
	
			//Listen to silent push notifications
			[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(didReceiveSilentPushNotification:)
                                                         name:kTiSilentPushNotification object:nil];

            //Listen to notification actions
			[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(didReceiveRemoteNotificationAction:)
                                                         name:@"TiRemoteNotificationAction" object:nil];
		}
	}
}

- (void)generateNotification:(NSDictionary*)dict
{
    // Check and see if any keys from APS and the rest of the dictionary match; if they do, just
    // bump out the dictionary as-is
    
    //[TiApp app].remoteNotification = [[NSMutableDictionary alloc] initWithDictionary:dict];
    [((NSMutableDictionary*)[TiApp app].remoteNotification) removeAllObjects];
    for (id key in dict)
    {
        [[TiApp app].remoteNotification setValue:[dict valueForKey:key] forKey:key];
    }
    
    NSDictionary* aps = [dict objectForKey:@"aps"];
    for (id key in aps)
    {
        if ([dict objectForKey:key] != nil) {
            DebugLog(@"[WARN] Conflicting keys in push APS dictionary and notification dictionary `%@`, not copying to toplevel from APS", key);
            continue;
        }
        [[TiApp app].remoteNotification setValue:[aps valueForKey:key] forKey:key];
    }
}

-(void)didReceiveSilentPushNotification:(NSNotification*)note
{
	//avoid duplicated notifications from silent push TiApp
	if ([self runningInBackground])
	{
		[self generateNotification:[note userInfo]];

		NSMutableDictionary * event = [TiUtils dictionaryWithCode:0 message:nil];
		[event setObject:[[TiApp app] remoteNotification] forKey:@"data"];
		[event setObject:[NSNumber numberWithInt:CONST_MODE_BACKGROUND] forKey:@"mode"];
		[self fireEvent:CONST_EVENT_CALLBACK withObject:event];
	}
}

-(void)didReceiveRemoteNotificationAction:(NSNotification*)note
{
    NSDictionary *notification = [note object];
    
    NSMutableDictionary * event = [TiUtils dictionaryWithCode:0 message:nil];
    [event setObject:[notification objectForKey:@"data"] forKey:@"data"];
    [event setObject:[notification objectForKey:@"identifier"] forKey:@"identifier"];
    [event setObject:[notification objectForKey:@"category"] forKey:@"category"];
    [event setObject:[NSNumber numberWithInt:CONST_MODE_ACTION] forKey:@"mode"];
    [event setObject:@"didReceiveRemoteNotificationAction" forKey:@"debug"];
    [self fireEvent:CONST_EVENT_CALLBACK withObject:event];
}

-(void)endBackgroundHandler:(id)arg
{
	ENSURE_SINGLE_ARG(arg, NSString);
	[[TiApp app] completionHandler:arg withResult:1];
}

-(void)unregisterPush:(id)args
{
	UIApplication * app = [UIApplication sharedApplication];
	[app unregisterForRemoteNotifications];
}

#pragma mark Push Notification Delegates

-(void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
	if ([self _hasListeners:CONST_EVENT_SUCCESS])
	{
		NSString *token = [[[[deviceToken description] stringByReplacingOccurrencesOfString:@"<"withString:@""]
		stringByReplacingOccurrencesOfString:@">" withString:@""]
		stringByReplacingOccurrencesOfString: @" " withString: @""];

		NSMutableDictionary * event = [TiUtils dictionaryWithCode:0 message:nil];
		[event setObject:token forKey:@"registrationId"];
		[self fireEvent:CONST_EVENT_SUCCESS withObject:event];
	}
}

-(void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
{
	if ([self _hasListeners:CONST_EVENT_CALLBACK])
	{
		//avoid duplicated notifications from silent push TiApp
		if ([self runningInForeground])
		{
			NSMutableDictionary * event = [TiUtils dictionaryWithCode:0 message:nil];
			[event setObject:userInfo forKey:@"data"];
			[event setObject:[NSNumber numberWithInt:CONST_MODE_FOREGROUND] forKey:@"mode"];
			[self fireEvent:CONST_EVENT_CALLBACK withObject:event];
		}
		else if ([self isInactive])
		{
			NSMutableDictionary * event = [TiUtils dictionaryWithCode:0 message:nil];
			[event setObject:userInfo forKey:@"data"];
			[event setObject:[NSNumber numberWithInt:CONST_MODE_CLICK] forKey:@"mode"];
			[self fireEvent:CONST_EVENT_CALLBACK withObject:event];
		}
	}
}

-(void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
	if ([self _hasListeners:CONST_EVENT_ERROR])
	{
		NSString * message = [TiUtils messageFromError:error];
		NSMutableDictionary * event = [TiUtils dictionaryWithCode:CONST_ERROR_REGISTER message:message];
		[self fireEvent:CONST_EVENT_ERROR withObject:event];
	}
}

@end
