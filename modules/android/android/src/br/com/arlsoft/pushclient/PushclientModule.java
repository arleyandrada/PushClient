package br.com.arlsoft.pushclient;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import org.appcelerator.kroll.KrollModule;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiApplication;
import org.appcelerator.kroll.common.Log;
import org.json.JSONException;
import org.json.JSONObject;
import org.appcelerator.titanium.util.TiUIHelper;
import org.appcelerator.titanium.io.TiFileFactory;
import org.appcelerator.titanium.io.TiBaseFile;
import org.appcelerator.titanium.util.TiColorHelper;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.gcm.GoogleCloudMessaging;

import android.app.Activity;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

@Kroll.module(name = "Pushclient", id = "br.com.arlsoft.pushclient")
public class PushclientModule extends KrollModule {
	private static final String TAG = "PushclientModule";
	private static final String PROPERTY_PREFIX = PushclientModule.class.getName();
	private static final String ModuleName = "Pushclient";
	private static final int PLAY_SERVICES_RESOLUTION_REQUEST = 9000;

	// Public Events Names
	@Kroll.constant
	public static final String EVENT_SUCCESS = "Pushclient_Success";
	@Kroll.constant
	public static final String EVENT_ERROR = "Pushclient_Error";
	@Kroll.constant
	public static final String EVENT_CALLBACK = "Pushclient_Callback";

	// Public Error Codes
	@Kroll.constant
	public static final int ERROR_SENDER_ID = 1;
	@Kroll.constant
	public static final int ERROR_NOT_SUPPORTED = 2;
	@Kroll.constant
	public static final int ERROR_REGISTER = 3;
	@Kroll.constant
	public static final int ERROR_UNREGISTER = 4;
	@Kroll.constant
	public static final int ERROR_PLAY_SERVICES = 5;

	// Public Callback Modes
	@Kroll.constant
	public static final int MODE_FOREGROUND = 1;
	@Kroll.constant
	public static final int MODE_CLICK = 2;
	@Kroll.constant
	public static final int MODE_BACKGROUND = 3;

	// Public Notification Types (iOS)
	@Kroll.constant
	public static final int NOTIFICATION_TYPE_BADGE = 1;
	@Kroll.constant
	public static final int NOTIFICATION_TYPE_ALERT = 2;
	@Kroll.constant
	public static final int NOTIFICATION_TYPE_SOUND = 3;
	@Kroll.constant
	public static final int NOTIFICATION_TYPE_NEWSSTAND = 3;

	// Property Names
	public static final String PROPERTY_REG_ID = PROPERTY_PREFIX + ".registrationId";
	private static final String PROPERTY_APP_VERSION = PROPERTY_PREFIX + ".appVersion";
	public static final String PROPERTY_NOTIFICATION_ID = PROPERTY_PREFIX + ".notificationId";
	public static final String PROPERTY_EXTRAS = PROPERTY_PREFIX + ".extras";

	private GoogleCloudMessaging gcm;

	private Activity activity;
	private Context context;

	private String senderId;
	private String registrationId;
	private Boolean recoverable;

	private static Boolean registered;

	public static boolean isLoaded() {
		return getModule() != null && registered;
	}

	public static boolean hasCallbackListeners() {
		PushclientModule module = getModule();
		return (module != null && module.hasListeners(EVENT_CALLBACK));
	}

	private static PushclientModule getModule() {
		TiApplication appContext = TiApplication.getInstance();
		PushclientModule module = (PushclientModule) appContext.getModuleByName(ModuleName);
		return module;
	}

	@Kroll.onAppCreate
	public static void onAppCreate(TiApplication app) {
		registered = false;
	}

	@Override
	public void onResume(Activity activity) {
		super.onResume(activity);

		// Wait for registerPush...
		if (registered) {
			if (senderId != null && !senderId.isEmpty()) {
				registrationId = getCurrentRegistrationId();
				if (registrationId == null || registrationId.isEmpty()) {
					checkGooglePlayServiceAndRegister();
				}
			}
		}
	}

	public PushclientModule() {
		super(ModuleName);
	}

	@Kroll.method
	public void endBackgroundHandler(Object handlerId) {
		// Do nothing...
	}

