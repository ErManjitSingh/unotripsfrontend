<?php

use PHPMailer\PHPMailer\PHPMailer;

/**
 * Shared Gmail SMTP settings for enquiry form (index.php) and chatbot (send_chat.php).
 */
function uno_trips_smtp_configure(PHPMailer $mail): void
{
  $mail->isSMTP();
  $mail->Host = 'smtp.gmail.com';
  $mail->SMTPAuth = true;
  $mail->Username = 'unotripsit@gmail.com';
  $mail->Password = 'srwg qxtj izrw kcmw';
  $mail->SMTPSecure = 'tls';
  $mail->Port = 587;
}
