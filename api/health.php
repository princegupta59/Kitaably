<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query('SELECT 1 AS ok');

    echo json_encode([
        'success' => true,
        'message' => 'Kitaably database connection is working.'
    ]);
} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Database test failed.'
    ]);
}