	@Kroll.method
	public void showLocalNotification(HashMap options) {
		try {
			JSONObject reader = new JSONObject(options);
			Bundle newExtras = new Bundle();
			for (int i = 0; i < reader.names().length(); i++) {
				String key = reader.names().getString(i);
				String value = reader.getString(key);
				newExtras.putString(key, value);
			}
			PushclientModule.sendNotification(newExtras);
		} catch (JSONException e) {
		}
	}

	@Kroll.method
	public void registerPush(HashMap options) {
		TiApplication appContext = TiApplication.getInstance();
		activity = appContext.getCurrentActivity();
		context = activity.getApplicationContext();

		senderId = (String) options.get("GCMSenderId");
		recoverable = (Boolean) false;
		// Disabled option to avoid problems with GCM resources
		// recoverable = (Boolean) options.get("GCMRecoverable");

		if (senderId.isEmpty()) {
			sendError(ERROR_SENDER_ID, "Undefined GCMSenderId");
		} else {
			checkGooglePlayServiceAndRegister();
		}

		checkForExtras();
		registered = true;
	}

	private void checkGooglePlayServiceAndRegister() {
		int resultCode = GooglePlayServicesUtil.isGooglePlayServicesAvailable(activity);
		if (resultCode == ConnectionResult.SUCCESS) {
			gcm = GoogleCloudMessaging.getInstance(activity);
			registrationId = getRegistrationId(context);
			if (registrationId.isEmpty()) {
				registerInBackground();
			} else {
				sendSuccess(registrationId);
			}
		} else {
			if (GooglePlayServicesUtil.isUserRecoverableError(resultCode)) {
				if (recoverable) {
					GooglePlayServicesUtil.getErrorDialog(resultCode, activity, PLAY_SERVICES_RESOLUTION_REQUEST).show();
				} else {
					sendError(ERROR_PLAY_SERVICES, GooglePlayServicesUtil.getErrorString(resultCode));
				}
			} else {
				sendError(ERROR_NOT_SUPPORTED, "This device is not supported");
			}
		}
	}

	private void registerInBackground() {
		new AsyncTask<Void, Void, String>() {
			@Override
			protected String doInBackground(Void... params) {
				String msg = "";
				try {
					if (gcm == null) {
						gcm = GoogleCloudMessaging.getInstance(context);
					}
					registrationId = gcm.register(senderId);
					TiApplication appContext = TiApplication.getInstance();
					appContext.getAppProperties().setString(PROPERTY_REG_ID, registrationId);
					sendSuccess(registrationId);
				} catch (IOException ex) {
					msg = ex.getMessage();
				}
				return msg;
			}

			@Override
			protected void onPostExecute(String msg) {
				if (!msg.isEmpty()) {
					sendError(ERROR_REGISTER, msg);
				}
			}
		}.execute(null, null, null);
	}

	@Kroll.method
	public void unregisterPush() {
		new AsyncTask<Void, Void, String>() {
			@Override
			protected String doInBackground(Void... params) {
				String msg = "";
				try {
					if (gcm == null) {
						gcm = GoogleCloudMessaging.getInstance(context);
					}
					gcm.unregister();
					registrationId = "";
					TiApplication appContext = TiApplication.getInstance();
					appContext.getAppProperties().removeProperty(PROPERTY_REG_ID);
				} catch (IOException ex) {
					msg = ex.getMessage();
				}
				return msg;
			}

			@Override
			protected void onPostExecute(String msg) {
				if (!msg.isEmpty()) {
					sendError(ERROR_UNREGISTER, msg);
				}
			}
		}.execute(null, null, null);
	}

	private void checkForExtras() {
		Activity activity = TiApplication.getAppRootOrCurrentActivity();
		if (activity != null) {
			Intent intent = activity.getIntent();
			if (intent != null) {
				Bundle extras = intent.getExtras();
				if (extras != null && !extras.isEmpty() && extras.containsKey(PROPERTY_EXTRAS)) {
					extras = extras.getBundle(PROPERTY_EXTRAS);
					HashMap data = PushclientModule.convertBundleToHashMap(extras);
					data.put("prev_state", "stopped");
					PushclientModule.sendMessage(data, PushclientModule.MODE_CLICK);
					intent.removeExtra(PROPERTY_EXTRAS);
				}
			}
		}
	}

	private String getRegistrationId(Context context) {
		String registrationId = getCurrentRegistrationId();

		TiApplication appContext = TiApplication.getInstance();
		int registeredVersion = appContext.getAppProperties().getInt(PROPERTY_APP_VERSION, Integer.MIN_VALUE);
		int currentVersion = getAppVersion(context);

		if (registeredVersion != currentVersion) {
			return "";
		}
		return registrationId;
	}

