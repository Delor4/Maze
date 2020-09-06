/**
 * Created by Delor on 2015-02-28.
 */

//stałe
const DIR = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3
}

//używane zmienne
var canvas, context;

var lab;
var GraphMaze = {};
GraphMaze.Multiply = 1;
var newX = 10;
var newY = 10;

var imgBlood = new Image();
imgBlood.loaded = false;
imgBlood.onload = function () {
    this.loaded = true;
    Repaint();
};
var imgDotee = new Image();
imgDotee.loaded = false;
imgDotee.onload = function () {
    this.loaded = true;
    Repaint();
};
function distance(x1, y1, x2, y2) {//odległość między punktami (2d)
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function random(i) {
    return Math.floor(Math.random() * i);
}
function Room() {
    this.flag = 0;
    this.path = false;
    this.blood = [false, false, false, false];

}
function Wall() {
    this.Type = 0;//brak ściany

    //this.GraphSizeY=15;

    this.setType = function (t) {
        this.Type = t;
    };
    this.getType = function () {
        return this.Type;
    };
}
function Maze(x, y, m) {
    this.countX = x;
    this.countY = y;
    this.graphMultiply = m;

    //rozmiary komnat
    this.roomSizeX = 15;
    this.roomSizeY = 15;

    this.wallWidth = 5;
    this.wallHeight = 10;

    this.wallsCount = 0;
    this.marker = 0;

    this.dotee = {
        x: this.countX - 1,
        y: this.countY - 1,
        look: DIR.UP
    };

    this.hintCount = 5;

    this.getHintCount = function () {
        return this.hintCount;
    }
    this.setGraphMultiply = function (g) {
        this.graphMultiply = g;
    };
    this.getGraphMultiply = function () {
        return this.graphMultiply;
    };
    this.Repaint = function (context) {
        //odmalowuję labirynt
        var grd = context.createRadialGradient(0, 0, distance(0, 0, this.getGraphSizeX(), this.getGraphSizeY()) / 10, 0,
            0, distance(0, 0, this.getGraphSizeX(), this.getGraphSizeY()));
        grd.addColorStop(0, "#c0c0c0");
        //grd.addColorStop(0.5, "red");
        grd.addColorStop(1, "#000000");

        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(this.getGraphSizeX(), 0);
        context.lineTo(this.getGraphSizeX(), this.getGraphSizeY());
        context.lineTo(0, this.getGraphSizeY());
        context.closePath();
        context.fillStyle = grd;
        context.fill();

        //komnaty
        for (var i = 0; i < this.countX; i++) {
            for (var j = 0; j < this.countY; j++) {
                var r = this.rooms[i][j];
                var x1 = ((i * (this.roomSizeX)) + ((i + 1) * (this.wallWidth))) * this.graphMultiply;
                var y1 = ((j * (this.roomSizeY)) + ((j + 1) * (this.wallWidth))) * this.graphMultiply;
                var x2 = x1 + (this.roomSizeX * this.graphMultiply);
                var y2 = y1 + (this.roomSizeY * this.graphMultiply);
                var x3 = x1 + ((this.roomSizeX - this.wallHeight) * this.graphMultiply / 2);
                var y3 = y1 + ((this.roomSizeY - this.wallHeight) * this.graphMultiply / 2);
                var x4 = x2 - ((this.roomSizeX - this.wallHeight) * this.graphMultiply / 2);
                var y4 = y2 - ((this.roomSizeY - this.wallHeight) * this.graphMultiply / 2);
                context.beginPath();
                context.moveTo(x1, y1);
                context.lineTo(x2, y1);
                context.lineTo(x2, y2);
                context.lineTo(x1, y2);
                context.closePath();
                //context.stroke();
                context.fillStyle = "white";
                context.fill();

                if (r.blood[DIR.UP]) {
                    context.save();
                    context.translate((x1 + x2) / 2, (y1 + y2) / 2);
                    if (imgBlood.loaded)
                        context.drawImage(imgBlood, -(x2 - x1) / 2, -(y2 - y1) / 2, x2 - x1, y2 - y1);
                    context.restore();
                }
                if (r.blood[DIR.RIGHT]) {
                    context.save();
                    context.translate((x1 + x2) / 2, (y1 + y2) / 2);
                    context.rotate(Math.PI / 2);
                    if (imgBlood.loaded)
                        context.drawImage(imgBlood, -(x2 - x1) / 2, -(y2 - y1) / 2, x2 - x1, y2 - y1);
                    context.restore();

                }
                if (r.blood[DIR.DOWN]) {
                    context.save();
                    context.translate((x1 + x2) / 2, (y1 + y2) / 2);
                    context.rotate(Math.PI);
                    if (imgBlood.loaded)
                        context.drawImage(imgBlood, -(x2 - x1) / 2, -(y2 - y1) / 2, x2 - x1, y2 - y1);
                    context.restore();

                }
                if (r.blood[DIR.LEFT]) {
                    context.save();
                    context.translate((x1 + x2) / 2, (y1 + y2) / 2);
                    context.rotate(-Math.PI / 2);
                    if (imgBlood.loaded)
                        context.drawImage(imgBlood, -(x2 - x1) / 2, -(y2 - y1) / 2, x2 - x1, y2 - y1);
                    context.restore();

                }

                //cała ścieżka po wygraniu
                if (
                    (this.winner && r.path == 1) ||
                    (this.hint && r.path == 2)
                ) {
                    var x0 = (x1 + x2) / 2;
                    var y0 = (y1 + y2) / 2;
                    var xr = (x2 - x1) / 4;
                    var yr = (y2 - y1) / 2;
                    context.save();
                    context.globalAlpha = 0.5;
                    context.beginPath();
                    grd = context.createRadialGradient(x0, y0, xr,
                        x0, y0, yr);
                    grd.addColorStop(0, "rgba(255,255,0,1)");
                    //grd.addColorStop(0.5, "red");
                    grd.addColorStop(1, "rgba(255,255,0,0)");
                    context.moveTo(x1, y1);
                    context.lineTo(x2, y1);
                    context.lineTo(x2, y2);
                    context.lineTo(x1, y2);
                    context.closePath();
                    //context.stroke();
                    context.fillStyle = grd;
                    context.fill();

                    context.restore();
                }
                context.strokeStyle = "gray";
                context.lineWidth = this.graphMultiply;
                context.beginPath();
                context.moveTo(x3, y1);
                context.lineTo(x1, y1);
                context.lineTo(x1, y3);

                context.moveTo(x4, y1);
                context.lineTo(x2, y1);
                context.lineTo(x2, y3);

                context.moveTo(x4, y2);
                context.lineTo(x2, y2);
                context.lineTo(x2, y4);

                context.moveTo(x3, y2);
                context.lineTo(x1, y2);
                context.lineTo(x1, y4);
                context.stroke();

                if (i == this.dotee.x && j == this.dotee.y) {

                    if (this.dotee.look == DIR.UP) {
                        context.save();
                        context.translate((x1 + x2) / 2, (y1 + y2) / 2);
                        if (imgDotee.loaded)
                            context.drawImage(imgDotee, -(x2 - x1) / 2, -(y2 - y1) / 2, x2 - x1, y2 - y1);
                        context.restore();
                    }
                    if (this.dotee.look == DIR.RIGHT) {
                        context.save();
                        context.translate((x1 + x2) / 2, (y1 + y2) / 2);
                        context.rotate(Math.PI / 2);
                        if (imgDotee.loaded)
                            context.drawImage(imgDotee, -(x2 - x1) / 2, -(y2 - y1) / 2, x2 - x1, y2 - y1);
                        context.restore();

                    }
                    if (this.dotee.look == DIR.DOWN) {
                        context.save();
                        context.translate((x1 + x2) / 2, (y1 + y2) / 2);
                        context.rotate(Math.PI);
                        if (imgDotee.loaded)
                            context.drawImage(imgDotee, -(x2 - x1) / 2, -(y2 - y1) / 2, x2 - x1, y2 - y1);
                        context.restore();

                    }
                    if (this.dotee.look == DIR.LEFT) {
                        context.save();
                        context.translate((x1 + x2) / 2, (y1 + y2) / 2);
                        context.rotate(-Math.PI / 2);
                        if (imgDotee.loaded)
                            context.drawImage(imgDotee, -(x2 - x1) / 2, -(y2 - y1) / 2, x2 - x1, y2 - y1);
                        context.restore();

                    }
                }
            }
        }
        //ściany x
        for (var i = 0; i <= this.countX; i++) {
            for (var j = 0; j < this.countY; j++) {
                var w = this.walls.x[i][j];
                var x1 = ((i * (this.roomSizeX + this.wallWidth))) * this.graphMultiply;
                var y1 = ((j * (this.roomSizeY)) + ((j + 1) * (this.wallWidth))) * this.graphMultiply;
                var x2 = x1 + (this.wallWidth * this.graphMultiply);
                var y2 = y1 + (this.roomSizeY * this.graphMultiply);
                var x3 = x1;
                var y3 = y1 + ((this.roomSizeY - this.wallHeight) * this.graphMultiply / 2);
                var x4 = x2;
                var y4 = y2 - ((this.roomSizeY - this.wallHeight) * this.graphMultiply / 2);

                if (w.getType() == 0) {
                    context.beginPath();
                    context.moveTo(x3, y3);
                    context.lineTo(x4, y3);
                    context.lineTo(x4, y4);
                    context.lineTo(x3, y4);
                    context.closePath();
                    context.fillStyle = "white";
                    context.fill();

                    context.strokeStyle = "gray";
                    context.lineWidth = this.graphMultiply;
                    context.beginPath();
                    context.moveTo(x3, y3);
                    context.lineTo(x4, y3);
                    context.moveTo(x3, y4);
                    context.lineTo(x4, y4);
                    context.stroke();

                }
                else {
                    context.strokeStyle = "gray";
                    context.lineWidth = this.graphMultiply;
                    context.beginPath();
                    context.moveTo(x1, y3);
                    context.lineTo(x1, y4);
                    context.moveTo(x2, y3);
                    context.lineTo(x2, y4);
                    context.stroke();
                }
            }
        }
        for (var i = 0; i < this.countX; i++) {
            for (var j = 0; j <= this.countY; j++) {
                var w = this.walls.y[i][j];
                var x1 = ((i * (this.roomSizeX)) + ((i + 1) * (this.wallWidth))) * this.graphMultiply;
                var y1 = ((j * (this.roomSizeY + this.wallWidth))) * this.graphMultiply;
                var x2 = x1 + (this.roomSizeX * this.graphMultiply);
                var y2 = y1 + (this.wallWidth * this.graphMultiply);
                var x3 = x1 + ((this.roomSizeX - this.wallHeight) * this.graphMultiply / 2);
                var y3 = y1;
                var x4 = x2 - ((this.roomSizeX - this.wallHeight) * this.graphMultiply / 2);
                var y4 = y2;

                if (w.getType() == 0) {
                    context.beginPath();
                    context.moveTo(x3, y3);
                    context.lineTo(x4, y3);
                    context.lineTo(x4, y4);
                    context.lineTo(x3, y4);
                    context.closePath();
                    context.fillStyle = "white";
                    context.fill();

                    context.strokeStyle = "gray";
                    context.lineWidth = this.graphMultiply;
                    context.beginPath();
                    context.moveTo(x3, y3);
                    context.lineTo(x3, y4);
                    context.moveTo(x4, y3);
                    context.lineTo(x4, y4);
                    context.stroke();

                }
                else {
                    context.strokeStyle = "gray";
                    context.lineWidth = this.graphMultiply;
                    context.beginPath();
                    context.moveTo(x3, y3);
                    context.lineTo(x4, y3);
                    context.moveTo(x3, y4);
                    context.lineTo(x4, y4);
                    context.stroke();
                }
            }
        }
        if (this.winner) {
            //tu jakiś ekran z gratulacjami
            context.save();
            context.globalAlpha = 0.5;
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(this.getGraphSizeX(), 0);
            context.lineTo(this.getGraphSizeX(), this.getGraphSizeY());
            context.lineTo(0, this.getGraphSizeY());
            context.closePath();
            //context.stroke();
            context.fillStyle = "#c0c0c0";
            context.fill();

            context.restore();

            context.textAlign = "center";
            context.fillStyle = "#ff0000";
            context.strokeStyle = "#800000";

            context.font = "" + (30 * this.graphMultiply) + "pt Calibri";
            this.Text(context, "Gratulacje!", this.getGraphSizeX() / 2, this.getGraphSizeY() / 5);

            context.font = "" + (15 * this.graphMultiply) + "pt Calibri";
            this.Text(context, "Labirynt " + this.countX + "x" + this.countY + " pól", this.getGraphSizeX() / 2, 2 * this.getGraphSizeY() / 5);
            var delta = milisecToTime(new Date(this.endTime - this.startTime).getTime());
            this.Text(context, "ukończony w czasie: ", this.getGraphSizeX() / 2, 3 * this.getGraphSizeY() / 5);
            this.Text(context, "" + delta.h + ":" + delta.m + ":" + delta.s, this.getGraphSizeX() / 2, 4 * this.getGraphSizeY() / 5);

        }

    }
    this.Text = function (context, text, x, y) {
        context.save();
        context.fillStyle = "white";
        context.fillText(text, x + (2 * this.graphMultiply), y + (2 * this.graphMultiply));
        context.restore();
        context.fillText(text, x, y);
        context.strokeText(text, x, y);

    }
    this.getGraphSizeX = function () {
        return ((this.roomSizeX * this.countX) + (this.wallWidth * (this.countX + 1))) * this.getGraphMultiply();

    };
    this.getGraphSizeY = function () {
        return ((this.roomSizeY * this.countY) + (this.wallWidth * (this.countY + 1))) * this.getGraphMultiply();
    };

    this.place_walls = function () {//losowanie rozstawienia ścian
        const max_walls = (this.countX * this.countY) - (this.countX + this.countY) + 1;

        while (this.wallsCount < max_walls) {
            for (var rx = 0; rx < this.countX; rx++) {
                this.checkInsert(rx, this.countY - 1, random(4));
            }

            for (var ry = 0; ry < this.countY; ry++) {
                this.checkInsert(this.countX - 1, ry, random(4));
            }

            for (var ry = 0; ry < this.countY; ry++) {
                for (var rx = 0; rx < this.countX; rx++) {
                    this.checkInsert(rx, ry, random(4));
                }
            }
        }
    }

    this.get_room = function (x, y) {
        if (x < 0 || x >= this.countX || y < 0 || y >= this.countY) return null;
        return this.rooms[x][y];
    }
    this.get_wall = [];
    this.get_wall_up = function (x, y) {
        if (x < 0 || x >= this.countX || y < 0 || y > this.countY) return null;
        return this.walls.y[x][y];
    }
    this.get_wall[DIR.UP] = this.get_wall_up.bind(this);

    this.get_wall_down = function (x, y) {
        if (x < 0 || x >= this.countX || y < 0 || y > this.countY) return null;
        return this.walls.y[x][y + 1];
    }
    this.get_wall[DIR.DOWN] = this.get_wall_down.bind(this);

    this.get_wall_left = function (x, y) {
        if (x < 0 || x > this.countX || y < 0 || y >= this.countY) return null;
        return this.walls.x[x][y];
    }
    this.get_wall[DIR.LEFT] = this.get_wall_left.bind(this);

    this.get_wall_right = function (x, y) {
        if (x < 0 || x > this.countX || y < 0 || y >= this.countY) return null;
        return this.walls.x[x + 1][y];
    }
    this.get_wall[DIR.RIGHT] = this.get_wall_right.bind(this);

    //sprawdzam czy mogę wstawić scianę f w komnacie (x,y)
    this.checkInsert = function (rx, ry, f) {
        var sc, pd;
        sc = (this.get_wall[f])(rx, ry);
        switch (f) {
            case DIR.UP:
                pd = new Point(rx, ry - 1);
                break;
            case DIR.LEFT:
                pd = new Point(rx - 1, ry);
                break;
            case DIR.DOWN:
                pd = new Point(rx, ry + 1);
                break;
            case DIR.RIGHT:
            default:
                pd = new Point(rx + 1, ry);
                break;
        }
        if (sc.getType() == 0) {

            //var po=this.get_room(rx,ry);
            var po = new Point(rx, ry);
            sc.setType(1);
            this.wallsCount++;

            this.marker++;
            if ((this.find_path(po, pd, this.marker)) == false) {//po dodaniu tej sciany brak przejscia więc cofamy wybór
                sc.setType(0);
                this.wallsCount--;
            }
        }
    }
    this.adjacent = function (rx, ry, k) {
        switch (k) {
            case DIR.UP:
                return this.get_room(rx, ry - 1);
                break;
            case DIR.LEFT:
                return this.get_room(rx - 1, ry);
                break;
            case DIR.DOWN:
                return this.get_room(rx, ry + 1);
                break;
            case DIR.RIGHT:
            default:
                return this.get_room(rx + 1, ry);
                break;
        }
    }
    this.wall = function (rx, ry, k) {
        return this.get_wall[k](rx, ry);
    }
    this.point_of_adjacent = function (rx, ry, k) {
        switch (k) {
            case DIR.UP:
                return new Point(rx, ry - 1);
                break;
            case DIR.LEFT:
                return new Point(rx - 1, ry);
                break;
            case DIR.DOWN:
                return new Point(rx, ry + 1);
                break;
            case DIR.RIGHT:
            default:
                return new Point(rx + 1, ry);
                break;
        }
    }
    this.find_path = function (st, pd, zn) {

        if (
            st.x < 0 || st.x >= this.countX ||
            st.y < 0 || st.y >= this.countY ||
            pd.x < 0 || pd.x >= this.countX ||
            pd.y < 0 || pd.y >= this.countY
        ) return false;
        if (st.x == pd.x && st.y == pd.y) {
            this.get_room(st.x, st.y).path = 1;
            return true;
        }

        if (zn == this.get_room(st.x, st.y).flag) {
            this.get_room(st.x, st.y).path = 0;
            return false;
        }

        this.get_room(st.x, st.y).flag = zn;

        for (var i = 0; i < 4; i++) {
            if (this.adjacent(st.x, st.y, i) != null) {
                if (this.wall(st.x, st.y, i).getType() == 0) {
                    if (this.find_path(this.point_of_adjacent(st.x, st.y, i), pd, zn) == true) {
                        this.get_room(st.x, st.y).path = 1;
                        return true;
                    }
                }
            }
        }
        this.get_room(st.x, st.y).path = 0;
        return false;

    }

    //obsługa kropka
    this.move_dotee_up = function () {
        if (!this.winner) {
            if (this.get_wall[DIR.UP](this.dotee.x, this.dotee.y).getType() == 0) {
                this.hint = false;
                this.get_room(this.dotee.x, this.dotee.y).blood[DIR.UP] = true;
                this.dotee.y -= 1;
                this.dotee.look = DIR.UP;
                this.checkWin();
            }
        }
    }
    this.move_dotee_down = function () {
        if (!this.winner) {
            if (this.get_wall[DIR.DOWN](this.dotee.x, this.dotee.y).getType() == 0) {
                this.hint = false;
                this.get_room(this.dotee.x, this.dotee.y).blood[DIR.DOWN] = true;
                this.dotee.y += 1;
                this.dotee.look = DIR.DOWN;
                this.checkWin();
            }
        }
    }
    this.move_dotee_left = function () {
        if (!this.winner) {
            if (this.get_wall[DIR.LEFT](this.dotee.x, this.dotee.y).getType() == 0) {
                this.hint = false;
                this.get_room(this.dotee.x, this.dotee.y).blood[DIR.LEFT] = true;
                this.dotee.x -= 1;
                this.dotee.look = DIR.LEFT;
                this.checkWin();
            }
        }
    }
    this.move_dotee_right = function () {
        if (!this.winner) {
            if (this.get_wall[DIR.RIGHT](this.dotee.x, this.dotee.y).getType() == 0) {
                this.hint = false;
                this.get_room(this.dotee.x, this.dotee.y).blood[DIR.RIGHT] = true;
                this.dotee.x += 1;
                this.dotee.look = DIR.RIGHT;
                this.checkWin();
            }
        }
    }
    this.move_dotee = [];
    this.move_dotee[DIR.UP] = this.move_dotee_up.bind(this);
    this.move_dotee[DIR.RIGHT] = this.move_dotee_right.bind(this);
    this.move_dotee[DIR.DOWN] = this.move_dotee_down.bind(this);
    this.move_dotee[DIR.LEFT] = this.move_dotee_left.bind(this);

    this.winner = false;
    //this.postwinner=false;
    this.endTime = null;
    this.checkWin = function () {
        if (this.dotee.x == 0 && this.dotee.y == 0) {
            this.winner = true;
            this.endTime = new Date();
            this.clearPath();
            this.marker++;
            this.find_path({ x: 0, y: 0 }, { x: this.countX - 1, y: this.countY - 1 }, this.marker);
        }
    }
    this.Hint = function () {
        if (!this.hint && !this.winner) {
            if (this.hintCount > 0) {
                this.hintCount--;
                this.hint = true;
                this.marker++;
                this.find_path({ x: 0, y: 0 }, this.dotee, this.marker);
                var p;
                for (var i = 0; i < 4; i++) {
                    if (this.adjacent(this.dotee.x, this.dotee.y, i) !== null &&
                        this.adjacent(this.dotee.x, this.dotee.y, i).path == 1 &&
                        this.wall(this.dotee.x, this.dotee.y, i).getType() == 0
                    ) {
                        p = this.point_of_adjacent(this.dotee.x, this.dotee.y, i);
                        break;
                    }
                }
                this.clearPath();
                this.get_room(p.x, p.y).path = 2;

            }
        }
    }
    this.clearPath = function () {
        for (var i = 0; i < this.countX; i++) {
            for (var j = 0; j < this.countY; j++) {
                this.rooms[i][j].path = 0;
            }
        }

    }
    //tworzenie labiryntu
    this.rooms = [];
    for (var i = 0; i < this.countX; i++) {
        this.rooms[i] = [];
        for (var j = 0; j < this.countY; j++) {
            this.rooms[i][j] = new Room();
        }
    }
    this.walls = {};
    this.walls.x = [];
    this.walls.y = [];

    for (var i = 0; i < this.countX + 1; i++) {
        this.walls.x[i] = [];
        for (var j = 0; j < this.countY; j++) {
            this.walls.x[i][j] = new Wall();
            if (i == 0 || i == this.countX) this.walls.x[i][j].setType(1);
        }
    }
    for (var i = 0; i < this.countX; i++) {
        this.walls.y[i] = [];
        for (var j = 0; j < this.countY + 1; j++) {
            this.walls.y[i][j] = new Wall();
            if (j == 0 || j == this.countY) this.walls.y[i][j].setType(1);

        }
    }
    this.place_walls();
    this.startTime = new Date();
}

function NewLab() {
    lab = new Maze(newX, newY, GraphMaze.Multiply);
    Repaint();
}
function Point(x, y) {
    this.x = x;
    this.y = y;
}
function Repaint() {
    document.getElementById("sizeout").textContent = newX + "x" + newY + " pól";

    document.getElementById("hints").textContent = lab.getHintCount();
    lab.setGraphMultiply(GraphMaze.Multiply);
    canvas.width = lab.getGraphSizeX();
    canvas.height = lab.getGraphSizeY();

    lab.Repaint(context);
    ShowTime();
}

function milisecToTime(mi) {
    var h = Math.floor(mi / (1000 * 60 * 60));
    var m = Math.floor((mi - (h * 1000 * 60 * 60)) / (1000 * 60));
    var s = Math.floor((mi - (h * 1000 * 60 * 60) - (m * 1000 * 60)) / 1000);
    if (h < 10) h = "0" + h;
    if (m < 10) m = "0" + m;
    if (s < 10) s = "0" + s;
    return { h: h, m: m, s: s };
}
function ShowTime() {
    var t = new Date;
    if (lab.winner) {
        t = lab.endTime;
    }
    var delta = milisecToTime(new Date(t - lab.startTime).getTime());
    document.getElementById("showtime").textContent = delta.h + ":" + delta.m + ":" + delta.s;
}
//inicjowanie wszystkiego
window.onload = function () {
    canvas = document.getElementById("drawingCanvas");
    context = canvas.getContext("2d");

    window.onkeydown = function (e) {
        var changed = false;
        var moved = -1;
        switch (e.keyCode) {
            case 38://up
                moved = DIR.UP;
                break;
            case 37://left
                moved = DIR.LEFT;
                break;
            case 39://right
                moved = DIR.RIGHT;
                break;
            case 40://down
                moved = DIR.DOWN;
                break;
            case 32://space
                lab.Hint();
                changed = true;
                break;
        }
        if(moved != -1) {
            lab.move_dotee[moved]();
            changed = true;
        }
        if(changed) {
            Repaint();
            e.preventDefault();
        }

    }

    document.getElementById("maze_scale").onchange = function () {
        GraphMaze.Multiply = Math.floor(this.value);
        Repaint();
    };
    document.getElementById("maze_size_x").onchange = function () {
        newX = Math.floor(this.value);
        Repaint();
    };
    document.getElementById("maze_size_y").onchange = function () {
        newY = Math.floor(this.value);
        Repaint();
    };

    NewLab();

    imgBlood.src = 'krew.png';
    imgDotee.src = 'kropek.png';
    Repaint();

    setInterval(function () { ShowTime(); }, 1000);
};