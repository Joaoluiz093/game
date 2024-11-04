const mapCanvas = document.getElementById("mapCanvas");
const mapCtx = mapCanvas.getContext("2d");

const paletteCanvas = document.getElementById("paletteCanvas");
const paletteCtx = paletteCanvas.getContext("2d");

const tileSize = 50;
mapCanvas.width = 800;
mapCanvas.height = 600;

let selectedTile = null;
let currentNPCType = null;
const paletteTiles = [];
const layers = { ground: [], mask: [], fringe: [] };
const map = [];
const npcs = [];
let currentLayer = "ground";
let currentTool = "paint";

// Função para inicializar camadas e mapa com arrays bidimensionais
function initializeMapLayers() {
    const width = mapCanvas.width / tileSize;
    const height = mapCanvas.height / tileSize;

    // Inicializa cada camada com uma estrutura bidimensional preenchida com null
    layers.ground = Array.from({ length: height }, () => Array(width).fill(null));
    layers.mask = Array.from({ length: height }, () => Array(width).fill(null));
    layers.fringe = Array.from({ length: height }, () => Array(width).fill(null));

    // Inicializa o mapa de bloqueios
    for (let y = 0; y < height; y++) {
        map[y] = [];
        for (let x = 0; x < width; x++) {
            map[y][x] = { blocked: false };
        }
    }
}

// Função para alternar o menu de seleção de NPCs
function toggleNPCMenu() {
    const npcMenu = document.getElementById("npcMenu");
    npcMenu.style.display = npcMenu.style.display === "none" ? "block" : "none";
}

// Função para definir o tipo de NPC selecionado e configurar a ferramenta
function selectNPCType() {
    const npcType = document.getElementById("npcType").value;
    if (npcType) {
        const npcTile = paletteTiles.find(tile => tile.type === npcType);
        if (npcTile) {
            addNPC(npcType, npcTile.image); // Configura o NPC para ser adicionado
        }
    }
}

// Função para configurar a ferramenta de adicionar NPC com o tipo e imagem
function addNPC(type, image) {
    currentTool = "addNPC";
    currentNPCType = type;
    selectedTile = image;
    console.log("Adicionando NPC do tipo:", type);
}

// Função para definir a camada ativa (ground ou mask)
function setCurrentLayer(layer) {
    currentLayer = layer;
    console.log("Camada selecionada:", currentLayer);
}

// Função para definir a ferramenta atual
function setCurrentTool(tool) {
    currentTool = tool;
    console.log("Ferramenta selecionada:", currentTool);
}

// Evento de clique na paleta para selecionar um tile
paletteCanvas.addEventListener("click", (e) => {
    const columns = 2; // A quantidade de colunas da paleta, deve ser a mesma definida na função drawPalette
    const tileX = Math.floor(e.offsetX / tileSize);
    const tileY = Math.floor(e.offsetY / tileSize);

    // Calcula o índice do tile clicado
    const index = tileY * columns + tileX;

    // Verifica se o índice está dentro do limite de tiles disponíveis
    if (index >= 0 && index < paletteTiles.length) {
        selectedTile = paletteTiles[index];
        console.log("Tile selecionado:", selectedTile);
        drawPalette(); // Redesenha a paleta para destacar o tile selecionado
    }
});

function drawPalette() {
    paletteCtx.clearRect(0, 0, paletteCanvas.width, paletteCanvas.height);
    
    const columns = 2; // Quantidade de colunas desejada
    const rows = Math.ceil(paletteTiles.length / columns); // Calcula o número de linhas necessárias
    paletteCanvas.height = rows * tileSize; // Ajusta a altura do canvas para caber todos os tiles
    
    paletteTiles.forEach((tile, index) => {
        const x = (index % columns) * tileSize;
        const y = Math.floor(index / columns) * tileSize;
        
        // Desenha cada tile na posição calculada
        paletteCtx.drawImage(tile.image, x, y, tileSize, tileSize);

        // Destaca o tile selecionado com uma borda
        if (tile === selectedTile) {
            paletteCtx.strokeStyle = "yellow";
            paletteCtx.lineWidth = 2;
            paletteCtx.strokeRect(x, y, tileSize, tileSize);
        }
    });
}


