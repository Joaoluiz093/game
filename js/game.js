// Verifica sessão do usuário e inicializa o jogo se estiver logado
fetch("server/check_session.php")
    .then(response => response.json())
    .then(data => {
        if (data.status === "logged_in") {
            initGame(data.username); // Passa o username para initGame
        } else {
            window.location.href = "auth.html"; // Redireciona para a página de login
        }
    })
    .catch(error => console.error("Erro ao verificar sessão:", error));

// Variáveis globais
const npcs = []; // Armazena os NPCs
let players = []; // Array para múltiplos jogadores
let bombs = [];  // Armazena as bombas
let mapData = {}; // Armazena o mapa e dados de bloqueio
const tileSize = 50; // Define o tamanho do tile globalmente

// Defina o objeto player globalmente
let player = {
    x: 1, 
    y: 1, 
    width: 31, 
    height: 45, 
    direction: "down", 
    isWalking: false, 
    health: 100, 
    stepToggle: false, 
    username: "Player1"
};

// Defina o objeto playerImages globalmente para uso em drawPlayer
const playerImages = {
    down: { idle: new Image(), walking: new Image() },
    up: { idle: new Image(), walking: new Image() },
    left: { idle: new Image(), walking: new Image() },
    right: { idle: new Image(), walking: new Image() }
};

// Defina os tilesets globais para uso em drawLayers e outras funções de renderização
let tilesetGround = new Image();
let tilesetMask = new Image();
let tilesetBau = new Image();

// Defina as imagens das bombas globalmente para uso em drawBombs
const bombImages = Array.from({ length: 17 }, (_, i) => {
    const img = new Image();
    img.src = `assets/bomb/bomb${i + 1}.png`;
    return img;
});


