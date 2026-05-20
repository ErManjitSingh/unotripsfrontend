<?php
declare(strict_types=1);

$backend = rtrim(getenv('HOTELS_API_URL') ?: 'https://unohotels-backend.onrender.com', '/');
$path = isset($_GET['path']) ? (string) $_GET['path'] : '';
$path = '/' . ltrim($path, '/');

$query = $_SERVER['QUERY_STRING'] ?? '';
if ($query !== '') {
    parse_str($query, $params);
    unset($params['path']);
    $extra = http_build_query($params);
    if ($extra !== '') {
        $path .= (str_contains($path, '?') ? '&' : '?') . $extra;
    }
}

$url = $backend . $path;
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$headers = ['Accept: application/json', 'Content-Type: application/json'];
$contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
if ($contentType !== '') {
    $headers = array_values(array_filter($headers, static fn(string $h): bool => !str_starts_with($h, 'Content-Type:')));
    $headers[] = 'Content-Type: ' . $contentType;
}
if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $headers[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
}

$body = file_get_contents('php://input');
if ($body === false) {
    $body = '';
}

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_POSTFIELDS => ($method === 'GET' || $method === 'HEAD' || $body === '') ? null : $body,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 60,
]);

$response = curl_exec($ch);
if ($response === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['message' => 'Hotels API proxy error', 'data' => null]);
    exit;
}

$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

$responseBody = substr($response, $headerSize);

http_response_code($status);
header('Content-Type: application/json; charset=utf-8');
echo $responseBody;