// Evento de clique no canvas do mapa para desenhar, definir bloqueio ou adicionar NPC
mapCanvas.addEventListener("click", (e) => {
    const x = Math.floor(e.offsetX / tileSize);
    const y = Math.floor(e.offsetY / tileSize);

    if (currentTool === "paint" && selectedTile) {
        console.log(`Pintando tile na camada ${currentLayer} na posição:`, x, y);

        mapCtx.drawImage(
            selectedTile.image, selectedTile.x, selectedTile.y, tileSize, tileSize, 
            x * tileSize, y * tileSize, tileSize, tileSize
        );

        layers[currentLayer][y][x] = { x: selectedTile.x / tileSize, y: selectedTile.y / tileSize };
    } else if (currentTool === "block") {
        console.log("Aplicando bloqueio na posição:", x, y);

        map[y][x].blocked = !map[y][x].blocked;

        if (map[y][x].blocked) {
            mapCtx.fillStyle = "rgba(255, 0, 0, 0.5)";
            mapCtx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        } else {
            drawTileAt(x, y);
        }
    } else if (currentTool === "addNPC" && selectedTile && currentNPCType) {
        console.log(`Colocando NPC ${currentNPCType} na posição:`, x, y);

        const npc = { type: currentNPCType, image: selectedTile, x, y };
        npcs.push(npc);

        mapCtx.drawImage(selectedTile, x * tileSize, y * tileSize, tileSize, tileSize);
    }
});


// Função para redesenhar um tile específico (útil para remover bloqueios)
function drawTileAt(x, y) {
    const groundTile = layers.ground[y][x];
    const maskTile = layers.mask[y][x];

    mapCtx.clearRect(x * tileSize, y * tileSize, tileSize, tileSize);

    if (groundTile) {
        mapCtx.drawImage(
            selectedTile.image,
            groundTile.x * tileSize, groundTile.y * tileSize, tileSize, tileSize,
            x * tileSize, y * tileSize, tileSize, tileSize
        );
    }

    if (maskTile) {
        mapCtx.drawImage(
            selectedTile.image,
            maskTile.x * tileSize, maskTile.y * tileSize, tileSize, tileSize,
            x * tileSize, y * tileSize, tileSize, tileSize
        );
    }

    npcs.forEach(npc => {
        mapCtx.drawImage(npc.image, npc.x * tileSize, npc.y * tileSize, tileSize, tileSize);
    });
}


// Variável para armazenar o estado do modo NPC
let isAddingNPC = false;

// Função para ativar o modo de adicionar NPC
function activateNPCMode() {
    isAddingNPC = true;
    currentTool = "addNPC"; // Define a ferramenta atual para adicionar NPC
    console.log("Modo Baú ativado. Clique no mapa para posicionar o NPC.");
}

// Função para adicionar NPC no mapa na posição clicada
mapCanvas.addEventListener("click", (e) => {
    if (isAddingNPC) { // Verifica se o modo NPC está ativo
        const x = Math.floor(e.offsetX / tileSize);
        const y = Math.floor(e.offsetY / tileSize);

        console.log(`Colocando NPC na posição:`, x, y);

        // Cria o objeto NPC com propriedades como saúde, posição, etc.
        const npc = {
            type: "bau",
            image: selectedTile.image,
            x: x,
            y: y,
            width: tileSize,
            height: tileSize,
            health: 500 // Definindo a saúde inicial
        };

        // Adiciona o NPC na lista de NPCs
        npcs.push(npc);

        // Desenha o NPC no mapa
        drawNPCs();

        // Desativa o modo de adicionar NPC após a colocação
        isAddingNPC = false;
    }
});

