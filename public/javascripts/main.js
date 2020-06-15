//
//CLIENT CODE -- 
//

// Icon Styles
let iconStyle = L.Icon.extend({
    options: {
        iconSize: [45, 20],
        iconAnchor: [20, 20],
        popupAnchor: [-3, -20]
    }
});



//Farben fuer Marker auf Karte
let meineFARBEN = {
    kitas: [255, 0, 0],
    laden: [17, 0, 148],
    schulen: [255, 215, 0],
    gastro: [0, 100, 0],
    spielplatz: [255, 0, 200],
    sport: [255, 132, 0],
    parkplatz: [121, 121, 133], 
    bars: [0, 244, 0],
    favs: [255, 255, 0],
    feedback: [0, 4, 255]
}

//Für Schattenfunktion
let osmb;


//soll bereits eingetragenen pos/neg ids speichern
let feedbackCollector = [];


//Button-Funktionaltäten ----------------------------------
//Funktion für Vogelperspektive
//Settings-Funktion
function Settings(tilt, zoom, cond, rot) {
    let aktuellPOSI = osmb.getPosition();
    osmb.setPosition(aktuellPOSI);
    osmb.setTilt(tilt);
    osmb.setZoom(zoom);
    osmb.setDisabled(cond);
    osmb.setRotation(rot);
}

function birdUP() {
    // let aktuellPOSI = osmb.getPosition();
    // osmb.setPosition(aktuellPOSI);
    Settings(0, 16, false, 46.9728601252617);
}

//Stellt per Buttonclick auf Vogelperspektive
const birdPerspektive = document.querySelector(".bird");
birdPerspektive.addEventListener("click", birdUP);


//Funkt. für Startansicht
//noch Set Disabled auf false?
function startPosition() {
    Settings(45, 17.2, false, -15.031315240082794);
}

//Stellt per Buttonclick auf Seitenview
const seitenPerspektive = document.querySelector(".sideview");
seitenPerspektive.addEventListener("click", startPosition);

//Für Zoom-butons
const zoomIN = document.querySelector(".zoom-in");
zoomIN.addEventListener("click", function () {
    let zoomStufe = osmb.getZoom();
    let meinZoom = zoomStufe + 0.75;
    osmb.setZoom(meinZoom);
});


const zoomOUT = document.querySelector(".zoom-out");
zoomOUT.addEventListener("click", function () {
    let zoomStufe = osmb.getZoom();
    let meinZoom = zoomStufe - 0.75;
    osmb.setZoom(meinZoom);
})

function disableElement (x, input) {
    document.querySelector(x).disabled = input;
};


