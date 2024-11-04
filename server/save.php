<?php
include 'db.php';

if (isset($_POST['username'], $_POST['pos_x'], $_POST['pos_y'], $_POST['health'], $_POST['level'], $_POST['experience'])) {
    $username = $_POST['username'];
    $pos_x = $_POST['pos_x'];
    $pos_y = $_POST['pos_y'];
    $health = $_POST['health'];
    $level = $_POST['level'];
    $experience = $_POST['experience'];

    $sql = "UPDATE players SET pos_x = $pos_x, pos_y = $pos_y, health = $health, level = $level, experience = $experience WHERE username = '$username'";
    $conn->query($sql);
}

$conn->close();
?>