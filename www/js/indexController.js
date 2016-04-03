/**
 * Created by niek on 29-3-2016.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
    },
    openNativeAppWindow: function(data) {
        window.open(data, '_system');
    }
};

$( "#pokomonpageLijst" ).on( "pagebeforecreate", function( event, ui ) {
    pokomonObject.getPokomonsPaged(0,5, true);
    getPokomonInvetory();
} );
$( "#pokomonpageLijst" ).on( "pageinit", function( event, ui ) {
    var zoekwaarde = window.localStorage.getItem("zoekveld");
    if(zoekwaarde){
        $("#filterBasic-input").val(zoekwaarde);
        $("#pokodexlijst").filterable("refresh");
    }
    if($("#pokodexlijst").size() === 1){
        $.mobile.loading( "show", {
            text: "Pokemons ophalen",
            textVisible: true,
            theme: $.mobile.loader.prototype.options.theme,
            textonly: false,
            html: ""
        });
    }
});

$( "#pokomonpageLijst").on( "pagebeforehide", function( event, ui ) {
    var zoekwaarde = $("#filterBasic-input").val();
    if(zoekwaarde){
        window.localStorage.setItem("zoekveld", zoekwaarde);
    } else{
        window.localStorage.removeItem("zoekveld");
    }
} );
//als er gescrolld word voeg er 5 aan de lijst toe.
$(document).on( 'scrollstart', '#pokoLijst', function(){
    var startnr = $('#pokodexlijst li').length -1;
    fillPokomonList(startnr , startnr + 10);
});

$("#pokoLijst").on('tap', 'a', function(){
    console.log(this.rel);
    getPokomonDetails(parseInt(this.rel));
    $.mobile.changePage( "../pokemonDetail.html", { transition: "slide"} );
});

$(document).on('swipeleft', '.ui-page', function(event){
    if(event.handled !== true) // This will prevent event triggering more then once
    {
        switch(this.id){
            case "pokomonpageLijst" :
                $.mobile.changePage("../www/inventory.html", {transition: "slide", reverse: true}, true, true);
                break;
            case "pokomonInvetoryPage" :
                $.mobile.changePage("../www/about.html", {transition: "slide", reverse: true}, true, true);
                break;
            case "about" :
                $.mobile.changePage("../www/settings.html", {transition: "slide", reverse: true}, true, true);
                break;
            case "settings" :
                $.mobile.changePage("../www/index.html", {transition: "slide", reverse: true}, true, true);
                break;
        }
        event.handled = true;
    }
    return false;
});

$(document).on('swiperight', '.ui-page', function(event){
    if(event.handled !== true) // This will prevent event triggering more then once
    {
        switch(this.id){
            case "pokomonpageLijst" :
                $.mobile.changePage("../www/settings.html", {transition: "slide", reverse: true}, true, true);
                break;
            case "pokomonInvetoryPage" :
                $.mobile.changePage("../www/index.html", {transition: "slide", reverse: true}, true, true);
                break;
            case "about" :
                $.mobile.changePage("../www/inventory.html", {transition: "slide", reverse: true}, true, true);
                break;
            case "settings" :
                $.mobile.changePage("../www/about.html", {transition: "slide", reverse: true}, true, true);
                break;
        }
        event.handled = true;
    }
    return false;
});

//Zorgt ervoor dat alle links naar website in de browser van de telefoon geopent worden
$(document).on('touchstart','.internetLink', function(e) {
    e.preventDefault();
    var elem = $(this);
    var url = elem.attr('href');
    if (url.indexOf('http://') !== -1) {
        window.open(url, '_system');
    }
});