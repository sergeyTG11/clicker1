let coins = 1;
let isPlacingHouse = false;
let isPlacingDefenseHouse = false;
let currentHouse = null;
let houses = [];
let defenseHouses = [];
let sticks = [];
let stickmen = [];
let defenseStickmen = [];
let enemies = [];
let housePrices = [1, 3, 5]; // Цены на домики
let houseCount = 0;
let level = 1;
let gameInterval;
let enemySpawnInterval;
const coinSound = document.getElementById('coin-sound');
const menuTrack = document.getElementById('menu-track');

// Инициализация игры
function initGame() {
    createSticks(20);
    updateStickmen();
    updateCoins();
    menuTrack.play().catch(e => console.log("Автовоспроизведение заблокировано"));
    
    document.getElementById('finish-level').style.display = 'none';
    document.getElementById('defense-house-item').style.display = 'none';
    
    document.getElementById('house-item').addEventListener('click', buyHouse);
    document.getElementById('defense-house-item').addEventListener('click', buyDefenseHouse);
    document.getElementById('finish-level').addEventListener('click', finishLevel);
    document.getElementById('play-button').addEventListener('click', startGame);
    document.getElementById('support-button').addEventListener('click', showSupportScreen);
    document.getElementById('back-button').addEventListener('click', hideSupportScreen);
    
    createSnow();
}

// Обновление отображения монет
function updateCoins() {
    document.getElementById('coins').textContent = coins;
    document.getElementById('house-price').textContent = housePrices[houseCount];
}

// Покупка обычного домика
function buyHouse() {
    const price = housePrices[houseCount];
    if (coins >= price && !isPlacingHouse && houseCount < 3) {
        coins -= price;
        updateCoins();
        isPlacingHouse = true;
        houseCount++;
        
        currentHouse = document.createElement('div');
        currentHouse.className = 'house';
        currentHouse.style.left = '50px';
        currentHouse.style.top = '50px';
        document.getElementById('game').appendChild(currentHouse);
        
        document.addEventListener('mousemove', moveHouse);
        currentHouse.addEventListener('click', placeHouse);
        
        if (houseCount >= 3) {
            document.getElementById('house-item').style.display = 'none';
            if (level >= 2) {
                document.getElementById('defense-house-item').style.display = 'block';
            }
            document.getElementById('finish-level').style.display = 'block';
        }
    }
}

// Покупка защитного домика
function buyDefenseHouse() {
    if (coins >= 5 && !isPlacingDefenseHouse) {
        coins -= 5;
        updateCoins();
        isPlacingDefenseHouse = true;
        
        currentHouse = document.createElement('div');
        currentHouse.className = 'defense-house';
        currentHouse.style.left = '50px';
        currentHouse.style.top = '50px';
        document.getElementById('game').appendChild(currentHouse);
        
        document.addEventListener('mousemove', moveHouse);
        currentHouse.addEventListener('click', placeDefenseHouse);
    }
}

// Перемещение домика за курсором
function moveHouse(e) {
    if ((isPlacingHouse || isPlacingDefenseHouse) && currentHouse) {
        currentHouse.style.left = `${e.clientX - 40}px`;
        currentHouse.style.top = `${e.clientY - 30}px`;
    }
}

// Установка обычного домика
function placeHouse() {
    if (isPlacingHouse) {
        document.removeEventListener('mousemove', moveHouse);
        currentHouse.removeEventListener('click', placeHouse);
        isPlacingHouse = false;
        houses.push(currentHouse);
        currentHouse = null;
        
        createStickman(houses[houses.length - 1]);
    }
}

// Установка защитного домика
function placeDefenseHouse() {
    if (isPlacingDefenseHouse) {
        document.removeEventListener('mousemove', moveHouse);
        currentHouse.removeEventListener('click', placeDefenseHouse);
        isPlacingDefenseHouse = false;
        defenseHouses.push(currentHouse);
        currentHouse = null;
        
        createDefenseStickman(defenseHouses[defenseHouses.length - 1]);
    }
}

// Создание обычного стикмана
function createStickman(house) {
    const stickman = document.createElement('img');
    stickman.src = 'assets/images/stickman.png';
    stickman.className = 'stickman';
    stickman.style.left = `${parseFloat(house.style.left) + 20}px`;
    stickman.style.top = `${parseFloat(house.style.top) + 50}px`;
    document.getElementById('game').appendChild(stickman);
    
    const stickmanData = {
        element: stickman,
        house: house,
        targetStick: null,
        isMoving: false,
        speed: 15
    };
    
    stickmen.push(stickmanData);
}

