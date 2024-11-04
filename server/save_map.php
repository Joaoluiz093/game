<?php
$data = file_get_contents("php://input");

if (!empty($data)) {
    file_put_contents("map.json", $data);
    echo "Mapa salvo com sucesso!";
} else {
    echo "Erro: Dados vazios ou inválidos recebidos.";
}
?>