//für Haus-ID in Auswahl
const selected_HOUSE = [];
//Hauptfunktion für Laden geojson / karte
async function geoJSONDAZU() {

    osmb = new OSMBuildings({
        container: 'map',
        zoom: 17.2,
        minZoom: 16,
        position: {
            latitude: 48.00577917553929,
            longitude: 7.796016226556075
        },
        tilt: 45,
        rotation: -15.031315240082794,
        effects: ['shadows'],
        showBackfaces: false,
        disabled: false,
        attribution: '© 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>'
    });


    osmb.addMapTiles(
        'https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=6aRyUJLkA6sK2ccxVEly', {
            attribution: '© Data <a href="http://openstreetmap.org/copyright/">OpenStreetMap</a> · © Map <a href="http://mapbox.com">Mapbox</a>'
        }
    );


    // Datum 3.05.2020 8:30 Ausgangszeit für Schatten
    osmb.setDate(new Date(2020, 5, 3, 8, 30));
    //addBuildingsGEOJSON fügt GEOJSON hinzu und Array "meineorte" für Marker 
    addBuildingsGEOJSON();
    // marker sammlungen in array packt, direkt angeschlossen werden kann
    console.log(osmb);

    //wählt div Element für Info-Einblendung
    const meineInfo = document.querySelector(".meineInfo")
    //
    //HIGHLIGHT Funktion bei Click, Inhalt Infobox
    //Highlight und Marker dazu
    //RiesenFunktion beginnt -->mit infobox, radiobox ,senden von Präferenzen
    //
    osmb.on("pointerup", e => {
        let marker = "";

        if (!e.features) {
            osmb.highlight(feature => {});
            if (osmb.markers) {
                osmb.markers.destroy();
            };

            //versteckt Infobox, wenn keine Elemente in Auswahl 
            if (!e.features) {
                // console.log(meineInfo);
                meineInfo.style.visibility = "hidden";
                // Löschen von vorhanden User-Kommentaren, die unter Inputbox angezeigt werden

            };

            return;
        }

        let featureIdList = "";
        featureIdList = e.features.map(feature => feature.id);
        // console.log(featureIdList);
        osmb.highlight(feature => {
            if (featureIdList.indexOf(feature.id) > -1 && feature.id != undefined) {
                //soll marker über click-Event anzeigen
                console.log(feature.id);
                //Fall schon haus-id schon zwischengespeichert in array
                //mit splice von anfang bis ende löschen
                if (selected_HOUSE.length > 0) {

                    selected_HOUSE.splice(0, selected_HOUSE.length)
                }

                selected_HOUSE.push(feature.id)
                //ID u feature Zwischenspeichern für post req unten
                myID ="";
                myID =feature.id
                myFeature="";
                myFeature=feature;

                //Funktion checkt, ob in erhaltener JSON Antwort Kommentar für Haus-id vorhanden ist
                //wenn ja -> anzeigen in div
                commentChecker()

                //entfernt vorherige marker
                if (osmb.markers) {
                    osmb.markers.destroy();
                };

                //positioniert marker, lat lon Location
                marker = osmb.addMarker({
                    latitude: feature.properties.bounds.min[1],
                    longitude: feature.properties.bounds.min[0],
                    altitude: 75
                }, {
                    url: "marker.svg",
                    color: "#fbff00"
                });


                //Meineinfo=> namen von infobox gesamt
                
                meineInfo.style.visibility = "visible";
                document.querySelector(".typus").textContent = `Art: ${feature.properties.Typ}`;
                document.querySelector(".zusatz").textContent = feature.properties.Zusatz;


                if (!feedbackCollector.includes(feature.id)) {
                    //Eintragwahrnung leer, weil noch kein Eintrag
                    document.querySelector(".keineDopplung").textContent = "";
                    //wenn ID noch nicht im Feedback collecor -> disablen
                    for (let i = 0; i < document.querySelector('.meinForm').test.length; i++) {
                        //Radio-Button enablen
                        document.querySelector('.meinForm').test[i].disabled = false;
                    };
                    document.querySelector('.meinForm').dropdown.disabled = false;

                    disableElement('.InputField', false);
                    disableElement('.buttonEins', false);
                };

                //filter -> wenn id im prüfarray gefunden 
                // --> d.h. button für Feedback deaktiviert
                if (feedbackCollector.includes(feature.id)) {
                    let eintragcheck = document.querySelector(".keineDopplung")
                    eintragcheck.textContent = "Für diesen Standort wurde bereits ein Eintrag vorgenommen";

                    //wenn id im feedbackcollecor disablen von Form
                    for (let i = 0; i < document.querySelector('.meinForm').test.length; i++) {
                        //Radiobutton disablen
                        document.querySelector('.meinForm').test[i].disabled = true;
                    };
                    document.querySelector('.meinForm').dropdown.disabled = true;
                    disableElement('.InputField', false);
                    disableElement('.buttonEins', false);
                }

                return "#fdff00";
            }
            //Soll ID vom gelickten Haus ausgeben
            
        });
    });
};

//Für nächste FUnktion
let myID, myFeature;

let buttonEins = document.querySelector(".buttonEins");
let meinForm = document.querySelector(".meinForm");
let inputField = document.querySelector(".InputField");


