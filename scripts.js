let moves = 20;
let coins = 0;
let currentLevel = 1;
let tasks = [{ emoji: "🍓", count: 3 }]; // Список задач для текущего уровня
let selectedCell = null; // Переменная для хранения выбранной ячейки
let inventory = []; // Инвентарь для хранения купленных бомб
let playerStats = {}; // Статистика игрока (ключи — id игроков, значения — уровень)

function startGame() {
    alert('Игра началась!');
    generateBoard();
    updateMoves();
}

function pauseGame() {
    alert('Игра на паузе.');
}

function resetGame() {
    alert('Игра перезапущена!');
    generateBoard();
    updateMoves();
}

function undoMove() {
    alert('Ход отменен.');
}

function openShop() {
    document.querySelector('.shop').style.display = 'block';
}

function closeShop() {
    document.querySelector('.shop').style.display = 'none';
}

function openInventory() {
    alert('Ваш инвентарь: ' + inventory.join(', '));
}

function openStats() {
    let statsString = Object.keys(playerStats)
        .map(player => `Игрок ${player}: Уровень ${playerStats[player]}`)
        .join('\n');
    alert('Статистика игроков:\n' + statsString);
}

function selectLevel(level) {
    if (level > currentLevel) {
        alert('Этот уровень пока заблокирован.');
        return;
    }
    currentLevel = level;
    alert(`Вы выбрали уровень ${level}`);
    loadLevel(level);
}

function loadLevel(level) {
    moves = 20 + level * 5;  // Пример увеличения шагов с каждым уровнем
    tasks = generateTasksForLevel(level);  // Генерация задач
    updateTaskList();
    generateBoard();  // Генерация игрового поля
    updateMoves();
}

function generateTasksForLevel(level) {
    let taskList = [];
    if (level >= 5) {
        taskList.push({ emoji: "🍓", count: 5 });
        taskList.push({ emoji: "🍒", count: 4 });
    } else {
        taskList.push({ emoji: "🍓", count: 3 + level });
    }
    return taskList;
}

function updateTaskList() {
    let taskListDiv = document.getElementById("task-list");
    taskListDiv.innerHTML = "";
    tasks.forEach((task, index) => {
        taskListDiv.innerHTML += `<p class="task-item">Задача ${index + 1}: Собрать ${task.count} ${task.emoji}</p>`;
    });
}

function generateBoard() {
    let board = document.querySelector('.game-board');
    board.innerHTML = "";  // Очищаем поле
    for (let i = 0; i < 64; i++) {
        let cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = getRandomEmoji();  // Генерация случайного объекта
        cell.addEventListener('click', () => selectCell(cell, i));  // Добавляем обработчик события для клика
        board.appendChild(cell);
    }
}

function getRandomEmoji() {
    const emojis = ["⭐", "✨", "💦", "🔥", "🎉", "❤️", "🍓", "🍒", "🍉", "🍕", "🐱", "🐯"];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

function selectCell(cell, index) {
    if (selectedCell === null) {
        selectedCell = { element: cell, index: index };
        cell.style.border = '2px solid red';  // Выделяем выбранную ячейку
    } else {
        // Проверяем, можно ли поменять местами с выбранной ячейкой
        if (isAdjacent(selectedCell.index, index)) {
            swapCells(selectedCell.element, cell);  // Меняем местами ячейки
            moves--;
            updateMoves();
            checkMatches();  // Проверяем на совпадения после каждого хода
        }
        selectedCell.element.style.border = '1px solid #ccc';  // Убираем выделение
        selectedCell = null;  // Сбрасываем выбранную ячейку
    }
}

function isAdjacent(index1, index2) {
    const row1 = Math.floor(index1 / 8);
    const col1 = index1 % 8;
    const row2 = Math.floor(index2 / 8);
    const col2 = index2 % 8;
    return (Math.abs(row1 - row2) + Math.abs(col1 - col2)) === 1;
}

function swapCells(cell1, cell2) {
    const temp = cell1.textContent;
    cell1.textContent = cell2.textContent;
    cell2.textContent = temp;
}

function checkMatches() {
    let board = document.querySelectorAll('.cell');
    let matchedCells = [];

    // Проверка горизонтальных и вертикальных совпадений
    for (let i = 0; i < 64; i++) {
        const row = Math.floor(i / 8);
        const col = i % 8;

        // Проверка горизонтальных совпадений
        if (col <= 4 && board[i].textContent === board[i + 1].textContent && 
            board[i].textContent === board[i + 2].textContent && board[i].textContent === board[i + 3].textContent) {
            createBomb(i + 1);
            matchedCells.push(i, i + 1, i + 2, i + 3);  // Горизонтальное совпадение
        }
        // Проверка вертикальных совпадений
        if (row <= 4 && board[i].textContent === board[i + 8].textContent && 
            board[i].textContent === board[i + 16].textContent && board[i].textContent === board[i + 24].textContent) {
            createBomb(i + 8);
            matchedCells.push(i, i + 8, i + 16, i + 24);  // Вертикальное совпадение
        }
    }

    if (matchedCells.length > 0) {
        matchedCells.forEach(index => {
            board[index].textContent = getRandomEmoji();  // Заменяем совпавшие элементы новыми
        });
        // После обновления поля проверяем задачи
        checkTasks();
    }
}

function createBomb(index) {
    let board = document.querySelectorAll('.cell');
    board[index].textContent = "💣";  // Устанавливаем бомбу на место совпадения
}

function checkTasks() {
    tasks.forEach(task => {
        let count = 0;
        document.querySelectorAll('.cell').forEach(cell => {
            if (cell.textContent === task.emoji) {
                count++;
            }
        });
        task.count -= count;
        if (task.count <= 0) {
            alert('Задача выполнена!');
        }
    });
    updateTaskList();
}

function buyBomb() {
    if (coins >= 40) {
        coins -= 40;
        inventory.push('💣');  // Добавляем бомбу в инвентарь
        alert('Бомба куплена и добавлена в инвентарь!');
    } else {
        alert('Недостаточно монет.');
    }
    updateCoins();
}

function buyMove() {
    if (coins >= 1) {
        coins -= 1;
        moves += 1;
        updateMoves();
    } else {
        alert('Недостаточно монет.');
    }
}

function updateCoins() {
    document.getElementById("coins").textContent = coins;
}

function updateMoves() {
    document.getElementById("moves").textContent = moves;
}