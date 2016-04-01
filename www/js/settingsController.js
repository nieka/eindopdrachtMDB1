/**
 * Created by niek on 30-3-2016.
 */
var mydb = openDatabase("pokomon_db", "0.1", "pokomon database", 1024 * 1024);

$(document).on('tap','#wisInvetory', function() {
    console.log("wis inventory");
    mydb.transaction(function (t) {
        t.executeSql("DROP TABLE pokomonsGevangen", [], function (db, results) {
            $(document).simpledialog2({
                mode: 'button',
                headerText: '',
                headerClose: true,
                buttonPrompt: 'Inetory verwijderd',
                buttons: {
                    'Ok': {
                        click: function () {
                        }
                    }
                }
            });
        });
    });
});
$(document).on('tap','#wisPokemonLocatie', function(){
    console.log("wis pokomonlocaties");
    mydb.transaction(function (t) {
        t.executeSql("DROP TABLE pokomonlocaties",[],function(db,results){
            $(document).simpledialog2({
                mode: 'button',
                headerText: '',
                headerClose: true,
                buttonPrompt: 'pokemon locaties verwijderd',
                buttons : {
                    'Ok': {
                        click: function () {}
                    }
                }
            });
        });
    });

});