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
                	if (response && response.success && response.id) {
						Ti.App.Properties.setString('OneSignal.Player.Id', response.id);
                	}
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
    	'test_type': 1, 							//Remove for production environment
        'device_type' : (!OS_IOS) ? 1 : 0,
        'identifier' : registrationId,
        'tags' : tags,
        'app_id' : Alloy.CFG.OneSignalApplicationId,
        'device_os' : Titanium.Platform.version,
        'language' : Titanium.Platform.locale,
        'device_model' : Titanium.Platform.model,
        'timezone' : tz,
        'notification_types' : "1",                                            // forces user to register in push notification
        'sdk' : Titanium.Platform.version
    };
    
    Ti.API.info('oneSignalRequest:' + JSON.stringify(params));
 
    // Register device token with OneSignal
    request.open('POST', Alloy.CFG.OneSignalRESTApiBaseUri + 'players', true);
    request.setRequestHeader('Authorization', "Basic " + Alloy.CFG.OnesignalRESTApiKey);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(params));
};

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
    
    Ti.API.info('oneSignalRequest:' + JSON.stringify(params));

    request.open('PUT', Alloy.CFG.OneSignalRESTApiBaseUri + 'notifications/' + pushId, true);
    request.setRequestHeader('Authorization', "Basic " + Alloy.CFG.OnesignalRESTApiKey);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(params));
};

var sendMessage = function(message, delay, cb){
	var playerId = Ti.App.Properties.getString('OneSignal.Player.Id', false);
	if (!playerId) {
		alert('Please first register your device');
		return;
	}
	
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
        'contents' : {'en': message},
        'include_player_ids' : [playerId],
        'content_available' : 1,
        '' : new Date().toString()
    };

	if (delay) {
	 	var t = new Date();
		t.setSeconds(t.getSeconds() + delay);
		params['send_after'] = t.toString();
	} 
   
    Ti.API.info('oneSignalRequest:' + JSON.stringify(params));

    request.open('POST', Alloy.CFG.OneSignalRESTApiBaseUri + 'notifications', true);
    request.setRequestHeader('Authorization', "Basic " + Alloy.CFG.OnesignalRESTApiKey);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(params));
};

var logout = function(cb){
    var playerId = Ti.App.Properties.getString('OneSignal.Player.Id', false);
    if (!playerId) {
        alert('Please first register your device');
        return;
    }

    var client = Ti.Network.createHTTPClient({
        // function called when the response data is available
        onload : function(e) {
            Ti.API.info("Received text: " + this.responseText);
            var finalResp = {};
            _.each(_.keys(JSON.parse(this.responseText).tags),function(value){
                finalResp[value] = "";
            });

            var request = Titanium.Network.createHTTPClient({
                enableKeepAlive : false,
                onload : function(e) {
                    try {
                        var statusCode = request.status;
                        var response = JSON.parse(request.responseText);
                        if (statusCode == 200 || statusCode == 201) {
                            Ti.App.Properties.setString('OneSignal.Player.Id', null);
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
                tags : finalResp,
                notification_types : "-2" // opts out from recieving notification
            };
            
            Ti.API.info('oneSignalRequest:' + JSON.stringify(params));

            request.open('PUT', Alloy.CFG.OneSignalRESTApiBaseUri + 'players/' + playerId, true);
            request.setRequestHeader('Authorization', "Basic " + Alloy.CFG.OnesignalRESTApiKey);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(params));
            cb(false, this.responseText);
        },
        // function called when an error occurs, including a timeout
        onerror : function(e) {
            Ti.API.debug(e.error);
            cb(true, e.error);
        },
        timeout : 5000  // in milliseconds
    });
    client.open("GET",  Alloy.CFG.OneSignalRESTApiBaseUri + 'players/'+playerId+'?app_id='+ Alloy.CFG.OneSignalApplicationId);
    client.send();
};

exports.registerDevice = registerDevice;
exports.confirmPushOpened = confirmPushOpened;
exports.sendMessage = sendMessage;
exports.logout = logout;
