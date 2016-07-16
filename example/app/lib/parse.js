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

var registerDevice = function(registrationId, channels, cb) {
	var request = Titanium.Network.createHTTPClient({
		enableKeepAlive : false,
		onload : function(e) {
			try {
				var statusCode = request.status;
				var response = JSON.parse(request.responseText);
				if (statusCode == 200 || statusCode == 201) {
					cb(false, response);
				} else {
					cb(true, response);
				}
			} catch (ex) {
				cb(true, response);
			}
		},
		onerror : function(e) {
			cb(true, e.error);
		}
	});

	channels = channels || [];

	var installationId = Ti.App.Properties.getString('Parse:installationId', '');
	if (installationId == '') {
		installationId = Titanium.Platform.createUUID();
		Ti.App.Properties.setString('Parse:installationId', installationId);
	}

	var params = {
			'deviceType' : (OS_ANDROID) ? 'android' : 'ios',
			'deviceToken' : registrationId,
			'installationId' : installationId,
			'channels' : channels
		};

	if (OS_ANDROID) {
		params['pushType'] = 'gcm';
	}

	// Other unused parse params...
	// https://www.parse.com/docs/push_guide#setup/Android
	// https://www.parse.com/docs/push_guide#installations/iOS
	//
	// badge: The current value of the icon badge for iOS apps. Changes to this
	// value on the server will be used for future badge-increment push
	// notifications.
	// timeZone: The current time zone where the target device is located.
	// appName: The display name of the client application to which this
	// installation belongs.
	// appVersion: The version string of the client application to which this
	// installation belongs.
	// parseVersion: The version of the Parse SDK which this installation uses.
	// appIdentifier: A unique identifier for this installation's client
	// application. This parameter is not supported in Android.

	Ti.API.info('parseRequest:' + JSON.stringify(params));

	// Register device token with Parse
	request.open('POST', Alloy.CFG.ParseRESTApiBaseUri + 'installations', true);
	request.setRequestHeader('X-Parse-Application-Id', Alloy.CFG.ParseApplicationId);
	request.setRequestHeader('X-Parse-REST-API-Key', Alloy.CFG.ParseRESTApiKey);
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(JSON.stringify(params));
};

exports.registerDevice = registerDevice;