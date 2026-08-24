import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/env_config.dart';

class SecureStorageService {
  final FlutterSecureStorage _storage;

  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(
                encryptedSharedPreferences: true,
                resetOnError: true,
              ),
              iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
            );

  String? _accessToken;
  String? _refreshToken;

  Future<void> init() async {
    try {
      _accessToken = await _storage.read(key: EnvConfig.accessTokenKey);
      _refreshToken = await _storage.read(key: EnvConfig.refreshTokenKey);
    } catch (_) {
      try {
        await _storage.deleteAll();
      } catch (_) {}
      _accessToken = null;
      _refreshToken = null;
    }
  }

  String? get accessToken => _accessToken;
  String? get refreshToken => _refreshToken;

  Future<void> storeTokens({required String accessToken, required String refreshToken}) async {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    try {
      await _storage.write(key: EnvConfig.accessTokenKey, value: accessToken);
      await _storage.write(key: EnvConfig.refreshTokenKey, value: refreshToken);
    } catch (_) {}
  }

  Future<void> clearTokens() async {
    _accessToken = null;
    _refreshToken = null;
    try {
      await _storage.delete(key: EnvConfig.accessTokenKey);
      await _storage.delete(key: EnvConfig.refreshTokenKey);
    } catch (_) {}
  }
}
