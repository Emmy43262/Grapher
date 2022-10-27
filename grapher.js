const g = document.getElementById("grapher");
const c = g.getContext("2d");
const width = g.width;
const height = g.height;

const canvasData = c.getImageData(0,0,width,height);

const offset = {x:0,y:0};
const zoom = 50; //pixels per unit
const precision = 1; //pixel gap between evaluations

g.addEventListener("mousedown",function(event){
    g.addEventListener("mousemove",ChangeOffset);
});

g.addEventListener("mouseup",function(event){
    g.removeEventListener("mousemove",ChangeOffset);
})

g.addEventListener("mouseleave",function(event){
    g.removeEventListener("mousemove",ChangeOffset);
})

Clear = (()=>{
    c.lineWidth = 2*width;
    c.strokeStyle = '#eee';

    c.beginPath();
    c.moveTo(0,0);
    c.lineTo(height,width);
    c.stroke();
});

DrawAxes = (()=>{
    c.lineWidth = 2;
    c.strokeStyle = "#000";

    if(Math.abs(offset.x/zoom) <= width/2)
    {
        const _x = offset.x/zoom + width/2;
        c.beginPath();
        c.moveTo(_x,0);
        c.lineTo(_x,height);
        c.stroke();
    }

    if(Math.abs(offset.y/zoom) <= height/2)
    {
        const _y = offset.y/zoom + height/2;
        c.beginPath();
        c.moveTo(0,_y);
        c.lineTo(width,_y);
        c.stroke();
    }
});

ChangeOffset = ((event)=>{
    offset.x += event.movementX;
    offset.y += event.movementY;
    Draw();
});

Eval = x=>5*Math.sin(x);

PlotData = (()=>{
    
});

Draw = (()=>{
    Clear();
    DrawAxes();
    Plot();
})

Plot = (()=>{
    c.lineWidth = 1;
    c.beginPath();
    
    c.moveTo(0,0);
    
    for(let x = 0 ; x <= width ; x += precision)
    {
        let _x = (x-offset.x)/zoom;
    
        let _y = Eval(_x);
    
        let y = _y * zoom + offset.y;
    
        c.lineTo(x,y+height/2);
    }
    
    c.stroke();
})


Draw();
