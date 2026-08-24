import 'package:flutter_test/flutter_test.dart';
import 'package:krishna_sanjeevani/core/network/api_response.dart';

void main() {
  group('ApiResponse Tests', () {
    test('ApiResponse.fromJson parses successful response with data correctly', () {
      final json = {
        'success': true,
        'message': 'Success',
        'data': {'userId': '123', 'name': 'Aditya'},
      };

      final response = ApiResponse.fromJson(
        json,
        (dataJson) => dataJson as Map<String, dynamic>,
      );

      expect(response.success, isTrue);
      expect(response.message, equals('Success'));
      expect(response.data, isNotNull);
      expect(response.data!['userId'], equals('123'));
      expect(response.errors, isNull);
    });

    test('ApiResponse.error creates structured error response', () {
      final response = ApiResponse<dynamic>.error('Network timeout', errorName: 'TimeoutError');

      expect(response.success, isFalse);
      expect(response.message, equals('Network timeout'));
      expect(response.errors, isNotNull);
      expect(response.errors!.length, equals(1));
      expect(response.errors!.first.name, equals('TimeoutError'));
    });
  });
}