// Função para desenhar todos os NPCs no mapa
function drawNPCs() {
    npcs.forEach(npc => {
        // Desenha o NPC na posição calculada
        mapCtx.drawImage(npc.image, npc.x * tileSize, npc.y * tileSize, tileSize, tileSize);

        // Definindo a largura e altura da barra de saúde
        const barMaxWidth = tileSize - 4; // Barra um pouco menor que o tile para ajustar centralização
        const barHeight = 4;

        // Ajuste para centralizar a barra de saúde abaixo do NPC
        const barX = npc.x * tileSize + (tileSize - barMaxWidth) / 2; // Centraliza a barra horizontalmente
        const barY = npc.y * tileSize + tileSize + 5; // Posiciona a barra logo abaixo do NPC

        // Desenha o fundo da barra de saúde (contorno preto)
        mapCtx.fillStyle = "black";
        mapCtx.fillRect(barX - 1, barY - 1, barMaxWidth + 2, barHeight + 2);

        // Calcula a proporção de saúde e ajusta a cor da barra
        const maxHealth = 500; // Vida máxima do NPC (ajuste conforme necessário)
        const healthRatio = Math.max(0, Math.min(npc.health / maxHealth, 1)); // Garante proporção entre 0 e 1
        mapCtx.fillStyle = healthRatio > 0.3 ? "green" : "red";
        mapCtx.fillRect(barX, barY, barMaxWidth * healthRatio, barHeight);
    });
}
// Função para preencher todo o mapa com o tile selecionado
function fillMapWithSelectedTile() {
    if (!selectedTile) {
        alert("Por favor, selecione um tile na paleta primeiro.");
        return;
    }

    // Percorre todas as posições do mapa e aplica o tile selecionado em cada uma
    for (let y = 0; y < mapCanvas.height / tileSize; y++) {
        for (let x = 0; x < mapCanvas.width / tileSize; x++) {
            mapCtx.drawImage(
                selectedTile.image, 0, 0, tileSize, tileSize, 
                x * tileSize, y * tileSize, tileSize, tileSize
            );

            // Atualiza o layer atual com as coordenadas do tile selecionado
            layers[currentLayer][y][x] = { x: 0, y: 0 }; // Ajuste as coordenadas conforme necessário
        }
    }

    console.log("Mapa preenchido com o tile selecionado.");
}


// Função para salvar o mapa
function saveMap() {
    const mapData = {
        layers: layers,
        blockedTiles: map.map(row => row.map(cell => cell.blocked)),
        npcs: npcs.map(npc => ({
            type: npc.type,
            x: npc.x,
            y: npc.y,
            health: npc.health
        }))
    };

    fetch("server/save_map.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapData)
    })
    .then(response => response.text())
    .then(data => console.log("Mapa salvo com sucesso!"))
    .catch(error => console.error("Erro ao salvar mapa:", error));
}

initializeMapLayers();
drawPalette();

function renderLayers() {
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    ["ground", "mask", "fringe"].forEach(layerName => { // Troquei "bau" por "fringe" aqui
        const layer = layers[layerName];
        if (layer) {
            for (let y = 0; y < layer.length; y++) {
                for (let x = 0; x < layer[y].length; x++) {
                    const tile = layer[y][x];
                    if (tile && selectedTile) {
                        mapCtx.drawImage(
                            selectedTile.image,
                            tile.x * tileSize,
                            tile.y * tileSize,
                            tileSize,
                            tileSize,
                            x * tileSize,
                            y * tileSize,
                            tileSize,
                            tileSize
                        );
                    }
                }
            }
        }
    });
    console.log("Camadas renderizadas.");
}

