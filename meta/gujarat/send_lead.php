<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/mail_smtp.php';
require_once __DIR__ . '/crm_lead_push.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Method not allowed']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
  $input = $_POST;
}

$DEFAULT_DESTINATION = getenv('UNO_META_DESTINATION') ?: 'Gujarat';
$subject = trim((string) ($input['_subject'] ?? $input['subject'] ?? 'Gujarat Lead'));
$source = trim((string) ($input['source'] ?? 'Gujarat Landing Page'));
$phone = trim((string) ($input['phone'] ?? ''));
$name = trim((string) ($input['name'] ?? ''));
$email = trim((string) ($input['email'] ?? ''));
$message = trim((string) ($input['message'] ?? ''));
$transcript = trim((string) ($input['transcript'] ?? ''));
$packageTitle = trim((string) ($input['package'] ?? $input['package-title'] ?? ''));
$destination = trim((string) ($input['destination'] ?? $input['destinationy'] ?? $DEFAULT_DESTINATION));

if ($phone === '' && $message === '' && $transcript === '') {
  http_response_code(422);
  echo json_encode(['success' => false, 'message' => 'Missing lead details']);
  exit;
}

$crmOk = false;
if ($phone !== '') {
  $crmResult = uno_crm_push_lead([
    'name' => $name !== '' ? $name : ('Gujarat Lead'),
    'phone' => $phone,
    'email' => $email,
    'destination' => $destination !== '' ? $destination : 'Gujarat',
    'source' => 'DPW',
    'sourceLabel' => 'DPW',
    'landingPage' => $source,
    'message' => $message,
    'package' => $packageTitle,
    'transcript' => $transcript,
    'captureType' => $transcript !== '' ? 'chatbot' : 'form',
    'channel' => 'website',
  ]);
  $crmOk = !empty($crmResult['success']);
}

$lines = ["New enquiry — {$source}"];
if ($destination !== '') {
  $lines[] = 'Destination: ' . $destination;
}
if ($packageTitle !== '') {
  $lines[] = 'Package: ' . $packageTitle;
}
if ($name !== '') {
  $lines[] = 'Name: ' . $name;
}
if ($phone !== '') {
  $lines[] = 'Phone: ' . $phone;
}
if ($email !== '') {
  $lines[] = 'Email: ' . $email;
}
if ($message !== '') {
  $lines[] = '';
  $lines[] = $message;
}
if ($transcript !== '') {
  $lines[] = '';
  $lines[] = 'Conversation:';
  $lines[] = $transcript;
}
$body = implode("\n", $lines);

$mailOk = false;
try {
  $mail = new PHPMailer(true);
  uno_trips_smtp_configure($mail);
  $mail->setFrom('query@ptwhotels.com', 'Uno Trips');
  $mail->addAddress('unotripsit@gmail.com');
  $mail->addAddress('manjitsingh012345@gmail.com');
  $mail->Subject = $subject;
  $mail->Body = $body;
  $mail->send();
  $mailOk = true;
} catch (Exception $e) {
  error_log('[send_lead] mail failed: ' . $e->getMessage());
}

if ($crmOk || $mailOk) {
  echo json_encode([
    'success' => true,
    'message' => 'Lead sent',
    'crm' => $crmOk,
    'email' => $mailOk,
  ]);
  exit;
}

http_response_code(500);
echo json_encode(['success' => false, 'message' => 'Could not save lead. Please call us.']);
