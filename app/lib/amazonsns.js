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

var AWS = require("ti.aws");
var async = require('async');

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};

var getAttributeValue = function(endpointAttributes, getKey) {
	var ret = null;
	if (endpointAttributes && endpointAttributes.entry && endpointAttributes.entry.length) {
		for (var i = 0; i < endpointAttributes.entry.length; i++) {
			var key = endpointAttributes.entry[i].key;
			var value = endpointAttributes.entry[i].value;
			if (key == getKey) {
				endpointEnabled = value;
			}
		}
	}
	return ret;
};

var setAttributeValue = function(endpointAttributes, setKey, setValue) {
	endpointAttributes = endpointAttributes || {};
	endpointAttributes.entry = endpointAttributes.entry || [];
	var setKeyFound = false;
	for (var i = 0; i < endpointAttributes.entry.length; i++) {
		var key = endpointAttributes.entry[i].key;
		var value = endpointAttributes.entry[i].value;
		if (key == setKey) {
			endpointAttributes.entry[i].value = setValue;
			setKeyFound = true;
		}
	}
	if (!setKeyFound) {
		endpointAttributes.entry.push({key:setKey, value:setValue});
	}
	return endpointAttributes;
};

var registerDevice = function(registrationId, channels, cb) {

	var applicationARN = OS_ANDROID ? Alloy.CFG.AmazonAndroidARN : Alloy.CFG.AmazonIOSARN;
	var platformTopicARN = OS_ANDROID ? Alloy.CFG.AmazonSNSAndroidTopicARN : Alloy.CFG.AmazonSNSiOSTopicARN;

	//Initialize AWS
	AWS.authorize(Alloy.CFG.AmazonAccessKey, Alloy.CFG.AmazonSecretKey);
	AWS.setRegionEndpoint(Alloy.CFG.AmazonSNSRegion);

	//Initialize Channels (Topics)
	channels = channels || [];
	if (Alloy.CFG.AmazonSNSAllTopicARN && !channels.contains(Alloy.CFG.AmazonSNSAllTopicARN))
		channels.push(Alloy.CFG.AmazonSNSAllTopicARN);
	if (platformTopicARN && !channels.contains(platformTopicARN))
		channels.push(platformTopicARN);
	
	//Check previous Amazon SNS endpoint...
	var endpointArn = Ti.App.Properties.getString('AmazonSNS:endpointArn', '');
	if (endpointArn == '') {

		//Create new endpoint
		createPlatformEndpoint(applicationARN, registrationId, channels, cb);

	} else {

		//Check current endpoint attributes...
		AWS.SNS.getEndpointAttributes({
			EndpointArn : endpointArn
		}, function(data, response) {

			endpointAttributes = data.GetEndpointAttributesResult.Attributes;
			
			var endpointEnabled = getAttributeValue(endpointAttributes, "Enabled") == true;
			var endpointToken = getAttributeValue(endpointAttributes, "Token"); 

			if (!endpointEnabled || endpointToken != registrationId) {

				//Update endpoint attributes...
				AWS.SNS.setEndpointAttributes({
					'Attributes.entry.1.key' : 'Enabled',
					'Attributes.entry.1.value' : 'true',
					'Attributes.entry.2.key' : 'Token',
					'Attributes.entry.2.value' : registrationId,
					EndpointArn : endpointArn
				}, function(data, response) {

					//Endpoint OK and force topic subscriptions...
					subscribeTopics(endpointArn, channels, cb);

				}, function(message, error) {

					//Log and return error...
					var err = message || error.message || error.responseText;
				    Ti.API.info("Error setting endpoint attributes for " + endpointArn + " : " + err);
				    cb(true, error);
				});
			} else {

				//Endpoint OK and force topic subscriptions...
				subscribeTopics(endpointArn, channels, cb);
			}

		}, function(message, error) {
			
			if (error && error.Error && error.Error.Code == "NotFound") {

				//Create new endpoint if it does not exists
				createPlatformEndpoint(applicationARN, registrationId, channels, cb);

			} else {

				//Log and return error...
				var err = message || error.message || error.responseText;
			    Ti.API.info("Error getting endpoint attributes for " + endpointArn + " : " + err);
			    cb(true, error);
			}
		});
	}
};

var subscribeTopics = function(endpointArn, channels, cb) {
			
	if (channels && channels.length) {
		var subscribeQueue = async.queue(function(channel, callback) {
			AWS.SNS.subscribe({
				TopicArn : channel,
				Endpoint : endpointArn,
				Protocol : 'application'
			}, function(data, response) {
				callback(false, data, channel);
			}, function(message, error) {
				callback(message || error.message || error.responseText, error, channel);
			});
		}, 3);
		subscribeQueue.drain = function() {

			//Allways return success...
		    cb(false, endpointArn);
		};
		subscribeQueue.push(channels, function(err, data, channel) {

			if (err) {
				//Log error...
			    Ti.API.info("Error subscribing to topic " + channel + " : " + JSON.stringify(err));
			} else {
				//Save each topic subscription...
				var subscriptionArn = data.SubscribeResult.SubscriptionArn;
				Ti.App.Properties.setString(channel, subscriptionArn);
			}
		});
	} else {
		
		//No channels, return success...
		cb(false, endpointArn);
	}
};

var createPlatformEndpoint = function(applicationARN, registrationId, channels, cb) {

	AWS.SNS.createPlatformEndpoint({
		PlatformApplicationArn : applicationARN,
		Token : registrationId
	}, function(data, response) {
		
		//Save current endpoint...
		var endpointArn = data.CreatePlatformEndpointResult.EndpointArn;
		Ti.App.Properties.setString('AmazonSNS:endpointArn', endpointArn);
		
		//Force topic subscriptions...
		subscribeTopics(endpointArn, channels, cb);
		
	}, function(message, error) {

		//Log and return error...
		var err = message || error.message || error.responseText;
	    Ti.API.info("Error creating plataform endpoint to application " + applicationARN + " : " + err);
	    cb(true, error);
	});
};

exports.registerDevice = registerDevice; 