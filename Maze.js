/**
 * Created by Delor on 2015-02-28.
 */

    //używane zmienne
    var canvas,context;

    var lab;
    var GraphMaze={};
    GraphMaze.Multiply=1;
    var newX=10;
    var newY=10;

    var imgKrew = new Image();
    imgKrew.zaladowany=false;
    imgKrew.onload = function(){
        this.zaladowany = true;
        Repaint();
    };
    var imgKropek = new Image();
    imgKropek.zaladowany=false;
    imgKropek.onload = function(){
        this.zaladowany=true;
        Repaint();
    };
function dl(x1,y1,x2,y2){//odległość między punktami (2d)
    return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}

function random(i){
    return Math.floor(Math.random()*i);
}
    function Room(){
        this.flag=0;
        this.sciezka=false;
        this.krew=[false,false,false,false];

    }
    function Wall(){
        this.Type=0;//brak ściany

        //this.GraphSizeY=15;

        this.setType=function(t){
            this.Type=t;
        }
        this.getType=function(){
            return this.Type;
        }
    }
    function Maze(x,y,m){
        this.countX=x;
        this.countY=y;
        this.graphMultiply=m;

        //rozmiary komnat
        this.roomSizeX=15;
        this.roomSizeY=15;

        this.wallWidth=5;
        this.wallHeight=10;

        this.scian=0;
        this.znacznik=0;

        this.kropek={
            x:this.countX-1,
            y:this.countY-1,
            look:0
        };

        this.hintCount=5;

        this.getHintCount=function(){
            return this.hintCount;
        }
        this.setGraphMultiply=function(g){
            this.graphMultiply=g;
        }
        this.getGraphMultiply= function(){
            return this.graphMultiply;
        }
        this.Repaint=function(context){
        //odmalowuję labirynt
            var grd = context.createRadialGradient(0, 0, dl(0,0,this.getGraphSizeX(),this.getGraphSizeY())/10, 0,
                0, dl(0,0,this.getGraphSizeX(),this.getGraphSizeY()));
            grd.addColorStop(0, "#c0c0c0");
            //grd.addColorStop(0.5, "red");
            grd.addColorStop(1, "#000000");

            context.beginPath();
            context.moveTo(0,0);
            context.lineTo(this.getGraphSizeX(),0);
            context.lineTo(this.getGraphSizeX(),this.getGraphSizeY());
            context.lineTo(0,this.getGraphSizeY());
            context.closePath();
            context.fillStyle=grd;
            context.fill();

            //komnaty
            for(var i=0;i<this.countX;i++){
                for(var j=0;j<this.countY;j++){
                    var r=this.rooms[i][j];
                    var x1=((i*(this.roomSizeX))+((i+1)*(this.wallWidth)))*this.graphMultiply;
                    var y1=((j*(this.roomSizeY))+((j+1)*(this.wallWidth)))*this.graphMultiply;
                    var x2=x1+(this.roomSizeX*this.graphMultiply);
                    var y2=y1+(this.roomSizeY*this.graphMultiply);
                    var x3=x1+((this.roomSizeX-this.wallHeight)*this.graphMultiply/2);
                    var y3=y1+((this.roomSizeY-this.wallHeight)*this.graphMultiply/2);
                    var x4=x2-((this.roomSizeX-this.wallHeight)*this.graphMultiply/2);
                    var y4=y2-((this.roomSizeY-this.wallHeight)*this.graphMultiply/2);
                    context.beginPath();
                    context.moveTo(x1,y1);
                    context.lineTo(x2,y1);
                    context.lineTo(x2,y2);
                    context.lineTo(x1,y2);
                    context.closePath();
                    //context.stroke();
                    context.fillStyle="white";
                    context.fill();

                    if(r.krew[0]){//góra
                        context.save();
                        context.translate((x1+x2)/2,(y1+y2)/2);
                        if(imgKrew.zaladowany)
                            context.drawImage(imgKrew,-(x2-x1)/2,-(y2-y1)/2,x2-x1,y2-y1);
                        context.restore();
                    }
                    if(r.krew[1]){//prawo
                        context.save();
                        context.translate((x1+x2)/2,(y1+y2)/2);
                        context.rotate(Math.PI/2);
                        if(imgKrew.zaladowany)
                            context.drawImage(imgKrew,-(x2-x1)/2,-(y2-y1)/2,x2-x1,y2-y1);
                        context.restore();

                    }
                    if(r.krew[2]){//dół
                        context.save();
                        context.translate((x1+x2)/2,(y1+y2)/2);
                        context.rotate(Math.PI);
                        if(imgKrew.zaladowany)
                            context.drawImage(imgKrew,-(x2-x1)/2,-(y2-y1)/2,x2-x1,y2-y1);
                        context.restore();

                    }
                    if(r.krew[3]){//lewo
                        context.save();
                        context.translate((x1+x2)/2,(y1+y2)/2);
                        context.rotate(-Math.PI/2);
                        if(imgKrew.zaladowany)
                            context.drawImage(imgKrew,-(x2-x1)/2,-(y2-y1)/2,x2-x1,y2-y1);
                        context.restore();

                    }
                    //jedno pole podpowiedzi
                    if(this.hint && r.sciezka==2){
                        context.save();
                        context.globalAlpha=0.5;
                        context.beginPath();
                        context.moveTo(x1,y1);
                        context.lineTo(x2,y1);
                        context.lineTo(x2,y2);
                        context.lineTo(x1,y2);
                        context.closePath();
                        //context.stroke();
                        context.fillStyle="yellow";
                        context.fill();

                        context.restore();
                    }
                    //cała ścieżka po wygraniu
                    if(this.winner && r.sciezka==1){
                        context.save();
                        context.globalAlpha=0.5;
                        context.beginPath();
                        context.moveTo(x1,y1);
                        context.lineTo(x2,y1);
                        context.lineTo(x2,y2);
                        context.lineTo(x1,y2);
                        context.closePath();
                        //context.stroke();
                        context.fillStyle="yellow";
                        context.fill();

                        context.restore();
                    }
                    context.strokeStyle="gray";
                    context.lineWidth=this.graphMultiply;
                    context.beginPath();
                    context.moveTo(x3,y1);
                    context.lineTo(x1,y1);
                    context.lineTo(x1,y3);

                    context.moveTo(x4,y1);
                    context.lineTo(x2,y1);
                    context.lineTo(x2,y3);

                    context.moveTo(x4,y2);
                    context.lineTo(x2,y2);
                    context.lineTo(x2,y4);

                    context.moveTo(x3,y2);
                    context.lineTo(x1,y2);
                    context.lineTo(x1,y4);
                    context.stroke();

                    if(i==this.kropek.x && j==this.kropek.y) {
/*                        var grd = context.createRadialGradient((x1+x2)/2, (y1+y2)/2, dl(x1,y1,x2,y1)/100, (x2+x1)/2, (y1+y2)/2, (x2-x1)/3);
                        grd.addColorStop(0, "#000040");
                        //grd.addColorStop(0.5, "red");
                        grd.addColorStop(1, "#0000ff");
                        context.fillStyle=grd;
                        context.beginPath();
                        context.arc((x1+x2)/2, (y1+y2)/2, (x2-x1)/3, 0, Math.PI*2,true);
                        context.closePath();
                        context.fill()
*/
                        if(this.kropek.look==0){//góra
                            context.save();
                            context.translate((x1+x2)/2,(y1+y2)/2);
                            if(imgKropek.zaladowany)
                                context.drawImage(imgKropek,-(x2-x1)/2,-(y2-y1)/2,x2-x1,y2-y1);
                            context.restore();
                        }
                        if(this.kropek.look==1){//prawo
                            context.save();
                            context.translate((x1+x2)/2,(y1+y2)/2);
                            context.rotate(Math.PI/2);
                            if(imgKropek.zaladowany)
                                context.drawImage(imgKropek,-(x2-x1)/2,-(y2-y1)/2,x2-x1,y2-y1);
                            context.restore();

                        }
                        if(this.kropek.look==2){//dół
                            context.save();
                            context.translate((x1+x2)/2,(y1+y2)/2);
                            context.rotate(Math.PI);
                            if(imgKropek.zaladowany)
                                context.drawImage(imgKropek,-(x2-x1)/2,-(y2-y1)/2,x2-x1,y2-y1);
                            context.restore();

                        }
                        if(this.kropek.look==3){//lewo
                            context.save();
                            context.translate((x1+x2)/2,(y1+y2)/2);
                            context.rotate(-Math.PI/2);
                            if(imgKropek.zaladowany)
                                context.drawImage(imgKropek,-(x2-x1)/2,-(y2-y1)/2,x2-x1,y2-y1);
                            context.restore();

                        }
                    }
//                    context.fillStyle=grd;
                    //context.fillText(this.get_room(i,j).flag+","+this.get_room(i,j).sciezka,x3,y4);
                }
            }
            //ściany x
            for(var i=0;i<=this.countX;i++) {
                for(var j=0;j<this.countY;j++){
                    var w=this.walls.x[i][j];
                    var x1=((i*(this.roomSizeX+this.wallWidth)))*this.graphMultiply;
                    var y1=((j*(this.roomSizeY))+((j+1)*(this.wallWidth)))*this.graphMultiply;
                    var x2=x1+(this.wallWidth*this.graphMultiply);
                    var y2=y1+(this.roomSizeY*this.graphMultiply);
                    var x3=x1;
                    var y3=y1+((this.roomSizeY-this.wallHeight)*this.graphMultiply/2);
                    var x4=x2;
                    var y4=y2-((this.roomSizeY-this.wallHeight)*this.graphMultiply/2);

//                    context.stroke();
                    if(w.getType()==0){
                        context.beginPath();
                        context.moveTo(x3,y3);
                        context.lineTo(x4,y3);
                        context.lineTo(x4,y4);
                        context.lineTo(x3,y4);
                        context.closePath();
                        context.fillStyle="white";
                        context.fill();

                        context.strokeStyle="gray";
                        context.lineWidth=this.graphMultiply;
                        context.beginPath();
                        context.moveTo(x3,y3);
                        context.lineTo(x4,y3);
                        context.moveTo(x3,y4);
                        context.lineTo(x4,y4);
                        context.stroke();

                    }
                    else {
                        //context.fillStyle = "black";
                        //context.fill();

                        context.strokeStyle="gray";
                        context.lineWidth=this.graphMultiply;
                        context.beginPath();
                        context.moveTo(x1,y3);
                        context.lineTo(x1,y4);
                        context.moveTo(x2,y3);
                        context.lineTo(x2,y4);
                        context.stroke();

                    }
                }
            }
            for(var i=0;i<this.countX;i++) {
                for(var j=0;j<=this.countY;j++){
                    var w=this.walls.y[i][j];
                    var x1=((i*(this.roomSizeX))+((i+1)*(this.wallWidth)))*this.graphMultiply;
                    var y1=((j*(this.roomSizeY+this.wallWidth)))*this.graphMultiply;
                    var x2=x1+(this.roomSizeX*this.graphMultiply);
                    var y2=y1+(this.wallWidth*this.graphMultiply);
                    var x3=x1+((this.roomSizeX-this.wallHeight)*this.graphMultiply/2);
                    var y3=y1;
                    var x4=x2-((this.roomSizeX-this.wallHeight)*this.graphMultiply/2);
                    var y4=y2;

//                   context.stroke();
                    if(w.getType()==0){
                        context.beginPath();
                        context.moveTo(x3,y3);
                        context.lineTo(x4,y3);
                        context.lineTo(x4,y4);
                        context.lineTo(x3,y4);
                        context.closePath();
                        context.fillStyle="white";
                        context.fill();

                        context.strokeStyle="gray";
                        context.lineWidth=this.graphMultiply;
                        context.beginPath();
                        context.moveTo(x3,y3);
                        context.lineTo(x3,y4);
                        context.moveTo(x4,y3);
                        context.lineTo(x4,y4);
                        context.stroke();

                    }
                    else {
                        //context.fillStyle = "black";
                        //context.fill();

                        context.strokeStyle="gray";
                        context.lineWidth=this.graphMultiply;
                        context.beginPath();
                        context.moveTo(x3,y3);
                        context.lineTo(x4,y3);
                        context.moveTo(x3,y4);
                        context.lineTo(x4,y4);
                        context.stroke();

                    }
                }
            }
            if(this.winner){
                //tu jakiś ekran z gratulacjami
                context.save();
                context.globalAlpha=0.5;
                context.beginPath();
                context.moveTo(0,0);
                context.lineTo(this.getGraphSizeX(),0);
                context.lineTo(this.getGraphSizeX(),this.getGraphSizeY());
                context.lineTo(0,this.getGraphSizeY());
                context.closePath();
                //context.stroke();
                context.fillStyle="#c0c0c0";
                context.fill();

                context.restore();

                context.textAlign="center";
                context.fillStyle="#ff0000";
                context.strokeStyle="#800000";

                context.font = ""+(30*this.graphMultiply)+"pt Calibri";
                this.Text(context,"Gratulacje!",this.getGraphSizeX()/2,this.getGraphSizeY()/5);

                context.font = ""+(15*this.graphMultiply)+"pt Calibri";
                this.Text(context,"Labirynt "+this.countX+"x"+this.countY+" pól",this.getGraphSizeX()/2,2*this.getGraphSizeY()/5);
                var delta=milisecToTime(new Date(this.endTime-this.startTime).getTime());
                this.Text(context,"ukończony w czasie: ",this.getGraphSizeX()/2,3*this.getGraphSizeY()/5);
                this.Text(context,""+delta.h+":"+delta.m+":"+delta.s,this.getGraphSizeX()/2,4*this.getGraphSizeY()/5);

            }

        }
        this.Text=function(context,text,x,y){
            context.save();
            context.fillStyle="white";
            context.fillText(text,x+(2*this.graphMultiply),y+(2*this.graphMultiply));
            context.restore();
            context.fillText(text,x,y);
            context.strokeText(text,x,y);

        }
        this.getGraphSizeX=function(){
            var x=((this.roomSizeX*this.countX)+(this.wallWidth*(this.countX+1)))*this.getGraphMultiply();
            return x;

        }
        this.getGraphSizeY=function(){
            var y=((this.roomSizeY*this.countY)+(this.wallWidth*(this.countY+1)))*this.getGraphMultiply();
            return y;

        }


        this.losuj=function(){//losowanie rozstawienia ścian
            while(this.scian<((this.countX*this.countY)-(this.countX+this.countY)+1))
            {
                for(var rx=0;rx<this.countX;rx++)
                {
                    this.proba_wstawienia(rx,this.countY-1,random(4));
                }

                for(var ry=0;ry<this.countY;ry++)
                {
                    this.proba_wstawienia(this.countX-1,ry,random(4));
                }

                for(var ry=0;ry<this.countY;ry++)
                {
                    for(var rx=0;rx<this.countX;rx++)
                    {
                        this.proba_wstawienia(rx,ry,random(4));
                    }
                }
            }
        }

        this.get_room=function(x,y){
            if(x<0 || x>=this.countX || y<0 || y>=this.countY) return null;
            return this.rooms[x][y];
        }
        this.get_wall_up=function(x,y){
            if(x<0 || x>=this.countX || y<0 || y>this.countY) return null;
            return this.walls.y[x][y];
        }
        this.get_wall_down=function(x,y){
            if(x<0 || x>=this.countX || y<0 || y>this.countY) return null;
            return this.walls.y[x][y+1];
        }
        this.get_wall_left=function(x,y){
            if(x<0 || x>this.countX || y<0 || y>=this.countY) return null;
            return this.walls.x[x][y];
        }
        this.get_wall_right=function(x,y){
            if(x<0 || x>this.countX || y<0 || y>=this.countY) return null;
            return this.walls.x[x+1][y];
        }
        //sprawdzam czy mogę wstawić scianę f w komnacie (x,y)
        this.proba_wstawienia=function(rx,ry,f){
            var sc,pd;
            switch(f)
            {
                case 0:
                    sc=this.get_wall_up(rx,ry);
                    //pd=this.get_room(rx,ry-1);
                    pd=new Punkt(rx,ry-1);
                    break;
                case 3:
                    sc=this.get_wall_left(rx,ry);
                    //pd=this.get_room(rx-1,ry);
                    pd=new Punkt(rx-1,ry);
                    break;
                case 2:
                    sc=this.get_wall_down(rx,ry);
                    //pd=this.get_room(rx,ry+1);
                    pd=new Punkt(rx,ry+1);
                    break;
                default:
                    sc=this.get_wall_right(rx,ry);
                    //pd=this.get_room(rx+1,ry);
                    pd=new Punkt(rx+1,ry);
                    break;
            }
            if(sc.getType()==0)
            {

                //var po=this.get_room(rx,ry);
                var po=new Punkt(rx,ry);
                sc.setType(1);
                this.scian++;

                this.znacznik++;
                if( (this.find_path(po,pd,this.znacznik))== false )
                {//po dodaniu tej sciany brak przejscia więc cofamy wybór
                    sc.setType(0);
                    this.scian--;
                }
            }
        }
        this.sasiad=function(rx,ry,k){
            switch(k)
            {
                case 0:
                    return this.get_room(rx,ry-1);
                    break;
                case 3:
                    return this.get_room(rx-1,ry);

                    break;
                case 2:
                    return this.get_room(rx,ry+1);
                    break;
                default:
                    return this.get_room(rx+1,ry);
                    break;
            }
        }
        this.sciana=function(rx,ry,k){
            switch(k)
            {
                case 0:
                    return this.get_wall_up(rx,ry);
                    break;
                case 3:
                    return this.get_wall_left(rx,ry);
                    break;
                case 2:
                    return this.get_wall_down(rx,ry);
                    break;
                default:
                    return this.get_wall_right(rx,ry);
                    break;
            }
        }
        this.psasiad=function(rx,ry,k){
            switch(k)
            {
                case 0:
                    return new Punkt(rx,ry-1);
                    break;
                case 3:
                    return new Punkt(rx-1,ry);
                    break;
                case 2:
                    return new Punkt(rx,ry+1);
                    break;
                default:
                    return new Punkt(rx+1,ry);
                    break;
            }
        }
        this.find_path=function(st,pd,zn){

            if(
                st.x<0 || st.x>=this.countX ||
                st.y<0 || st.y>=this.countY ||
                pd.x<0 || pd.x>=this.countX ||
                pd.y<0 || pd.y>=this.countY
            ) return false;
            if(st.x==pd.x && st.y==pd.y){
                this.get_room(st.x,st.y).sciezka=1;
                return true;
            }

            if(zn==this.get_room(st.x,st.y).flag)
            {
                this.get_room(st.x,st.y).sciezka=0;
                return false;
            }

            this.get_room(st.x,st.y).flag=zn;

            for(var i=0;i<4;i++)
            {
                if(this.sasiad(st.x,st.y,i)!=null)
                {
                    if(this.sciana(st.x,st.y,i).getType()==0)
                    {
                        if( this.find_path(this.psasiad(st.x,st.y,i),pd,zn) ==true)
                        {
                            this.get_room(st.x,st.y).sciezka=1;
                            return true;
                        }
                    }
                }
            }
            this.get_room(st.x,st.y).sciezka=0;
            return false;

        }

        //obsługa kropka
        this.moveKropekUp=function(){
            if(!this.winner) {
                if (this.get_wall_up(this.kropek.x, this.kropek.y).getType() == 0) {
                    this.hint = false;
                    this.get_room(this.kropek.x, this.kropek.y).krew[0] = true;
                    this.kropek.y -= 1;
                    this.kropek.look=0;
                    this.checkWin();
                }
            }
        }
        this.moveKropekDown=function(){
            if(!this.winner){
                if(this.get_wall_down(this.kropek.x,this.kropek.y).getType()==0){
                    this.hint=false;
                    this.get_room(this.kropek.x,this.kropek.y).krew[2]=true;
                    this.kropek.y+=1;
                    this.kropek.look=2;
                    this.checkWin();
                }
            }
        }
        this.moveKropekLeft=function(){
            if(!this.winner){
                if(this.get_wall_left(this.kropek.x,this.kropek.y).getType()==0){
                    this.hint=false;
                    this.get_room(this.kropek.x,this.kropek.y).krew[3]=true;
                    this.kropek.x-=1;
                    this.kropek.look=3;
                    this.checkWin();
                }
            }
        }
        this.moveKropekRight=function(){
            if(!this.winner){
                if(this.get_wall_right(this.kropek.x,this.kropek.y).getType()==0){
                    this.hint=false;
                    this.get_room(this.kropek.x,this.kropek.y).krew[1]=true;
                    this.kropek.x+=1;
                    this.kropek.look=1;
                    this.checkWin();
                }
            }
        }
        this.winner=false;
        //this.postwinner=false;
        this.endTime=null;
        this.checkWin=function(){
            if(this.kropek.x==0 && this.kropek.y==0){
                this.winner=true;
                this.endTime=new Date();
                this.zerujSciezke();
                this.znacznik++;
                this.find_path({x: 0, y: 0},{x: this.countX-1,y: this.countY-1}, this.znacznik);
            }
        }
        this.Hint=function(){
            if(!this.hint && !this.winner) {
                if (this.hintCount > 0) {
                    this.hintCount--;
                    this.hint = true;
                    this.znacznik++;
                    this.find_path({x: 0, y: 0}, this.kropek, this.znacznik);
                    var p;
                    for (var i = 0; i < 4; i++) {
                        if (this.sasiad(this.kropek.x, this.kropek.y, i) !== null && this.sasiad(this.kropek.x, this.kropek.y, i).sciezka == 1 && this.sciana(this.kropek.x, this.kropek.y, i).getType() == 0) {
                            //this.sasiad(this.kropek.x,this.kropek.y,i).sciezka=2;
                            p = this.psasiad(this.kropek.x, this.kropek.y, i);
                            break;
                        }
                    }
                    this.zerujSciezke();
                    this.get_room(p.x, p.y).sciezka = 2;

                }
            }
        }
        this.zerujSciezke=function(){
            for(var i=0;i<this.countX;i++){
                for(var j=0;j<this.countY;j++){
                    this.rooms[i][j].sciezka=0;
                }
            }

        }
        //tworzenie labiryntu
        this.rooms=[];
        for(var i=0;i<this.countX;i++){
            this.rooms[i]=[];
            for(var j=0;j<this.countY;j++){
                this.rooms[i][j]=new Room();
            }
        }
        this.walls={};
        this.walls.x=[];
        this.walls.y=[];

        for(var i=0;i<this.countX+1;i++) {
            this.walls.x[i]=[];
            for(var j=0;j<this.countY;j++){
                this.walls.x[i][j]=new Wall();
                if(i==0 || i==this.countX) this.walls.x[i][j].setType(1);
            }
        }
        for(var i=0;i<this.countX;i++) {
            this.walls.y[i]=[];
            for(var j=0;j<this.countY+1;j++){
                this.walls.y[i][j]=new Wall();
                if(j==0 || j==this.countY) this.walls.y[i][j].setType(1);

            }
        }
        this.losuj();
        this.startTime=new Date();
    }

