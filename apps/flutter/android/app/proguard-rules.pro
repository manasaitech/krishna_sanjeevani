# Flutter ProGuard & R8 Rules for Krishna Sanjeevani

# Keep Flutter engine classes
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.embedding.** { *; }

# Suppress missing Play Core deferred components warnings in R8
-dontwarn com.google.android.play.core.**
-keep class io.flutter.embedding.engine.deferredcomponents.** { *; }

# Keep Audio Service & Just Audio classes
-keep class com.ryanheise.audioservice.** { *; }
-keep class com.ryanheise.just_audio.** { *; }

# Keep Secure Storage classes
-keep class com.it_roots.flutter_secure_storage.** { *; }

# Keep Google Sign-In & Credential Manager classes
-keep class com.google.android.gms.auth.api.signin.** { *; }
-keep class androidx.credentials.** { *; }

# Keep Razorpay SDK classes
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**
