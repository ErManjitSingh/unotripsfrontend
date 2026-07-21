<?php
/**
 * Push a Meta landing / chatbot enquiry into UNO Trips CRM.
 * Never throws — email / thank-you flow must keep working even if CRM is down.
 */
function uno_crm_push_lead(array $payload): array
{
  try {
    $apiUrl = getenv('UNO_CRM_LEAD_API_URL') ?: 'https://app.unotrips.com/api/public/leads';
    $apiKey = getenv('UNO_CRM_LEAD_API_KEY') ?: 'unotrips-meta-lead-2026-secure';

    $landingPage = $payload['landingPage'] ?? ($payload['sourceLabel'] ?? ($payload['source'] ?? ''));
    $body = array_filter([
      'name' => $payload['name'] ?? '',
      'phone' => $payload['phone'] ?? '',
      'email' => $payload['email'] ?? '',
      'destination' => $payload['destination'] ?? '',
      'city' => $payload['city'] ?? '',
      // Website / Meta landers always store as DPW in CRM.
      'source' => 'DPW',
      'sourceLabel' => 'DPW',
      'landingPage' => $landingPage,
      'message' => $payload['message'] ?? '',
      'package' => $payload['package'] ?? ($payload['package-title'] ?? ''),
      'chat' => $payload['chat'] ?? null,
      'transcript' => $payload['transcript'] ?? null,
      'captureType' => $payload['captureType'] ?? 'form',
      'channel' => 'website',
      'travelDate' => $payload['travelDate'] ?? ($payload['travel_date'] ?? null),
      'travelers' => $payload['travelers'] ?? ($payload['travellers'] ?? null),
    ], static function ($v) {
      return $v !== null && $v !== '';
    });

    if (empty($body['phone'])) {
      return ['success' => false, 'message' => 'Missing phone'];
    }
    if (empty($body['destination'])) {
      $body['destination'] = 'Not specified';
    }

    $json = json_encode($body);
    $raw = null;
    $status = 0;

    if (function_exists('curl_init')) {
      $ch = curl_init($apiUrl);
      curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
          'Content-Type: application/json',
          'Accept: application/json',
          'X-Api-Key: ' . $apiKey,
        ],
        CURLOPT_POSTFIELDS => $json,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => true,
      ]);
      $raw = curl_exec($ch);
      $errno = curl_errno($ch);
      $error = curl_error($ch);
      $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);
      if ($errno) {
        error_log('[uno_crm_push_lead] curl error: ' . $error);
        return ['success' => false, 'message' => $error];
      }
    } else {
      $context = stream_context_create([
        'http' => [
          'method' => 'POST',
          'header' =>
            "Content-Type: application/json\r\n" .
            "Accept: application/json\r\n" .
            'X-Api-Key: ' . $apiKey . "\r\n" .
            'Content-Length: ' . strlen($json) . "\r\n",
          'content' => $json,
          'timeout' => 12,
          'ignore_errors' => true,
        ],
        'ssl' => [
          'verify_peer' => true,
          'verify_peer_name' => true,
        ],
      ]);
      $raw = @file_get_contents($apiUrl, false, $context);
      if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
        $status = (int) $m[1];
      }
      if ($raw === false) {
        error_log('[uno_crm_push_lead] file_get_contents failed for ' . $apiUrl);
        return ['success' => false, 'message' => 'CRM request failed (no curl extension)'];
      }
    }

    $decoded = json_decode((string) $raw, true);
    if ($status >= 200 && $status < 300) {
      return is_array($decoded) ? $decoded : ['success' => true];
    }

    error_log('[uno_crm_push_lead] HTTP ' . $status . ' ' . (string) $raw);
    return [
      'success' => false,
      'message' => is_array($decoded) ? ($decoded['message'] ?? 'CRM rejected lead') : 'CRM rejected lead',
      'status' => $status,
    ];
  } catch (Throwable $e) {
    error_log('[uno_crm_push_lead] ' . $e->getMessage());
    return ['success' => false, 'message' => $e->getMessage()];
  }
}
