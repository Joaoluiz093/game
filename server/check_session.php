<?php
session_start();
if (isset($_SESSION['username'])) {
    echo json_encode(['status' => 'logged_in', 'username' => $_SESSION['username']]);
} else {
    echo json_encode(['status' => 'not_logged_in']);
}
?>