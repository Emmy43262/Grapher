const g = document.getElementById("grapher");
const c = g.getContext("2d");
g.width = document.documentElement.clientWidth;
g.height = document.documentElement.clientHeight;

const width = g.width;
const height = g.height;

const canvasData = c.getImageData(0,0,width,height);

const offset = {x:0,y:0};
let zoom = 50; //pixels per unit
const precision = 1; //pixel gap between evaluations

document.getElementById("magnify").addEventListener("click",()=>{
    zoom *= 1.2;
    Draw();
});
document.getElementById("demagnify").addEventListener("click",()=>{
    zoom *= .83;
    Draw();
});

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

    if(Math.abs(offset.x) <= width/2)
    {
        const _x = offset.x + width/2;
        c.beginPath();
        c.moveTo(_x,0);
        c.lineTo(_x,height);
        c.stroke();
    }

    if(Math.abs(offset.y) <= height/2)
    {
        const _y = offset.y + height/2;
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

PlotFunction = ((color,e)=>{
    c.lineWidth = 2;
    c.strokeStyle = color;
    c.beginPath();
    
    for(let x = 0 ; x <= width ; x += precision)
    {
        let _x = (x-offset.x-width/2)/zoom;
        
        let _y = e(_x);

        
    
        let y = -_y * zoom + offset.y + height/2;
        
        let yhf = e((x-precision/2-offset.x-width/2)/zoom);
        let ya = e((x-precision-offset.x-width/2)/zoom);

        if(ya == yhf && ya != _y )
        {
            c.stroke();
            c.beginPath();
            c.moveTo(x,y);
        }
        else
        {
            if(x==0)
                c.moveTo(x,y);
            c.lineTo(x,y);
        }
    }
    
    c.stroke();
})


Eval = x=>10*x+5;

Draw = (()=>{
    Clear();
    DrawAxes();
    PlotFunction("#f0f",x=>x);
    PlotFunction("#00f",x=>x*x);
    PlotFunction("#070",x=>Math.sin(x));
    PlotFunction("#a00",x=>Math.round(x));
})

Draw();
