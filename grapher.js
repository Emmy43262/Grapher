const g = document.getElementById("grapher");
const c = g.getContext("2d");

g.width = document.getElementById("wrapper").clientWidth;
g.height = document.getElementById("wrapper").clientHeight;
let width = g.width;
let height = g.height;


const offset = {x:0,y:0};
let zoom = 60; //pixels per unit
const precision = 1; //pixel gap between evaluations
const idealGridSize = 150; //upper bound for grid size
const pointDisplayDelta = 30; //max pixels between mouse position and function 
let gridSize;

let hilit_function = null; 

let funcs = [];
let p10;
let unit_v;

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

/*g.addEventListener("mousemove",function(event){
    cx = xToCoord(event.x);
    cy = yToCoord(event.y);
    
    let drawn = false;

    for(let i = 0 ; i < funcs.length ; ++i)
    {
        let element = funcs[i];

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
        }
    }
    
});*/

g.addEventListener('click',(event)=>{
    const {clientX,clientY} = event;
    const sX = xToCoord(clientX);

    for(let i = 0 ; i < funcs.length ; ++i)
    {
        if(funcs[i].fct == "")continue;

        const pY = yToWorld(eval(funcs[i].fct.replace(/x/gm, sX)));
        if(Math.abs(pY-clientY)<30)
        {
            hilit_function = i;
            Draw();
            return;
        }
    }
    if(hilit_function != null)
    {
        hilit_function = null;
        Draw();
    }
})

let drawingPointData = false;

g.addEventListener('mousemove',(event)=>{
    if(hilit_function==null)
        return;
    
    const {clientX,clientY} = event;
    const sX = xToCoord(clientX);
    const sY = eval(funcs[hilit_function].fct.replace(/x/gm,sX));

    const pY = yToWorld(sY);
    if(Math.abs(pY-clientY)<40)
    {
        const x = sX.toPrecision(3);
        const y = sY.toPrecision(3);
        Draw();

        c.fillStyle = "#fff";
        c.fillRect(xToWorld(sX),yToWorld(sY),200,50);
        c.strokeStyle = "#000";
        c.lineWidth = 3;
        c.strokeRect(xToWorld(sX),yToWorld(sY),200,50);

        
        
        const txt = "("+x+", "+y+")";
        
        c.fillStyle = "#000";
        c.font = "24px arial bold";
        c.textAlign="center";
        c.fillText(txt,xToWorld(sX)+100,yToWorld(sY)+30);

        drawingPointData = true;
    }
    else if(drawingPointData)
    {
        Draw();
        console.log("da");
        drawingPointData = false;
    }

})

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

window.addEventListener("resize",(event) =>{
    g.width = document.getElementById("wrapper").clientWidth;
    g.height = document.getElementById("wrapper").clientHeight;
    width = g.width;
    height = g.height;
    Draw();
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


PlotFunction = (e)=>{
    c.beginPath();
    
    for(let x = 0 ; x <= width ; x += precision)
    {
        let _x = (x-offset.x-width/2)/zoom;
        
        let _y = eval(e.fct.replace(/x/gm, _x));

        let y = -_y * zoom + offset.y + height/2;
        
        if(x==0)
            c.moveTo(x,y);
        c.lineTo(x,y);
    }
    
    c.stroke();
}

colors = ["#a00","#00a","#070"];

PlotFunctions = () => {

    for(let i = 0 ; i < funcs.length ; ++i)
    {
        if(i==hilit_function)
            c.lineWidth = 4;
        else
            c.lineWidth = 3;
        
        c.strokeStyle = colors[i];

        PlotFunction(funcs[i]);
    }
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

    c.font = "16px arial";

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
    //console.log(funcs);
})


f_holders = document.getElementsByClassName("fun");


for(let i = 0 ; i < f_holders.length ; ++i)
{
    f_holders[i].childNodes[5].addEventListener("click",()=>{
        const str = f_holders[i].childNodes[3].value;

        for(let j = 0 ; j < i ; ++j)
        {
            if(funcs[j] == null)
            {
                funcs[j] = {fct:""};
            }
        }

        funcs[i] = {fct:""};
        funcs[i].fct = str;
        Draw();
    });
}



/*f_holders.forEach(fun => {
    console.log(fun.childNodes[2]);
});*/

Draw();