// Inicialize o mapa e paleta
initializePalette();
loadMap();
// Função para carregar o mapa e renderizar no jogo
function loadMap() {
    fetch("server/load_map.php")
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao carregar o mapa: " + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log("Mapa carregado com sucesso:", data);

            // Carregar e renderizar cada camada do mapa
            if (data.layers) {
                layers.ground = data.layers.ground || [];
                layers.mask = data.layers.mask || [];
                layers.fringe = data.layers.fringe || [];
                renderLayers();
            }

            // Carregar tiles bloqueados
            if (data.blockedTiles) {
                data.blockedTiles.forEach((row, y) => {
                    row.forEach((blocked, x) => {
                        map[y][x].blocked = blocked;
                        if (blocked) {
                            mapCtx.fillStyle = "rgba(255, 0, 0, 0.5)";
                            mapCtx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                        }
                    });
                });
            }

            // Carregar NPCs
            if (data.npcs) {
                npcs.length = 0; // Limpa qualquer NPC existente
                data.npcs.forEach(npcData => {
                    const npcTile = paletteTiles.find(tile => tile.type === npcData.type);
                    if (npcTile) {
                        const npc = {
                            type: npcData.type,
                            image: npcTile.image,
                            x: npcData.x,
                            y: npcData.y,
                            width: tileSize,
                            height: tileSize,
                            health: npcData.health
                        };
                        npcs.push(npc);
                    }
                });
                drawNPCs();
            }
        })
        .catch(error => console.error("Erro ao carregar mapa:", error));
}

// Função para renderizar todas as camadas do mapa
function renderLayers() {
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    ["ground", "mask", "bau"].forEach(layerName => {
        const layer = layers[layerName];
        if (layer) {
            for (let y = 0; y < layer.length; y++) {
                for (let x = 0; x < layer[y].length; x++) {
                    const tile = layer[y][x];
                    if (tile && selectedTile) {
                        mapCtx.drawImage(
                            selectedTile.image,
                            tile.x * tileSize,
                            tile.y * tileSize,
                            tileSize,
                            tileSize,
                            x * tileSize,
                            y * tileSize,
                            tileSize,
                            tileSize
                        );
                    }
                }
            }
        }
    });
    console.log("Camadas renderizadas.");
}

function saveMap() {
    const width = mapCanvas.width / tileSize;
    const height = mapCanvas.height / tileSize;

    // Garante que cada camada seja preenchida corretamente com arrays bidimensionais
    if (layers.ground.length === 0) {
        layers.ground = Array.from({ length: height }, () => Array(width).fill(null));
    }
    if (layers.mask.length === 0) {
        layers.mask = Array.from({ length: height }, () => Array(width).fill(null));
    }
    if (!layers.fringe || layers.fringe.length === 0) {
        layers.fringe = Array.from({ length: height }, () => Array(width).fill(null));
    }

    const mapData = {
        layers: {
            ground: layers.ground,
            mask: layers.mask,
            fringe: layers.fringe
        },
        blockedTiles: map.map(row => row.map(cell => cell.blocked)),
        npcs: npcs.map(npc => ({
            type: npc.type,
            x: npc.x,
            y: npc.y,
            health: npc.health
        }))
    };

    // Envia o objeto para o servidor como JSON
    fetch("server/save_map.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapData)
    })
    .then(response => response.text())
    .then(data => console.log("Mapa salvo com sucesso!"))
    .catch(error => console.error("Erro ao salvar mapa:", error));
}
loadMap(); // Carregar o mapa e renderizar

// Função para carregar um tile da imagem de upload
function uploadTile() {
    const fileInput = document.getElementById("tileUpload");
    const file = fileInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append("tileImage", file);

        fetch("server/upload_tile.php", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                const newTile = new Image();
                newTile.src = data.path + "?t=" + new Date().getTime();

                newTile.onload = () => {
                    addTileToPalette(newTile);
                };
            } else {
                alert("Erro ao enviar imagem: " + data.message);
            }
        })
        .catch(error => console.error("Erro ao enviar imagem:", error));
    }
}

// Função para adicionar o tile carregado à paleta
function addTileToPalette(image) {
    const tile = { x: 0, y: 0, image };
    paletteTiles.push(tile);
    drawPalette();
}

drawPalette();

function initializePalette() {
    drawPalette();
    console.log("Paleta inicializada.");
}