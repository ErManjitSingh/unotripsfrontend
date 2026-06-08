<?php

use PHPMailer\PHPMailer\PHPMailer;

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
