/**
 * Created by niek on 29-3-2016.
 */
//maak database waar locatie van pokomons inzitten
if (window.openDatabase) {
    //Create the database the parameters are 1. the database name 2.version number 3. a description 4. the size of the database (in bytes) 1024 x 1024 = 1MB
    var mydb = openDatabase("pokomon_db", "0.1", "pokomon database", 1024 * 1024);

    //create the cars table using SQL for the database using a transaction
    mydb.transaction(function (t) {
        t.executeSql("CREATE TABLE IF NOT EXISTS pokomonlocaties (id INTEGER PRIMARY KEY, latitude DOUBLE, longitude DOUBLE)");
        t.executeSql("CREATE TABLE IF NOT EXISTS pokomonsGevangen (id INTEGER PRIMARY KEY, naam TEXT)");
        addDummyData();
    });
}
var pokomonObject = {
    getPokomonsPaged : getPokomonsPaged
};
var url = "http://pokeapi.co/api/v2/";
var pokomonlijst = [];
var pokomonafbeeldingen = [];

function getPokomonsPaged(page, maxpage,show){
    limit=20;
    pagenr = page;
    //Pokomons inladen tot maxpage gehaald is
    $.getJSON(url +  'pokemon/?limit=' + limit + '&offset=' + limit*page, function( data ) {
        // For each item in our JSON, add a roomtable row and cells to the content string
        pokomonlijst = pokomonlijst.concat(data.results);
        pagenr++;
        if(show){
            show = false;
            fillPokomonList(0);
        }
        if(pagenr < maxpage){
            getPokomonsPaged(pagenr, maxpage,show)
        }
    });
    var id = page * limit +1;
    for(var i = id; i <= (id + 20); i++){
        //Pokomon afbeeldingen inladen
        var xmlHTTP = new XMLHttpRequest();
        xmlHTTP.open('GET','http://pokeapi.co/media/sprites/pokemon/' + i + '.png',true);

        // Must include this line - specifies the response type we want
        xmlHTTP.responseType = 'arraybuffer';

        xmlHTTP.onload = function(e)
        {
            var arr = new Uint8Array(this.response);
            var raw = String.fromCharCode.apply(null,arr);
            var b64=btoa(raw);
            pokomonafbeeldingen[i] =("data:image/png;base64,"+b64);
        };
        xmlHTTP.send();
    }
}

function fillPokomonList(start, end){
    var lijst = "";
    var endLengt =0;
    if(end <= pokomonlijst.length){
        endLengt = end;
        var page = pokomonlijst.length/20 +1;
        getPokomonsPaged(page, page + 3,false);
    } else {
        var page = pokomonlijst.length/20 +1;
        getPokomonsPaged(page, page + 5,false);
        endLengt = pokomonlijst.length;
    }
    for(var i= start; i < endLengt; i++){
        lijst += "<li>";
        lijst += "<a id='#pokoDetail' rel='" + i + "'>";
        if(pokomonafbeeldingen[i]){
            console.log("sprite loaded");
            lijst += "<img id='pokomon_image' src='" + pokomonafbeeldingen[i] + "'>";
        }else {
            console.log("img loaded");
            lijst += "<img id='pokomon_image' src='http://pokeapi.co/media/sprites/pokemon/" + (i + 1) + ".png'>";
        }
        lijst += "<h2>" + pokomonlijst[i].name + "</h2>";
        lijst += "</a>";
        lijst += "</li>";
    }
   // $.mobile.loading( "hide" );
    $("#pokodexlijst").append(lijst);

}

