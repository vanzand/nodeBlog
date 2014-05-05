$(function() {
  var my2048 = {
    score: 0,
    highScore : 0,
    board: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    specialClass: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ] //0代表正常，1代表add， 2代表merged
  };
  my2048.init = function() {
    //清空分数和内容
    this.score = 0;
    this.board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    this.specialClass = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    //初始化两个数字
    this.addRandomNumber();
    this.addRandomNumber();
    //绑定事件
    $(document).bind('keydown', function(e){
      var keyMap = {
        37 : 0, //left
        38 : 1, //up
        39 : 2, //right
        40 : 3, //down
      }, direction = keyMap[e.which];
      if(direction !== undefined){
        my2048.move(direction);
      }
    });
    //展示
    this.show();
  }

  my2048.move = function(direction){
    var board = this.board, specialClass = this.specialClass = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    //移动时判断每个元素是否能移动是从目的方向开始的，向左的时候列方向是正序，向右列方向是反序,向上的时候横方向是正序，向下的时候横方向是反序
    var xList = [0, 1, 2, 3], yList = [0, 1, 2, 3];
    if(direction===2){
      yList = yList.reverse();
    }else if(direction===3){
      xList = xList.reverse();
    }
    var mergedCell = [
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false]
    ], moved = false;
    xList.forEach(function(x){
      yList.forEach(function(y){
        if(board[x][y]){
          //找到每个非零元素应该移动到的位置
          var targetCell = my2048.findMovedTarget(x, y, direction, board[x][y], mergedCell);
          if(targetCell.x!==x || targetCell.y !==y){
            moved = true;
            //进行数字的更新
            if(board[targetCell.x][targetCell.y]){
              //发生合并
              board[targetCell.x][targetCell.y] += board[x][y];
              board[x][y] = 0;
              mergedCell[targetCell.x][targetCell.y] = true;
              my2048.score += board[targetCell.x][targetCell.y];
              specialClass[targetCell.x][targetCell.y] = 2;
            }else{
              board[targetCell.x][targetCell.y] += board[x][y];
              board[x][y] = 0;
            }
          }
        }
      });
    });
    //展示
    if(moved){
      //只有移动了才有必要进行展示的更新
      //添加一个新元素
      this.addRandomNumber();
      this.show();
    }
  }

  my2048.findMovedTarget = function(x, y, direction, value, mergedCell){
    var previousX = x, previousY = y, board = this.board;
    //向不同的方向移动时，坐标的移动是有规律的，例如向左移动，行不变列减一...
    var vector = this.getVector(direction);
    do{
      previousX = x;
      previousY = y;
      x += vector.x;
      y += vector.y;
    }while(this.inBound(x, y) && board[x][y]===0);
    //此时要么到了边界，要么下一个格子有数字
    if(!this.inBound(x, y)){
      return {
        x : previousX,
        y : previousY
      }
    }else{
      if(board[x][y]===value && !mergedCell[x][y]){
        //如果值相等并且没有合并过可以合并
        return {
          x : x,
          y : y
        }
      }else{
        return {
          x : previousX,
          y : previousY
        }
      }
    }
  }

  my2048.inBound = function(x, y){
    return 0<=x && x<=3 && 0<=y && y<=3;
  }

  my2048.getVector = function(direction){
    var vectorX = 0, vectorY = 0;
    switch(direction){
    case 0 :
      vectorY = -1;
      break;
    case 1 :
      vectorX = -1;
      break;
    case 2 :
      vectorY = 1;
      break;
    case 3 :
      vectorX = 1;
      break;
    }
    return {
      x : vectorX,
      y : vectorY
    };
  }

  my2048.addRandomNumber = function() {
    //获取此时空着的单元格的x和y
    var avialableCells = this.avialableCells(),
      randomCell = avialableCells[Math.floor(Math.random() * avialableCells.length)],
      randomNumber = Math.random() < 0.8 ? 2 : 4;
    this.board[randomCell.x][randomCell.y] = randomNumber;
    this.specialClass[randomCell.x][randomCell.y] = 1;
  }

  my2048.avialableCells = function() {
    var board = this.board,
      avialableCells = [];
    for (var x = 0; x <= 3; x++) {
      for (var y = 0; y <= 3; y++) {
        if (!board[x][y]) {
          avialableCells.push({
            x: x,
            y: y
          });
        }
      }
    }
    return avialableCells;
  }

  my2048.show = function() {
    var board = this.board,
      specialClass = this.specialClass;
    //更新分数
    if(this.score>this.highScore){
      this.highScore = this.score;
    }
    $('#currentScore').text(this.score);
    $('#highScore').text(this.highScore);

    //每次都要先清空cocntainer的数据
    $('#number-container').empty();
    window.requestAnimationFrame(function() {
      for (var x = 0; x <= 3; x++) {
        for (var y = 0; y <= 3; y++) {
          if (board[x][y]) {
            //显示出所有非空元素
            my2048.showOneNumber(x, y, board[x][y], specialClass[x][y]);
          }
        }
      }
    });

  }

  my2048.showOneNumber = function(x, y, number, specialClass) {
    var numContainer = document.querySelector('#number-container'),
      cellDiv = document.createElement('div'),
      cellInnerDiv = document.createElement('div'),
      numCellClass = ['num-cell', 'num_cell_' + number, 'num_cell_' + x + '_' + y];
    if (specialClass === 1) {
      numCellClass.push('num_cell_new');
    } else if (specialClass === 2) {
      numCellClass.push('num_cell_merged');
    }
    cellInnerDiv.classList.add('num_cell_inner');
    cellInnerDiv.textContent = number;
    cellDiv.setAttribute('class', numCellClass.join(' '));
    cellDiv.appendChild(cellInnerDiv);
    numContainer.appendChild(cellDiv);
  }

  my2048.init();
})
