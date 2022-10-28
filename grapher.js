const g = document.getElementById("grapher");
const c = g.getContext("2d");
g.width = document.documentElement.clientWidth;
g.height = document.documentElement.clientHeight;

const width = g.width;
const height = g.height;

const canvasData = c.getImageData(0,0,width,height);

const offset = {x:0,y:0};
let zoom = 60; //pixels per unit
const precision = 1; //pixel gap between evaluations
const idealGridSize = 150; //upper bound for grid size
const pointDisplayDelta = 30; //max pixels between mouse position and function 
let gridSize;

let hilightPoint = {x:-10,y:-10};

c.font = "bold 20px monospace";

const functions =[
    {
        color:"#f0f",
        e:x=>Math.sqrt(x)
    },
    {
        color:"#00f",
        e:x=>x*x+2
    },
    {
        color:"#070",
        e:x=>Math.sin(x)
    },
    {
        color:"#a00",
        e:x=>Math.round(x)+x
    },

];

document.getElementById("magnify").addEventListener("click",()=>{
    zoom *= 1.2;
    ComputeGridSize();
    Draw();
});
document.getElementById("demagnify").addEventListener("click",()=>{
    zoom /= 1.2;
    ComputeGridSize();
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

g.addEventListener("mousemove",function(event){
    cx = xToCoord(event.x);
    cy = yToCoord(event.y);

    Draw();
    hilightPoint = {x:-10,x:-10};

    let drawn = false;
    functions.forEach(element => {
        if(drawn)
            return;
        const v = yToWorld(element.e(cx));
        if(Math.abs(v-event.y) <= pointDisplayDelta)
        {   
            drawn = true;
            hilightPoint = {x:event.x,y:v};
            
            c.fillStyle = "#eee";
            c.strokeStyle = "#000";
            c.lineWidth = 1;
            c.fillRect(hilightPoint.x,hilightPoint.y,200,50);
            c.strokeRect(hilightPoint.x,hilightPoint.y,200,50);
            c.fillStyle = "#000";
            let text = "(" + (Math.round(xToCoord(hilightPoint.x)*100)/100).toString() + ", " + (Math.round(yToCoord(hilightPoint.y)*100)/100).toString() + ")";
            c.textAlign = "center";
            c.fillText(text,hilightPoint.x+100,hilightPoint.y+25);
            
            return;
        }
    });

});

toCoords = point=>{
    point.x = (point.x-offset.x-width/2)/zoom;
    point.y = -(point.y-offset.y-height/2)/zoom;
    return point;
}

xToCoord = x => (x-offset.x-width/2)/zoom;
yToCoord = y => -(y-offset.y-height/2)/zoom;

xToWorld = x => x*zoom+width/2+offset.x;
yToWorld = y => -y*zoom+height/2+offset.y;

Clear = ()=>{
    c.lineWidth = 2*width;
    c.strokeStyle = '#eee';

    c.beginPath();
    c.moveTo(0,0);
    c.lineTo(height,width);
    c.stroke();
};

DrawAxes = ()=>{
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
};

ChangeOffset = ((event)=>{
    offset.x += event.movementX;
    offset.y += event.movementY;
    Draw();
});

PlotFunction = (color,e)=>{
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
}

PlotFunctions = () => {
    functions.forEach(element => {
        PlotFunction(element.color, element.e);
    });
}

ComputeGridSize = () =>{

    const maxSize = idealGridSize/zoom;
    const multipliers = [1,2,4,5,1000];
    const org = 10 ** Math.floor(Math.log10(idealGridSize/zoom));
    
    for(let i = 1 ; i < multipliers.length ; ++i)
        if(org*multipliers[i] > maxSize)
        {
            gridSize = org*multipliers[i-1];
            return;
        }
}
ComputeGridSize();

DrawGrid = () => 
{
    let st = (-offset.x-width/2)/zoom;
    let en = (width/2-offset.x)/zoom;

    st -= st%gridSize;
    en -= en%gridSize;

    c.strokeStyle= "#666";
    c.lineWidth = 2;

    for(let x = st ; x <= en ; x += gridSize)
    {
        const _x = x * zoom + width/2 + offset.x;
        
        c.beginPath();
        c.moveTo(_x,0);
        c.lineTo(_x,height);
        c.stroke();
    }


    st = (-offset.y-height/2)/zoom;
    en = (height/2-offset.y)/zoom;

    st -= st%gridSize;
    en -= en%gridSize;

    for(let y = st ; y <= en ; y += gridSize)
    {
        const _y = y * zoom + height/2 + offset.y;

        c.beginPath();
        c.moveTo(0,_y);
        c.lineTo(width,_y);
        c.stroke();
    }
}



DrawLabels = () => 
{
    let st = (-offset.x-width/2)/zoom;
    let en = (width/2-offset.x)/zoom;

    st -= st%gridSize;
    en -= en%gridSize;

    c.textAlign = "left";
    c.strokeStyle="#eee";
    c.fillStyle="#000";
    c.lineWidth = 4;

    for(let x = st ; x <= en ; x += gridSize)
    {
        const _x = x * zoom + width/2 + offset.x;

        if(x!=0)
            if(Math.abs(offset.y) < height/2 )
            {
                c.strokeText(x,_x+5,offset.y+height/2+20);
                c.fillText(x,_x+5,offset.y+height/2+20);
            }
        }

    st = (-offset.y-height/2)/zoom;
    en = (height/2-offset.y)/zoom;

    st -= st%gridSize;
    en -= en%gridSize;


    for(let y = st ; y <= en ; y += gridSize)
    {
        const _y = y * zoom + height/2 + offset.y;

        if(y!=0)
            if(Math.abs(offset.x) < width/2)
            {
                c.strokeText(-y,offset.x+width/2+5,_y-6);
                c.fillText(-y,offset.x+width/2+5,_y-6);
            }
    }
}

Draw = (()=>{
    Clear();
    DrawAxes();
    DrawGrid();
    PlotFunctions();
    DrawLabels();
})

Draw();
