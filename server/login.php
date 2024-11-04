<?php
session_start();
include 'db.php';

if (isset($_POST['username']) && isset($_POST['password'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $query = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $query->bind_param("s", $username);
    $query->execute();
    $result = $query->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        // Verifica a senha
        if (password_verify($password, $user['password'])) {
            $_SESSION['username'] = $username; // Armazena o nome do usuário na sessão
            header("Location: ../index.html"); // Redireciona para o jogo
            exit();
        } else {
            echo "Senha incorreta!";
        }
    } else {
        echo "Usuário não encontrado!";
    }

    $query->close();
    $conn->close();
}
?>