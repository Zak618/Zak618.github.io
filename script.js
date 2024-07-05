const character = document.getElementById('character');

const tasks = [
    {
        description: "Переместите персонажа вправо на 100 пикселей.",
        code: "moveCharacter(100, 0);"
    },
    {
        description: "Переместите персонажа вниз на 100 пикселей.",
        code: "moveCharacter(0, 100);"
    },
    {
        description: "Переместите персонажа вправо на 50 пикселей и вниз на 50 пикселей.",
        code: "moveCharacter(50, 50);"
    }
];

let currentTaskIndex = 0;

function loadTask(taskIndex) {
    const task = tasks[taskIndex];
    document.getElementById('taskDescription').innerText = task.description;
    editor.setValue(task.code);
}

function moveCharacter(dx, dy) {
    const currentLeft = parseInt(character.style.left) || 0;
    const currentTop = parseInt(character.style.top) || 0;
    character.style.left = `${currentLeft + dx}px`;
    character.style.top = `${currentTop + dy}px`;
}

document.getElementById('runCodeButton').addEventListener('click', () => {
    const code = editor.getValue();
    try {
        eval(code);
    } catch (e) {
        alert('Ошибка в вашем коде: ' + e.message);
    }
});

document.getElementById('nextTaskButton').addEventListener('click', () => {
    currentTaskIndex = (currentTaskIndex + 1) % tasks.length;
    loadTask(currentTaskIndex);
});

// Инициализация редактора
const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");

// Начальная загрузка задания
loadTask(currentTaskIndex);
