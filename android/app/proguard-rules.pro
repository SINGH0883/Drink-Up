# Capacitor & Plugins ProGuard rules
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }
-keep interface com.getcapacitor.** { *; }
-keepattributes *Annotation*
-dontwarn com.getcapacitor.**
-dontwarn androidx.**
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
