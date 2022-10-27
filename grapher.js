const g = document.getElementById("grapher");
const c = g.getContext("2d");
const width = g.width;
const height = g.height;

const canvasData = c.getImageData(0,0,width,height);

const center = {x:0,y:0};
const ppu = 100;


c.lineWidth = 2*width;
c.strokeStyle = '#fff';

c.moveTo(0,0);
c.lineTo(height,width);
c.stroke();

c.strokeStyle = '#f0f';
c.lineWidth = 3;

c.beginPath();
c.moveTo(0,0);
c.lineTo(200,100);
c.lineTo(200,50);
c.stroke();

