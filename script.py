#!/usr/bin/env python3
# encoding: utf-8

from wsgiref.handlers import CGIHandler
from wsgiref.simple_server import make_server
from wsgiref import util

import mimetypes
import json, os

rochade = {"K": False, "k": False} # 1 wert = weiß; 2 wert = schwarz
schach = {"K": False, "k": False} # 1 wert = ob weiß bereits im schach stand; 2 wert = ob schwarz bereits im Schach war

class Chess():
    def __init__(self, inputString, secField, figNotation): #inputString könnte z.B so aus sehen: "Pa2a4" -> weißer Pawn/Bauer von a2 nach a4; secField ist entweder 0 wenn leeres Feld oder eine Bestimmte Figur(P,q,…)
        try:
            (self.fletters, self.fnumbers) = ("abcdefgh", "87654321")
            self.figN = figNotation #hier ist der String mit der Angabe der Figuren
            self.figure = inputString[0] #speichert die Figur (P, R,…)
            self.f1 = inputString[1:3] #gibt die erste Feldkoordinate an (z.B.: a2) -> wichtig für den Zug des Bauers, da entweder 2 oder 1 vor
            self.coor01 = [self.fletters.index(inputString[1])*100,    #gibt die x-coor01 an
                            self.fnumbers.index(inputString[2])*100]    #gibt die y-coor01 an
            self.coor02 = [self.fletters.index(inputString[3])*100,    #gibt die x-self.coor02 an
            self.fnumbers.index(inputString[4])*100]    #gibt die y-self.coor02 an
            self.secField = secField
            self.sFf = secField #backup der Figur, nötig für rochade
            if (self.secField != "0"): #bestimmen des Gegners; 0 = none
                if self.secField.lower() == self.secField: self.secField = "rnbqkp" #gegner = black
                else: self.secField = "RNBQKP"  #gegner = white
        except: raise SystemError


    def isPossible(self): #Zugüberprüfung
        if (self.figure == 'p' or self.figure == 'P'): #pawn
            if (self.coor02[1] == self.coor01[1]-100 and self.figure == "P") or \
            (self.coor02[1] == self.coor01[1]+100 and self.figure == "p"): #wenn die Bewegung nach vorn stimmt (y-Coor)
                if self.coor01[0] == self.coor02[0] and self.secField == "0":  #keine Abweichung nach rechts/links ist und die 2.Coor leer ist
                    return True
                elif (self.coor01[0]-100 == self.coor02[0] or self.coor01[0]+100 == self.coor02[0]) and (not(self.figure in self.secField) and self.secField != "0"): #wenn schräg geschlagen wird
                    return True
            elif (self.figure == 'p' and self.f1[1] == '7' and self.coor01[1]+200 == self.coor02[1]) or \
            (self.figure == 'P' and self.f1[1] == '2' and self.coor01[1]-200 == self.coor02[1]): #wenn es ein Bauer ist, der noch nicht bewegt wurde, kann er 2 vor
                if self.secField == "0" and self.coor01[0] == self.coor02[0]: return True
            return False

        if self.figure == 'r' or self.figure == 'R': #rok
            if (self.coor01[0] == self.coor02[0] and self.coor01[1] != self.coor02[1]) or \
            (self.coor01[1] == self.coor02[1] and self.coor01[0] != self.coor02[0]): # wenn der Turm auf der x-Achse/Y-Achse verschoben wurde
                if not(self.isBetween()) and not(self.figure in self.secField): return True #wenn keine Figuren dazwischen sind und auf dem 2nd Feld keine eigene Figr steht
            return False

        if self.figure == 'n' or self.figure == 'N': #horse
            if (self.coor02[1] == self.coor01[1]+200 and self.coor01[0]+100 == self.coor02[0]) or \
            (self.coor02[1] == self.coor01[1]+200 and self.coor01[0]-100 == self.coor02[0]): #  wenn 2 nach vorn und 1 nach rechts/links (schwarz)
                if not(self.figure in self.secField):
                    return True
            elif (self.coor02[1] == self.coor01[1]+100 and self.coor01[0]+200 == self.coor02[0]) or \
            (self.coor02[1] == self.coor01[1]+100 and self.coor01[0]-200 == self.coor02[0]): #wenn 1 nach vorn und 2 nach rechts/links (schwarz)
                if not(self.figure in self.secField): return True
            elif (self.coor02[1] == self.coor01[1]-200 and self.coor01[0]+100 == self.coor02[0]) or \
            (self.coor02[1] == self.coor01[1]-200 and self.coor01[0]-100 == self.coor02[0]): #wenn 2 nach vorn und 1 nach rechts/links (weiß)
                if not(self.figure in self.secField): return True
            elif (self.coor02[1] == self.coor01[1]-100 and self.coor01[0]+200 == self.coor02[0]) or \
            (self.coor02[1] == self.coor01[1]-100 and self.coor01[0]-200 == self.coor02[0]): #wenn 1 nach vorn und 2 nach rechts/links (weiß)
                if not(self.figure in self.secField): return True
            return False

        if self.figure == 'b' or self.figure == 'B': #bishop
            if abs(self.coor01[0] - self.coor02[0]) == abs(self.coor01[1] - self.coor02[1]): #abs gibt die absolute Zahl zurück, also: abs(1-3) == 2
                if not(self.isBetween()) and not(self.figure in self.secField): return True
            return False

        if self.figure == 'q' or self.figure == 'Q': #queen
            if abs(self.coor01[0] - self.coor02[0]) == abs(self.coor01[1] - self.coor02[1]): #gleich wie Läufer
                if not(self.isBetween()) and not(self.figure in self.secField): return True
            elif (self.coor01[0] == self.coor02[0] and self.coor01[1] != self.coor02[1]) or \
            (self.coor01[1] == self.coor02[1] and self.coor01[0] != self.coor02[0]): # gleich wie Turm
                if not(self.isBetween()) and not(self.figure in self.secField): return True
            return False

        if self.figure == 'k' or self.figure == 'K': #king
            #Standartmoves
            if abs(self.coor01[0] - self.coor02[0]) == abs(self.coor01[1] - self.coor02[1]) and abs(self.coor01[0] - self.coor02[0]) == 100: # wie Läufer, nur das es bloß ein Schritt sein darf
                if not(self.figure in self.secField):
                    return True
            elif (self.coor01[0] == self.coor02[0] and abs(self.coor01[1] - self.coor02[1]) == 100) or \
            (self.coor01[1] == self.coor02[1] and abs(self.coor01[0] - self.coor02[0]) == 100): #wenn er 1 Schritt nach vorn/hinten/rechts/links bewegt wird
                if not(self.figure in self.secField):
                    return True
            #Rochade
            elif self.coor01[1] == self.coor02[1] and  self.coor01[0] - self.coor02[0] in (400, -300): #wenn keine Y-Verschiebung aber X-Verschiebung um 300 bzw 400px
                if not(rochade[self.figure]) and not(schach[self.figure]): #wenn der könig noch keine rochade gemacht hat oder im schach war
                    if not(self.isBetween()) and self.sFf == self.secField[0] and self.figure in self.secField: #nichts dazwischen - figur des 2. Feldes = Turm - Turm hat selbe Farbe wie König
                        rochade[self.figure] = True
                        return "swap%s" % (self.coor01[0] - self.coor02[0]) #heißt soviel wie tausch + die richtung
            return False

    def isBetween(self): #schaut, ob zwischen dem zugpfad der Figur noch andere stehen
        self.figN_l, tmp = [], [""]
        for v in self.figN:
            if v == "/":
                self.figN_l.append(tmp[0])
                tmp = [""]
            elif (v in "12345678"): tmp[0] += "0"*int(v)
            else: tmp[0] += v
        self.figN_l.append(tmp[0]) #sonst würde es die letzte reihe nicht mehr anhängen, da dort ja kein »/« kommt

        if self.coor01[1] == self.coor02[1]: #wenn nur verschiebung auf der x-Achse
            rowN = (self.coor01[1])//100 #gibt die nummer der Reihe an
            for f in self.figN_l[rowN][min(self.coor01[0]//100+1, self.coor02[0]//100+1):max(self.coor02[0]//100, self.coor01[0]//100)]: #min und max, falls nach links geschoben wird
                if f != "0": return True #wenn eine Figur dazwischen steht gib True zurück
            return False #sollte alles frei sein: return False
        if self.coor01[0] == self.coor02[0]: #wenn nur verschiebung auf der y-Achse
            columnN = (self.coor01[0])//100 #gibt die nummer der Spalte an
            for f in self.figN_l[min(self.coor01[1]//100+1, self.coor02[1]//100+1):max(self.coor02[1]//100, self.coor01[1]//100)]:
                if f[columnN] != "0": return True #wenn eine Figur dazwischen steht gib True zurück
            return False #sollte alles frei sein: return False
        if abs(self.coor01[0] - self.coor02[0]) == abs(self.coor01[1] - self.coor02[1]): #wenn diagonale Verschiebung
            iterateCount = abs(self.coor01[0] - self.coor02[0])//100-1
            if self.coor01[1] < self.coor02[1]: #wenn nach unten gezogen wird
                if self.coor01[0] < self.coor02[0]: #wenn nach (unten) rechts gezogen wird
                    for f in range(1,iterateCount+1):
                        if self.figN_l[self.coor01[1]//100+f][self.coor01[0]//100+f] != "0": return True
                elif self.coor01[0] > self.coor02[0]: #wenn nach (unten) links gezogen wird
                    for f in range (1, iterateCount+1):
                        if self.figN_l[self.coor01[1]//100+f][self.coor01[0]//100-f] != "0": return True
            elif self.coor01[1] > self.coor02[1]: #wenn nach oben gezogen wird
                if self.coor01[0] < self.coor02[0]: #wenn nach (oben) rechts gezogen wird
                    for f in range(1,iterateCount+1):
                        if self.figN_l[self.coor01[1]//100-f][self.coor01[0]//100+f] != "0": return True
                elif self.coor01[0] > self.coor02[0]: #wenn nach (oben) links gezogen wird
                    for f in range(1,iterateCount+1):
                        if self.figN_l[self.coor01[1]//100-f][self.coor01[0]//100-f] != "0": return True
            return False # wenn alles frei ist

# application
def application(environ, start_response):
    global rochade, schach
    if environ.get("REQUEST_METHOD") == 'GET':
        path = environ['PWD']
        fn = os.path.join(path, environ['PATH_INFO'][1:])
        if '.' not in fn.split(os.path.sep)[-1]:
            fn = os.path.join(fn, 'index.html')
        type = mimetypes.guess_type(fn)[0]
        if os.path.exists(fn):
            start_response('200 OK', [('Content-Type', type)])
            #falls seite bloß neugeladen wird -> Rochade/Schach zurücksetzten:
            rochade = {"K": False, "k": False}
            schach = {"K": False, "k": False}
            return util.FileWrapper(open(fn, "rb"))
        else:
            start_response('404 Not Found', [('Content-Type', 'text/plain')])
            return [b'not found']
    elif environ.get("REQUEST_METHOD") == 'POST':
        if environ['PATH_INFO'][1:] == 'app_01':
            wsgi_input = environ.get("wsgi.input")
            request_size = int(environ.get("CONTENT_LENGTH", "0"))

            line = wsgi_input.read( request_size )
            jsonString = json.loads( line )
            zug = jsonString['move']
            secField = jsonString['secField']
            figNotation = jsonString['figNotation']
            try:
                game = Chess(zug, secField, figNotation)
            except SystemError: #if something went wrong in the initialation
                start_response('500 Internal Server Error',[ ])
                return []

            # prepare the response data
            result = {}
            result['success'] = True
            result['message'] = 'value is readable!'
            result['value'] = game.isPossible()
            if result['value'] == True: #wenn der Zug korrekt war
                fo = open( '.backup.txt', "w+" ) #den SPielstand (vor dem Zug) speichern, damit man im Notfall den letzten Spielstand wiederherstellen kann
                fo.write(figNotation)
                fo.close()
            response = json.dumps(result,indent=1)
            del game

            start_response('200 OK',[('Content-type','application/json'),("Content-Length", str(len(response))) ])
            return [str.encode( response )]
        else:
            start_response('204 No Content',[ ])
            return []

# server part:
with make_server('', 8000, application) as httpd:
    print("Serving on port 8000...")
    fo = open("backup.txt", "w+")
    fo.close()

    # Serve until process is killed
    httpd.serve_forever()
