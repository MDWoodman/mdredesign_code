<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

$catalogDir = __DIR__ . '/katalogi';

if (!is_dir($catalogDir)) {
    echo json_encode(['files' => []], JSON_UNESCAPED_UNICODE);
    exit;
}

$items = scandir($catalogDir);
if ($items === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Nie udalo sie odczytac katalogu.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$pdfFiles = [];
foreach ($items as $item) {
    if ($item === '.' || $item === '..') {
        continue;
    }

    $fullPath = $catalogDir . '/' . $item;
    if (!is_file($fullPath)) {
        continue;
    }

    $extension = strtolower((string)pathinfo($item, PATHINFO_EXTENSION));
    if ($extension !== 'pdf') {
        continue;
    }

    $pdfFiles[] = [
        'name' => $item,
        'url' => 'katalogi/' . rawurlencode($item),
    ];
}

usort(
    $pdfFiles,
    static function (array $a, array $b): int {
        return strnatcasecmp($a['name'], $b['name']);
    }
);

echo json_encode(['files' => $pdfFiles], JSON_UNESCAPED_UNICODE);
