/* 変数定義 */
var canvas,ctx;
var img_player, img_enemy, img_potion;
/* プレイヤー */
var player_x, player_y;
var player_hp;
/* アイテム */
var potion = 1;
var potion_x = new Array(potion);
var potion_y = new Array(potion);
var potion_hp = new Array(potion);
var muteki = 1;
var muteki_x = new Array(muteki);
var muteki_y = new Array(muteki);
var muteki_hp = new Array(muteki);
/* 配列(敵キャラ) */
var enemies = 30;
var enemies_x = new Array(enemies);
var enemies_y = new Array(enemies);
var enemies_hp = new Array(enemies);
var speed = 1;
/* 効果音 */
var damage = new Audio('koukaon1.mp3');
var medicine = new Audio('koukaon2.mp3');
var death = new Audio('koukaon.mp3');
/* BGM */
var startBGM = new Audio('tnt.mp3');
var gameBGM = new Audio('kai.mp3');
/* スコア */
var s = 0;
/* インターバル */
var star_interval = 30;
var player_star_interval=20;
/* FPS管理 */
var FPS = 30;
var MSPF = 1000 / FPS;
/* キー状態 */
var keys = new Array(256);


/* キー状態を初期化 */
for(var i=0; i<keys.length; i++){
  keys[i]=false;
}


/* BGMを流す */
startBGM.loop = true;
startBGM.play();

/* スタートボタンで呼び出される処理 */
function gameStart() {
  /* BGM */
  startBGM.loop = false;
  gameBGM.loop = true;
  gameBGM.play();
  canvas = document.getElementById('screen');
  document.getElementById("start").style.display = "none";
  document.getElementById("str_title").style.display = "none";
  document.getElementById("screen").style.display = "block";
  document.getElementById("score_hp").style.display = "block";
  /* 2次元用描画コンテキストを取得 */
  ctx = canvas.getContext('2d');

  /* 画像を取得 */
  img_player = document.getElementById('player');
  img_enemy = document.getElementById('enemy');
  img_potion = document.getElementById('potion');
  img_muteki = document.getElementById('muteki');

  /* player設定 */
  player_x = (canvas.width-player.width)/2;
  player_y = (canvas.height-player.height)-20;
  player_hp = 3;

  /* enemies位置設定 */
  for(var i=0; i<enemies; i++){
    enemies_x[i] = Math.random()*(canvas.width-img_enemy.width);
    enemies_y[i] = Math.random()*(canvas.height-img_enemy.height);
    enemies_hp[i] = 10;
  }
  /* mainloop開始 */
  mainloop();
}


/* (再)描画 */
var draw = function(){
  /* キャラクタークリア */
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  /* player描画 */
  if(player_hp > 0){
　　　　ctx.save();
    if(player_star_interval % 2 != 0){
      ctx.globalAlpha = 0.5;
    }
    ctx.drawImage(img_player, player_x, player_y);
    ctx.restore();
  }
  /* 体力0でgameover */
  if(player_hp <=0){
    /* 効果音・BGM */
    gameBGM.loop = false;
    death.play();
    document.getElementById("screen").style.display = "none";
    document.getElementById("over").style.display = "block";
   
    if (s < 20) {
        var goimg = document.getElementById('bg');
        document.getElementById("go").style.display = "block";
        goimg.style.backgroundImage = "url(character/gameover.png)";
        document.getElementById("setumei").style.display = "none";
    }
    if (s >=20) {
        var gcimg = document.getElementById('bg');
        document.getElementById("gc").style.display = "block";
        gcimg.style.backgroundImage = "url(character/gc.jpg)";
        document.getElementById("setumei").style.display = "none";
    }
  }
  /* enemies描画 */
  for(var i=0; i<enemies; i++){
    if(enemies_hp[i] > 0){
      ctx.drawImage(img_enemy, enemies_x[i], enemies_y[i]);
    }
  }
  /* アイテム描画 */
  for(var i=0; i<potion; i++){
    if(potion_hp[i] > 0){
      ctx.drawImage(img_potion, potion_x[i], potion_y[i]);
    }
  }
  for(var i=0; i<muteki; i++){
    if(muteki_hp[i] > 0){
      ctx.drawImage(img_muteki, muteki_x[i], muteki_y[i]);
    }
  }
}


/* 当たり判定プログラム */
var hitCheck = function(x1, y1, obj1, x2, y2, obj2) {
  var cx1, cy1, cx2, cy2, r1, r2, d;
  /* 中心座標の取得 */
  cx1 = x1 + obj1.width/2;
  cy1 = y1 + obj1.height/2;
  cx2 = x2 + obj2.width/2;
  cy2 = y2 + obj2.height/2;
  /* 半径の計算 */
  r1 = (obj1.width+obj1.height)/4;
  r2 = (obj2.width+obj2.height)/4;
  /* 中心座標同士の距離の測定 */
  d = Math.sqrt(Math.pow(cx1-cx2, 2) + Math.pow(cy1-cy2, 2));
  /* 判定 */
  /* 当たっている */
  if(r1 + r2 > d) {
    return true;
  }
  /* 当たっていない */
  else {
    return false;
  }
}


