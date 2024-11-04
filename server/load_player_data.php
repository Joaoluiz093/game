<?php
header('Content-Type: application/json');

// Conexão com o banco de dados
$mysqli = new mysqli("localhost", "root", "", "game");

if ($mysqli->connect_error) {
    echo json_encode(["error" => "Erro de conexão com o banco de dados"]);
    exit();
}

// Obtém o nome de usuário da URL
$username = $mysqli->real_escape_string($_GET['username']);

// Consulta SQL para obter os dados do personagem
$query = "SELECT p.vida, p.ataque, p.defesa, p.velocidade, p.raridade
          FROM personagens p
          INNER JOIN users u ON u.id = p.id
          WHERE u.username = '$username' LIMIT 1";

$result = $mysqli->query($query);

if ($result && $result->num_rows > 0) {
    $data = $result->fetch_assoc();
    echo json_encode($data);
} else {
    echo json_encode(["error" => "Usuário não encontrado"]);
}

$mysqli->close();
?>
