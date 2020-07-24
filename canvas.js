const snowfalldiv = document.getElementById("snowfall");
const canvas = document.createElement("canvas");

window.addEventListener("resize",function(){
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
});
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;


snowfalldiv.appendChild(canvas);
const w = 2000//canvas.width;
const h = 3000;//canvas.height;

const ctx = canvas.getContext("2d");
const backgroundImage = new Image();
backgroundImage.src = "background.jpg";

const flakes = [];

class snowfall{


  static startFlakes(){
    const x = Math.ceil(Math.random()*w);
    const y = Math.ceil(Math.random()*h);
    const speed = Math.ceil(Math.random()*2);
    const radius = 1.5*Math.PI;
    flakes.push({
      x:x,
      y:y,
      speed:speed,
      radius: radius
    });
  }

  static snowFall(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snowfall.addFlakes();
    snowfall.addSnow();
  }

  static addFlakes(){
    const x = Math.ceil(Math.random()*w);
    const y = 0;
    const speed = Math.ceil(Math.random()*2);
    const radius = 1.5*Math.PI;

    //const y = Math.ceil(Math.random()*h);

    flakes.push({
      x:x,
      y:y,
      speed:speed,
      radius: radius
    });
  }

  static addSnow(){
    for(let i=0; i < flakes.length; i++){
      let oneFlake= flakes[i];
      
      //create circles
      ctx.beginPath();

      //color
      ctx.fillStyle="rgba(255, 255, 255, 0.8)";

      //drawing
      ctx.arc(oneFlake.x, oneFlake.y += oneFlake.speed/2, oneFlake.speed * 0.8, 0, oneFlake.radius);
      ctx.fill();
    }
  }

}


for(let i=0; i < 800; i++){
  snowfall.startFlakes();
}

setInterval(()=> snowfall.snowFall(), 40);