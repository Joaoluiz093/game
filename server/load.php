<?php
include 'db.php';

if (isset($_GET['username'])) {
    $username = $_GET['username'];
    $sql = "SELECT * FROM players WHERE username = '$username'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        echo json_encode($result->fetch_assoc());
    } else {
        echo json_encode(null);
    }
}

$conn->close();
?>