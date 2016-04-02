/**
 * Created by niek on 30-3-2016.
 */
//maak database waar locatie van pokemons inzitten
if (window.openDatabase) {
    //Create the database the parameters are 1. the database name 2.version number 3. a description 4. the size of the database (in bytes) 1024 x 1024 = 1MB
    var mydb = openDatabase("pokomon_db", "0.1", "pokomon database", 1024 * 1024);
    //create the cars table using SQL for the database using a transaction
    mydb.transaction(function (t) {
        t.executeSql("CREATE TABLE IF NOT EXISTS pokomonlocaties (id INTEGER PRIMARY KEY, latitude DOUBLE, longitude DOUBLE)");
        t.executeSql("CREATE TABLE IF NOT EXISTS pokomonsGevangen (id INTEGER PRIMARY KEY, naam TEXT)");
    });
}

$(document).on('tap','#vangPokemon', function(){
    console.log("vang pokemon");
    $.mobile.loading( "show", {
        text: "Pokomon zoeken",
        textVisible: true,
        theme: $.mobile.loader.prototype.options.theme,
        textonly: false,
        html: ""
    });
    navigator.geolocation.getCurrentPosition(geolocationSuccess,onError);
});
$(document).on( "pagebeforecreate",'#pokomonInvetoryPage', function( event, ui ) {
    loadPokomonInvetory();
    $("#invLijst").on('tap', 'a', function(){
        console.log(this.rel);
        getPokomonDetails((this.rel));
        $.mobile.changePage( "../www/pokemonDetail.html", { transition: "slide"} );
    });
} );

function geolocationSuccess(position){
    mydb.transaction(function (t) {
        t.executeSql("SELECT * FROM pokomonlocaties", [], function(transaction, results){
            var pokomongevangen = false;
            for(var i=0; i< results.rows.length; i++){
                var pokoLocatie = results.rows[i];
                //0.000001
                var afstandLat = Math.abs(pokoLocatie.latitude - position.coords.latitude);
                var afstandLon = Math.abs(pokoLocatie.longitude - position.coords.longitude);
                if(afstandLat >= 0 && afstandLat <= 0.5 && afstandLon >= 0 && afstandLon <= 0.5){
                    pokomongevangen = true;

                    getPokomon(results.rows[i].id, function(data){
                        $.mobile.loading( "hide" );
                        $(document).simpledialog2({
                            mode: 'button',
                            headerText: '',
                            headerClose: true,
                            buttonPrompt: 'Wilt u ' + data.name + ' vangen?',
                            buttons : {
                                'Ja': {
                                    click: function () {
                                        $('#buttonoutput').text('Pokomon gevangen');
                                        vangPokemon(data.id, data.name);
                                    }
                                }
                            }
                        });
                    });
                    navigator.vibrate(1000);
                    break;
                }
            }
            if(!pokomongevangen){
                $.mobile.loading( "hide" );
                $(document).simpledialog2({
                    mode: 'button',
                    headerText: '',
                    headerClose: true,
                    buttonPrompt: 'Geen pokomon gevonden',
                    buttons : {
                        'OK': {
                            click: function () {
                                $('#buttonoutput').text('OK');
                            }
                        }
                    }
                })
            }
        });
    });

}

function onError(error) {
    $.mobile.loading( "hide" );

}