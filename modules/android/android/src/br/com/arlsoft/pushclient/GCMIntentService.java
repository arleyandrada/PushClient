package br.com.arlsoft.pushclient;

import java.util.HashMap;

import com.google.android.gms.gcm.GoogleCloudMessaging;

import android.app.IntentService;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.PowerManager;

import org.appcelerator.kroll.KrollRuntime;
import org.appcelerator.titanium.TiApplication;

/**
 * This {@code IntentService} does the actual handling of the GCM message.
 * {@code GCMBroadcastReceiver} (a {@code WakefulBroadcastReceiver}) holds a
 * partial wake lock for this service while the service does its work. When the
 * service is finished, it calls {@code completeWakefulIntent()} to release the
 * wake lock.
 */
public class GCMIntentService extends IntentService {

	// wakelock
	private static final String WAKELOCK_KEY = "GCM_LIB";
	private static PowerManager.WakeLock sWakeLock;

	// Java lock used to synchronize access to sWakelock
	private static final Object LOCK = GCMIntentService.class;

	@SuppressWarnings("unused")
	private static final String TAG = "GCMIntentService";

	/*
	 * public static final int NOTIFICATION_ID = 1; private NotificationManager
	 * mNotificationManager; NotificationCompat.Builder builder;
	 */

	public GCMIntentService() {
		super("GCMIntentService");
	}

	@Override
	protected void onHandleIntent(Intent intent) {
		try {
			Bundle extras = intent.getExtras();

			if (extras != null && !extras.isEmpty()) {
				GoogleCloudMessaging gcm = GoogleCloudMessaging.getInstance(this);

				HashMap data = PushclientModule.convertBundleToHashMap(intent.getExtras());
				HashMap dataGCM = new HashMap();
				data.put("gcm", dataGCM);

				// GoogleCloudMessaging.MESSAGE_TYPE_SEND_ERROR
				// GoogleCloudMessaging.MESSAGE_TYPE_DELETED
				// GoogleCloudMessaging.MESSAGE_TYPE_MESSAGE
				String messageType = gcm.getMessageType(intent);
				dataGCM.put("messageType", messageType);

				if (TiApplication.isCurrentActivityInForeground()) {
					PushclientModule.sendMessage(data, PushclientModule.MODE_FOREGROUND);
				} else {
					PushclientModule.sendNotification(extras);
					if (KrollRuntime.getInstance().getRuntimeState() != KrollRuntime.State.DISPOSED) {
						dataGCM.put("handlerId", 0);
						PushclientModule.sendMessage(data, PushclientModule.MODE_BACKGROUND);
					}
				}
			}
		} finally {
			// Release the power lock, so phone can get back to sleep.
			// The lock is reference-counted by default, so multiple
			// messages are ok.

			// If onMessage() needs to spawn a thread or do something else,
			// it should use its own lock.
			synchronized (LOCK) {
				// sanity check for null as this is a public method
				if (sWakeLock != null) {
					sWakeLock.release();
				}
			}
		}
	}

	public static void runIntentInService(Context context, Intent intent, ComponentName comp) {
		synchronized (LOCK) {
			if (sWakeLock == null) {
				// This is called from BroadcastReceiver, there is no init.
				PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
				sWakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, WAKELOCK_KEY);
			}
		}
		sWakeLock.acquire();
		intent.setComponent(comp);
		context.startService(intent);
	}
}
