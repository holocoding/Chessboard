window.onload = doAll;

class Chessgame {
    constructor() {  //__init__ funktion von javascript
        this.fletters = "abcdefgh"; this.fnumbers = "87654321";
        this.figs = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"; //speichern der Spielaufstellung (hier die Grundaufstellung)
        this.figNames = { "r": "Rook", "n": "Knight", "b": "Bishop", "q": "Queen", "k": "King", "p": "Pawn" };
    }
    getEbI(target) { return document.getElementById(target) } // Verkürzung, damit es später im Code nicht immer so viel Platz wegnimmt
    fieldToCoors(field) { //Nach Eingabe einer Feldcoor (z.B a1), werden die Koordinaten dieses Feldes wie bspw x = 8 und y = 110 zurückgegeben
        this.field = field; this.returnIdx = [];
        this.field_x = this.fletters.indexOf(this.field[0]) * 100 + this.getEbI("board").offsetLeft;
        this.field_y = (800) - ((Number(this.field[1]) - 1) * 100 - (this.getEbI("board").offsetTop - 100));
        this.returnIdx.push(this.field_x, this.field_y);
        return (this.returnIdx);
    }
    readMove(e) {   //einlesen des Inputs
        if (e.key == 'Enter') {
            this.content = e.target.value;
            if (this.content.length == 5) { //Überprüfen der Länge
                if (this.fletters.includes(this.content[1]) && this.fletters.includes(this.content[3]) &&  //Überprüfen, ob 1. und 3. Index des Inputs ein Buchstabe der Feldkoordianten ist
                    this.fnumbers.includes(this.content[2]) && this.fnumbers.includes(this.content[4])) {//Überprüfen, ob 2. nud 4. Index des Inputs eine Nummer der Feldkoordianten ist
                    if (this.getEbI(this.content.slice(3, 5)) == undefined) { //wenn die 2. Angegebene Position leer ist
                        serverMoveHandler(this.content, "0"); // 0 steht für None
                    } else { //wenn an der 2. angegebenen Position schon eine Figur steht
                        serverMoveHandler(this.content, this.getEbI(this.content.slice(3, 5)))
                    }
                }
                else {window.alert("Invalid Input")} // Falls die Eingabe fehlerhaft war
            }
            else {window.alert("Invalid Input")} // falls die Eingabe zu kurz/lang war
            e.target.value = ""; //Inhalt des Eingabefeldes leeren
        }
    }
    drawBoard() {   // Zeichnet das Schachbrett
        for (this.y = 0; this.y < 8; this.y++) {
            this.div = document.createElement("div");
            this.div.className = "row";
            this.getEbI("board").appendChild(this.div);
            for (this.x = 0; this.x < 8; this.x++) {
                this.img = document.createElement("img");
                this.img.src = "../Images/" + String(Math.abs(this.y % 2 - this.x % 2)) + ".png";
                this.img.id = "f" + this.fletters[this.x] + String(9 - (this.y + 1));
                this.div.appendChild(this.img);
            }
        }
        this.drawFigs(); // nach zeichnen des Boards, wird die Funktion zum zeichnen der Figuren aufgerufen
    }
    drawFigs() { //Funktion zum zeichnen/generieren der Figuren
        this.x = this.getEbI("board").offsetLeft; //abstand zum rand
        this.y = this.getEbI("board").offsetTop; //Abstand nach oben
        for (this.fig = 0; this.fig < this.figs.length; this.fig++) {
            if (this.figs[this.fig] == "/") { //bedeutet neue Zeile
                this.x = this.getEbI("board").offsetLeft; //wird wieder auf Ursprung resetet
                this.y += 100;  //Abstand vergrößert sich um 100 nach oben
            } else if (this.fnumbers.indexOf(this.figs[this.fig]) >= 0) { //wenn eine Zahl vorhanden ist, wird berechnet wie viel frei ist (also bsw. 4 = 4 leere positionen = 400px)
                this.x += parseInt(this.figs[this.fig]) * 100; //also die z.B. die 4 * 100 für 400px
            } else { //wenn eine Figur angegeben wird
                this.figImg = document.createElement("img"); //erstellen einer neuen Bildvariable
                this.figImg.src = "../Images/svg/" + this.figs[this.fig] + ".svg"; //zuweisen des richtigen Bildes
                this.figImg.title = this.figNames[(this.figs[this.fig]).toLowerCase()];  //ist der Titel, der erscheint, wenn man mit der Maus drüber verweilt.
                this.figImg.className = "figures"; this.figImg.draggable = false;
                this.figImg.style.left = String(this.x + 2) + "px"; this.figImg.style.top = String(this.y + 2) + "px"; //angeben der Position (+2 da der Rand des Spielfeldes mit beachtet werden muss)
                this.figImg.id = this.fletters[(this.x - this.getEbI("board").offsetLeft) / 100] + this.fnumbers[(this.y - this.getEbI("board").offsetTop) / 100]; //ID-Vergebung(gibt Feldkoordinate an→ a1,…)
                this.getEbI("board").appendChild(this.figImg);
                this.draging(String(this.fletters[(this.x - this.getEbI("board").offsetLeft) / 100] + this.fnumbers[(this.y - this.getEbI("board").offsetTop) / 100])); //macht Objekt draggfähig
                this.x += 100;
            }
        }
    }
    whenResize() { // beim Verändern der Fensterskalierung müssen die Figuren neu gezeichnet werden
        this.figs = this.createFigNotation(); //damit dann beim Aufruf von drawFigs die Spielfiguren an gleicher Stelle bleiben.
        for (this.letter = 0; this.letter < 8; this.letter++) {
            for (this.number = 7; this.number >= 0; this.number--) {
                try { //da nicht alle Felder besetzt sind und somit undefined Felder vorhanden sind, welche Fehlermerldungen verursachen
                    this.delFigure = this.getEbI(this.fletters[this.letter] + this.fnumbers[this.number])
                    this.delFigure.parentNode.removeChild(this.delFigure);
                } catch (e) { }
            }
        }
        this.drawFigs();
    }
    draging(dfig) { // Funktion für die dragging-Funktion von Spielfiguren
        this.dfig = dfig; this.inDrag = false;
        this.figN = this.createFigNotation;
        this.dragStartX; this.dragStartY; this.objInitLeft; this.objInitTop;
        this.dragTarget = this.getEbI(this.dfig);
        this.dragTarget.addEventListener("mousedown", function (e) {
            this.inDrag = true;
            this.objInitLeft = e.srcElement.offsetLeft; this.objInitTop = e.srcElement.offsetTop; //e.srcElement ist das derzeit ausgewählte Objekt(Figur)
            this.dragStartX = e.pageX; this.dragStartY = e.pageY;
            e.srcElement.style.zIndex = 100;//damit man sie problemlos über die anderen Figuren ziehen kann.
        });
        this.dragTarget.addEventListener("mousemove", function (e) {
            if (!this.inDrag) { return; }
            if ((this.objInitLeft + e.pageX - this.dragStartX) > -10) { //darf nicht zu weit nach links außen, da sonst die Richtige Einrückung fehler verursacht.
                e.srcElement.style.left = (this.objInitLeft + e.pageX - this.dragStartX) + "px";
            }
            e.srcElement.style.top = (this.objInitTop + e.pageY - this.dragStartY) + "px";
        });

        this.dragTarget.addEventListener("mouseup", function (e) {
            this.inDrag = false; var board = document.getElementById("board");
            e.srcElement.style.zIndex = 10; //damit wieder die andere Figuren über sie kommen
            console.log(this.objInitLeft, this.objInitTop, e.srcElement);
            //das Flolgende ist für die richtige Einrückung:
            if ((parseInt(e.srcElement.style.left[1])) < 5 && (e.srcElement.style.left).length >= 5) { //wenn Zehner d. Zahl kleiner 5 -> abrunden && Länge "000px" entspricht
                e.srcElement.style.left = String(parseInt(e.srcElement.style.left[0] + "02") + board.offsetLeft) + "px"; //+"02", wegen der Border vom div "board"
            } else if (((parseInt(e.srcElement.style.left[0])) < 5 && (e.srcElement.style.left).length == 4) || (parseInt(e.srcElement.style.left.slice(0, -2)) < 10)) {
                e.srcElement.style.left = String(2 + board.offsetLeft) + "px";
            }
            if ((parseInt(e.srcElement.style.top[1])) < 5) { //keine Längen abfrage nötig, da alle Figuren mindestens 100px nach oben entfernt sind
                e.srcElement.style.top = String(parseInt(e.srcElement.style.top[0] + "02") - 100 + board.offsetTop) + "px"; //-100 da abgerundet wird
            }
            if ((parseInt(e.srcElement.style.left[1])) >= 5 && (e.srcElement.style.left).length >= 5) { //wenn Zehner d. Zahl größer 5 -> aufunden && Länge "000px" entspricht
                e.srcElement.style.left = String(parseInt(e.srcElement.style.left[0] + "02") + 100 + board.offsetLeft) + "px";
            } else if ((parseInt(e.srcElement.style.left[0])) >= 5 && (e.srcElement.style.left).length == 4) {
                e.srcElement.style.left = String(102 + board.offsetLeft) + "px";
            }
            if ((parseInt(e.srcElement.style.top[1])) >= 5) {
                e.srcElement.style.top = String(parseInt(e.srcElement.style.top[0] + "02") + board.offsetTop) + "px";
            }
            //das Folgende ist, damit es als richtiger Zug gewertet wird:
            this.fieldCoorX = "abcdefgh"[((parseInt(e.srcElement.style.left.slice(0, -2)) - board.offsetLeft - 2) / 100)] //-2, da die Border vom div "board" beachtet werden muss
            this.fieldCoorY = "87654321"[((parseInt(e.srcElement.style.top.slice(0, -2)) - board.offsetTop - 2) / 100)]
            this.moveVar = e.srcElement.src.slice(-5, -4) + e.srcElement.id + this.fieldCoorX + this.fieldCoorY;
            if (document.getElementById(this.fieldCoorX + this.fieldCoorY) != undefined) { this.secField = document.getElementById(this.fieldCoorX + this.fieldCoorY) }
            else { this.secField = "0" } // "0" == None
            serverMoveHandler(this.moveVar, this.secField);
        })
    }
    createFigNotation() { // generiert einen String nach der Forsyth-Edwards-Notation der die aktuelle Spielaufstellung beinhaltet
        this.counter = 0;
        this.zeroCount = 0;
        this.figString = "";
        for (this.fyIDX = 0; this.fyIDX < this.fnumbers.length; this.fyIDX++) {
            this.fy = this.fnumbers[this.fyIDX];
            for (this.fxIDX = 0; this.fxIDX < this.fletters.length; this.fxIDX++, this.counter++) {
                if (this.counter == 8) {
                    if (this.zeroCount > 0) { this.figString += String(this.zeroCount); this.zeroCount = 0 };
                    this.figString += "/"; this.counter = 0;
                }
                this.fx = this.fletters[this.fxIDX];
                this.selElement = this.getEbI(this.fx + this.fy);
                if (this.selElement != undefined) {
                    if (this.zeroCount > 0) { this.figString += String(this.zeroCount); this.zeroCount = 0 }
                    this.figString += this.selElement.src.slice(-5, -4);
                } else { this.zeroCount += 1 }
            }
        }
        console.log(this.figString);
        return this.figString;
    }
}
function serverMoveHandler(content, secField) { // Funktion für die Verbindung zum Server für die Zugüberprüfung | secField = "0" h.d. secField = "None" ist
    globalVar[0] = content;
    if (secField != "0") { secField = secField.src.slice(-5, -4) }
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (e) {
        var board = document.getElementById("board");
        if (e["srcElement"]["readyState"] == 4 && e["srcElement"]["status"] == 200) { //wenn die Daten-Übertragung erfolgreich war
            var response = e["srcElement"]["response"];
            console.log("Zug ist " + response["value"]);
            if (response["value"] == true) { //wenn es ein ganz normaler Zug ist, der als Korrekt bezeichnet wurde
                if (secField != "0") { var delElement = document.getElementById(globalVar[0].slice(3, 5)); delElement.parentNode.removeChild(delElement); }
                var img = document.getElementById(globalVar[0].slice(1, 3));
                img.style.left = String((("abcdefgh".indexOf(globalVar[0].slice(3, 5)[0])) * 100 + board.offsetLeft) + 2) + "px"; //+2, Border vom div board muss beachtet werden
                img.style.top = String((800) - ((Number(globalVar[0].slice(3, 5)[1]) - 1) * 100 - (board.offsetTop - 100)) + 2) + "px";
                img.id = globalVar[0].slice(3, 5);
            }
            else if (String(response["value"]).startsWith("swap")) { //bedeudet rochade
                var fstElement = document.getElementById(globalVar[0].slice(1, 3));
                    secElement = document.getElementById(globalVar[0].slice(3, 5));
                fstElDatas = [ game.fieldToCoors(globalVar[0].slice(1, 3)), fstElement.id ]; //speichern der Koordinaten und ID vom erstem Feld
                console.log(fstElDatas[0][0], secElement.style.left, fstElement.style.left);
                console.log(String(response["value"]));
                switch (String(response["value"]).slice(4)) {
                    case "-300": //wenn rochade nach rechts
                        fstElement.style.left = String(parseInt(secElement.style.left.slice(0,-2))-100)+"px";
                        secElement.style.left = String(fstElDatas[0][0]+100)+"px";
                        break;
                    case "400": //wenn rochade nach links
                        fstElement.style.left = String(parseInt(secElement.style.left.slice(0,-2))+200)+"px";
                        secElement.style.left = String(fstElDatas[0][0]-100)+"px";
                        break;
                }
                fstElement.id = secElement.id
                secElement.id = fstElDatas[1]

            }
            else { //wenn der Zug als inkorrekt (False) bezeichnet wurde
                var img = document.getElementById(globalVar[0].slice(1, 3));
                img.style.left = String((("abcdefgh".indexOf(globalVar[0].slice(1, 3)[0])) * 100 + board.offsetLeft) + 2) + "px"; //+2, Border vom div board muss beachtet werden
                img.style.top = String((800) - ((Number(globalVar[0].slice(1, 3)[1]) - 1) * 100 - (board.offsetTop - 100)) + 2) + "px";
                window.alert("Invalid Move");
            }
        } else if(e["srcElement"]["readyState"] == 4 && e["srcElement"]["status"] == 204){ //wenn ein Fehler zurückgegbene wurde (bspw. durch zug außerhalb des Feldes)
            var img = document.getElementById(globalVar[0].slice(1, 3));
            img.style.left = String((("abcdefgh".indexOf(globalVar[0].slice(1, 3)[0])) * 100 + board.offsetLeft) + 2) + "px"; //+2, Border vom div board muss beachtet werden
            img.style.top = String((800) - ((Number(globalVar[0].slice(1, 3)[1]) - 1) * 100 - (board.offsetTop - 100)) + 2) + "px";
            console.log("Zug konnte nicht verarbeitet werden");
        }
    }
    xhr.responseType = 'json';
    xhr.open("POST", "http://localhost:8000/app_01");
    xhr.setRequestHeader("content-type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({ "move": globalVar[0], "secField": secField, "figNotation": game.createFigNotation() }));
}
var game = new Chessgame()
    globalVar = [0, 0];

function doAll() {
    document.getElementsByTagName("body")[0].style.display = "block";
    document.getElementsByTagName("body")[0].style.animation = "fadeIn 1s linear";

    game.drawBoard()
    var name = "";

    window.addEventListener('resize', function () { //resize-function, damit die Figuren bei einem Zoom passend verkleinert/-größert werden.
        game.whenResize()
    }, false);
    window.addEventListener('mousemove', function (e) {   //für die Anzeige der Maus-Koordinaten oben rechts im Fenster zuständig.
        var paragraph = document.getElementById("p");
        paragraph.textContent = "X: " + e.pageX + " Y:" + e.pageY;
    }, false);
    document.getElementById("input_move").addEventListener('keydown', function (e) { game.readMove(e) }, false); //keydown-Funktion dem Zuginput zuweisen
    document.getElementById("chat_input").addEventListener('keydown', function (e) {  //keydown-Funktion der Eingabebox des Chats zuweisen.
        if (name == "") { //wenn noch kein Name eingegeben wurde
            e.target.value = ""; //Eingabe leeren
            if (document.getElementById("chat_input").readOnly != true) {
                window.alert("Um eine Nachricht einzugeben, müssen Sie erst bei \
                den Statics ihren Namen eingeben =)")
            }
            document.getElementById("chat_input").readOnly = true;
            document.getElementById("NameInput").focus(); //keine weiter Eingabe ermöglichen + NameInput fokosieren
        }
        if (e.key == 'Enter') { //wenn ein Name eingeben wurde.
            var newParagraph = document.createElement("p");
            newParagraph.textContent = (name + e.target.value);
            newParagraph.style.margin = "0px";
            document.getElementById("chat").appendChild(newParagraph);
            e.target.value = "";
        }
    }, false);
    document.getElementById("NameInput").addEventListener("keydown", function (e) {   //Inputbox bei den Statics, wo der Name eigetragen werden kann.
        if (e.key == "Enter") {
            if (e.target.value.length > 20 || e.target.value.length < 1) { return }; //wenn die Länge nicht stimmt → return
            name = e.target.value + ": ";
            document.getElementById("chat_input").placeholder = "Bitte Geben Sie hier ihre Nachricht ein.";
            document.getElementById("chatbox").style.borderColor = "darkgreen";
            document.getElementById("NameInput").readOnly = true; //nach der Eingabe kann der Name jetzt nicht mehr geändert werden.
            document.getElementById("chat_input").readOnly = false; //Chateingabe ist jetzt wieder möglich
            document.title += ": " + e.target.value + " gg. GNU-Chess" //Im Title ist nun zu sehen, wer gegeneinander spielt
        }
    }, false)
}
