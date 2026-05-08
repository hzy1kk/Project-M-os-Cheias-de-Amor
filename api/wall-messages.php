<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

const MAX_MESSAGES = 12;
const MAX_NAME_LENGTH = 40;
const MAX_MESSAGE_LENGTH = 140;

$storageDir = __DIR__ . '/data';
$storageFile = $storageDir . '/wall-messages.json';

$defaultMessages = [
    [
        'name' => 'Equipe Mãos Cheias',
        'message' => 'Toda doação organizada carrega respeito, cuidado e futuro.',
        'createdAt' => '2026-01-01T12:00:00.000Z'
    ],
    [
        'name' => 'Colégio Paulo de Tarso',
        'message' => 'Quando a comunidade se une, a solidariedade deixa de ser ideia e vira ação.',
        'createdAt' => '2026-01-01T12:01:00.000Z'
    ]
];

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function respond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function normalize_text(string $value, int $maxLength): string
{
    $value = trim(strip_tags($value));

    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength, 'UTF-8');
    }

    return substr($value, 0, $maxLength);
}

function normalize_messages(array $messages): array
{
    $normalized = [];

    foreach ($messages as $item) {
        if (!is_array($item)) {
            continue;
        }

        $name = normalize_text((string) ($item['name'] ?? ''), MAX_NAME_LENGTH);
        $message = normalize_text((string) ($item['message'] ?? ''), MAX_MESSAGE_LENGTH);
        $createdAt = normalize_text((string) ($item['createdAt'] ?? gmdate('c')), 40);

        if ($name === '' || $message === '') {
            continue;
        }

        $normalized[] = [
            'name' => $name,
            'message' => $message,
            'createdAt' => $createdAt
        ];
    }

    return array_slice($normalized, -MAX_MESSAGES);
}

function ensure_storage(string $storageDir, string $storageFile, array $defaultMessages): void
{
    if (!is_dir($storageDir) && !mkdir($storageDir, 0755, true) && !is_dir($storageDir)) {
        respond(500, ['error' => 'Não foi possível preparar o armazenamento do mural.']);
    }

    if (!file_exists($storageFile)) {
        file_put_contents($storageFile, json_encode($defaultMessages, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
    }
}

function read_messages(string $storageFile, array $defaultMessages): array
{
    $raw = file_get_contents($storageFile);
    $decoded = json_decode($raw ?: '[]', true);

    if (!is_array($decoded)) {
        return $defaultMessages;
    }

    return normalize_messages($decoded);
}

function write_messages(string $storageFile, array $messages): void
{
    $encoded = json_encode(normalize_messages($messages), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    if (file_put_contents($storageFile, $encoded, LOCK_EX) === false) {
        respond(500, ['error' => 'Não foi possível salvar a publicação no mural.']);
    }
}

ensure_storage($storageDir, $storageFile, $defaultMessages);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    respond(200, ['messages' => read_messages($storageFile, $defaultMessages)]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['error' => 'Método não permitido.']);
}

$payload = json_decode(file_get_contents('php://input') ?: '{}', true);

if (!is_array($payload)) {
    respond(400, ['error' => 'Envie uma publicação válida em JSON.']);
}

$name = normalize_text((string) ($payload['name'] ?? ''), MAX_NAME_LENGTH);
$message = normalize_text((string) ($payload['message'] ?? ''), MAX_MESSAGE_LENGTH);
$createdAt = normalize_text((string) ($payload['createdAt'] ?? gmdate('c')), 40);

if ($name === '' || $message === '') {
    respond(422, ['error' => 'Nome e mensagem são obrigatórios.']);
}

$messages = read_messages($storageFile, $defaultMessages);
$messages[] = [
    'name' => $name,
    'message' => $message,
    'createdAt' => $createdAt
];

write_messages($storageFile, $messages);
respond(201, ['messages' => read_messages($storageFile, $defaultMessages)]);
