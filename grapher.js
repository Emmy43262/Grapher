const g = document.getElementById("grapher");
const c = g.getContext("2d");
g.width = document.getElementById("wrapper").clientWidth;
g.height = document.getElementById("wrapper").clientHeight;

const width = g.width;
const height = g.height;


const offset = {x:0,y:0};
let zoom = 60; //pixels per unit
const precision = 1; //pixel gap between evaluations
const idealGridSize = 150; //upper bound for grid size
const pointDisplayDelta = 30; //max pixels between mouse position and function 
let gridSize;

let hilightPoint = {x:-10,y:-10};

let p10;
let unit_v;

c.font = "16px arial";

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

ChangeZoom = (multiplier) =>{
    zoom *= multiplier;
    ComputeGridSize();
    Draw();
}

document.getElementById("magnify").addEventListener("click",()=>{
    ChangeZoom(1.2);
});
document.getElementById("demagnify").addEventListener("click",()=>{
    ChangeZoom(1/1.2);
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

g.addEventListener('wheel', (event) => {

    const{wheelDeltaY, offsetX, offsetY} = event;

    //let dX = (offsetX - width/2)/width;
    //let dY = (offsetY - height/2)/height;

    //offset.x += dX * 100 * ((wheelDeltaY>0)?-1:1);
    //offset.y += dY * 100 * ((wheelDeltaY>0)?-1:1);
    
    const zoomValue = 117;

    const z = (wheelDeltaY>0)?(wheelDeltaY/zoomValue):(1/Math.abs(wheelDeltaY/zoomValue));
    ChangeZoom(z);
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
    c.strokeStyle = '#fff';

    c.beginPath();
    c.moveTo(0,0);
    c.lineTo(height,width);
    c.stroke();
};

DrawAxes = ()=>{
    c.lineWidth = 2.5;
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
    c.lineWidth = 3;
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
    const multipliers = [1,2,5,1000];
    p10 = Math.floor(Math.log10(idealGridSize/zoom))
    const org = 10 ** p10;

    
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

    
    for(let x = st-gridSize ; x <= en+gridSize ; x += gridSize)
    {
        const _x = x * zoom + width/2 + offset.x;
        
        c.strokeStyle= "#888";
        c.lineWidth = 1.25;
        c.beginPath();
        c.moveTo(_x,0);
        c.lineTo(_x,height);
        c.stroke();
        
        c.strokeStyle= "#aaa";
        c.lineWidth = .5;

        for(let i = 1 ; i < 5 ; ++i)
        {
            c.beginPath();
            c.moveTo(_x+gridSize/5*zoom*i,0);
            c.lineTo(_x+gridSize/5*zoom*i,height);
            c.stroke();
        }

    }
    
    
    st = (-offset.y-height/2)/zoom;
    en = (height/2-offset.y)/zoom;
    
    st -= st%gridSize;
    en -= en%gridSize;
    
    for(let y = st-gridSize ; y <= en+gridSize ; y += gridSize)
    {
        const _y = y * zoom + height/2 + offset.y;
        
        c.strokeStyle= "#888";
        c.lineWidth = 1.25;
        
        c.beginPath();
        c.moveTo(0,_y);
        c.lineTo(width,_y);
        c.stroke();
        
        c.strokeStyle= "#aaa";
        c.lineWidth = .5;
    
        for(let i = 1 ; i < 5 ; ++i)
        {
            c.beginPath();
            c.moveTo(0,_y+gridSize/5*zoom*i);
            c.lineTo(width,_y+gridSize/5*zoom*i);
            c.stroke();
        }

    }
}



DrawLabels = () => 
{
    let st = (-offset.x-width/2)/zoom;
    let en = (width/2-offset.x)/zoom;

    st -= st%gridSize;
    en -= en%gridSize;

    c.textAlign = "center";
    c.strokeStyle="#fff";
    c.fillStyle="#000";
    c.lineWidth = 4;

    for(let x = st ; x <= en+1 ; x += gridSize)
    {
        const _x = x * zoom + width/2 + offset.x;

        if(x!=0 && Math.abs(x) >= gridSize*.99)
            if(Math.abs(offset.y) < height/2 )
            {
                const val = parseFloat(x.toPrecision(14));
                
                c.strokeText(val,_x,offset.y+height/2+20);
                c.fillText(val,_x,offset.y+height/2+20);
            }
        }

    st = (-offset.y-height/2)/zoom;
    en = (height/2-offset.y)/zoom;

    st -= st%gridSize;
    en -= en%gridSize;

    c.textAlign = "left";

    for(let y = st ; y <= en+1 ; y += gridSize)
    {
        const _y = y * zoom + height/2 + offset.y;

        if(y!=0 && Math.abs(y) >= gridSize*.99 )
            if(Math.abs(offset.x) < width/2)
            {
                const val = parseFloat(y.toPrecision(14));

                c.strokeText(-val,offset.x+width/2+8,_y+5);
                c.fillText(-val,offset.x+width/2+8,_y+5);
            }
    }
}

Draw = (()=>{
    Clear();
    DrawGrid();
    DrawAxes();
    PlotFunctions();
    DrawLabels();
})

Draw();
