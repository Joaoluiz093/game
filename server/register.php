<?php
include 'db.php';

if (isset($_POST['username']) && isset($_POST['password'])) {
    $username = $_POST['username'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT); // Criptografa a senha

    // Verifica se o nome de usuário já existe
    $checkQuery = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $checkQuery->bind_param("s", $username);
    $checkQuery->execute();
    $result = $checkQuery->get_result();

    if ($result->num_rows > 0) {
        echo "Nome de usuário já existe!";
    } else {
        $query = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $query->bind_param("ss", $username, $password);

        if ($query->execute()) {
            echo "Cadastro realizado com sucesso!";
        } else {
            echo "Erro ao cadastrar usuário.";
        }
    }

    $checkQuery->close();
    $query->close();
    $conn->close();
}
?>