function NewLab(){
    lab=new Maze(newX,newY,GraphMaze.Multiply);
    //lab.find_path({x:0,y:0},{x:0,y:1},900);
    Repaint();
}
function Punkt(x,y){
    this.x=x;
    this.y=y;
}
var isFirefox = typeof InstallTrigger !== 'undefined';
function Repaint(){
    document.getElementById("sizeout").textContent=newX+"x"+newY+ " pól";

    document.getElementById("hints").textContent=lab.getHintCount();
    lab.setGraphMultiply(GraphMaze.Multiply);
    canvas.width=lab.getGraphSizeX();
    canvas.height=lab.getGraphSizeY();

    lab.Repaint(context);
    ShowTime();


    if(isFirefox){
//        document.getElementById("uwaga").textContent="Zalecam użycie przeglądarki Google Chrome lub Internet Explorer v. 9+";
    }
}
function milisecToTime(mi){
    var h=Math.floor(mi/(1000*60*60));
    var m=Math.floor((mi-(h*1000*60*60))/(1000*60));
    var s=Math.floor((mi-(h*1000*60*60)-(m*1000*60))/1000);
    if(h<10) h="0"+h;
    if(m<10) m="0"+m;
    if(s<10) s="0"+s;
    return {h:h,m:m,s:s};
}
function ShowTime(){
    var t= new Date;
    if(lab.winner){
        t=lab.endTime;
    }
    var delta=milisecToTime(new Date(t-lab.startTime).getTime());
    document.getElementById("showtime").textContent=delta.h+":"+delta.m+":"+delta.s;
}
//inicjowanie wszystkiego
window.onload = function() {
    canvas = document.getElementById("drawingCanvas");
    context = canvas.getContext("2d");

    window.onkeydown=function(e){
        switch (e.keyCode){
            case 38://up
                lab.moveKropekUp();
                Repaint();
                e.preventDefault();
                break;
            case 37://left
                lab.moveKropekLeft();
                Repaint();
                e.preventDefault();
                break;
            case 39://right
                lab.moveKropekRight();
                Repaint();
                e.preventDefault();
                break;
            case 40://down
                lab.moveKropekDown();
                Repaint();
                e.preventDefault();
                break;
            case 32://space
                lab.Hint();
                Repaint();
                e.preventDefault();
                break;
        }

    }


    //lab = new Maze(20,10);
    //lab.losuj();
    //lab.walls.x[5][5].setType(1);
    //lab.walls.y[6][6].setType(1);

    document.getElementById("skala").onchange= function(){
        GraphMaze.Multiply=Math.floor(this.value);
        Repaint();
    };
    document.getElementById("sizex").onchange= function(){
        newX=Math.floor(this.value);
        Repaint();
    };
    document.getElementById("sizey").onchange= function(){
        newY=Math.floor(this.value);
        Repaint();
    };

    NewLab();
    //lab.find_path({x:0,y:0},{x:lab.countX-1,y:lab.countY-1},900);
    imgKrew.src='krew.png';
    imgKropek.src='kropek.png';
    Repaint();

    //lab.winner=true;
    setInterval(function(){ShowTime();},1000);
}