/**
 * Created by Delor on 2015-02-28.
 * Updated on 2020.
 */

//constants
const DIR = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3
}

const ROTATION = [
    0,
    Math.PI / 2,
    Math.PI,
    -Math.PI / 2
];

const INIT = {
    HINT_COUNT : 5,
    ROOM_SIZE_X : 15,
    ROOM_SIZE_Y : 15,

    WALL_WIDTH : 5,
    WALL_HEIGHT: 10
}

//variables
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
function distance(x1, y1, x2, y2) {//Euclidean distance between two points
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
    this.Type = 0;//no wall

    this.setSolid = function () {
        this.Type = 1;
    }
    this.setFree = function () {
        this.Type = 0;
    }
    this.isSolid = function () {
        return this.Type == 1;
    }
    this.isFree = function () {
        return this.Type == 0;
    }
}
function Maze(x, y, multiply) {
    this.countX = x;
    this.countY = y;
    this.graphMultiply = multiply;

    this.roomSizeX = INIT.ROOM_SIZE_X;
    this.roomSizeY = INIT.ROOM_SIZE_Y;

    this.wallWidth = INIT.WALL_WIDTH;
    this.wallHeight = INIT.WALL_HEIGHT;

    this.wallsCount = 0;
    this.marker = 0;

    this.dotee = {
        x: this.countX - 1,
        y: this.countY - 1,
        look: DIR.UP
    };

    this.hintCount = INIT.HINT_COUNT;

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
        var grd = context.createRadialGradient(0, 0, distance(0, 0, this.getGraphSizeX(), this.getGraphSizeY()) / 10,
                                               0, 0, distance(0, 0, this.getGraphSizeX(), this.getGraphSizeY()));
        grd.addColorStop(0, "#c0c0c0");
        grd.addColorStop(1, "#000000");

        //draw maze

        this.draw_background(context, grd);

        //rooms
        for (var i = 0; i < this.countX; i++) {
            for (var j = 0; j < this.countY; j++) {
                const x1 = ((i * (this.roomSizeX)) + ((i + 1) * (this.wallWidth))) * this.graphMultiply;
                const y1 = ((j * (this.roomSizeY)) + ((j + 1) * (this.wallWidth))) * this.graphMultiply;
                const x2 = x1 + (this.roomSizeX * this.graphMultiply);
                const y2 = y1 + (this.roomSizeY * this.graphMultiply);

                const d = {
                    "room" : this.rooms[i][j],
                    "x1" : x1,
                    "y1" : y1,
                    "x2" : x2,
                    "y2" : y2,
                    "x3" : x1 + ((this.roomSizeX - this.wallHeight) * this.graphMultiply / 2),
                    "y3" : y1 + ((this.roomSizeY - this.wallHeight) * this.graphMultiply / 2),
                    "x4" : x2 - ((this.roomSizeX - this.wallHeight) * this.graphMultiply / 2),
                    "y4" : y2 - ((this.roomSizeY - this.wallHeight) * this.graphMultiply / 2)
                }

                //room
                this.draw_room_background(context, d);
                this.draw_room_outline(context, d);

                //blood
                this.draw_blood(context, d);

                //after win draw all hints
                if (
                    (this.winner && d.room.path == 1) ||
                    (this.hint && d.room.path == 2)
                ) {
                    this.draw_hint(context, d, grd);
                }

                //main character
                if (i == this.dotee.x && j == this.dotee.y) {
                    this.draw_dotee(context, d);
                }
            }
        }
        //walls horizontal
        for (var i = 0; i <= this.countX; i++) {
            for (var j = 0; j < this.countY; j++) {

                const x1 = ((i * (this.roomSizeX + this.wallWidth))) * this.graphMultiply;
                const y1 = ((j * (this.roomSizeY)) + ((j + 1) * (this.wallWidth))) * this.graphMultiply;
                const x2 = x1 + (this.wallWidth * this.graphMultiply);
                const y2 = y1 + (this.roomSizeY * this.graphMultiply);

                const d = {
                    "wall" : this.walls.x[i][j],
                    "x1" : x1,
                    "x2" : x2,
                    "y1" : y1,
                    "y2" : y2,
                    "x3" : x1,
                    "y3" : y1 + ((this.roomSizeY - this.wallHeight) * this.graphMultiply / 2),
                    "x4" : x2,
                    "y4" : y2 - ((this.roomSizeY - this.wallHeight) * this.graphMultiply / 2)
                };

                if (d.wall.isSolid()) {
                    this.draw_wall_solid_horizontal(context, d);
                }
                else {
                    this.draw_wall_free_bkg(context, d);
                    this.draw_wall_free_outline_horizontal(context, d);
                }
            }
        }
        //walls vertical
        for (var i = 0; i < this.countX; i++) {
            for (var j = 0; j <= this.countY; j++) {
                const x1 = ((i * (this.roomSizeX)) + ((i + 1) * (this.wallWidth))) * this.graphMultiply;
                const y1 = ((j * (this.roomSizeY + this.wallWidth))) * this.graphMultiply;
                const x2 = x1 + (this.roomSizeX * this.graphMultiply);
                const y2 = y1 + (this.wallWidth * this.graphMultiply);

                const d = {
                    "wall" : this.walls.y[i][j],
                    "x1" : x1,
                    "x2" : x2,
                    "y1" : y1,
                    "y2" : y2,
                    "x3" : x1 + ((this.roomSizeX - this.wallHeight) * this.graphMultiply / 2),
                    "y3" : y1,
                    "x4" : x2 - ((this.roomSizeX - this.wallHeight) * this.graphMultiply / 2),
                    "y4" : y2
                };

                if (d.wall.isSolid()) {
                    this.draw_wall_solid_vertical(context, d);
                }
                else {
                    this.draw_wall_free_bkg(context, d);
                    this.draw_wall_free_outline_vertical(context, d);
                }
            }
        }

        if (this.winner) {
            this.draw_congratulation_background(context);
            this.draw_congratulation_texts(context);
        }
    }

    this.draw_background = function (context, grd) {
        this.draw_filled_rect(context, grd, 0, 0, this.getGraphSizeX(), this.getGraphSizeY());
    }

    this.draw_room_background = function (context, d) {
        this.draw_filled_rect(context, "white", d.x1, d.y1, d.x2, d.y2);
    }

    this.draw_room_outline = function (context, data) {
        context.strokeStyle = "gray";
        context.lineWidth = this.graphMultiply;

        context.beginPath();
        context.moveTo(data.x3, data.y1);
        context.lineTo(data.x1, data.y1);
        context.lineTo(data.x1, data.y3);

        context.moveTo(data.x4, data.y1);
        context.lineTo(data.x2, data.y1);
        context.lineTo(data.x2, data.y3);

        context.moveTo(data.x4, data.y2);
        context.lineTo(data.x2, data.y2);
        context.lineTo(data.x2, data.y4);

        context.moveTo(data.x3, data.y2);
        context.lineTo(data.x1, data.y2);
        context.lineTo(data.x1, data.y4);
        context.stroke();
    }
    this.draw_wall_free_bkg = function (context, data) {
        this.draw_filled_rect(context, "white", data.x3, data.y3, data.x4, data.y4);
    }
    this.draw_wall_free_outline_horizontal = function (context, data) {
        context.strokeStyle = "gray";
        context.lineWidth = this.graphMultiply;
        context.beginPath();
        context.moveTo(data.x3, data.y3);
        context.lineTo(data.x4, data.y3);
        context.moveTo(data.x3, data.y4);
        context.lineTo(data.x4, data.y4);
        context.stroke();
    }
    this.draw_wall_solid_horizontal = function(context, data) {
        context.strokeStyle = "gray";
        context.lineWidth = this.graphMultiply;
        context.beginPath();
        context.moveTo(data.x1, data.y3);
        context.lineTo(data.x1, data.y4);
        context.moveTo(data.x2, data.y3);
        context.lineTo(data.x2, data.y4);
        context.stroke();
    }
    this.draw_wall_free_outline_vertical = function (context, data) {
        context.strokeStyle = "gray";
        context.lineWidth = this.graphMultiply;
        context.beginPath();
        context.moveTo(data.x3, data.y3);
        context.lineTo(data.x3, data.y4);
        context.moveTo(data.x4, data.y3);
        context.lineTo(data.x4, data.y4);
        context.stroke();
    }
    this.draw_wall_solid_vertical = function(context, data) {
        context.strokeStyle = "gray";
        context.lineWidth = this.graphMultiply;
        context.beginPath();
        context.moveTo(data.x3, data.y3);
        context.lineTo(data.x4, data.y3);
        context.moveTo(data.x3, data.y4);
        context.lineTo(data.x4, data.y4);
        context.stroke();
    }
    this.draw_blood = function (context, data) {
        data.room.blood.forEach(function (exist, index) {
            if(exist){
                context.save();
                context.translate((data.x1 + data.x2) / 2, (data.y1 + data.y2) / 2);
                context.rotate(ROTATION[index]);
                if (imgBlood.loaded)
                    context.drawImage(imgBlood, -(data.x2 - data.x1) / 2, -(data.y2 - data.y1) / 2, data.x2 - data.x1, data.y2 - data.y1);
                context.restore();
            }
        });
    }
    this.draw_hint = function (context, data, grd) {
        var x0 = (data.x1 + data.x2) / 2;
        var y0 = (data.y1 + data.y2) / 2;
        var xr = (data.x2 - data.x1) / 4;
        var yr = (data.y2 - data.y1) / 2;
        context.save();
        context.globalAlpha = 0.5;

        grd = context.createRadialGradient(x0, y0, xr, x0, y0, yr);
        grd.addColorStop(0, "rgba(255,255,0,1)");
        grd.addColorStop(1, "rgba(255,255,0,0)");

        this.draw_filled_rect(context, grd, data.x1, data.y1, data.x2, data.y2);

        context.restore();
    }
    this.draw_dotee = function(context, data) {
        context.save();
        context.translate((data.x1 + data.x2) / 2, (data.y1 + data.y2) / 2);
        context.rotate(ROTATION[this.dotee.look]);
        if (imgDotee.loaded)
            context.drawImage(imgDotee,
                -(data.x2 - data.x1) / 2,
                 -(data.y2 - data.y1) / 2,
                  data.x2 - data.x1, data.y2 - data.y1
            );
        context.restore();
    }
    this.draw_congratulation_background = function (context) {
        context.save();
        context.globalAlpha = 0.5;
        this.draw_filled_rect(context, "#c0c0c0", 0, 0, this.getGraphSizeX(), this.getGraphSizeY());
        context.restore();
    }

    this.draw_congratulation_texts = function (context) {
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
    this.draw_filled_rect = function (context, fillStyle, x1, y1, x2, y2) {
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y1);
            context.lineTo(x2, y2);
            context.lineTo(x1, y2);
            context.closePath();
            context.fillStyle = fillStyle;
            context.fill();
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

    this.place_walls = function () {//randomize walls placement
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
        if (sc.isFree()) {
            var po = new Point(rx, ry);
            sc.setSolid();
            this.wallsCount++;

            this.marker++;
            if ((this.find_path(po, pd, this.marker)) == false) {//no path, revert changes
                sc.setFree();
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
            if (
                (this.adjacent(st.x, st.y, i) != null) &&
                this.wall(st.x, st.y, i).isFree() &&
                this.find_path(this.point_of_adjacent(st.x, st.y, i), pd, zn)
            ) {
                this.get_room(st.x, st.y).path = 1;
                return true;
            }
        }
        this.get_room(st.x, st.y).path = 0;
        return false;

    }

    //main character moving
    this.move_dotee_up = function () {
        if (!this.winner) {
            if (this.get_wall[DIR.UP](this.dotee.x, this.dotee.y).isFree()) {
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
            if (this.get_wall[DIR.DOWN](this.dotee.x, this.dotee.y).isFree()) {
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
            if (this.get_wall[DIR.LEFT](this.dotee.x, this.dotee.y).isFree()) {
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
            if (this.get_wall[DIR.RIGHT](this.dotee.x, this.dotee.y).isFree()) {
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
                        this.wall(this.dotee.x, this.dotee.y, i).isFree()
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
    //making maze
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
            if (i == 0 || i == this.countX) this.walls.x[i][j].setSolid();
        }
    }
    for (var i = 0; i < this.countX; i++) {
        this.walls.y[i] = [];
        for (var j = 0; j < this.countY + 1; j++) {
            this.walls.y[i][j] = new Wall();
            if (j == 0 || j == this.countY) this.walls.y[i][j].setSolid();

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
//initiating
window.onload = function () {
    canvas = document.getElementById("drawingCanvas");
    context = canvas.getContext("2d");

    window.onkeydown = function (e) {
        var changed = false;
        var moved = -1;
        switch (e.keyCode) {
            case 38:
                moved = DIR.UP;
                break;
            case 37:
                moved = DIR.LEFT;
                break;
            case 39:
                moved = DIR.RIGHT;
                break;
            case 40:
                moved = DIR.DOWN;
                break;
            case 32: //space
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