//Erst auf Button click ausgelöst
//Funktion für Absenden von ausgefülltem Form
//Sendet Post-Request
//Funktion "feedbackButtons"-> checkt zustände der Form-Felder
buttonEins.addEventListener("click", function () {
                    //soll ausgeführt werden, wenn id noch NICHT gespeichert
                    if (!feedbackCollector.includes(myID)) {

                        //funtion feedbackButtons -> speichert lat, lon von Haus, ID, und Geclickten Radiobutton (von radioCheck bestimmt)
                        //radioCheck  FUnktion checkt, welcher Radio-b gewählt (ist meinForm= Form mit Buttons)
                        //Funktion feedbachB noch ändern -> textinput speichern
                        //also hier auf client seite und auf server seite 
                        //ÄNDERUNG in Funktion für textinput
                        feedbackButtons(
                            myFeature,
                            radioCheck(meinForm),
                            inputField.value,
                            formCheck());

                        //id in Array pushen
                        feedbackCollector.push(myID);

                        console.log(feedbackCollector.includes(myID));
                        console.log(feedbackCollector);

                    }
            console.log("Das ist myID");
            console.log(myID);
});



//enabled Feedbackmöglichkeiten, wenn id noch nicht gespeichert wurde
function FeedbackDone() {
    if (!feedbackCollector.includes(feature.id)) {
        for (let i = 0; i < meinForm.test.length; i++) {
            meinForm.test[i].disabled = "false";
        };
        meinForm.dropdown.disabled = "false";
        meinForm.suggestion_text.disabled = "false";
    }
}


// ---- 
//------wichtig ------
//Fügt Geojson aller LAyer hinzu funktion
window.onload = function () {
    geoJSONDAZU();

}



/// FUnktion für Feedback absendung an Server
//Checkt Form Einträge

async function feedbackButtons(x, z, q, g) {

    //hier soll  LAT / LON Kootdninate von aktivem
    // haus nach click auf button abgesendet werden
    //speichert aktuellen hausstandort, könnte noch ID mitnehmen!!
    //Objekt, das weitergereicht wird
    const data = {
        'latitude': x.properties.bounds.min[1],
        'longitude': x.properties.bounds.min[0],
        'haus_ID': x.id,
        'radiobutton': z,
        'freitext': q,
        'dropdown': g
    };
    //Methode der Sendung an Server
    const options = {
        method: "POST",
        //gibt zu sendenden content-typ an
        headers: {
            "Content-Type": "application/json"
        },
        //Objekt wird genommen und in json-string umgeformt
        body: JSON.stringify(data)
    };

    //daten werden mit optionen gesendet
    // auf serverantwort mit await gewartet
    //antwort als json geparsed und geloggt
    const response = await fetch("/add", options);
    const json = await response.json();

};


//Funktion prüft, welche Radiobutton in Form ausgewählt wurden
//returned ensp. value
//x =meinForm
function radioCheck(x) {
    for (let i = 0; i < x.test.length; i++) {
        if (x.test[i].checked) {

            feedbackZustand = x.test[i].value
        }
    }
    return feedbackZustand;
};

//Checkt Auswahl im Dropdownmenu
function formCheck() {
    let kurz = document.querySelector('.dropdown')
    let dropZustand = kurz.options[kurz.selectedIndex].value;
    return dropZustand;
};

