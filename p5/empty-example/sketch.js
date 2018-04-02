function setup() {
	createCanvas(980,1084);
}

function draw() {
	//background(204);
	if(mouseIsPressed){
  	fill(0);
  } else {
  	fill(255);
  }
  ellipse(mouseX, mouseY, 40, 40);
	point(240, 60);
}
