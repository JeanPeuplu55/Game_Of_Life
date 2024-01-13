const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const density = document.getElementById('density');
const play = document.getElementById('play');
const reset = document.getElementById('reset');


// on ne change pas la taille du canvas
const canvasSize = 500;
let gridSize = canvasSize;

const canvasPixel = 1000;

let cellSize = canvasPixel / gridSize;
let drawGrid = [];
let updateGrid =[];
let mainLoop = null;
let mouseZoom = [0, 0];
let coordinateM = [0, 0];

isMouseDown = false;


function drawPixel(pixelsArray){  
    // on rafraichit le canvas
    let zoomOrigin
    if(coordinateM[0] >= gridSize / 2 ){
        zoomOrigin =  gridSize / 2;
    }else{
        zoomOrigin=0;
    }
    
    mouseZoom = [Math.abs(coordinateM[0] -zoomOrigin ) , Math.abs (coordinateM[1] - zoomOrigin)]; 
    console.log(mouseZoom)
    cellSize = canvasPixel / gridSize;
    ctx.clearRect(0,0, canvasSize, canvasSize);
    // la boucle i correspond au nbre de ligne, cela correspond à la verticalité.
    for(i = 0; i < gridSize; i++){
        // la boucle j correspond au nbre de colonne, donc l'horizontalité.
        for (j= 0 ; j < gridSize; j++){
            color = pixelsArray[i][j] ? "chartreuse" : "black";   
            ctx.fillStyle = color;            
            ctx.fillRect(mouseZoom[0] + i * cellSize, mouseZoom[1] + j * cellSize, cellSize, cellSize);    
             
              
        }
    }
}

function initGrid(density = 0.5) {
    
    for(i = 0; i < canvasSize; i++){
        drawGrid [i] = [];
        updateGrid[i] = [];
        for (j= 0 ; j < canvasSize; j++){
            drawGrid[i][j] = getRandomBoolean(density);
            updateGrid[i][j] = null;
        }
   }

}

function getRandomBoolean(density) {
    return Math.random() < density;
}
initGrid(gridSize);
drawPixel(drawGrid);

// reset.addEventListener('click', function(){
//     // ctx.clearRect(0,0, canvasSize, canvasSize);
//     // let val = this.value;
//     // initGrid(gridSize, 0);
//     for(i = 0; i < gridSize; i++){

//         for (j= 0 ; j < gridSize; j++){
//             drawGrid[i][j] = getRandomBoolean(density);
//             updateGrid[i][j] = false;
//         }
//    }
// })
// initGrid(gridSize);
// drawPixel(drawGrid);

density.addEventListener('input', function(){
    let val = this.value;
    initGrid(0);
    drawPixel(drawGrid);
})

function main(){
    mainLoop = setInterval(function(){
        // console.log('hey')
        for(i = 0; i < canvasSize; i++){
            for (j= 0 ; j < canvasSize; j++){
                // on verifie l'état de la cellule (vivante ou morte)
                let cellState = drawGrid[i][j];

                // on calcule le nbre de cellule vivante autour d'elle 
                let neighboursNbrCellAlive = deadOrAliveNbr(i, j);

                // on va décider de l'état de la cellule grâce au nbre de cellules autour d'elle
                let isAlive = checkIsAlive(cellState, neighboursNbrCellAlive);
                // console.log(`La cellule de position [${i} , ${j}] est dans un état ${isAlive},
                // avant elle était ${cellState} et elle avait ${neighboursNbrCellAlive} voisines vivantes`)
                

                // on ajoute l'état de la cellule ds le tableau de MAJ.
                updateGrid[i][j] = isAlive;
                 
            }
        }
        /* il change le tableau qui dessine par le tableau de MAJ.
           on dessine */
           exchangeGrid();

        drawPixel(drawGrid);
    }, 200)
}

function deadOrAliveNbr(x, y){
    const nbCoordinate = [[-1, -1], [0. -1], [1, -1], [-1, 0], 
                          [1, 0], [-1, 1], [0, 1], [1, 1]];
        let count = 0;
        nbCoordinate.forEach(c => {
            count += getNbState(x + c[0], y + c[1]);
        })
            return count;
}

function getNbState(x, y){
    try{
        return drawGrid[x][y] ? 1 : 0;
    }catch{
        return 0;
    }
}

function checkIsAlive(cellState, neighboursNbrCellAlive){
    // if (cellState && neighboursNbrCellAlive < 2){
    //     return false;

    // }
    // else if (cellState && (neighboursNbrCellAlive === 2 || neighboursNbrCellAlive === 3)){
    //     return true;
    // }
    // else if (cellState && neighboursNbrCellAlive > 3){
    //     return false;
    // }
    // else if (cellState && neighboursNbrCellAlive === 3){
    //     return true;
    // }

        if (!cellState && neighboursNbrCellAlive === 3){
            return true;

        }
        else if (cellState && neighboursNbrCellAlive > 1 && neighboursNbrCellAlive < 4){
            return true;
        }else{
            return false;
        }

}

function exchangeGrid(){
    for(i = 0; i < canvasSize; i++){
        for (j= 0 ; j < canvasSize; j++){
            drawGrid[i][j] = updateGrid[i][j];
        }
    }

}

canvas.addEventListener("click", function(e){
   let coordinate= getMouseCoordinates(e);
    drawGrid[coordinate[0]][coordinate[1]] = drawGrid[coordinate[0]][coordinate[1]] ? false : true;
        drawPixel(drawGrid);

        
        // console.log(pX, pY);
})
canvas.addEventListener("mousemove", function(e){
    
    if(isMouseDown){
        coordinate = getMouseCoordinates(e)
        drawGrid[coordinate[0]][coordinate[1]] = true;
        drawPixel(drawGrid);
    }      
})


canvas.addEventListener("mousedown", function(){
    isMouseDown = true;
})
canvas.addEventListener("mouseup",function(){
    isMouseDown = false;
})
canvas.addEventListener("mouseout",function(){
    isMouseDown = false;
})

play.addEventListener('click', function(){
    if(mainLoop!=null){
        clearInterval(mainLoop);
        mainLoop = null;
    }else{
        main();
    }
})

function getMouseCoordinates(event){
    let limit = canvas.getBoundingClientRect();
    let posX = event.clientX - limit.left;
    let posY = event.clientY - limit.top;
    let pX = Math.floor(posX / cellSize);
    let pY = Math.floor(posY / cellSize);
        return [pX, pY];
}

// EXPERIMENTAL

let scale = 1;

canvas.addEventListener('wheel', function(e){
    e.preventDefault();
    coordinateM = getMouseCoordinates(e);
    scale += e.deltaY * 0.001;

    if(gridSize < canvasSize){
        scale = Math.min(Math.max(0.1, scale,0.1), 1.1);     
    }else{
        scale = Math.min(Math.max(0.1, scale, 0.1), 1); 
    }
    gridSize = Math.round (clamp(gridSize * scale, canvasSize * 0.1, canvasSize));

    scale = 1
    drawPixel(drawGrid);
    console.log()

})

function clamp(value, min, max){

    if (value > max){
        return max;
    }else if (value < min){
        return min;
    }else{
        return value;
    }
}


initGrid();
drawPixel(drawGrid);