	private String getCurrentRegistrationId() {
		TiApplication appContext = TiApplication.getInstance();
		String registrationId = appContext.getAppProperties().getString(PROPERTY_REG_ID, "");

		if (registrationId.isEmpty()) {
			return "";
		}

		return registrationId;
	}

	private static int getAppVersion(Context context) {
		try {
			PackageInfo packageInfo = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
			return packageInfo.versionCode;
		} catch (NameNotFoundException e) {
			// should never happen
			throw new RuntimeException("Could not get package name: " + e);
		}
	}

	private static String getPathToApplicationAsset(String assetName) {
		// The url for an application asset can be created by resolving the
		// specified
		// path with the proxy context. This locates a resource relative to the
		// application resources folder
		PushclientModule module = getModule();
		if (module == null)
			return null;

		return module.resolveUrl(null, assetName);
	}

	private static Bitmap getBitmap(String url) {
		if (url == null)
			return null;

		Bitmap bitmap = null;

		if (url.startsWith("http://") || url.startsWith("https://")) {
			// from web
			if (bitmap == null) {
				bitmap = getBitmapFromURL(url);
			}

			// from web + random
			if (bitmap == null) {
				bitmap = getBitmapFromURL(url + "?" + java.util.UUID.randomUUID().toString());
			}

			if (bitmap == null) {
				Log.i(TAG, "Unable to find image from url : " + url);
			}
		} else {
			// from assets
			if (bitmap == null) {
				try {
					TiBaseFile file = TiFileFactory.createTitaniumFile(new String[] { getPathToApplicationAsset(url) }, false);
					bitmap = TiUIHelper.createBitmap(file.getInputStream());
				} catch (Exception ex) {
					Log.i(TAG, "Unable to find image [" + url + "] from assets.");
				}
			}
		}

		return bitmap;
	}

	private static Bitmap getBitmapFromURL(String strURL) {
		URL url = null;
		HttpURLConnection connection = null;
		InputStream input = null;
		Bitmap myBitmap = null;
		try {
			url = new URL(strURL);
			connection = (HttpURLConnection) url.openConnection();
			connection.setDoInput(true);
			connection.connect();
			input = connection.getInputStream();
			myBitmap = BitmapFactory.decodeStream(input);
			return myBitmap;
		} catch (Exception e) {
			return null;
		}
	}

	public static void sendSuccess(String registrationId) {
		PushclientModule module = getModule();

		if (module != null && module.hasListeners(EVENT_SUCCESS)) {
			HashMap data = new HashMap();
			data.put("code", 0);
			data.put("success", true);
			data.put("registrationId", registrationId);

			module.fireEvent(EVENT_SUCCESS, data);
		}
	}

	public static void sendError(int code, String message) {
		PushclientModule module = getModule();

		if (module != null && module.hasListeners(EVENT_ERROR)) {
			HashMap data = new HashMap();
			data.put("code", code);
			data.put("success", false);
			data.put("error", message);

			module.fireEvent(EVENT_ERROR, data);
		}
	}

	public static void sendMessage(HashMap messageData, int mode) {
		PushclientModule module = getModule();

		if (module != null && module.hasListeners(EVENT_CALLBACK)) {
			HashMap data = new HashMap();
			data.put("code", 0);
			data.put("success", true);
			data.put("data", messageData);
			data.put("mode", mode);

			module.fireEvent(EVENT_CALLBACK, data);
		}
	}

