const WIDTH=800, HEIGHT=600;
const FHEIGHT = 10000;
let DEBUG = location.hash === "#debug"? true : false;// Boolean(confirm("debug mode"));
var config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: DEBUG
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var CAN_JUMP = true;
var JUMP_VELOCITY = -330;

/*var camera = new Phaser.C
*/
var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0, scores=[], score_elt;
var gameOver = false;
var explosion;
var name;
var game = new Phaser.Game(config);
var nbombs = 0;
var GameY = 0;
var SKY;
var walls;
var bomb_ys;


console.log(game);

try {
    if(!Array.isArray(JSON.parse(localStorage.scores))) throw "error";
}
catch(e) {
    localStorage.scores = "[]";
}


function preload ()
{
    this.load.image('sepline', 'images/seperator.png');
    this.load.image('sky', 'images/sky.png');
    this.load.image('ground', 'images/platform.png');
    this.load.image('star', 'images/star.png');
    this.load.image('bomb', 'images/bomb.png');
    this.load.image('wall10x100', 'images/wall-10x100.png');
    this.load.image('platform-100', 'images/platform-100.png')
    this.load.spritesheet('dude', 'images/dude.png', { frameWidth: 32, frameHeight: 42 });
    this.load.spritesheet('pac', 'images/pac.png', { frameWidth: 50, frameHeight: 50 });
    this.load.spritesheet('explosion', 'images/explosion.png', { frameWidth: 100, frameHeight: 100 })
}

function create ()
{
    
    //  A simple background for our game
    document.onclick = (e) => e.target.requestFullscreen();
    SKY = this.add.image(WIDTH/2, HEIGHT/2, 'sky');
    score_elt = this.add.image(WIDTH/2, score, 'sepline');
    score_elt.setTint(0x008800);

    var names = [], oppt = [];
    for(var _score of JSON.parse(localStorage.scores)) {
        if(names.includes(_score.name)) {
            if(oppt[names.find(_score.name)] > _score.score) continue;
        }
        names.push(_score.name);
        oppt.push(_score.score);
        scores.push(this.add.image(WIDTH/2, _score.score, 'sepline'));
        scores.push(this.add.text(WIDTH/2, _score.score, _score.name,  { fontSize: '20px', fill: '#fff' }));
    }
    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();
    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    var platforms_coords = [
        {
            x:0,
            y:-315,
            type: "platform-100"
        },
        {
            x:50,
            y:300
        },
        {
            x:75,
            y:200,
            type: "platform-100"
        },
        {
            x:400,
            y:70
        },
        {
            x:70,
            y:-150
        },
        {
            x:110,
            y:-730
        },
        
        {
            x:401,
            y:-450
        },
        {
            x:410,
            y:-900
        },
        {
            x:840,
            y: 50,
            type: "platform-100"
        },
        {
            x:500,
            y:-50
        },
        {
            x:600,
            y:400
        },
        {
            x:700,
            y:-300
        },
        {
            x:701,
            y:-630
        },
        {
            x:750,
            y:230
        },
        {
            x:400,
            y:-600,
            type: "platform-100"
        },
        {
            x:0,
            y:-1050,
            type: "platform-100"
        },
        {
            x:536,
            y:-1150,
            type: "ground"
        },
        {
            x:618,
            y:-1250,
            type: "platform-100"
        },
        {
            x:400,
            y:-1500,
            type: "ground"
        },
        {
            x:714,
            y:-1400,
            type: "platform-100"
        },
        {
            x:57,
            y:-1650,
            type: "platform-100"
        },
        {
            x:400,
            y:-1800,
            type: "ground"
        }
    ]
    bombs = this.physics.add.group();

    for(var gnd of platforms_coords) {
        platforms.create(Number(gnd.x), gnd.y, gnd.type || 'ground');
        if(DEBUG) this.add.text(Number(gnd.x), gnd.y, gnd.x+","+gnd.y.toString(), { fontSize: '32px', fill: '#fff' });
     
    }
    console.log("platforms: ", platforms);

    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'pac');
    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    //player.body.setGravityY(1);

    //player.setCollideWorldBounds(true);
    console.log("player: ", player);
    walls = this.physics.add.staticGroup();
    for(var i = HEIGHT; i > -FHEIGHT; i-=100) {
        walls.create(-5, i, "wall10x100");
        walls.create(WIDTH+5, i, "wall10x100");
    }
    

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('pac', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });



    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('pac', { start: 2, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'explose',
        frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 3 }),
        frameRate: 20,
        repeat: 0

    });
    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();
    print("bombs: ",bombs);

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
        key: 'star',
        repeat: 15,
        setXY: { x: 12, y: 0, stepX: 50 }
    });

    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.9, 1));

    });

    
    console.log(bombs);

    //  The score


    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(walls, bombs);
    this.physics.add.collider(walls, player);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

    print("cameras: ",this.cameras);




}

function update ()
{
    if (gameOver)
    {
        if(!name) {
            name = prompt("enter your name:");
            if(!name) return;
            //todo ask name to score
            var all = JSON.parse(localStorage.scores).filter((elt) => elt.name != name);
            all.push({
                name: name,
                score: score
            });
            localStorage.scores = JSON.stringify(all);
        }
        return;
    }
    SKY.y = GameY+(HEIGHT/2);


    if(player.y-GameY < HEIGHT/3) {
        //todo try scrollling modify
        this.cameras.main.scrollY -= ((HEIGHT/3)-(player.y-GameY));
        GameY -= ((HEIGHT/3)-(player.y-GameY));
    } else if(player.y-GameY > (HEIGHT/3)*2) {
        //todo try scrollling modify
        this.cameras.main.scrollY -= ((HEIGHT/3)*2-(player.y-GameY));
        GameY -= ((HEIGHT/3)*2-(player.y-GameY));
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if(cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }else {
        player.setVelocityX(0);
    }
    
    //print((cursors.up.isDown || cursors.space.isDown) && true);
    if ((cursors.up.isDown || cursors.space.isDown) && player.body.touching.down && CAN_JUMP && !cursors.down.isDown)
    {
        player.setVelocityY(JUMP_VELOCITY);
    }
    
}
window.print = console.log;

function collectStar (player, star)
{
    star.disableBody(true, true);

    //  Add and update the score

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, GameY, true, true);

        });
        score = GameY;
        score_elt.y = score;
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, GameY-16, 'bomb');
        bomb.setBounce(1);
        // bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
        nbombs += 1;
    }
}

function hitBomb (player, bomb)
{
    //debugger;
    print(cursors);
    if(cursors.down.isDown) {
        console.log("cheated");
        return;
    }
    explosion = this.physics.add.sprite(player.x, player.y, 'explosion');
    explosion.anims.play("explose", false);

    this.physics.pause();

    player.setTint(0xff0000);


    gameOver = true;
    var restart = this.add.text(200, 200+GameY, 'Restart', { fontSize: '100px', fill: '#fff', background: '#0f07' });
    document.querySelector("canvas").onclick = () => location.reload();

}
