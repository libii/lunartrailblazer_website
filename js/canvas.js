// TODO: implement resizing support

function makeStarsCanvas(starSize = 0) {
  const canvas = document.createElement("canvas");

  const containerDiv = document.getElementsByClassName("pageBody")[0];
  canvas.height = containerDiv.clientHeight;
  canvas.width = containerDiv.clientWidth;

  const w = canvas.width + 3500; //3500px is the right buffer needed for window resizing
  const h = canvas.height + 1000;//1000px buffer for window resizing

  const stars = [];

  // If you want the density to be consistent, consider changing
  //  the number of stars based on the area of the canvas as well
  for (var i = 0; i < 200 * (Math.max(1, 3 - starSize)); i++) {
    stars.push({
      //Math Equation with a seed
      //x: Math.ceil(Math.seedrandom("moon prism power") * ((w+300)-1)+1),
      //y: Math.ceil(Math.seedrandom("moon prism power") * h),
      x: Math.ceil(Math.random() * ((w)-1)+1),
      y: Math.ceil(Math.random() * h),
      radius: Math.ceil(Math.random() + starSize / 2.0)
    });
  }

  const context = canvas.getContext("2d");
  stars.forEach(function (star) {
    context.beginPath();
    context.fillStyle = "rgba(255, 255, 255, 0.8)";
    context.arc(star.x, star.y, star.radius, 0, 1.5 * Math.PI);
    context.shadowColor = "yellow";
    context.shadowBlur = 15;
    context.fill();
  });

 window.addEventListener("resize",function(){
    canvas.height = containerDiv.clientHeight;
    canvas.width = containerDiv.clientWidth;
    stars.forEach(function (star) {
      context.beginPath();
      context.fillStyle = "rgba(255, 255, 255, 0.8)";
      context.arc(star.x, star.y, star.radius, 0, 1.5 * Math.PI);
      context.shadowColor = "yellow";
      context.shadowBlur = 15;
      context.fill();
    });
  });

  return canvas;
}

const starDivs = [{
  name: "stars-far",
  starSize: 0.1
}, {
  name: "stars-middle",
  starSize: 0.7
}, {
  name: "stars-near",
  starSize: 1.9
}];

starDivs.forEach(starDiv => {
  const div = document.getElementById(starDiv.name);
  div.appendChild(makeStarsCanvas(starDiv.starSize));
});