/* 描画プログラム */
var mainloop = function(){
  /* 処理開始時間 */
  var startTime = new Date();
  /* player移動 */
  movePlayer();
  /* enemies移動 */
  moveEnemies();
  /* アイテム移動 */
  moveItem();
  
  document.getElementById("php").value = player_hp;

  /* player, enemies 当たり判定 */
  if(player_hp > 0 && player_star_interval==0){
    for(var i=0; i<enemies; i++){
      if(enemies_hp[i] > 0){
        var hit = hitCheck(player_x, player_y, img_player, enemies_x[i], enemies_y[i], img_enemy)
        if(hit==true){
         　damage.play();
          player_hp -= 1;
          enemies_hp[i] -= 1;
          if ( player_hp == 2) {
              img_player = document.getElementById('player2');
          }
          else if (player_hp == 1) {
              img_player = document.getElementById('player3');
          }
          else {
              img_player = document.getElementById('player');
          }
          /* 無敵時間 */
          player_star_interval = star_interval;
        }
      }
    }
  }

  /* potion 当たり判定 */
  if(player_hp > 0){
    for(var i=0; i<potion; i++){
      if(potion_hp[i]>0){
        var hit = hitCheck(player_x, player_y, img_player, potion_x[i], potion_y[i], img_potion)
        if(hit==true){
          medicine.play();
          player_hp += 2;
          potion_hp[i] -= 1;

          if (player_hp == 2) {
              img_player = document.getElementById('player2');
          }
          else if (player_hp == 1) {
              img_player = document.getElementById('player3');
          }
          else {
              img_player = document.getElementById('player');
          }
        }
      }
    }
  }

  /* muteki 当たり判定 */
  if(player_hp>0){
    for(var i=0; i<muteki; i++){
      if(muteki_hp[i]>0){
        var hit = hitCheck(player_x, player_y, img_player, muteki_x[i], muteki_y[i], img_muteki)
        if(hit==true){
          medicine.play();
          player_star_interval = star_interval;
          muteki_hp[i] -= 1;
        }
      }
    }
  }

  /* 無敵時間 (減らす) */
  if(player_star_interval > 0){
    player_star_interval--;
  }
  /* 描画 */
  draw();
  /* 滑らかな移動 */
  /* 処理経過時間、次のループまでの間隔 */
  var deltaTime = (new Date())-startTime;
  var interval = MSPF-deltaTime;
  /* 待機 */
  if(interval>0){
    setTimeout(mainloop, interval);
  }
  /* 即実行 */
  else{
    mainloop();
  }
}

/* 難易度 */
var log2 = function(){
  speed++;
}
setInterval(log2, 10000);

/* 一定時間ごとにアイテムを降らせる*/
var log = function () {
  for (var i = 0; i < enemies; i++) {
    potion_x[i] = Math.random() * (canvas.width - img_enemy.width);
    potion_y[i] = -img_enemy.height;
    potion_hp[i] = 1;
  }
}
/* ここの数×1/10000秒ごとにアイテム落下 */
setInterval(log, 10000);

var log = function () {
  for (var i = 0; i < enemies; i++) {
    muteki_x[i] = Math.random() * (canvas.width - img_enemy.width);
    muteki_y[i] = -img_enemy.height;
    muteki_hp[i] = 1;
  }
}
/* ここの数×1/10000秒ごとにアイテム落下 */
setInterval(log, 10000);


/* 押しているキーを取得 */
window.onkeydown = function(e){
  keys[e.keyCode] = true;
}
window.onkeyup = function(e){
  keys[e.keyCode] = false;
}


/* playerを動かす */
var movePlayer = function(){
  var speed = 2.5;
  var up_w = 87;
  var left_a = 65;
  var down_s = 83;
  var right_d = 68;

  /* hpがなかったら終了 */
  if(player_hp <= 0){
    return;
  }
  
  if(keys[up_w] && player_y > 0){
    player_y -= speed;
  }
  if(keys[left_a] && player_x > 0){
    player_x -= speed;
  }
  if(keys[down_s] && player_y+img_player.height < canvas.height){
    player_y += speed;
  }
  if(keys[right_d] && player_x+img_player.width < canvas.width){
    player_x += speed;
  }
}


/* enemiesを動かす */
var moveEnemies = function(){
  /* 上から下に動かす */
  for(var i=0; i<enemies; i++){
    if(enemies_hp[i] <= 0){
      continue;
    }
    enemies_y[i] += speed;
    /* はみ出た場合 */
    if(enemies_y[i] > canvas.height){
      /* 上に戻す */
      enemies_y[i] = -img_enemy.height;
      enemies_x[i] = Math.random()*(canvas.width-img_enemy.width);
      if(player_hp > 0){
          s++;
          document.getElementById("score").value = s;
      }
    }
  }
}


/* アイテムを動かす */
var moveItem = function(){
  var speed = 1.5;
  /* 上から下に動かす */
  for (var i = 0; i < potion; i++) {
    if (potion_hp[i] <= 0) {
      continue;
    }
    potion_y[i] += speed;
  }
  for (var i = 0; i < muteki; i++) {
    if (muteki_hp[i] <= 0) {
      continue;
    }
    muteki_y[i] += speed;
  }
}

/* 初期状態にする */
function reset(){
  document.location.reload();
}