// Создание защитного стикмана
function createDefenseStickman(house) {
    const stickman = document.createElement('img');
    stickman.src = 'assets/images/defense-stickman.png';
    stickman.className = 'defense-stickman';
    stickman.style.left = `${parseFloat(house.style.left) + 20}px`;
    stickman.style.top = `${parseFloat(house.style.top) + 50}px`;
    document.getElementById('game').appendChild(stickman);
    
    const stickmanData = {
        element: stickman,
        house: house,
        targetEnemy: null,
        isMoving: false,
        speed: 15,
        hp: 10,
        maxHp: 10
    };
    
    defenseStickmen.push(stickmanData);
    createHPBar(stickman, stickmanData);
}

// Создание вражеского стикмана
function createEnemy() {
    const enemy = document.createElement('img');
    enemy.src = 'assets/images/enemy-stickman.png';
    enemy.className = 'enemy-stickman';
    enemy.style.left = `${window.innerWidth - 50}px`;
    enemy.style.top = `${Math.random() * (window.innerHeight - 100) + 50}px`;
    document.getElementById('game').appendChild(enemy);
    
    const enemyData = {
        element: enemy,
        targetHouse: houses[Math.floor(Math.random() * houses.length)],
        isMoving: true,
        speed: 5,
        hp: 3,
        maxHp: 3
    };
    
    enemies.push(enemyData);
    createHPBar(enemy, enemyData);
}

// Создание полоски здоровья
function createHPBar(element, data) {
    const hpBar = document.createElement('div');
    hpBar.className = 'hp-bar';
    hpBar.style.left = `${parseFloat(element.style.left)}px`;
    hpBar.style.top = `${parseFloat(element.style.top) - 15}px`;
    
    const hpBarFill = document.createElement('div');
    hpBarFill.className = 'hp-bar-fill';
    hpBarFill.style.width = '100%';
    hpBar.appendChild(hpBarFill);
    
    document.getElementById('game').appendChild(hpBar);
    element.hpBar = hpBar;
    element.hpBarFill = hpBarFill;
}

// Обновление полоски здоровья
function updateHPBar(element, data) {
    const percent = (data.hp / data.maxHp) * 100;
    element.hpBarFill.style.width = `${percent}%`;
    element.hpBar.style.left = `${parseFloat(element.style.left)}px`;
    element.hpBar.style.top = `${parseFloat(element.style.top) - 15}px`;
}

// Логика движения обычных стикманов
function updateStickmen() {
    stickmen.forEach((stickman) => {
        if (!stickman.isMoving && sticks.length > 0) {
            stickman.targetStick = sticks[Math.floor(Math.random() * sticks.length)];
            stickman.isMoving = true;
        }
        
        if (stickman.targetStick && stickman.isMoving) {
            const stickRect = stickman.targetStick.getBoundingClientRect();
            const stickmanRect = stickman.element.getBoundingClientRect();
            
            const dx = stickRect.left - stickmanRect.left;
            const dy = stickRect.top - stickmanRect.top;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            stickman.element.style.transform = dx > 0 ? 'scaleX(1)' : 'scaleX(-1)';
            
            if (distance > 5) {
                stickman.element.style.left = `${stickmanRect.left + dx / distance * stickman.speed}px`;
                stickman.element.style.top = `${stickmanRect.top + dy / distance * stickman.speed}px`;
            } else {
                setTimeout(() => {
                    stickman.targetStick.remove();
                    sticks = sticks.filter(s => s !== stickman.targetStick);
                    moveStickmanToHouse(stickman);
                }, 1000);
            }
        }
    });
    
    defenseStickmen.forEach((defender) => {
        if (!defender.isMoving && enemies.length > 0) {
            defender.targetEnemy = enemies[0];
            defender.isMoving = true;
            
            const exclamation = document.createElement('div');
            exclamation.className = 'exclamation';
            exclamation.textContent = '!';
            defender.element.appendChild(exclamation);
            defender.exclamation = exclamation;
        }
        
        if (defender.targetEnemy && defender.isMoving) {
            const enemyRect = defender.targetEnemy.element.getBoundingClientRect();
            const defenderRect = defender.element.getBoundingClientRect();
            
            const dx = enemyRect.left - defenderRect.left;
            const dy = enemyRect.top - defenderRect.top;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            defender.element.style.transform = dx > 0 ? 'scaleX(1)' : 'scaleX(-1)';
            
            if (distance > 5) {
                defender.element.style.left = `${defenderRect.left + dx / distance * defender.speed}px`;
                defender.element.style.top = `${defenderRect.top + dy / distance * defender.speed}px`;
            } else {
                defender.targetEnemy.hp -= 1;
                updateHPBar(defender.targetEnemy.element, defender.targetEnemy);
                
                if (defender.targetEnemy.hp <= 0) {
                    defender.targetEnemy.element.remove();
                    defender.targetEnemy.element.hpBar.remove();
                    enemies = enemies.filter(e => e !== defender.targetEnemy);
                    
                    if (defender.exclamation) {
                        defender.exclamation.remove();
                    }
                    
                    defender.isMoving = false;
                    defender.targetEnemy = null;
                }
            }
        }
    });
    
    enemies.forEach((enemy) => {
        if (enemy.isMoving) {
            const houseRect = enemy.targetHouse.getBoundingClientRect();
            const enemyRect = enemy.element.getBoundingClientRect();
            
            const dx = houseRect.left - enemyRect.left;
            const dy = houseRect.top - enemyRect.top;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            enemy.element.style.transform = dx > 0 ? 'scaleX(1)' : 'scaleX(-1)';
            
            if (distance > 5) {
                enemy.element.style.left = `${enemyRect.left + dx / distance * enemy.speed}px`;
                enemy.element.style.top = `${enemyRect.top + dy / distance * enemy.speed}px`;
            } else {
                enemy.isMoving = false;
            }
        }
    });
}

