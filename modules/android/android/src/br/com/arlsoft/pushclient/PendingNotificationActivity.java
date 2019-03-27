package br.com.arlsoft.pushclient;

import java.util.HashMap;

import org.appcelerator.kroll.KrollRuntime;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

public class PendingNotificationActivity extends Activity {

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		Intent intent = getIntent();
		Bundle extras = intent.getExtras();
		if (extras != null && !extras.isEmpty() && extras.containsKey(PushclientModule.PROPERTY_EXTRAS)) {
			extras = extras.getBundle(PushclientModule.PROPERTY_EXTRAS);

			if (PushclientModule.hasCallbackListeners() && KrollRuntime.getInstance().getRuntimeState() != KrollRuntime.State.DISPOSED) {
				// Fire notification received delegate
				HashMap data = PushclientModule.convertBundleToHashMap(extras);
				data.put("prev_state", "background");
				PushclientModule.sendMessage(data, PushclientModule.MODE_CLICK);
				intent.removeExtra(PushclientModule.PROPERTY_EXTRAS);

				// Put app in foreground
				Intent launcherIntent = PushclientModule.getLauncherIntent(null);
				startActivity(launcherIntent);
			} else {
				// Start app from main activity with extras
				Intent launcherIntent = PushclientModule.getLauncherIntent(extras);
				startActivity(launcherIntent);
			}
		}

		finish();
	}
}