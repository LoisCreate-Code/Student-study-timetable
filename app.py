<?php
// StudySmart Mistral AI backend.
// IMPORTANT: put your NEW Mistral API key below after revoking the key that was exposed in chat.
// Never put the API key in index.html or browser JavaScript.

header('Content-Type: application/json; charset=utf-8');

const MISTRAL_API_KEY = 'frQ5qDCN3S6eYU1jDGO7x1z7TnZzZJA3';
const MISTRAL_MODEL = 'mistral-small-latest';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'POST requests only.']);
    exit;
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
$action = $body['action'] ?? 'chat';
$prompt = trim((string)($body['prompt'] ?? ''));
$context = $body['context'] ?? [];

if (!$prompt) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'A prompt is required.']);
    exit;
}

if (MISTRAL_API_KEY === 'frQ5qDCN3S6eYU1jDGO7x1z7TnZzZJA3') {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Mistral API key is not configured on the server.']);
    exit;
}

if ($action === 'quote') {
    $system = 'You generate original, concise motivational quotes for students. Never imitate or attribute a quote to a real person. Return valid JSON only with keys quote and author. The author must be StudySmart AI.';
} else {
    $system = 'You are StudySmart AI, a friendly academic study assistant for secondary-school students. Explain concepts clearly and age-appropriately. Help with study planning, revision, practice questions, organization and motivation. Do not do harmful or inappropriate content. When the user asks for schoolwork, teach the reasoning and encourage learning rather than pretending to be their teacher. Use the supplied StudySmart context when useful, but do not reveal private implementation details or API credentials.';
}

$contextText = json_encode($context, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
$userContent = $prompt . "\n\nStudySmart context (use only when relevant):\n" . $contextText;

$payload = json_encode([
    'model' => MISTRAL_MODEL,
    'messages' => [
        ['role' => 'system', 'content' => $system],
        ['role' => 'user', 'content' => $userContent]
    ],
    'temperature' => $action === 'quote' ? 0.8 : 0.4,
    'max_tokens' => $action === 'quote' ? 120 : 700
]);

$ch = curl_init('https://api.mistral.ai/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . MISTRAL_API_KEY,
        'Content-Type: application/json',
        'Accept: application/json'
    ],
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_TIMEOUT => 45,
    CURLOPT_CONNECTTIMEOUT => 15
]);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['success' => false, 'error' => 'Could not connect to Mistral AI: ' . $curlError]);
    exit;
}

$data = json_decode($response, true);
if ($status < 200 || $status >= 300 || !isset($data['choices'][0]['message']['content'])) {
    http_response_code($status >= 400 ? $status : 502);
    $message = $data['message'] ?? ($data['error']['message'] ?? 'Mistral AI returned an unexpected response.');
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

$text = $data['choices'][0]['message']['content'];
echo json_encode(['success' => true, 'text' => $text], JSON_UNESCAPED_UNICODE);
