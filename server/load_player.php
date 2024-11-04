<?php
include 'db.php';

if (isset($_GET['username'])) {
    $username = $_GET['username'];
    
    // Debug: registra o valor de $username para verificação
    error_log("Valor recebido de username: " . $username);
    
    $stmt = $conn->prepare("SELECT * FROM players WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode($result->fetch_assoc());
    } else {
        echo json_encode(null);
    }

    $stmt->close();
} else {
    echo json_encode(["error" => "Username not provided"]);
}

$conn->close();
?>