// Função para inicializar o jogo com dados do banco
function initGame(username) {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Solicita ao servidor as informações do personagem do jogador
    fetch(`server/load_player_data.php?username=${username}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Erro ao carregar os dados do jogador:", data.error);
                return;
            }

            // Define atributos do jogador com base nos dados do banco
            player.health = data.vida;
            player.attack = data.ataque;
            player.defense = data.defesa;
            player.speed = data.velocidade;

            // Define imagens do jogador de acordo com a raridade
            const rarity = data.raridade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const rarityFolder = `assets/players/${rarity}/`;
            playerImages.down.idle.src = `${rarityFolder}baixo.png`;
            playerImages.down.walking.src = `${rarityFolder}baixo_andando.png`;
            playerImages.up.idle.src = `${rarityFolder}cima.png`;
            playerImages.up.walking.src = `${rarityFolder}cima_andando.png`;
            playerImages.left.idle.src = `${rarityFolder}esquerda.png`;
            playerImages.left.walking.src = `${rarityFolder}esquerda_andando.png`;
            playerImages.right.idle.src = `${rarityFolder}direita.png`;
            playerImages.right.walking.src = `${rarityFolder}direita_andando.png`;

            // Carrega os tilesets globais
            tilesetGround.src = "assets/images/uploaded_tiles/chao2.png";
            tilesetMask.src = "assets/images/uploaded_tiles/lava.png";
            tilesetBau.src = "assets/images/uploaded_tiles/bau.png";

            // Após carregar as imagens e dados, inicia o carregamento do mapa e personagens
            Promise.all([
                new Promise(resolve => { tilesetGround.onload = resolve; }),
                new Promise(resolve => { tilesetMask.onload = resolve; }),
                new Promise(resolve => { tilesetBau.onload = resolve; })
            ]).then(() => {
                console.log("Tilesets e imagens de personagens carregados com sucesso");
                loadUserBalanceAndCreateCharacters(username);
            }).catch(error => console.error("Erro ao carregar os tilesets:", error));
        })
        .catch(error => console.error("Erro ao acessar load_player_data.php:", error));
}

// Função para carregar o saldo do usuário e criar os personagens
function loadUserBalanceAndCreateCharacters(username) {
    fetch('server/load_balance.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Erro ao carregar o saldo:", data.error);
                return;
            }

            const userCharacters = createCharactersFromBalance(data, username);
            console.log("Personagens do usuário:", userCharacters);

            displayCharactersInGame(userCharacters); // Exibe os personagens no jogo
        })
        .catch(error => console.error("Erro ao acessar load_balance.php:", error));
}

function createCharactersFromBalance(balance, username) {
    const characters = [];
    const rarityTypes = [
        { rarity: 'incomum', name: 'Personagem Incomum', maxHealth: balance.incomum_vida || 100 },
        { rarity: 'raro', name: 'Personagem Raro', maxHealth: balance.raro_vida || 100 },
        { rarity: 'mitico', name: 'Personagem Mítico', maxHealth: balance.mitico_vida || 100 },
        { rarity: 'epico', name: 'Personagem Épico', maxHealth: balance.epico_vida || 100 },
        { rarity: 'lendario', name: 'Personagem Lendário', maxHealth: balance.lendario_vida || 100 },
        { rarity: 'super_lendario', name: 'Personagem Super Lendário', maxHealth: balance.super_lendario_vida || 100 }
    ];

    rarityTypes.forEach(type => {
        const quantity = balance[type.rarity] || 0; // Obtém a quantidade do saldo (ou 0 se não existir)

        if (quantity > 0) {
            for (let i = 0; i < quantity; i++) {
                characters.push({
                    x: 1,
                    y: 1,
                    width: 31,
                    height: 45,
                    direction: "down",
                    isWalking: false,
                    stepToggle: false,
                    username: `${username} - ${type.name}`,
                    maxHealth: type.maxHealth,  // Vida máxima baseada na raridade
                    currentHealth: type.maxHealth,  // Inicia com a vida cheia
                    rarity: type.rarity,  // Adiciona a raridade aqui
                    quantity: quantity
                });
            }
        }
    });

    return characters;
}

// Função para gerar uma posição aleatória não ocupada no mapa
function generateRandomPosition() {
    let x, y, isOccupied;
    
    do {
        x = Math.floor(Math.random() * (mapData.width || 10));  // Limita o tamanho do mapa
        y = Math.floor(Math.random() * (mapData.height || 10));
        
        // Verifica se a posição está ocupada por outro jogador ou NPC
        isOccupied = players.some(player => player.x === x && player.y === y) ||
                     npcs.some(npc => npc.x === x && npc.y === y);
    } while (isOccupied); // Continua procurando até encontrar uma posição livre

    return { x, y };
}


function displayCharactersInGame(characters) {
    console.log("Iniciando exibição de personagens no jogo.");
    players = []; // Limpa a lista de jogadores antes de adicionar os novos

    characters.forEach(character => {
        console.log(`Criando personagens para: ${character.username} com quantidade: ${character.quantity}`);

        for (let i = 0; i < character.quantity; i++) {
            const { x, y } = generateRandomPosition(); // Obtém uma posição aleatória não ocupada

            // Verifique se rarity está definido
            if (!character.rarity) {
                console.error(`Raridade indefinida para o personagem ${character.username}`);
                continue;
            }

            // Define imagens específicas para cada raridade
            const rarityFolder = `assets/players/${character.rarity.toLowerCase()}/`;
            const characterImages = {
                down: { idle: new Image(), walking: new Image() },
                up: { idle: new Image(), walking: new Image() },
                left: { idle: new Image(), walking: new Image() },
                right: { idle: new Image(), walking: new Image() }
            };

            characterImages.down.idle.src = `${rarityFolder}baixo.png`;
            characterImages.down.walking.src = `${rarityFolder}baixo_andando.png`;
            characterImages.up.idle.src = `${rarityFolder}cima.png`;
            characterImages.up.walking.src = `${rarityFolder}cima_andando.png`;
            characterImages.left.idle.src = `${rarityFolder}esquerda.png`;
            characterImages.left.walking.src = `${rarityFolder}esquerda_andando.png`;
            characterImages.right.idle.src = `${rarityFolder}direita.png`;
            characterImages.right.walking.src = `${rarityFolder}direita_andando.png`;

            players.push({
                ...character,
                x: x, // Define a posição aleatória
                y: y,
                images: characterImages  // Atribui as imagens específicas ao personagem
            });
            console.log(`Personagem ${i + 1} para ${character.username} posicionado em x: ${x}, y: ${y}`);
        }
    });

    console.log("Jogadores carregados no array 'players':", players);
    loadMap(); // Carrega o mapa após a criação dos personagens

    setTimeout(movePlayersToNPC, 100); // Chama `movePlayersToNPC` com um pequeno atraso
}

function loadMap() {
    console.log("Carregando o mapa...");

    fetch("server/map.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao acessar map.json: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            mapData = data; // Armazena os dados do mapa globalmente
            console.log("Mapa carregado com sucesso:", mapData);

            if (mapData.npcs) {
                mapData.npcs.forEach(npcData => {
                    const npc = {
                        type: npcData.type,
                        x: npcData.x,
                        y: npcData.y,
                        width: tileSize,
                        height: tileSize,
                        health: npcData.health, // Aqui garantimos que o valor de map.json seja utilizado
                        image: new Image()
                    };
                    npc.image.src = `assets/images/uploaded_tiles/${npc.type}.png`;
                    npcs.push(npc);
                });
                console.log("NPCs carregados:", npcs);
            }

            drawGame();
        })
        .catch(error => console.error("Erro ao carregar o mapa:", error));
}

// Função para verificar se uma posição está ocupada por outro jogador ou NPC
function isPositionOccupied(x, y) {
    return players.some(player => player.x === x && player.y === y) ||
           npcs.some(npc => npc.x === x && npc.y === y);
}

// Função para escolher um NPC aleatório vivo
function getRandomNPC(npcs) {
    const aliveNPCs = npcs.filter(npc => npc.health > 0);
    if (aliveNPCs.length === 0) return null; // Retorna null se todos os NPCs estiverem mortos
    const randomIndex = Math.floor(Math.random() * aliveNPCs.length);
    return aliveNPCs[randomIndex];
}

function movePlayersToNPC() {
    console.log("Iniciando movimento para cada jogador em direção a NPCs...");

    players.forEach(player => {
        const moveAndBomb = () => {
            let targetNPC = getRandomNPC(npcs);
            if (!targetNPC) {
                console.log("Todos os NPCs foram derrotados.");
                return;
            }

            console.log(`NPC aleatório selecionado para ${player.username}:`, targetNPC);

            let failedMoveCount = 0;

            // Define um intervalo para mover o jogador até o NPC
            const moveInterval = setInterval(() => {
                if (targetNPC.health <= 0) {
                    clearInterval(moveInterval);
                    moveAndBomb(); // Vai para o próximo NPC se o atual foi derrotado
                    return;
                }

                let dx = targetNPC.x - player.x;
                let dy = targetNPC.y - player.y;

                // Define a direção do jogador com base no movimento
                if (Math.abs(dx) > Math.abs(dy)) {
                    player.direction = dx > 0 ? "right" : "left";
                } else {
                    player.direction = dy > 0 ? "down" : "up";
                }

                // Verifica se o jogador está ao lado do NPC (adjacente)
                if ((Math.abs(dx) === 1 && dy === 0) || (Math.abs(dy) === 1 && dx === 0)) {
                    console.log(`${player.username} está ao lado do NPC e soltou a bomba.`);
                    dropBomb(player.x, player.y, player); // Solta a bomba
                    targetNPC.health -= player.attack || 1; // Aplica o dano ao NPC com base no ataque do jogador
                    console.log(`Dano causado ao NPC: ${player.attack || 1}. Vida restante do NPC: ${targetNPC.health}`);
                    
                    clearInterval(moveInterval); // Para o movimento ao alcançar o alvo
                    player.isWalking = false; // Parar a animação de andar
                    drawGame(); // Redesenha o jogo após o movimento
                    setTimeout(moveAndBomb, 1000); // Após um breve intervalo, move para o próximo NPC
                    return;
                }

                // Movimento e travamento
                const nextX = player.x + (Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0);
                const nextY = player.y + (Math.abs(dx) <= Math.abs(dy) ? Math.sign(dy) : 0);

                if (!isPositionOccupied(nextX, nextY)) {
                    player.x = nextX;
                    player.y = nextY;
                    player.isWalking = true;
                    player.stepToggle = !player.stepToggle;
                    failedMoveCount = 0;
                    console.log(`${player.username} movendo-se para: (${player.x}, ${player.y}) direção: ${player.direction}`);
                } else {
                    failedMoveCount++;
                    console.log(`Posição ocupada em (${nextX}, ${nextY}) para ${player.username}, aguardando...`);
                }

                if (failedMoveCount >= 5) {
                    console.log(`${player.username} está preso. Selecionando um novo NPC alvo.`);
                    targetNPC = getRandomNPC(npcs);
                    failedMoveCount = 0;
                }

                drawGame();
            }, 500);
        };

        moveAndBomb();
    });
}



function dropBomb(x, y, player) {
    const bomb = {
        x: x,
        y: y,
        startTime: Date.now(),
        animationFrame: 0
    };
    bombs.push(bomb);
    console.log(`Bomba posicionada em: (${x}, ${y})`);

    // Reduz a vida do jogador em 1%
    const healthLoss = player.maxHealth * 0.01; // 1% da vida máxima
    player.currentHealth -= healthLoss;

    if (player.currentHealth <= 0) {
        player.currentHealth = 0;
        console.log(`${player.username} foi derrotado e está fora do jogo.`);
        player.isActive = false; // Define o jogador como inativo
        startHealthRegeneration(player); // Inicia a regeneração automática
    } else {
        console.log(`${player.username} perdeu 1% de vida. Vida atual: ${player.currentHealth}`);
    }

    // Explode a bomba após 4 segundos
    setTimeout(() => { explodeBomb(bomb); }, 4000);
    drawGame();
}

function removePlayerFromGame(player) {
    // Remove o jogador do array `players` para que ele desapareça do jogo
    players = players.filter(p => p !== player);
}

function startHealthRegeneration(player) {
    console.log(`Regeneração de vida iniciada para ${player.username}.`);

    // Define um intervalo para adicionar 3 pontos de vida por minuto
    const regenInterval = setInterval(() => {
        player.currentHealth += 3;

        if (player.currentHealth >= player.maxHealth) {
            player.currentHealth = player.maxHealth;
            clearInterval(regenInterval); // Para a regeneração
            player.isActive = true; // Define o jogador como ativo novamente
            console.log(`${player.username} está totalmente recuperado e de volta ao jogo.`);
            drawGame(); // Atualiza o jogo para mostrar o jogador de volta
        }
    }, 60000); // 60000 ms = 1 minuto
}

// Função para explodir a bomba e causar dano ao NPC
function explodeBomb(bomb) {
    console.log("Explodindo bomba:", bomb);

    // Remove a bomba da lista de bombas ativas
    bombs = bombs.filter(b => b !== bomb);

    // Verifica se algum NPC está ao alcance da explosão
    npcs.forEach(npc => {
        // Checa se o NPC está próximo da bomba (por exemplo, na mesma posição ou adjacente)
        if (Math.abs(npc.x - bomb.x) <= 1 && Math.abs(npc.y - bomb.y) <= 1) {
            npc.health -= 0.01; // Aplica dano ao NPC na explosão
            console.log(`Dano causado ao NPC ${npc.type}. Vida restante: ${npc.health}`);
        }
    });

    drawGame();
}

// Função para encontrar o NPC mais próximo
function findClosestNPC(player, npcs) {
    let closestNPC = null;
    let shortestDistance = Infinity;

    npcs.forEach(npc => {
        const distance = Math.abs(player.x - npc.x) + Math.abs(player.y - npc.y);
        if (distance < shortestDistance) {
            closestNPC = npc;
            shortestDistance = distance;
        }
    });

    return closestNPC;
}
// Função para renderizar o jogo
function drawGame() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawLayers();
    drawNPCs();
    drawPlayers();
    drawBombs();
}

// Função para renderizar as camadas do mapa (chão, máscaras, etc.)
function drawLayers() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const layers = mapData.layers;

    if (!layers) {
        console.error("Erro: camadas não encontradas em mapData.");
        return;
    }

    for (const layerName of ["ground", "mask", "bau"]) {
        const layer = layers[layerName];
        if (!layer) continue;

        const tileset = layerName === "ground" ? tilesetGround : layerName === "mask" ? tilesetMask : tilesetBau;

        for (let y = 0; y < layer.length; y++) {
            for (let x = 0; x < layer[y].length; x++) {
                const tile = layer[y][x];
                if (tile) {
                    ctx.drawImage(tileset, tile.x * tileSize, tile.y * tileSize, tileSize, tileSize, x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        }
    }
}

function drawNPCs() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    npcs.forEach(npc => {
        if (npc.health > 0) {
            // Desenha o NPC
            ctx.drawImage(npc.image, npc.x * tileSize, npc.y * tileSize, npc.width, npc.height);

            // Configuração da barra de vida
            const barMaxWidth = npc.width - 4; // Barra de vida um pouco menor que a largura do NPC
            const barHeight = 5;
            const barX = npc.x * tileSize + (npc.width - barMaxWidth) / 2; // Centraliza a barra horizontalmente
            const barY = npc.y * tileSize + npc.height + 3; // Ajusta para ficar logo abaixo do NPC

            // Desenha a borda da barra de vida
            ctx.fillStyle = "black";
            ctx.fillRect(barX - 1, barY - 1, barMaxWidth + 2, barHeight + 2);

            // Calcula a proporção da vida e desenha a barra interna
            const maxHealth = 500; // Defina o valor máximo de vida do NPC aqui
            const healthRatio = Math.max(0, Math.min(npc.health / maxHealth, 1)); // Garante que a proporção esteja entre 0 e 1
            ctx.fillStyle = healthRatio > 0.3 ? "green" : "red";
            ctx.fillRect(barX, barY, barMaxWidth * healthRatio, barHeight);
        } else {
            console.log(`NPC ${npc.type} removido do mapa por falta de vida.`);
        }
    });
}

// Função para renderizar todos os jogadores em `players`, incluindo a barra de vida estilizada
function drawPlayers() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    players.forEach(player => {
        // Seleciona a imagem de acordo com o estado de movimento e direção
        const currentImage = player.isWalking
            ? (player.stepToggle ? player.images[player.direction].walking : player.images[player.direction].idle)
            : player.images[player.direction].idle;

        // Desenha o jogador na posição atualizada com o tamanho específico de 31x45 pixels
        ctx.drawImage(currentImage, player.x * tileSize, player.y * tileSize, 31, 45);

        // Desenha o nome do jogador acima da imagem
        ctx.font = "16px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(player.username, (player.x * tileSize) + 15.5, (player.y * tileSize) - 10);

        // Estilização da barra de vida com borda preta e preenchimento verde/vermelho
        const barWidth = 28;
        const barHeight = 3;
        const barX = (player.x * tileSize) + (31 / 2) - (barWidth / 2);
        const barY = (player.y * tileSize) + 45 + 5; // Posiciona a barra logo abaixo do jogador

        // Desenha a borda da barra de vida em preto
        ctx.fillStyle = "black";
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

        // Calcula a proporção de vida e define a cor da barra
        const healthRatio = player.currentHealth / player.maxHealth;
        ctx.fillStyle = healthRatio > 0.3 ? "green" : "red";
        ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
    });
}

// Função para desenhar bombas ativas
function drawBombs() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    bombs.forEach(bomb => {
        const elapsedMs = Date.now() - bomb.startTime;
        bomb.animationFrame = Math.min(Math.floor(elapsedMs / 235), bombImages.length - 1);
        ctx.drawImage(bombImages[bomb.animationFrame], bomb.x * tileSize, bomb.y * tileSize, tileSize, tileSize);
    });
}