	public static void sendNotification(Bundle extras) {
		if (extras == null || extras.isEmpty())
			return;

		TiApplication appContext = TiApplication.getInstance();
		int appIconId = appContext.getResources().getIdentifier("appicon", "drawable", appContext.getPackageName());
		String appName = appContext.getAppInfo().getName();

		Bundle extrasRoot = extras;

		int badgeCount = -1;
		int notificationId = 0;
		String notificationTitle = null;
		String notificationText = null;
		String notificationTicker = null;
		Uri notificationSound = null;
		int notificationDefaults = 0;

		// TEXT
		if (extras.containsKey("text")) {
			notificationText = extras.getString("text");
		} else if (extras.containsKey("alert")) {
			notificationText = extras.getString("alert");
		} else if (extras.containsKey("message")) {
			notificationText = extras.getString("message");
		} else if (extras.containsKey("data")) {
			try {
				JSONObject reader = new JSONObject(extras.getString("data"));
				Bundle newExtras = new Bundle();
				for (int i = 0; i < reader.names().length(); i++) {
					String key = reader.names().getString(i);
					newExtras.putString(key, reader.getString(key));
				}
				if (newExtras.containsKey("text")) {
					notificationText = newExtras.getString("text");
					extras = newExtras;
				} else if (newExtras.containsKey("alert")) {
					notificationText = newExtras.getString("alert");
					extras = newExtras;
				} else if (newExtras.containsKey("message")) {
					notificationText = newExtras.getString("message");
					extras = newExtras;
				}
			} catch (JSONException e) {
				String text = extras.getString("data");
				if (text != null) {
					notificationText = text;
				}
			}
		} else if (extras.containsKey("msg")) {
			try {
				JSONObject reader = new JSONObject(extras.getString("msg"));
				Bundle newExtras = new Bundle();
				for (int i = 0; i < reader.names().length(); i++) {
					String key = reader.names().getString(i);
					newExtras.putString(key, reader.getString(key));
				}
				if (newExtras.containsKey("text")) {
					notificationText = newExtras.getString("text");
					extras = newExtras;
				} else if (newExtras.containsKey("alert")) {
					notificationText = newExtras.getString("alert");
					extras = newExtras;
				} else if (newExtras.containsKey("message")) {
					notificationText = newExtras.getString("message");
					extras = newExtras;
				}
			} catch (JSONException e) {
				String text = extras.getString("msg");
				if (text != null) {
					notificationText = text;
				}
			}
		} else if (extras.containsKey("default")) {
			try {
				JSONObject reader = new JSONObject(extras.getString("default"));
				Bundle newExtras = new Bundle();
				for (int i = 0; i < reader.names().length(); i++) {
					String key = reader.names().getString(i);
					newExtras.putString(key, reader.getString(key));
				}
				if (newExtras.containsKey("text")) {
					notificationText = newExtras.getString("text");
					extras = newExtras;
				} else if (newExtras.containsKey("alert")) {
					notificationText = newExtras.getString("alert");
					extras = newExtras;
				} else if (newExtras.containsKey("message")) {
					notificationText = newExtras.getString("message");
					extras = newExtras;
				}
			} catch (JSONException e) {
				String text = extras.getString("default");
				if (text != null) {
					notificationText = text;
				}
			}
		} else if (extras.containsKey("payload")) {
			try {
				JSONObject reader = new JSONObject(extras.getString("payload"));
				Bundle newExtras = new Bundle();
				for (int i = 0; i < reader.names().length(); i++) {
					String key = reader.names().getString(i);
					newExtras.putString(key, reader.getString(key));
				}
				if (newExtras.containsKey("text")) {
					notificationText = newExtras.getString("text");
					extras = newExtras;
				} else if (newExtras.containsKey("alert")) {
					notificationText = newExtras.getString("alert");
					extras = newExtras;
				} else if (newExtras.containsKey("message")) {
					notificationText = newExtras.getString("message");
					extras = newExtras;
				}
			} catch (JSONException e) {
				String text = extras.getString("payload");
				if (text != null) {
					notificationText = text;
				}
			}
		}

		// TITLE
		if (extras.containsKey("title")) {
			notificationTitle = extras.getString("title");
		} else {
			notificationTitle = appName;
		}

		// TICKER
		if (extras.containsKey("ticker")) {
			notificationTicker = extras.getString("ticker");
		} else {
			notificationTicker = notificationText;
		}

		// SOUND
		if (extras.containsKey("sound")) {
			if (extras.getString("sound").equalsIgnoreCase("default")) {
				notificationDefaults |= Notification.DEFAULT_SOUND;
			} else {
				File file = null;
				// getResourcesDirectory
				file = new File("app://" + extras.getString("sound"));
				if (file != null && file.exists()) {
					notificationSound = Uri.fromFile(file);
				} else {
					// getResourcesDirectory + sound folder
					file = new File("app://sound/" + extras.getString("sound"));
					if (file != null && file.exists()) {
						notificationSound = Uri.fromFile(file);
					} else {
						// getExternalStorageDirectory
						file = new File("appdata://" + extras.getString("sound"));
						if (file != null && file.exists()) {
							notificationSound = Uri.fromFile(file);
						} else {
							// getExternalStorageDirectory + sound folder
							file = new File("appdata://sound/" + extras.getString("sound"));
							if (file != null && file.exists()) {
								notificationSound = Uri.fromFile(file);
							} else {
								// res folder
								int soundId = appContext.getResources().getIdentifier(extras.getString("sound"), "raw", appContext.getPackageName());
								if (soundId != 0) {
									notificationSound = Uri.parse("android.resource://" + appContext.getPackageName() + "/raw/" + soundId);
								} else {
									// res folder without file extension
									String soundFile = extras.getString("sound").split("\\.")[0];
									soundId = appContext.getResources().getIdentifier(soundFile, "raw", appContext.getPackageName());
									if (soundId != 0) {
										notificationSound = Uri.parse("android.resource://" + appContext.getPackageName() + "/raw/" + soundId);
									}
								}
							}
						}
					}
				}
			}
		} else if (extrasRoot.containsKey("sound")) {
			if (extrasRoot.getString("sound").equalsIgnoreCase("default")) {
				notificationDefaults |= Notification.DEFAULT_SOUND;
			} else {
				File file = null;
				// getResourcesDirectory
				file = new File("app://" + extrasRoot.getString("sound"));
				if (file != null && file.exists()) {
					notificationSound = Uri.fromFile(file);
				} else {
					// getResourcesDirectory + sound folder
					file = new File("app://sound/" + extrasRoot.getString("sound"));
					if (file != null && file.exists()) {
						notificationSound = Uri.fromFile(file);
					} else {
						// getExternalStorageDirectory
						file = new File("appdata://" + extrasRoot.getString("sound"));
						if (file != null && file.exists()) {
							notificationSound = Uri.fromFile(file);
						} else {
							// getExternalStorageDirectory + sound folder
							file = new File("appdata://sound/" + extrasRoot.getString("sound"));
							if (file != null && file.exists()) {
								notificationSound = Uri.fromFile(file);
							} else {
								// res folder
								int soundId = appContext.getResources().getIdentifier(extrasRoot.getString("sound"), "raw", appContext.getPackageName());
								if (soundId != 0) {
									notificationSound = Uri.parse("android.resource://" + appContext.getPackageName() + "/raw/" + soundId);
								} else {
									// res folder without file extension
									String soundFile = extrasRoot.getString("sound").split("\\.")[0];
									soundId = appContext.getResources().getIdentifier(soundFile, "raw", appContext.getPackageName());
									if (soundId != 0) {
										notificationSound = Uri.parse("android.resource://" + appContext.getPackageName() + "/raw/" + soundId);
									}
								}
							}
						}
					}
				}
			}
		}

		// VIBRATE
		if (extras.containsKey("vibrate") && extras.getString("vibrate").equalsIgnoreCase("true")) {
			notificationDefaults |= Notification.DEFAULT_VIBRATE;
		}

		// LIGHTS
		if (extras.containsKey("lights") && extras.getString("lights").equalsIgnoreCase("true")) {
			notificationDefaults |= Notification.DEFAULT_LIGHTS;
		}

		// NOTIFICATION ID
		if (extras.containsKey("notificationId")) {
			try {
				notificationId = Integer.parseInt(extras.getString("notificationId"));
			} catch (NumberFormatException nfe) {
			}
		}
		if (notificationId == 0) {
			notificationId = appContext.getAppProperties().getInt(PROPERTY_NOTIFICATION_ID, 0);
			notificationId++;
			appContext.getAppProperties().setInt(PROPERTY_NOTIFICATION_ID, notificationId);
		}

		// BADGE
		if (extras.containsKey("badge")) {
			try {
				badgeCount = Integer.parseInt(extras.getString("badge"));
			} catch (NumberFormatException nfe) {
			}
		}

		// LARGE ICON
		Bitmap largeIcon = null;
		if (extras.containsKey("largeIcon")) {
			largeIcon = getBitmap(extras.getString("largeIcon"));
		} else if (extras.containsKey("licon")) {
			largeIcon = getBitmap(extras.getString("licon"));
		} else if (extrasRoot.containsKey("largeIcon")) {
			largeIcon = getBitmap(extrasRoot.getString("largeIcon"));
		} else if (extrasRoot.containsKey("licon")) {
			largeIcon = getBitmap(extrasRoot.getString("licon"));
		}

		// SMALL ICON
		if (extras.containsKey("smallIcon")) {
			appIconId = appContext.getResources().getIdentifier(extras.getString("smallIcon"), "drawable", appContext.getPackageName());
			if (appIconId == 0) {
				Log.i(TAG, "Unable to find resource identifier to custom smallIcon : " + extras.getString("smallIcon"));
			}
		} else if (extras.containsKey("sicon")) {
			appIconId = appContext.getResources().getIdentifier(extras.getString("sicon"), "drawable", appContext.getPackageName());
			if (appIconId == 0) {
				Log.i(TAG, "Unable to find resource identifier to custom sicon : " + extras.getString("sicon"));
			}
		} else if (extrasRoot.containsKey("smallIcon")) {
			appIconId = appContext.getResources().getIdentifier(extrasRoot.getString("smallIcon"), "drawable", appContext.getPackageName());
			if (appIconId == 0) {
				Log.i(TAG, "Unable to find resource identifier to custom smallIcon : " + extrasRoot.getString("smallIcon"));
			}
		} else if (extrasRoot.containsKey("sicon")) {
			appIconId = appContext.getResources().getIdentifier(extrasRoot.getString("sicon"), "drawable", appContext.getPackageName());
			if (appIconId == 0) {
				Log.i(TAG, "Unable to find resource identifier to custom smallIcon : " + extrasRoot.getString("sicon"));
			}
		}

		if (notificationText != null) {
			// Intent launch = getLauncherIntent(extras);
			Intent launch = new Intent(appContext, PendingNotificationActivity.class);
			launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
			if (extrasRoot != null && !extrasRoot.isEmpty()) {
				launch.putExtra(PROPERTY_EXTRAS, extrasRoot);
			}
			launch.setAction("dummy_unique_action_identifyer:" + notificationId);

			PendingIntent contentIntent = PendingIntent.getActivity(appContext, 0, launch, PendingIntent.FLAG_CANCEL_CURRENT);
			NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(appContext);

			mBuilder.setStyle(new NotificationCompat.BigTextStyle().bigText(notificationText));
			mBuilder.setContentText(notificationText);

			if (notificationTitle != null) {
				mBuilder.setContentTitle(notificationTitle);
			}
			if (notificationTicker != null) {
				mBuilder.setTicker(notificationTicker);
			}
			if (notificationDefaults != 0) {
				mBuilder.setDefaults(notificationDefaults);
			}
			if (notificationSound != null) {
				mBuilder.setSound(notificationSound);
			}
			if (badgeCount >= 0) {
				mBuilder.setNumber(badgeCount);
			}
			if (largeIcon != null) {
				mBuilder.setLargeIcon(largeIcon);
			}

			if (appIconId == 0) {
				appIconId = appContext.getResources().getIdentifier("appicon", "drawable", appContext.getPackageName());
			}

			mBuilder.setSmallIcon(appIconId);
			mBuilder.setContentIntent(contentIntent);
			mBuilder.setAutoCancel(true);
			mBuilder.setWhen(System.currentTimeMillis());

			// ledARGB, ledOnMS, ledOffMS
			boolean customLight = false;
			int argb = 0xFFFFFFFF;
			int onMs = 1000;
			int offMs = 2000;
			if (extras.containsKey("ledARGB")) {
				try {
					argb = TiColorHelper.parseColor(extras.getString("ledARGB"));
					customLight = true;
				} catch (Exception ex) {
					try {
						argb = Integer.parseInt(extras.getString("ledARGB"));
						customLight = true;
					} catch (NumberFormatException nfe) {
					}
				}
			} else if (extras.containsKey("ledc")) {
				try {
					argb = TiColorHelper.parseColor(extras.getString("ledc"));
					customLight = true;
				} catch (Exception ex) {
					try {
						argb = Integer.parseInt(extras.getString("ledc"));
						customLight = true;
					} catch (NumberFormatException nfe) {
					}
				}
			} else if (extrasRoot.containsKey("ledARGB")) {
				try {
					argb = TiColorHelper.parseColor(extrasRoot.getString("ledARGB"));
					customLight = true;
				} catch (Exception ex) {
					try {
						argb = Integer.parseInt(extrasRoot.getString("ledARGB"));
						customLight = true;
					} catch (NumberFormatException nfe) {
					}
				}
			} else if (extrasRoot.containsKey("ledc")) {
				try {
					argb = TiColorHelper.parseColor(extrasRoot.getString("ledc"));
					customLight = true;
				} catch (Exception ex) {
					try {
						argb = Integer.parseInt(extrasRoot.getString("ledc"));
						customLight = true;
					} catch (NumberFormatException nfe) {
					}
				}
			}
			if (extras.containsKey("ledOnMS")) {
				try {
					onMs = Integer.parseInt(extras.getString("ledOnMS"));
					customLight = true;
				} catch (NumberFormatException nfe) {
				}
			}
			if (extras.containsKey("ledOffMS")) {
				try {
					offMs = Integer.parseInt(extras.getString("ledOffMS"));
					customLight = true;
				} catch (NumberFormatException nfe) {
				}
			}
			if (customLight) {
				mBuilder.setLights(argb, onMs, offMs);
			}

			//Visibility
			if (extras.containsKey("visibility")) {
				try {
					mBuilder.setVisibility(Integer.parseInt(extras.getString("visibility")));
				} catch (NumberFormatException nfe) {
				}
			} else if (extras.containsKey("vis")) {
				try {
					mBuilder.setVisibility(Integer.parseInt(extras.getString("vis")));
				} catch (NumberFormatException nfe) {
				}
			} else if (extrasRoot.containsKey("visibility")) {
				try {
					mBuilder.setVisibility(Integer.parseInt(extrasRoot.getString("visibility")));
				} catch (NumberFormatException nfe) {
				}
			} else if (extrasRoot.containsKey("vis")) {
				try {
					mBuilder.setVisibility(Integer.parseInt(extrasRoot.getString("vis")));
				} catch (NumberFormatException nfe) {
				}
			} 
			
			//Icon background color
			int accent_argb = 0xFFFFFFFF;
			if (extras.containsKey("accentARGB")) {
				try {
					accent_argb = TiColorHelper.parseColor(extras.getString("accentARGB"));
					mBuilder.setColor(accent_argb);
				} catch (Exception ex) {
					try {
						accent_argb = Integer.parseInt(extras.getString("accentARGB"));
						mBuilder.setColor(accent_argb);
					} catch (NumberFormatException nfe) {
					}
				}
			} else if (extras.containsKey("bgac")) {
				try {
					accent_argb = TiColorHelper.parseColor(extras.getString("bgac"));
					mBuilder.setColor(accent_argb);
				} catch (Exception ex) {
					try {
						accent_argb = Integer.parseInt(extras.getString("bgac"));
						mBuilder.setColor(accent_argb);
					} catch (NumberFormatException nfe) {
					}
				}
			} else if (extrasRoot.containsKey("accentARGB")) {
				try {
					accent_argb = TiColorHelper.parseColor(extrasRoot.getString("accentARGB"));
					mBuilder.setColor(accent_argb);
				} catch (Exception ex) {
					try {
						accent_argb = Integer.parseInt(extrasRoot.getString("accentARGB"));
						mBuilder.setColor(accent_argb);
					} catch (NumberFormatException nfe) {
					}
				}
			} else if (extrasRoot.containsKey("bgac")) {
				try {
					accent_argb = TiColorHelper.parseColor(extrasRoot.getString("bgac"));
					mBuilder.setColor(accent_argb);
				} catch (Exception ex) {
					try {
						accent_argb = Integer.parseInt(extrasRoot.getString("bgac"));
						mBuilder.setColor(accent_argb);
					} catch (NumberFormatException nfe) {
					}
				}
			}
			

			NotificationManager nm = (NotificationManager) appContext.getSystemService(Context.NOTIFICATION_SERVICE);

			nm.notify(notificationId, mBuilder.build());
		}
	}

	public static Intent getLauncherIntent(Bundle extras) {
		TiApplication appContext = TiApplication.getInstance();
		PackageManager pm = appContext.getPackageManager();
		Intent launch = pm.getLaunchIntentForPackage(appContext.getPackageName());

		launch.addCategory(Intent.CATEGORY_LAUNCHER);
		launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

		if (extras != null && !extras.isEmpty()) {
			launch.putExtra(PROPERTY_EXTRAS, extras);
		}

		return launch;
	}

	public static HashMap convertBundleToHashMap(Bundle resource) {
		HashMap map = new HashMap();
		if (resource == null || resource.isEmpty())
			return map;
		for (String key : resource.keySet()) {
			map.put(key, resource.get(key));
		}
		return map;
	}
}
