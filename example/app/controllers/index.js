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

//Workaround to Titanium Mobile issue #17030
//https://jira.appcelerator.org/browse/TIMOB-17030
if (!OS_ANDROID) {
	var issue17030 = Ti.Network.registerForPushNotifications;
	var issue17030iOS8 = Ti.App.iOS.registerUserNotificationSettings;
}

var PushClient = require('br.com.arlsoft.pushclient');
//var Provider = require('parse');
//var Provider = require('amazonsns');
var Provider = require('onesignal');

var registerOptions = {
	//GCMSenderId : Alloy.CFG.ParseGCMSenderId,
	//GCMSenderId : Alloy.CFG.AmazonSNSGCMSenderId,
	GCMSenderId : Alloy.CFG.OneSignalGCMSenderId,
	APNTypes : [ PushClient.NOTIFICATION_TYPE_BADGE, PushClient.NOTIFICATION_TYPE_ALERT, PushClient.NOTIFICATION_TYPE_SOUND ]
};

if (OS_IOS) {
	var acceptAction = PushClient.createAction({
	    identifier: 'ACCEPT_IDENTIFIER',
	    title: 'Accept',
	    activationMode: PushClient.NOTIFICATION_ACTIVATION_MODE_FOREGROUND,
	    destructive: false,
	    authenticationRequired: true
	});
	var rejectAction = PushClient.createAction({
	    identifier: 'REJECT_IDENTIFIER',
	    title: 'Reject',
	    activationMode: PushClient.NOTIFICATION_ACTIVATION_MODE_BACKGROUND,
	    destructive: true,
	    authenticationRequired: false
	});
	var downloadContent = PushClient.createCategory({
	  identifier: 'APPROVE_CONTENT',
	  actionsForMinimalContext: [acceptAction, rejectAction],
	  actionsForDefaultContext: [acceptAction, rejectAction]
	});
	registerOptions.Categories = [downloadContent];
}

// Valid APNTypes (for iOS):
// PushClient.NOTIFICATION_TYPE_BADGE
// PushClient.NOTIFICATION_TYPE_ALERT
// PushClient.NOTIFICATION_TYPE_SOUND
// PushClient.NOTIFICATION_TYPE_NEWSSTAND (prior to iOS8)

// Categories (for iOS 8):
// Equivalent to Ti.App.iOS.createUserNotificationCategory and Ti.App.iOS.createUserNotificationAction
// https://wiki.appcelerator.org/display/guides2/iOS+Interactive+Notifications

// Notification properties:
// "alert" (String) to text message - or "text" to Android
// "sound" (String) to sound file to play - "default" to Android default sound
// "badge" (Int) to iOS badge count indicator
// "content-available" (Int) to iOS background notification
// -->> Requires set remote-notification UIBackgroundModes in tiapp.xml
// "notificationId" (Int) to Android notification identification
// "title" (String) to override Android notification title - default app name
// "ticker" (String) to override Android ticker message - default alert message
// "vibrate" (Boolean) to use default Android device vibration
// "lights" (Boolean) to use default Android device lights
// "smallIcon" (String) set small icon to Android notification from assets
// "largeIcon" (String) set large icon to Android notification from local file or url
// "category" (String) to iOS 8 interactive notification
// "ledARGB" (Color) to change default Android device light color
// "ledOnMS" (Int) to change default Android device light blink on time
// "ledOffMS" (Int) to change default Android device light blink off time

var eventSuccess = function(event) {
	Ti.API.info('eventSuccess:' + JSON.stringify(event));

	if (!event) {
		alert('Success:\n\nInvalid success');
		// Should never happen...
		return;
	}

	alert('Success:\n\nregistrationId\n\n' + event.registrationId);

	Provider.registerDevice(event.registrationId, [], function(error, response) {
		if (error) {
			alert('Provider API Error:\n\n' + JSON.stringify(response));
		} else {
			alert('Provider API Success:\n\n' + JSON.stringify(response));
		}
	});
};