//einfach id bei features id von alles 3d VOR properties
//Fügt geojson von Gebäuden hinzu, fügt Marker für gefilterte Standorte hinzu
async function addBuildingsGEOJSON() {
    let alles3d;
    const response3d = await fetch("../json/buildings_geojson_stand_25_05.geojson");
    alles3d = await response3d.json();
    console.log(alles3d.features.length);
    for (let i = 0; i <= alles3d.features.length - 1; i++) {
        if (alles3d.features[i].properties.id != undefined) {
            alles3d.features[i].id = alles3d.features[i].properties.id.toString();

        }
        //Gebäude Höhe --> levels gibt fenster look
        if (alles3d.features[i].properties.name == "IV") {
            alles3d.features[i].properties.levels =4;

        } else if (alles3d.features[i].properties.name == "III") {
            alles3d.features[i].properties.levels =3;

        } else if (alles3d.features[i].properties.name == "II") {
            alles3d.features[i].properties.levels =2;

        } else if (alles3d.features[i].properties.height == 12) {
            alles3d.features[i].properties.levels =1;
        }

        //Fassaden und Dach-Styling
        let dachfarbe = dachFARBEN();
        // let dachfarbe = "#efa345";
        let fassFarbe = fassadenFARBE();
        alles3d.features[i].properties.roofColor = dachfarbe;
        alles3d.features[i].properties.material = fassFarbe;

        //Hinzufügen von Farben für Flächen in Geojson-File
        if(alles3d.features[i].properties.Typ =="wiese"){
            alles3d.features[i].properties.roofColor ="#c1d898";        }
        if(alles3d.features[i].properties.Typ =="spielplatz"){
            alles3d.features[i].properties.roofColor ="#f6d7b0";
        }
        if(alles3d.features[i].properties.Typ =="strasse"){
            alles3d.features[i].properties.roofColor ="#575757";
        }
        if(alles3d.features[i].properties.Typ =="bruecke"){
            alles3d.features[i].properties.roofColor ="#5C3317";
            alles3d.features[i].properties.height =2;
            alles3d.features[i].properties.levels ="";
        }
        if(alles3d.features[i].properties.Typ =="fluss"){
            alles3d.features[i].properties.roofColor ="#007d9a";
        }
        if(alles3d.features[i].properties.Typ =="markt"){
            alles3d.features[i].properties.roofColor ="#ed6a5a";
            alles3d.features[i].properties.height = 2;
        }
 
        //Ende Loop
    };


    //
    //check  Standorte
    //
    //Sammelarrays für Orte
    //klappt
    // let kitaSTANDORTE = [];
    let meinKEY = Object.keys(alles3d.features);

    let kitaSTANDORTE = [], laeden = [], schulen = [], gastro = [], 
    spielplatz = [], sport = [], parkplatz = [];

    //Suchen nach Standorten in geojson --> speichern in Arrays
    for (let key of meinKEY) {
        if (alles3d.features[key].properties.Zusatz == "KITA" || alles3d.features[key].properties.Typ == "bildung") {
            kitaSTANDORTE.push(alles3d.features[key].id);
        } else if (alles3d.features[key].properties.Typ == "laden") {
            laeden.push(alles3d.features[key].id);
        } else if (alles3d.features[key].properties.Typ == "Schule") {
            schulen.push(alles3d.features[key].id);
        } else if (alles3d.features[key].properties.Typ == "gastro") {
            gastro.push(alles3d.features[key].id);
        }
        else if (alles3d.features[key].properties.Typ == "spielplatz") {
            spielplatz.push(alles3d.features[key].id);
        }
        else if (alles3d.features[key].properties.Typ == "sport") {
            sport.push(alles3d.features[key].id);
        }
        else if (alles3d.features[key].properties.Typ == "parkplatz") {
            parkplatz.push(alles3d.features[key].id);
        }
    };

    //Hinzufügen von Gebäude-layer 
    osmb.addGeoJSON(alles3d);

    //meineOrte <- speichert Ergebnis von Filter
    meineORTE = [kitaSTANDORTE, laeden, schulen,
                 gastro, spielplatz, sport, parkplatz];

    return meineORTE;

    //FUnKTIONSENDE
};


///benennt buttons für Legende
let kitaBUTTON, ladenBUTTON, schulenBUTTON, gastroButton, spielPlButton, sportButton, parkPLButton;
const myButtons ={kitaBUTTON, ladenBUTTON, schulenBUTTON, gastroButton, spielPlButton, sportButton, parkPLButton};

