<?php
$targetDir = "../assets/images/uploaded_tiles/"; // Diretório onde as imagens serão salvas
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true); // Cria o diretório se não existir
}

if ($_FILES["tileImage"]["error"] == UPLOAD_ERR_OK) {
    $fileName = basename($_FILES["tileImage"]["name"]);
    $targetFile = $targetDir . $fileName;

    // Move o arquivo carregado para o diretório de destino
    if (move_uploaded_file($_FILES["tileImage"]["tmp_name"], $targetFile)) {
        // Retorna o caminho acessível para o navegador
        echo json_encode(["status" => "success", "path" => "assets/images/uploaded_tiles/" . $fileName]);
    } else {
        echo json_encode(["status" => "error", "message" => "Falha ao mover o arquivo."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Erro no upload da imagem: " . $_FILES["tileImage"]["error"]]);
}
?>