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

var registerDevice = function(registrationId, tags, cb){
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
 
    tags = tags || {}; //Example: {"foo":"bar","this":"that"}
 
    var dt = new Date();
    var offset = dt.getTimezoneOffset();
    var tz = dt.toString();
    tz = tz.replace(/^.*\(/,"");
    tz = tz.replace(/\).*$/,"");
 	
    var params = {
    	'game_version': Titanium.App.version,
        'device_type' : (!OS_IOS) ? 1 : 0,
        'identifier' : registrationId,
        'tags' : tags,
        'app_id' : Alloy.CFG.OneSignalApplicationId,
        'device_os' : Titanium.Platform.version,
        'language' : Titanium.Platform.locale,
        'device_model' : Titanium.Platform.model,
        'timezone' : tz,
        'sdk' : Titanium.Platform.version
    };
    
    Ti.API.info('oneSignalRequest:' + JSON.stringify(params));
 
    // Register device token with OneSignal
    request.open('POST', Alloy.CFG.ParseRESTApiBaseUri + 'players', true);
    request.setRequestHeader('Authorization', "Basic " + Alloy.CFG.OnesignalRESTApiKey);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(params));
};

//PUSH RECEIVED
var confirmPushOpened = function(pushId, cb){
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
        	Titanium.API.error(JSON.stringify(e));
            cb(true, e.error);
        }
    });
 
    var params = {
        'app_id' :  Alloy.CFG.OneSignalApplicationId,
        'opened' : true
    };
    
    // Register device token with One Signal
    request.open('PUT', Alloy.CFG.ParseRESTApiBaseUri + 'notifications/' + pushId, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send(params);
};

exports.registerDevice = registerDevice;