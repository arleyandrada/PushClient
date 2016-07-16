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

#import "TiModule.h"
#import "TiAppiOSProxyHack.h"

@interface BrComArlsoftPushclientModule : TiModule 
{
@private
	TiAppiOSProxyHack *_appProxy;
}

@property(nonatomic,readonly) NSString* EVENT_SUCCESS;
@property(nonatomic,readonly) NSString* EVENT_ERROR;
@property(nonatomic,readonly) NSString* EVENT_CALLBACK;

@property(nonatomic,readonly) NSNumber* ERROR_SENDER_ID;
@property(nonatomic,readonly) NSNumber* ERROR_NOT_SUPPORTED;
@property(nonatomic,readonly) NSNumber* ERROR_REGISTER;
@property(nonatomic,readonly) NSNumber* ERROR_UNREGISTER;
@property(nonatomic,readonly) NSNumber* ERROR_PLAY_SERVICES;

@property(nonatomic,readonly) NSNumber* MODE_FOREGROUND;
@property(nonatomic,readonly) NSNumber* MODE_CLICK;
@property(nonatomic,readonly) NSNumber* MODE_BACKGROUND;
@property(nonatomic,readonly) NSNumber* MODE_ACTION;

@property(nonatomic,readonly) NSNumber* NOTIFICATION_TYPE_BADGE;
@property(nonatomic,readonly) NSNumber* NOTIFICATION_TYPE_ALERT;
@property(nonatomic,readonly) NSNumber* NOTIFICATION_TYPE_SOUND;
@property(nonatomic,readonly) NSNumber* NOTIFICATION_TYPE_NEWSSTAND;

@property(nonatomic,readonly) NSNumber* NOTIFICATION_ACTIVATION_MODE_FOREGROUND;
@property(nonatomic,readonly) NSNumber* NOTIFICATION_ACTIVATION_MODE_BACKGROUND;

+(void)myLog:(NSString*) format, ...;

@end