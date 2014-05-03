/**
 * Created by vanzand on 14-5-1.
 */
var GameManager = function(){
    this.board = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    this.score = 0;
}

/*
初始化游戏
 */
GameManager.prototype.init = function(){
    var _game = this;
    this.board = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    this.score = 0;
    //随机两个数字
    this.addRandomNumber();
    this.addRandomNumber();
    //绑定事件
    var keyMap = {
        37 : 'left', // Left
        38 : 'up', // Up
        39 : 'right', // Right
        40 : 'down'  // Down
    }
    $(document).on('keydown', function(e){
        var mapped = keyMap[e.which];
        if(mapped !== undefined){
            e.preventDefault();
            _game.move(mapped);
        }
    })
}

GameManager.prototype.updateViewer = function(){
    for(var x=0; x<4; x++){
        for(var y=0; y<4; y++){
            GameManager.showNumber(x, y, this.board[x][y]);
        }
    }
}

/**
 * 向指定方向移动
 * @param direction
 */
GameManager.prototype.move = function(direction){
    var _game = this;
    //如果游戏结束了，则直接返回

    //遍历需要从遍历方向的目的方向开始反向遍历，即向左时x轴从0->3，向右时x轴从3->0,y轴同理
    var xTraversals = [0, 1, 2, 3],
        yTraversals = [0, 1, 2, 3];
    if(direction === 'right'){
        xTraversals = xTraversals.reverse();
    }
    if(direction === 'down'){
        yTraversals = yTraversals.reverse();
    }
    //获取移动的向量
    var vector = GameManager.getVector(direction);
    //开始遍历元素进行移动判断
    var merged = [[false, false, false, false], [false, false, false, false], [false, false, false, false], [false, false, false, false]];
    xTraversals.forEach(function(x){
        yTraversals.forEach(function(y){
            //找到对应非空格子应该移动到的位置
            if(_game.board[x][y]!==0){
                var targetCell = _game.findRightCell(x, y, vector, merged);
                //如果未变动，则不许考虑
                if(!(targetCell.x === x && targetCell.y ===y)){
                    _game.board[targetCell.x][targetCell.y] += _game.board[x][y];
                    _game.board[x][y] = 0;
                    //判断指定位置的值是否需要叠加
                    if(_game.board[targetCell.x][targetCell.y]!==0 ){
                        merged[targetCell.x][targetCell.y]=true;
                        _game.score += _game.board[targetCell.x][targetCell.y];
                    }
                    //移动元素
                   // _game.moveCell(x, y, targetCell.x, targetCell.y);
                }

            }
        })
    });
    //更新视图
    setTimeout(function(){
        _game.updateViewer();
    },100);
    //添加一个新的数字
    _game.addRandomNumber();
}

GameManager.prototype.moveCell = function(formX, formY, targetX, targetY){
    var targetPlaceCell = $('#cell_'+targetX+'_'+targetY);
    $('#num_cell_'+formX+'_'+formY).animate({
        left:targetPlaceCell.offset().left,
        top :targetPlaceCell.offset().top
    }, 200);
}

/**
 * 找到向对应方向移动时应该移动到的位置
 * @param x
 * @param y
 * @param vector
 */
GameManager.prototype.findRightCell = function(x, y, vector, merged){
    var previousX = x, previousY = y, value = this.board[x][y];
    do{
        previousX = x;
        previousY = y;
        x+=vector.x;
        y+=vector.y;
    }while(inBoard(x, y) && this.board[x][y]===0);
    //此时previousCell就是移动之前的合法点，当然我们需要考虑此时能否向指定方向移动,即值是否相等
    x = previousX;
    y = previousY;
    x+=vector.x;
    y+=vector.y;
    if(inBoard(x, y) && this.board[x][y]===value && merged[x][y]===false){
        previousX = x;
        previousY = y;
    }
    return {
        x : previousX,
        y : previousY
    };

    function inBoard(x, y){
        return 0<= x && x<=3 && 0<=y && y<=3;
    }
}

/**
 * 获取方向对应的移动向量
 * @param direction
 */
GameManager.getVector = function(direction){
    var vector = {
        x : 0,
        y : 0
    };
    switch (direction){
        case 'left' :
            vector.x = 0;
            vector.y = -1;
            break;
        case 'up' :
            vector.x = -1;
            vector.y = 0;
            break;
        case 'right' :
            vector.x = 0;
            vector.y = 1;
            break;
        case 'down' :
            vector.x = 1;
            vector.y = 0;
            break;
    }
    return vector;
}

/*
添加一个随机数
 */
GameManager.prototype.addRandomNumber = function(){
    //获取当前空着的格子
    var availableCells = this.availableCells();
    if(availableCells.length){
        //随机获取空格子
        var randomLength = Math.floor(Math.random() * availableCells.length),
            cell = availableCells[randomLength];
        //获取随机的数字
        var randomNum = Math.random() < 0.7 ? 2 : 4;
        //显示出对应的数字
        this.board[cell.x][cell.y] = randomNum;
        GameManager.showNumber(cell.x, cell.y, randomNum);
    }
}

/*
 判断是否还有空位可以放入随机数
 */
GameManager.prototype.availableCells = function(){
    var cells = [];
    for(var i=0; i< this.board.length; i++){
        for(var j=0; j<this.board[i].length; j++){
            if(!this.board[i][j]){
                cells[cells.length] = {
                    x : i,
                    y : j
                };
            }
        }
    }
    return cells;
}

/**
 * 显示出对应的数字
 * @param x
 * @param y
 * @param number
 */
GameManager.showNumber = function(x, y, number){
    var board_cell = $('#cell_'+x+'_'+y),
        num_cell = $('#num_cell_'+x+'_'+y);
    if(number){
        num_cell.text(number).css({
            width : board_cell.width(),
            height : board_cell.height(),
            backgroundColor : GameManager.getNumCellBackgroundColor(number),
            color : '#000000'
        });
    }else{
        num_cell.text('').css({
            width : 0,
            height : 0
        });
    }

}

/**
 * 获取对应数字的颜色数
 * @param number
 */
GameManager.getNumCellBackgroundColor = function(number){
    var bgColors;
    switch (number){
        case 2 :
            bgColors = '#eee4da';
            break;
        case 4 :
            bgColors = '#ede0c8';
            break;
        case 8 :
            bgColors = '#f2b179';
            break;
        case 16 :
            bgColors = '#f59563';
            break;
        case 32 :
            bgColors = '#f67c5f';
            break;
        case 64 :
            bgColors = '#f65e3b';
            break;
        case 128 :
            bgColors = '#edcf72';
            break;
        case 256 :
            bgColors = '#edcc61';
            break;
        case 512 :
            bgColors = '#edc850';
            break;
        case 1024 :
            bgColors = '#edc53f';
            break;
        case 2048 :
            bgColors = '#edc22e';
            break;
        default :
            bgColors = '#3c3a32';
            break;
    }
    return bgColors;
}

$(function(){
    //初始化游戏
    var game = new GameManager;
    game.init();
});
