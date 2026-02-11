<?php

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php';

header('Content-Type: text/html; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'POST') {
    http_response_code(405);
    echo 'Metoda niedozwolona.';
    exit;
}

$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo 'Uzupelnij wszystkie wymagane pola.';
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo 'Niepoprawny adres e-mail.';
    exit;
}

$maxBytes = 10 * 1024 * 1024;
$allowedExtensions = ['pdf', 'odt', 'docx', 'jpg', 'jpeg', 'png'];
$allowedMimes = [
    'application/pdf',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'application/octet-stream',
    'application/zip'
];

$attachment = $_FILES['attachment'] ?? null;
$attachPath = null;
$attachName = null;

if ($attachment && ($attachment['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
    if (($attachment['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo 'Nie udalo sie przeslac zalacznika.';
        exit;
    }

    $size = (int)($attachment['size'] ?? 0);
    if ($size <= 0 || $size > $maxBytes) {
        http_response_code(400);
        echo 'Zalacznik jest za duzy (limit 10MB).';
        exit;
    }

    $originalName = basename((string)($attachment['name'] ?? 'zalacznik'));
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions, true)) {
        http_response_code(400);
        echo 'Niedozwolony typ pliku.';
        exit;
    }

    $tmpPath = (string)($attachment['tmp_name'] ?? '');
    if (!is_uploaded_file($tmpPath)) {
        http_response_code(400);
        echo 'Nieprawidlowy plik zalacznika.';
        exit;
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmpPath) ?: 'application/octet-stream';
    if (!in_array($mime, $allowedMimes, true)) {
        http_response_code(400);
        echo 'Nieprawidlowy typ MIME zalacznika.';
        exit;
    }

    $attachPath = $tmpPath;
    $attachName = $originalName;
}

$smtpHost = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
$smtpUser = getenv('SMTP_USER') ?: '';
$smtpPass = getenv('SMTP_PASS') ?: '';
$smtpPort = (int)(getenv('SMTP_PORT') ?: 587);
$smtpFrom = getenv('SMTP_FROM') ?: $smtpUser;
$smtpTo = getenv('SMTP_TO') ?: $smtpUser;

if ($smtpUser === '' || $smtpPass === '' || $smtpTo === '') {
    http_response_code(500);
    echo 'Brak konfiguracji SMTP. Ustaw SMTP_USER, SMTP_PASS i SMTP_TO.';
    exit;
}

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $smtpHost;
    $mail->SMTPAuth = true;
    $mail->Username = $smtpUser;
    $mail->Password = $smtpPass;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $smtpPort;

    $mail->setFrom($smtpFrom, 'MDReDesign');
    $mail->addAddress($smtpTo);
    $mail->addReplyTo($email, $name);

    if ($attachPath && $attachName) {
        $mail->addAttachment($attachPath, $attachName);
    }

    $mail->isHTML(true);
    $mail->Subject = 'Nowe zapytanie ze strony MDReDesign';
    $safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
    $safeName = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $safeEmail = htmlspecialchars($email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

    $mail->Body = "<p><strong>Imie i nazwisko:</strong> {$safeName}</p>"
        . "<p><strong>Email:</strong> {$safeEmail}</p>"
        . "<p><strong>Wiadomosc:</strong><br>{$safeMessage}</p>";
    $mail->AltBody = "Imie i nazwisko: {$name}\nEmail: {$email}\n\nWiadomosc:\n{$message}";

    $mail->send();
} catch (Exception $exception) {
    http_response_code(500);
    echo 'Nie udalo sie wyslac wiadomosci. Sprobuj ponownie.';
    exit;
}

echo '<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8"><title>Wyslano</title></head><body>'
    . '<p>Dziekujemy! Wiadomosc zostala wyslana.</p>'
    . '<p><a href="index.html">Wroc na strone</a></p>'
    . '</body></html>';
