package com.zenith.taskfocus

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class ZenithTaskApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
    }
}