var eventError = function(event) {
	Ti.API.info('eventError:' + JSON.stringify(event));

	if (!event) {
		alert('Error:\n\nInvalid error');
		// Should never happen...
		return;
	}

	switch (event.code) {
	case PushClient.ERROR_SENDER_ID:
		alert('Error:\n\nUndefined GCMSenderId');
		// Only for Google Cloud Messaging (Android)
		break;
	case PushClient.ERROR_PLAY_SERVICES:
		alert('Error:\n\nGoogle Play Services not available\n\n' + event.error);
		// Only for Google Cloud Messaging (Android)
		break;
	case PushClient.ERROR_NOT_SUPPORTED:
		alert('Error:\n\nNot supported error\n\n' + event.error);
		// Possible error messages for iOS:
		// - "Unable to run with iOS Simulator"
		// - "Unable to run with iOS in DEBUG mode"
		// - "Unable to run with iOS DEV profile due to Titanium Mobile issue
		// #17030"
		// Possible error messages for Android:
		// - "This device is not supported"
		break;
	case PushClient.ERROR_REGISTER:
		alert('Error:\n\nUnable to register this device\n\n' + event.error);
		break;
	case PushClient.ERROR_UNREGISTER:
		alert('Error:\n\nUnable to unregister this device\n\n' + event.error);
		break;
	default:
		alert('Error:\n\nUnknown error\n\n' + JSON.stringify(event));
		// Should never happen...
	}
};

var eventCallback = function(event) {
	Ti.API.info('eventCallback:' + JSON.stringify(event));

	if (!event) {
		alert('Callback:\n\nInvalid callback');
		// Should never happen...
	} else if (event.mode == PushClient.MODE_FOREGROUND) {
		if (OS_ANDROID) {
			PushClient.showLocalNotification(event.data);
			// Force to show local notification
		}
		alert('Callback in Foreground:\n\n' + JSON.stringify(event.data));
		// Push data received with app in foreground
	} else if (event.mode == PushClient.MODE_CLICK) {
		alert('Callback from Click:\n\n' + JSON.stringify(event.data));
		// Push data received when user clicks in notification message
		if (Provider.confirmPushOpened && event.data && event.data.custom && JSON.parse(event.data.custom).i) {
			//Confirm click to OneSignal API
			Provider.confirmPushOpened(JSON.parse(event.data.custom).i, function(error, response) {
				if (error) {
					Ti.API.info('Provider API Track Error:\n\n' + JSON.stringify(response));
				} else {
					Ti.API.info('Provider API Track Success:\n\n' + JSON.stringify(response));
				}
			});
		}
	} else if (event.mode == PushClient.MODE_BACKGROUND) {
		// Requires set remote-notification UIBackgroundModes in tiapp.xml
		PushClient.endBackgroundHandler(event.data.handlerId);
		// Put the application back to sleep before any UI interations
		alert('Callback from Silent:\n\n' + JSON.stringify(event.data));
		// Push data received with app in background
	} else if (event.mode == PushClient.MODE_ACTION) {
		alert('Callback from Action:\n\n'+event.category+'\n'+event.identifier+'\n\n' + JSON.stringify(event.data));
		// Push data received when user choose an action from notification message
	} else {
		alert('Callback:\n\n' + JSON.stringify(event.data));
		// Should never happen...
	}
};

PushClient.addEventListener(PushClient.EVENT_SUCCESS, eventSuccess);
PushClient.addEventListener(PushClient.EVENT_ERROR, eventError);
PushClient.addEventListener(PushClient.EVENT_CALLBACK, eventCallback);

function register(e){
	Ti.API.info('registerPush...');
	PushClient.registerPush(registerOptions);
}

if (!Provider.sendMessage) {
	$.btnSend.visible = false;
}

function send(e){
	if ($.btnSend.title != 'Send Hello World!') {
		return;
	}

	Ti.API.info('sending message...');

	Provider.sendMessage('Hello World!', 5, function(error, response) {
		if (error) {
			Ti.API.info('Provider API Send Error:\n\n' + JSON.stringify(response));
		} else {
			Ti.API.info('Provider API Send Success:\n\n' + JSON.stringify(response));
		}
	});

	$.btnSend.title = 'Sending in 5s...';

	var counter = 4;
    var countDown = setInterval(function () {
    	if (counter < 0) {
			$.btnSend.title = 'Send Hello World!';
    		clearInterval(countDown);
    		return;
    	}
    	$.btnSend.title = 'Sending in '+counter+'s...';
        counter--;
    }, 1000);
    setTimeout(function(){
		$.btnSend.title = 'Send Hello World!';
		clearInterval(countDown);
    }, 5000);
}

function unregister(e){
	Ti.API.info('unregisterPush...');
	PushClient.unregisterPush();
}

Ti.API.info('registerPush...');
PushClient.registerPush(registerOptions);

$.index.open();
