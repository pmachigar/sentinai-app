import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final authProvider = StateNotifierProvider<AuthNotifier, bool>((ref) {
  return AuthNotifier();
});

class AuthNotifier extends StateNotifier<bool> {
  // Manejador seguro de claves (Keystore/Keychain)
  final _storage = const FlutterSecureStorage();

  AuthNotifier() : super(false) {
    _checkStatus();
  }

  Future<void> _checkStatus() async {
    final token = await _storage.read(key: 'jwt_token');
    if (token != null) {
      state = true;
    }
  }

  Future<void> login(String token) async {
    await _storage.write(key: 'jwt_token', value: token);
    state = true;
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
    state = false;
  }
}