//Funktion für hinzufügen von eventlistener für Legende 
const addButton = function (buttonName, classname, number, color) {
     buttonName = document.querySelector(classname);
    buttonName.addEventListener("click", function() {
        if(meineORTE.length >0) {
            markerDAZU(meineORTE[number], color, buttonName)
        }
    })
}
//Einzelnen Orte wie Kitas, Schulen usw. -> zuweisen eventlistener und Marker
addButton(myButtons.kitaBUTTON, ".kita", 0, meineFARBEN.kitas);
addButton(myButtons.ladenBUTTON, ".laden", 1, meineFARBEN.laden);
addButton(myButtons.schulenBUTTON, ".schulen", 2, meineFARBEN.schulen);
addButton(myButtons.schulenBUTTON, ".gastro", 3, meineFARBEN.gastro);
addButton(myButtons.spielPlButton, ".spielplatz", 4, meineFARBEN.spielplatz);
addButton(myButtons.sportButton, ".sport", 5, meineFARBEN.sport);
addButton(myButtons.parkPLButton, ".parkplatz", 6, meineFARBEN.parkplatz);

//Aktion um Info-Fenster zu schließen
const closeButton = document.querySelector(".close");
closeButton.addEventListener("click", function() {
        document.querySelector(".meineInfo").style.visibility = "hidden";
});


// Hinzufügen
// Funktion Markiert alle Kitas auf klick
function markerDAZU(x, y, z) {
    // nimmt gespeicherte ids für kitas und markiert alle aus array
    featureIdList = x;
    osmb.highlight(function (feature) {
        if (featureIdList.indexOf(feature.id) > -1 && feature.id != undefined) {
            //soll marker über click-Event anzeigen

            // entfernt vorherige marker wenn mehr als 100 drin
            if (osmb.markers.length > 100) {
                osmb.markers.destroy();
            };


            //positioniert marker
            for (i = 0; i <= featureIdList.length; i++) {
                marker = osmb.addMarker({
                    latitude: feature.properties.bounds.max[1],
                    longitude: feature.properties.bounds.max[0],
                    altitude: 75,

                }, {
                    id: [i]
                });
                //Pointerfarbe nach Objekt
                marker.color = y;

            };

            return "#fdff00";

        }
    });

    //wenn box nicht gecheckt -> löscht marker
    //löscht highlight auswahl?
    if (!z.checked) {
        osmb.markers.destroy();
        osmb.highlight(feature => {});

        return;
    };

};



//Für SUchrequest vorhandener Kommentare 
//Global-Scope 
let myJSONRes;
//xml Req an Server -> Anfrage für vorhandene Kommentare
function requestIT() {
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/discuss", true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhttp.send();

    //Weiterverarbeitung der Server-Antwort
    xhttp.onload = function () {
        //in "daten" ist erhaltentes Sucherg. gespeichert
        let daten = xhttp.response;
        //hier noch als reiner "string" erhalten
        //umformen in JSON
        let myJSON = JSON.parse(daten);
        console.log(typeof (myJSON));
        // console.log(myJSON);
        myJSONRes = myJSON;
        return myJSONRes;
    }

    return myJSONRes;
};


function checkVariable(x) {
    console.log(x);
    if (x != null)
        //loopt durch json-antwort und pusht ids in array
        //wieder leeren (gegen dopplungen)
        feedbackHouses = [];
    for (i = 0; i <= x.length - 1; i++) {
        feedbackHouses.push(x[i].haus_ID)
    };

    //Standorte, für die Einträge bei ID vorliegen
    //Funktion fügt marker hinzu
    console.log(feedbackHouses);
    markerDAZU(feedbackHouses, meineFARBEN.feedback, feedbackMarkers)
}



//für feedback marker dazu
let feedbackHouses = [];
const feedbackMarkers = document.querySelector(".feedbacks")
feedbackMarkers.addEventListener("click", function () {

    // erstmal nur get request mit json daten von Kommentaren
    requestIT();

    //checkt alle 500 milis, ob Serverantwort erhalten. bei ja-> funktion
    setTimeout(checkVariable(myJSONRes), 500);

});


