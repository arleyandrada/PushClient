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
		if (extras != null && !extras.isEmpty() && extras.containsKey(PushClientModule.PROPERTY_EXTRAS)) {
			extras = extras.getBundle(PushClientModule.PROPERTY_EXTRAS);

			if (PushClientModule.hasCallbackListeners() && KrollRuntime.getInstance().getRuntimeState() != KrollRuntime.State.DISPOSED) {
				// Fire notification received delegate
				HashMap data = PushClientModule.convertBundleToHashMap(extras);
				data.put("prev_state", "background");
				PushClientModule.sendMessage(data, PushClientModule.MODE_CLICK);
				intent.removeExtra(PushClientModule.PROPERTY_EXTRAS);

				// Put app in foreground
				Intent launcherIntent = PushClientModule.getLauncherIntent(null);
				startActivity(launcherIntent);
			} else {
				// Start app from main activity with extras
				Intent launcherIntent = PushClientModule.getLauncherIntent(extras);
				startActivity(launcherIntent);
			}
		}

		finish();
	}
}