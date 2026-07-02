<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/mail_smtp.php';

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

$subject = trim((string) ($input['_subject'] ?? $input['subject'] ?? 'Assam Lead'));
$source = trim((string) ($input['source'] ?? 'Assam Landing Page'));
$phone = trim((string) ($input['phone'] ?? ''));
$name = trim((string) ($input['name'] ?? ''));
$email = trim((string) ($input['email'] ?? ''));
$message = trim((string) ($input['message'] ?? ''));
$transcript = trim((string) ($input['transcript'] ?? ''));
$packageTitle = trim((string) ($input['package'] ?? $input['package-title'] ?? ''));

if ($phone === '' && $message === '' && $transcript === '') {
  http_response_code(422);
  echo json_encode(['success' => false, 'message' => 'Missing lead details']);
  exit;
}

$lines = ["New enquiry — {$source}"];
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

$mail = new PHPMailer(true);
try {
  uno_trips_smtp_configure($mail);
  $mail->setFrom('query@ptwhotels.com', 'Uno Trips');
  $mail->addAddress('unotripsit@gmail.com');
  $mail->addAddress('manjitsingh012345@gmail.com');
  $mail->Subject = $subject;
  $mail->Body = $body;

  $mail->send();
  echo json_encode(['success' => true, 'message' => 'Lead sent']);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
