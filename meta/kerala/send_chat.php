<?php
/**
 * Receives chatbot transcript and emails it to site owner.
 * Called via POST with: chat (JSON string or array), user_email (optional), user_name (optional)
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';
require_once __DIR__ . '/mail_smtp.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['success' => false, 'message' => 'Invalid request']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$chat = $input['chat'] ?? '';
$userEmail = isset($input['user_email']) ? trim($input['user_email']) : '';
$userName = isset($input['user_name']) ? trim($input['user_name']) : '';
$userPhone = isset($input['user_phone']) ? trim($input['user_phone']) : '';

if (empty($chat)) {
  echo json_encode(['success' => false, 'message' => 'No chat data']);
  exit;
}

// Parse chat lines
$lines = [];
if (is_string($chat)) {
  $decoded = json_decode($chat, true);
  $lines = is_array($decoded) ? $decoded : [];
} else {
  $lines = (array)$chat;
}

// Plain text version (fallback)
$plainBody = "Chatbot conversation – Kerala Tour\n\n";
if ($userPhone) {
  $plainBody .= "Contact: " . $userPhone . "\n";
}
if ($userName) {
  $plainBody .= "Name: " . $userName . "\n";
}
if ($userEmail) {
  $plainBody .= "Email: " . $userEmail . "\n";
}
if ($userName || $userEmail || $userPhone) {
  $plainBody .= "\n";
}
foreach ($lines as $row) {
  $who = isset($row['who']) ? $row['who'] : '?';
  $text = isset($row['text']) ? $row['text'] : '';
  $plainBody .= ($who === 'bot' ? 'Bot: ' : 'User: ') . $text . "\n";
}
$plainBody .= "\n--- Sent from Kerala Tour chatbot (Uno Trips)";

// HTML formatted email
$htmlBody = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f5f5f5;">';
$htmlBody .= '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding:20px 0;">';
$htmlBody .= '<tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">';

// Header
$htmlBody .= '<tr><td style="background:#075e54; color:#fff; padding:16px 24px; font-size:18px; font-weight:bold;">Kerala Tour – Chatbot Lead</td></tr>';

// Contact details box
if ($userPhone || $userName || $userEmail) {
  $htmlBody .= '<tr><td style="padding:20px 24px; background:#f0f9ff; border-bottom:1px solid #e5e7eb;">';
  $htmlBody .= '<table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px; color:#1e293b;">';
  if ($userPhone) {
    $htmlBody .= '<tr><td style="color:#64748b; width:100px;">Mobile</td><td style="font-weight:600;">' . htmlspecialchars($userPhone) . '</td></tr>';
  }
  if ($userName) {
    $htmlBody .= '<tr><td style="color:#64748b;">Name</td><td style="font-weight:600;">' . htmlspecialchars($userName) . '</td></tr>';
  }
  if ($userEmail) {
    $htmlBody .= '<tr><td style="color:#64748b;">Email</td><td style="font-weight:600;">' . htmlspecialchars($userEmail) . '</td></tr>';
  }
  $htmlBody .= '</table></td></tr>';
}

// Conversation
$htmlBody .= '<tr><td style="padding:20px 24px;"><p style="margin:0 0 12px 0; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Conversation</p>';

foreach ($lines as $row) {
  $who = isset($row['who']) ? $row['who'] : '?';
  $text = isset($row['text']) ? $row['text'] : '';
  $safeText = nl2br(htmlspecialchars($text));
  if ($who === 'bot') {
    $htmlBody .= '<div style="margin-bottom:12px; max-width:85%;"><p style="margin:0 0 4px 0; font-size:11px; color:#075e54; font-weight:600;">Bot</p><div style="background:#f1f5f9; padding:12px 14px; border-radius:8px; border-top-left-radius:2px; font-size:14px; line-height:1.5; color:#1e293b;">' . $safeText . '</div></div>';
  } else {
    $htmlBody .= '<div style="margin-bottom:12px; max-width:85%; margin-left:auto; text-align:right;"><p style="margin:0 0 4px 0; font-size:11px; color:#0f766e; font-weight:600;">User</p><div style="background:#dcf8c6; padding:12px 14px; border-radius:8px; border-top-right-radius:2px; font-size:14px; line-height:1.5; color:#1e293b;">' . $safeText . '</div></div>';
  }
}

$htmlBody .= '</td></tr>';
$htmlBody .= '<tr><td style="padding:12px 24px; font-size:11px; color:#94a3b8; border-top:1px solid #e5e7eb;">Sent from Kerala Tour chatbot (Uno Trips)</td></tr>';
$htmlBody .= '</table></td></tr></table></body></html>';

$mail = new PHPMailer(true);
try {
  uno_trips_smtp_configure($mail);
  $mail->setFrom('query@ptwhotels.com', 'Uno Trips');
  $mail->isHTML(true);
  $mail->CharSet = 'UTF-8';

  $mail->addAddress('unotripsit@gmail.com');
  $mail->addAddress('manjitsingh012345@gmail.com');
  $mail->Subject = 'Chatbot conversation - Kerala Tour';
  $mail->Body = $htmlBody;
  $mail->AltBody = $plainBody;

  $mail->send();
  echo json_encode(['success' => true, 'message' => 'Chat sent']);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