//soll wenn von ausgewähltem Haus-ID mit solcher aus
//Feedback-JSON Einträgen übereinstimmt, vorhandene KOmmentare zurückgeben
//Wenn nicht -> "Noch nix da"
let thumb =[];
let dis =[];
function commentChecker() {
    if (myJSONRes == undefined) {
        console.log("Press Feedback button first please");
        return;
    }
    //Erst Checken, ob Feedback-Json schon geladen
    else if (myJSONRes.length > 0) {

        //Erst alten Einträge, falls vorhanden, in Infobox löschen (gegen Dopplungen)
        entf_LI_ELEM()

        let exits;
        for (i = 0; i <= myJSONRes.length - 1; i++) {
            //Abgleich von geclicktem Haus mit Kommentar-Häusern aus empfangenen JSON
            //
            let myComment = [];
            let thumbUPS = [];
            let thumbDOWNS = [];
            //Hier Probeversion drunter 
            if (myJSONRes[i].haus_ID == selected_HOUSE[0]) {

                //Leert Default Anzeige "nix da", wenn  Kommentar vorhanden (id da)
                document.querySelector(".feedback-server").textContent = "";

                console.log(myJSONRes[i].freitext)
                //Kommentar in Box anzeigen lassen 
                // document.querySelector(".feedback-server").textContent = myJSONRes[i].freitext;
                myComment[i] = document.createElement("li");
                //Textinhalt und Datum 
                console.log(myJSONRes[i].date_transformed);
                let date = "Datum "+ myJSONRes[i].date_transformed;
                
                //klappt
                // let myContent = myJSONRes[i].freitext + date;
                let myContent = myJSONRes[i].freitext
                myComment[i].textContent = myContent;
                
                //Neues Element erstellen für Datum von Kommentar
                let meinDatum = document.createElement("span");
                meinDatum.className ="kommentarDatum";
                meinDatum.textContent = date;
                
                // myComment[i].textContent = myJSONRes[i].freitext;

                //Gefällt mir /gefällt nicht Button pro Kommentar hinzufügen
                thumbUPS[i] = document.createElement("button");
                thumbUPS[i].textContent = "Like 👍";
                thumbUPS[i].postid=  myJSONRes[i]._id;
                thumbUPS[i].className=  "like";
                //funktion löst bei click auf button post req aus (Funktion like_dislike_post)
                //muss indirekt gecallt werden
                thumb.push(thumbUPS[i]);
                thumbUPS[i].addEventListener("click", function() {
                    let myValue = reply_click(this.postid);
                    like_dislike_post(myValue, "/like");
                    this.disabled=true;
                } );

                thumbDOWNS[i] = document.createElement("button");
                thumbDOWNS[i].textContent = "Dislike 👎";
                thumbDOWNS[i].postid= myJSONRes[i]._id;
                thumbDOWNS[i].className=  "dislike";
                thumbDOWNS[i].append(meinDatum);
                //funktion löst bei click auf button post req aus
                thumbDOWNS[i].addEventListener("click", function(){
                    let myValue = reply_click(this.postid);
                    like_dislike_post(myValue, "/dislike");
                    this.disabled=true;
                } );

                //wenn nach mehrmals infobox wegclicken ul verschindet
                if (document.querySelector(".feedback-list") === null) {
                    let newUL = document.createElement("ul");
                    newUL.className = "feedback-list";
                    //sollte ul unter h3 überschrif einfügen
                    document.querySelector(".commentHeader").append(newUL);
                }
                //An Kommentar Thumbs Up und Down Button anhängen
                myComment[i].append(thumbUPS[i], thumbDOWNS[i]);
                document.querySelector(".feedback-list").append(myComment[i]);

                exits = true;
                // ggf. wieder reinnehmen
                // return exits
            }

        }
        if (!exits || exits == undefined) {
            let keinKommentar = "Es ist noch kein Kommentar vorhanden 😅";
            console.log(keinKommentar)
            document.querySelector(".feedback-server").textContent = keinKommentar;
        };
    }

}


