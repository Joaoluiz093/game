<?php
session_start();
include 'db.php';

header('Content-Type: application/json'); // Define o cabeçalho como JSON

// Verifica se o usuário está logado
if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'Usuário não logado']);
    exit;
}

$username = $_SESSION['username'];

// Consulta para buscar os valores de raridade para o usuário
$sql = "SELECT incomum, raro, mitico, epico, lendario, super_lendario FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $balance = $result->fetch_assoc();
    echo json_encode($balance); // Retorna os dados como JSON
} else {
    echo json_encode(['error' => 'Usuário não encontrado']);
}

// Fecha a conexão
$conn->close();
