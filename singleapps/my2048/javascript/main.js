$(function() {
  var my2048 = {
    score: 0,
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
    //展示
    this.show();
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

    //一次遍历完后再做插入操作
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
      cellDiv = document.querySelector('#num_cell_'+x+'_'+y),
      cellInnerDiv = document.querySelector('#num_cell_inner_'+x+'_'+y),
      numCellClass = ['num-cell', 'num_cell_' + number, 'num_cell_' + x + '_' + y];
    if (specialClass === 1) {
      numCellClass.push('num_cell_new');
    } else if (specialClass === 2) {
      numCellClass.push('num_cell_merged');
    }
    cellDiv.setAttribute('class', numCellClass.join(' '));
    cellInnerDiv.textContent = number;
  }

  my2048.init();
})