// Возвращение обычного стикмана в домик
function moveStickmanToHouse(stickman) {
    const houseRect = stickman.house.getBoundingClientRect();
    const stickmanRect = stickman.element.getBoundingClientRect();
    
    const dx = houseRect.left - stickmanRect.left + 20;
    const dy = houseRect.top - stickmanRect.top + 30;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
        stickman.element.style.left = `${stickmanRect.left + dx / distance * stickman.speed}px`;
        stickman.element.style.top = `${stickmanRect.top + dy / distance * stickman.speed}px`;
        requestAnimationFrame(() => moveStickmanToHouse(stickman));
    } else {
        coins += 1;
        updateCoins();
        playCoinSound();
        showCoinPopup(stickman.house);
        stickman.isMoving = false;
        stickman.targetStick = null;
        
        createNewStick();
    }
}

// Создание новой палки
function createNewStick() {
    const stick = document.createElement('div');
    stick.className = 'stick';
    stick.style.left = `${window.innerWidth - 100 + Math.random() * 50}px`;
    stick.style.top = `${window.innerHeight - 100 + Math.random() * 50}px`;
    document.getElementById('game').appendChild(stick);
    sticks.push(stick);
}

// Создание начальных палок
function createSticks(count) {
    for (let i = 0; i < count; i++) {
        createNewStick();
    }
}

// Завершение уровня
function finishLevel() {
    clearInterval(gameInterval);
    clearInterval(enemySpawnInterval);
    level++;
    alert(`Уровень ${level} начался!`);
    resetGame();
}

// Сброс игры для нового уровня
function resetGame() {
    document.getElementById('game').innerHTML = '';
    document.getElementById('game').appendChild(document.getElementById('game-menu'));
    houses = [];
    defenseHouses = [];
    stickmen = [];
    defenseStickmen = [];
    enemies = [];
    sticks = [];
    houseCount = 0;
    coins = 1;
    
    createSticks(20);
    updateCoins();
    document.getElementById('house-item').style.display = 'block';
    document.getElementById('defense-house-item').style.display = 'none';
    document.getElementById('finish-level').style.display = 'none';
    
    startGame();
}

// Спаун врагов
function spawnEnemies() {
    if (Math.random() < 0.05 && houses.length > 0 && level >= 2) {
        createEnemy();
    }
}

// Воспроизведение звука монеты
function playCoinSound() {
    coinSound.currentTime = 0;
    coinSound.play().catch(e => console.log("Не удалось воспроизвести звук"));
}

// Показ всплывающей монеты
function showCoinPopup(house) {
    const coinPopup = document.createElement('div');
    coinPopup.className = 'coin-popup';
    coinPopup.textContent = '+1';
    coinPopup.style.left = `${parseFloat(house.style.left) + 30}px`;
    coinPopup.style.top = `${parseFloat(house.style.top)}px`;
    document.getElementById('game').appendChild(coinPopup);
    
    setTimeout(() => {
        coinPopup.remove();
    }, 1000);
}

// Начало игры
function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    menuTrack.pause();
    
    gameInterval = setInterval(updateStickmen, 1000/60);
    enemySpawnInterval = setInterval(spawnEnemies, 1000);
}

// Показать экран поддержки
function showSupportScreen() {
    document.getElementById('support-screen').style.display = 'flex';
}

// Скрыть экран поддержки
function hideSupportScreen() {
    document.getElementById('support-screen').style.display = 'none';
}

// Создание снега
function createSnow() {
    const snowContainer = document.getElementById('snow');
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
        snowflake.style.animationDelay = `${Math.random() * 5}s`;
        snowContainer.appendChild(snowflake);
    }
}

// Запуск игры
window.onload = initGame;