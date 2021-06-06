const field = document.querySelector('.wrapper');
const endBanner = document.getElementById('banner');
let timerTime = 0; // time variable
let timerActive = true;
let id = 1;
const size = 81; // field size
const bombsNumber = 9;
const square = size ** (1 / 2) // side length 
let bombs = [] // bombs coord list
let cellNumbers = [] // cells info list
let alreadyReplaced = [] // list of opened cells

// make a button instance
function createButton(x, y) {
  let b = document.createElement('button')
  b.id = id;
  b.style.left = 60 * y + 'px'
  b.style.top = 60 * x + 'px'
  b.classList.add('but', 'cell');
  b.onclick = () => checkIfBomb(b.id);
  b.oncontextmenu = (e) => setFlag(e, b.id);
  field.appendChild(b)
  id++;
}

function setTimer() {
  if (timerActive) {
    const timer = document.getElementById('timer')
    const min = parseInt(timerTime / 60);
    const sec = timerTime % 60
    const newTimer = document.createElement('div')
    newTimer.innerText = `${min}:${sec < 10 ? '0' : ''}${sec}`
    newTimer.id = 'timer'
    timer.replaceWith(newTimer)
    timerTime += 1
  }
}

// function on right click
function setFlag(e, id) {
  e.preventDefault()
  const button = document.getElementById(id);
  button.classList.contains('flag') ? button.classList.remove('flag') : button.classList.add('flag');
  return false;
}

// mark buttons bomb or cell
function setValues() {
  cellNumbers.forEach(cell => {
    const button = document.getElementById(cell.id);
    button.value = cell.bombs; //button value is equal to number of bombs around it
  })
  bombs.forEach(bomb => {
    const button = document.getElementById(bomb);
    button.value = 'b';
  })
}

// fill the field
function createField(num) {
  field.style.width = 30 * num ** (1 / 2) + 'px'
  for (let x = 0; x < num ** (1 / 2); x++) {
    for (y = 0; y < num ** (1 / 2); y++) {
      createButton(x, y)
    }
  }
}

// set random cell as a bomb
function setBombs(num, bombsNumb) {
  while (bombs.length < bombsNumb) {
    let r = Math.floor(Math.random() * num + 1); // get random cell
    if (bombs.indexOf(r) === -1) {
      bombs.push(r)
    }
  }
}

function showEndGame(string) {
  const text = document.getElementById('message')
  timerActive = false;
  string.includes('won') ? string += `Your time:${document.getElementById('timer').innerText}` : ''
  text.innerText = string
  endBanner.classList.contains('hide') ? endBanner.classList.replace('hide', 'show') : endBanner.classList.replace('show', 'hide')
}

function restartGame() {
  endBanner.classList.replace('show', 'hide');
  field.innerHTML = '';
  bombs = []
  cellNumbers = []
  alreadyReplaced = []
  id = 1
  timerActive = true;
  timerTime = 1;
  setBombs(size - 1, bombsNumber)
  setNumbers()
  createField(size)
  setValues()
}

// set a cell coord and bombs number
function setNumbers() {
  for (let i = 1; i < size + 1; i++) {
    const id = i;
    if (!bombs.includes(id)) {
      const cells = cellType(id) // get the cells around the current one
      const bombsAround = getBombsAround(cells) // count bombs around
      cellNumbers.push({ 'id': id, 'bombs': bombsAround })
    }
  }
}

// return cells around the current one
function cellType(gottenId) {
  const id = parseInt(gottenId)
  const middleCells = [id - square - 1, id - square, id - square + 1,
  id - 1, id + 1,
  id + square - 1, id + square, id + square + 1];

  const rightWallCells = [id - square - 1, id - square,
  id - 1,
  id + square - 1, id + square,];

  const leftWallCells = [id - square, id - square + 1,
  id + 1,
  id + square, id + square + 1];

  const leftUp = [id + 1, id + square, id + square + 1]
  const rightUp = [id - 1, id + square, id + square - 1]
  const leftDown = [id - square, id - square + 1, id + 1]
  const rightDown = [id - square, id - square - 1, id - 1]

  if (id % square === 0 && id !== size) {
    return rightWallCells;
  }
  if (id === size) {
    return rightDown
  }
  if (id === 1) {
    return leftUp
  }
  if (id === square) {
    return rightUp
  }
  if (id === size - square) {
    return leftDown
  }

  if (id % square === 1) {
    return leftWallCells;
  }
  else {
    return middleCells;
  }
}

// count bombs around the cell
function getBombsAround(cells) {
  let quantity = 0;
  cells.forEach(cell => {
    if (bombs.includes(cell)) {
      quantity++
    }
  })
  return quantity;
}

function checkIfBomb(id) {
  const button = document.getElementById(id);
  const value = button.value
  alreadyReplaced.push(parseInt(id))
  if (value === 'b') {
    button.classList.add('bomb')
    showEndGame('Game Over!');
    return
  }
  if (value === '0') {
    cellRecursion(id)
  }
  else {
    const cell = createCell(button)
    button.replaceWith(cell);
  }

  alreadyReplaced.length + bombsNumber === size ? showEndGame("You've won!") : ''
}

function createCell(button) {
  const cell = document.createElement('div');
  cell.classList.add('cellOpened');
  cell.style.left = button.style.left;
  cell.style.top = button.style.top;
  if (button.value === '0') {
    cell.innerText = ' '
  }
  else {
    cell.innerText = button.value;
  }
  return cell
}

// open cells that don't have bomb around automatically
function cellRecursion(id) {
  const button = document.getElementById(id);
  const value = parseInt(button.value)
  //stop if meet a cell with number
  if (value !== 0) {
    const cell = createCell(button)
    button.replaceWith(cell);
    return;
  }
  else {
    const cell = createCell(button)
    button.replaceWith(cell);
    const typeCell = cellType(parseInt(id))
    // repeat for cells around
    typeCell.forEach(x => {
      if (x > 0 && x <= size && !alreadyReplaced.includes(x)) {
        alreadyReplaced.push(x)
        cellRecursion(x)
      }
    })
  }
}

restartGame();
setInterval(setTimer, 1000)
