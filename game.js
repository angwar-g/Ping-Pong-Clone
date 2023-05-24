const SETTINGS = {
    winScore: 7,

    smallFont: "10px retro",
    largeFont: "14px retro",
    scoreboardColour: "black",

    buttonColour: "white",
    buttonTextColour: "black",

    paddleSound: '/Sounds/Paddle.wav',
    wallSound: '/Sounds/Wall.wav',
    scoreSound: '/Sounds/Score.wav',

    fps: 60,
    courtColour: "black",
    wallColour: "white",
    wallSize: 20,
    courtMarginX: 12,
    courtMarginY: 4,

    width: innerWidth,
    height: innerHeight,

    paddleColour: "white",
    paddleWidth: 12,
    paddleHeight: 48,

}

const PLAYERS = {
    playerOne: 1,
    playerTwo: 2
}


class Game {
    
    constructor(canvas){
        this.canvas = canvas;
        this.court = new Court(canvas);

        this.startButton = new Rectangle(canvas.width /2 -60 , canvas.height /2 - 20, 120, 40)   
        canvas.addEventListener("click", (e) => {
            if (this.startButton.contains(e.clientX, e.clientY) && !this.court.isMatchRunning){
                this.court.startMatch()
            }

        }) 
    }


    

    start(){

        let that = this;
        let previousTime = Date.now();

        setInterval(function(){
            //update
            let now = Date.now();

            let dT;
            dT = (now - previousTime)/1000.0;

            that.court.update(dT);
            
            that.draw();

            previousTime = now;
        }, 1/SETTINGS.fps*1000)     // set interval function takes a function and an interval 
    }

    draw(){

        let ctx = this.canvas.getContext("2d")
        ctx.clearRect(0,0,this.canvas.width, this.canvas.height)
        this.court.draw(this.canvas)
        if(!this.court.isMatchRunning){
            ctx.fillStyle = SETTINGS.buttonColour
            ctx.fillRect(this.startButton.x, this.startButton.y, this.startButton.width, this.startButton.height)
            ctx.fillStyle = SETTINGS.buttonTextColour
            ctx.font = SETTINGS.smallFont
            ctx.fillText("START MATCH", this.startButton.x + 5, this.startButton.y + this.startButton.height/2 + 6)

        }
    }
    
}

class ScoreBoard {

    constructor(){
        this.reset()
    }

    get winner(){
        if (this.scoreplayer1 >= SETTINGS.winScore){
            return 1
        }
        else if (this.scoreplayer2 >= SETTINGS.winScore){
            return 2
        }
        else{
            return 0
        } 
        
    }

    draw(canvas){
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "#0D98BA"
        ctx.font = SETTINGS.smallFont
        ctx.fillText("Player 1: " + this.scoreplayer1, 8, 20);
        ctx.fillText("Player 2: " + this.scoreplayer2, canvas.width - 130, 20);
        ctx.fillText("Round: " + this.round, canvas.width / 2 - 50, 20);

    }

    reset(){
        this.scoreplayer1 = 0
        this.scoreplayer2 = 0
        this.round = 1
    }

}

class Paddle {
    
    constructor(x, y, width, height, player_number, court){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.player_number = player_number;
        this.court = court;
        this.startX = x;
        this.startY = y;
    }

    reset(){
        this.x = this.startX
        this.y = this.startY
    }

    draw(canvas) {
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "000000";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    get collisionBox() {
        return new Rectangle(this.x, this.y, this.width, this.height)
    }
    
}

class PaddleController {

    constructor (paddle){
        this.paddle = paddle
        this.court = this.paddle.court
        this.canvas = this.court.canvas
        canvas.addEventListener("mousemove", (e) => {
            if (e.clientY < this.court.bounds.upper){
                this.paddle.y = this.court.bounds.upper
            }
            else if (e.clientY + SETTINGS.paddleHeight > this.court.bounds.lower){
                this.paddle.y = this.paddle.court.bounds.lower - SETTINGS.paddleHeight
            }
            else {
                this.paddle.y = e.clientY
            }
            
        })

        }
}
    

class AIController {

    constructor(paddle){
        this.paddle = paddle
        this.ball = this.paddle.court.ball
    } 

    get prediction(){
        return this.ball.y
    } 

    update(dT){
        if (this.ball.velocity.x > 0 && this.ball.x > SETTINGS.width/2 + 250){
            if(this.prediction > this.paddle.y + this.paddle.height/2){
                this.paddle.y += 5
            }
            else if(this.prediction < this.paddle.y + this.paddle.height/2){
                this.paddle.y -= 5
            }
           
        }

    }
    
}

class Court {

    constructor(canvas){
        this.isMatchRunning = false
        this.canvas = canvas;
        this.paddle_player1 = new Paddle(SETTINGS.paddleWidth, 
                                        canvas.height/2 - SETTINGS.paddleHeight/2,
                                        SETTINGS.paddleWidth, 
                                        SETTINGS.paddleHeight, 
                                        PLAYERS.playerOne,
                                        this)
        this.paddle_player2 = new Paddle(canvas.width- 2 * SETTINGS.paddleWidth,
                                        canvas.height/2 - SETTINGS.paddleHeight/2, 
                                        SETTINGS.paddleWidth, 
                                        SETTINGS.paddleHeight, 
                                        PLAYERS.playerTwo,
                                        this)
        this.ball = new Ball(canvas.width/2, canvas.height/2, 10, this)  
        this.paddlecontroller = new PaddleController(this.paddle_player1)
        this.AIController = new AIController(this.paddle_player2)
        this.scoreboard = new ScoreBoard()
    }