function getPokomonDetails(id){
    getPokomon(id, function( data ) {
        // For each item in our JSON, add a roomtable row and cells to the content string
        var tablecontent = "";
        var stats = data.stats;
        for(var i =0; i< stats.length ; i +=2){
            tablecontent += "<tr>";
            tablecontent += "<td>" + stats[i].stat.name + "</td><td>" + stats[i].base_stat+ "</td>";
            tablecontent += "<td>" + stats[i+1].stat.name + "</td><td>" + stats[i+1].base_stat+ "</td>";
            tablecontent += "</tr>";
        }
        $("#pokomonstats").append(tablecontent);

        var list = "";
        var abilities = data.abilities;
        for(var i=0; i< abilities.length; i++){
            list += "<li>" + abilities[i].ability.name +"</li>"
        }
        $("#pokomonAbilities").append(list);
        if(pokomonafbeeldingen[data.id-1]){
            $("#pokomon").attr("src", pokomonafbeeldingen[data.id-1]);
        }else {
            $("#pokomon").attr("src", "http://pokeapi.co/media/sprites/pokemon/" +data.id + ".png");
        }

        $("#pokomonTitel").text(data.name);
        $("#loading").hide();
        $("#title_pokomonstats").show();
        $("#title_pokomonAbilities").show();

    });
}

function getPokomon(id, callback){
    $.getJSON(url +  'pokemon/' + id, callback);
}

function vangPokemon(id, naam){
    mydb.transaction(function (t) {
        t.executeSql("INSERT INTO pokomonsGevangen (id, naam) VALUES (?, ?)", [id, naam]);
        t.executeSql('DELETE FROM pokomonlocaties WHERE id = ?', [id]);
        getPokomonInvetory()
    });
}

function getPokomonInvetory(){
    mydb.transaction(function (t) {
        t.executeSql("SELECT * FROM pokomonsGevangen", [], function (transaction, results) {
            window.localStorage.setItem("inv",JSON.stringify(results.rows));
            loadPokomonInvetory();
        });
    });
}

function loadPokomonInvetory(){
    var lijst = "";
    var inv = JSON.parse(window.localStorage.getItem("inv"));
    var i=0;
    while (inv[i]) {
        var pokemon = inv[i];
        lijst += "<li>";
        lijst += "<a id='#pokoDetail' rel='" + pokemon.id + "'>";
        if (pokomonafbeeldingen[pokemon.id]) {
            lijst += "<img id='pokomon_image' src='" + pokomonafbeeldingen[i] + "'>";
        } else {
            lijst += "<img id='pokomon_image' src='http://pokeapi.co/media/sprites/pokemon/" + pokemon.id + ".png'>";
        }
        lijst += "<h2>" + pokemon.naam + "</h2>";
        lijst += "</a>";
        lijst += "</li>";
        i++;
    }
    $("#invLijst").empty().append(lijst);
}

//voegt 10 pokomons toe die gevangen kunnen worden
function addDummyData(){
    mydb.transaction(function (t) {
        t.executeSql("SELECT * FROM pokomonlocaties", [], function(transaction, results){
            if(results.rows.length === 0){
                mydb.transaction(function (t) {
                    t.executeSql("INSERT INTO pokomonlocaties (id, latitude, longitude) VALUES (?, ?,?)",[10,51.803347,5.235370]);
                    t.executeSql("INSERT INTO pokomonlocaties (id, latitude, longitude) VALUES (?, ?,?)",[15,51.689980,5.295904]);
                    t.executeSql("INSERT INTO pokomonlocaties (id, latitude, longitude) VALUES (?, ?,?)",[20,51.683874,5.292578]);
                    t.executeSql("INSERT INTO pokomonlocaties (id, latitude, longitude) VALUES (?, ?,?)",[25,51.688264,5.279875]);
                    t.executeSql("INSERT INTO pokomonlocaties (id, latitude, longitude) VALUES (?, ?,?)",[30,51.701711,5.277021]);
                    t.executeSql("INSERT INTO pokomonlocaties (id, latitude, longitude) VALUES (?, ?,?)",[35,51.699583,5.303757]);
                    t.executeSql("INSERT INTO pokomonlocaties (id, latitude, longitude) VALUES (?, ?,?)",[40,51.695327,5.303199]);
                    t.executeSql("INSERT INTO pokomonlocaties (id, latitude, longitude) VALUES (?, ?,?)",[45,51.690898,5.304015]);
                    t.executeSql("INSERT INTO pokomonlocaties (id, latitude, longitude) VALUES (?, ?,?)",[50,51.688397,5.286634]);
                    t.executeSql("INSERT INTO pokomonlocaties (id, latitude, longitude) VALUES (?, ?,?)",[55,51.686029,5.311911]);
                });
            }
        });
    });

}