//Funktion für Löschen von allen "li" Elementen, wenn Infobox geschlossen wird
function entf_LI_ELEM() {
    let myLIElements = document.getElementsByTagName("li");
    for (i = 0; i <= myLIElements.length - 1; i++) {
        //solang sammlung von "Li" Elementen auf Seite länger als 0 ->löschen
        if (myLIElements.length > 0) {
            // entfernen von allen li elementen 
            // slice und remove
            Array.prototype.slice.call(document.getElementsByTagName("li")).forEach(
                function (item) {
                    item.remove();
                });
            //     //Neu -> soll übrig bleibendes li Element catachen
            // } else if (myLIElements[0] != undefined) {
            //     myLIElements[i].remove()
        };
    };
};


function reply_click(clicked_id)
{
    //noch button-id mitnehmen-> wenn in array & bereits gelickt dauerhaft deaktivieren

    return clicked_id;
}




//Funktion für like vote // dislike vote post request
async function like_dislike_post(x, z) {
    console.log("Funktions ID ist: ");
    console.log(x);
    let id = x;
    let route =z; 
    //speichert aktuellen hausstandort, könnte noch ID mitnehmen!!
    //Objekt, das weitergereicht wird
    const data = {
        'gesendete_ID': id
    };
    //Methode der Sendung an Server
    const options = {
        method: "POST",
        //gibt zu sendenden content-typ an
        headers: {
            "Content-Type": "application/json"
        },
        //Objekt wird genommen und in json-string umgeformt
        body: JSON.stringify(data)
    };

    //daten werden mit optionen gesendet
    // auf serverantwort mit await gewartet
    //antwort als json geparsed und geloggt
    const response = await fetch(route, options);
    const json = await response.json();

}


//Zufallsfarben für Dach ((nicht ganz bunt))
//ggf. anpassen
function dachFARBEN() {

    let daCH = [
        "#606C38",
        "#283618",
        "#FEFAE0",
        "#DDA15E",
        "#BC6C25",
    ]

    // picking a random item of the array
    return daCH[Math.floor(Math.random() * daCH.length)];
}


//für style von fassade
function fassadenFARBE() {

    let fassade = [
        "glass",
        "wood",
        "glassfront",
        "panels"
    ]
    return fassade[Math.floor(Math.random() * fassade.length)];

}

//
/// Schatten und Tageszeit in Karte
//

let
    now,
    date, time,
    timeRange, dateRange,
    timeRangeLabel, dateRangeLabel;



function changeDate() {
    if (osmb !== undefined)
        console.log(osmb == undefined);
    if (osmb != undefined) {
        let Y = now.getFullYear(),
            M = now.getMonth(),
            D = now.getDate(),
            h = now.getHours(),
            m = 0;

        timeRangeLabel.innerText = pad(h) + ':' + pad(m);
        //   dateRangeLabel.innerText = Y + '-' + pad(M+1) + '-' + pad(D);


        osmb.setDate(new Date(Y, M, D, h, m));
    }
}

function onTimeChange() {
    now.setHours(this.value);
    now.setMinutes(0);
    changeDate();
}

function onDateChange() {
    now.setMonth(0);
    now.setDate(this.value);
    changeDate();
}

function pad(v) {
    return (v < 10 ? '0' : '') + v;
}

timeRange = document.getElementById('time');
dateRange = document.getElementById('date');
timeRangeLabel = document.querySelector('*[for=time]');
dateRangeLabel = document.querySelector('*[for=date]');

now = new Date;
changeDate();

// init with day of year
var Jan1 = new Date(now.getFullYear(), 0, 1);
dateRange.value = Math.ceil((now - Jan1) / 86400000);

timeRange.value = now.getHours();

timeRange.addEventListener('change', onTimeChange);
dateRange.addEventListener('change', onDateChange);
timeRange.addEventListener('input', onTimeChange);
dateRange.addEventListener('input', onDateChange);

document.getElementById("date").style.display = "none";