    get bounds(){
        return {
            upper: SETTINGS.courtMarginY + SETTINGS.wallSize,
            lower: this.canvas.height - (SETTINGS.courtMarginY + SETTINGS.wallSize),
            left: 0,
            right: this.canvas.width
        }
    }

    startMatch(){
        this.isMatchRunning = true
        this.spawnBall()
        this.paddle_player1.reset()
        this.paddle_player2.reset()
        this.scoreboard.reset()
    }

    spawnBall(){
        this.ball.velocity = {x : Math.random()>0.5 ? 100 : -100, 
                              y : Math.random()>0.5 ? 100 : -100};
        this.ball.x = this.canvas.width / 2
        this.ball.y = this.canvas.height / 2
    }


    scorePoint(player){
        if (player == PLAYERS.playerOne){
            this.scoreboard.scoreplayer1 += 1  
        }
        else{
            this.scoreboard.scoreplayer2 += 1
        }
        
        if (this.scoreboard.winner){
            this.isMatchRunning = false
        }   
        else{
            this.scoreboard.round += 1
            this.spawnBall()
        }

    }


    draw(canvas){

        //background
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = "#0D98BA";
        ctx.fillRect(0,0,SETTINGS.width, SETTINGS.height);

        // margin on top
        ctx.fillStyle = "#000000";
        ctx.fillRect(0,SETTINGS.courtMarginY,this.canvas.width, SETTINGS.wallSize);

        //margin on bottom
        ctx.fillStyle = "#000000";
        ctx.fillRect(0,this.canvas.height-SETTINGS.courtMarginY-SETTINGS.wallSize,this.canvas.width, SETTINGS.wallSize);

        //dashed center line
        ctx.setLineDash([40]);
        ctx.beginPath();
        ctx.moveTo(SETTINGS.width/2, 0);
        ctx.lineTo(SETTINGS.width/2, SETTINGS.height - SETTINGS.courtMarginY);
        ctx.stroke();

        //paddles
        this.paddle_player1.draw(canvas);
        this.paddle_player2.draw(canvas);
        this.ball.draw(canvas);
        //scoreboard
        this.scoreboard.draw(canvas)

    }

    update(dT){
        if (this.isMatchRunning == false){
            return 
        }
        this.ball.update(dT)
        this.AIController.update(dT)
    }

    
}

class Ball {
    constructor(x, y, radius, court){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.court = court;
        this.velocity = {x: -100, y:100}
        this.acceleration = 3
        this.paddleSound = new Audio(SETTINGS.paddleSound)
        this.wallSound = new Audio(SETTINGS.wallSound)
        this.scoreSound = new Audio(SETTINGS.scoreSound)
    }

    get collisionBox() {
        return new Rectangle(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
    }

    draw(canvas){
        let ctx = canvas.getContext('2d');
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius,0, 2*Math.PI);
        ctx.fillStyle = "000000";
        ctx.fill()

    }

    update(dT) {
        this.x += this.velocity.x * this.acceleration * dT
        this.y += this.velocity.y * this.acceleration * dT

        // Hits the upper wall or the lower wall
        if (this.y - this.radius <= this.court.bounds.upper  || this.y + this.radius >= this.court.bounds.lower) {
            this.velocity.y *= -1
            this.wallSound.currentTime = 0
            this.wallSound.play()
            
        }

        if (this.collisionBox.overlaps(this.court.paddle_player1.collisionBox)) {
            this.velocity.x *= -1
            this.x = this.court.paddle_player1.collisionBox.right + this.radius 
            this.paddleSound.currentTime = 0
            this.paddleSound.play()       
        }

        if (this.collisionBox.overlaps(this.court.paddle_player2.collisionBox)) {
            this.velocity.x *= -1
            this.x = this.court.paddle_player2.collisionBox.left - this.radius  
            this.paddleSound.currentTime = 0
            this.paddleSound.play()        
        }

        if (this.x > this.court.bounds.right){
            this.court.scorePoint(PLAYERS.playerOne)
            this.scoreSound.currentTime = 0
            this.scoreSound.play()
        }

        if (this.x < this.court.bounds.left){
            this.court.scorePoint(PLAYERS.playerTwo)
            this.scoreSound.currentTime = 0
            this.scoreSound.play()
        }
    }
    
}

class Rectangle {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    get left() {return this.x}
    get right() {return this.x + this.width}
    get top() {return this.y}
    get bottom() {return this.y + this.height}

    overlaps(other) {
        return other.left < this.right &&
        this.left < other.right &&
        other.top < this.bottom &&
        this.top < other.bottom
    }

    contains(x, y) {
        return this.left < x && this.right > x && this.top < y && this.bottom > y
    }

}

const canvas = document.getElementById("game")
canvas.width = SETTINGS.width;
canvas.height = SETTINGS.height;
let game = new Game(canvas)
game.start();