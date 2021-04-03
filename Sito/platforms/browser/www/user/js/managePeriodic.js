function setPeriodicPayments(){

    var websocket = new WebSocket("ws://www.dsp.it:8080/")
 
    websocket.onopen = () => {
        var oggetto = {
             command:"42",
             cod_utente: localStorage.getItem("cod_Utente"),
        };
         
        websocket.send(JSON.stringify(oggetto));
    }  
 
    websocket.onmessage = function (event) {
        var message = JSON.parse(event.data);
        if (message.command == '42'){
            if (message.resultQuery == 0) {
                $(".container").append('<div class="container manageMethodsContainer">'+
                        'Nessuna periodicità esistente.'+
                    '</div>');
            }
            else {
                var oggetto = {
                    command:"23",
                    cod_utente: localStorage.getItem("cod_Utente"),
                };
                
                websocket.send(JSON.stringify(oggetto));

                websocket.onmessage = function (event) {
                    var message = JSON.parse(event.data);
                    if (message.command == '27'){
                        for(var i = 0; i < message.resultQuery.length; i++){
                            var data = message.resultQuery[i].Data_Avvio.split("T");
                            var gg_mm_aaaa = data[0].split("-");
                            var da_pagare = message.resultQuery[i].Importo_Totale-message.resultQuery[i].Importo;
                            var rate_rimanenti = message.resultQuery[i].Numero_Pagamenti - (message.resultQuery[i].Importo/(message.resultQuery[i].Importo_Totale/message.resultQuery[i].Numero_Pagamenti));
                            var delete_button = "<div class='col-sm-12 col-md-12 col-lg-12 col-xl-12'><button class='cancelButton' onclick='deletePeriodic(this);'><div class='buttonText'>Rimuovi</div></button></div>";
                            $(".container").append('<div class="managePeriodicContainer">'+
                                '<div class="row">'+
                                    '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Conto</label>'+
                                    '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">Carta '+message.resultQuery[i].Codice+'</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Esercizio commerciale</label>'+
                                    '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+message.resultQuery[i].Nome_Esercizio+'</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Importo totale</label>'+
                                    '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+message.resultQuery[i].Importo_Totale+'</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Data avvio</label>'+
                                    '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+gg_mm_aaaa[2]+"/"+gg_mm_aaaa[1]+"/"+gg_mm_aaaa[0]+'</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Importo pagato</label>'+
                                    '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+message.resultQuery[i].Importo+'</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Importo da pagare</label>'+
                                    '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+da_pagare+'</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Rate rimanenti</label>'+
                                    '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+rate_rimanenti+'</div>'+
                                '</div>'+
                                '<div class="row">'+
                                    delete_button+
                                '</div>'+
                            '</div>'+
                            '<br/>');
                           
                        }
                    }
                    else if (message.command == '28'){
                        alert("Tabella non riempita");
                    }

                    oggetto = {
                        command:"24",
                        cod_utente: localStorage.getItem("cod_Utente"),
                    };
                    
                    websocket.send(JSON.stringify(oggetto));

                    websocket.onmessage = function (event) {
                        var message = JSON.parse(event.data);
                        if (message.command == '27'){
                           for(var i = 0; i < message.resultQuery.length; i++){
                               var data = message.resultQuery[i].Data_Avvio.split("T");
                               var gg_mm_aaaa = data[0].split("-");
                               var da_pagare = message.resultQuery[i].Importo_Totale-message.resultQuery[i].Importo;
                               var rate_rimanenti = message.resultQuery[i].Numero_Pagamenti - (message.resultQuery[i].Importo/(message.resultQuery[i].Importo_Totale/message.resultQuery[i].Numero_Pagamenti));
                               var delete_button = "<div class='col-sm-12 col-md-12 col-lg-12 col-xl-12'><button class='cancelButton' onclick='deletePeriodic(this);><div class='buttonText'>Rimuovi</div></button></div>";
                               $(".container").append('<div class="managePeriodicContainer">'+
                                            '<div class="row">'+
                                                '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Conto</label>'+
                                                '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">IBAN '+message.resultQuery[i].IBAN+'</div>'+
                                            '</div>'+
                                            '<div class="row">'+
                                                '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Esercizio commerciale</label>'+
                                                '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+message.resultQuery[i].Nome_Esercizio+'</div>'+
                                            '</div>'+
                                            '<div class="row">'+
                                                '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Importo totale</label>'+
                                                '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+message.resultQuery[i].Importo_Totale+'</div>'+
                                            '</div>'+
                                            '<div class="row">'+
                                                '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Data avvio</label>'+
                                                '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+gg_mm_aaaa[2]+"/"+gg_mm_aaaa[1]+"/"+gg_mm_aaaa[0]+'</div>'+
                                            '</div>'+
                                            '<div class="row">'+
                                                '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Importo pagato</label>'+
                                                '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+message.resultQuery[i].Importo+'</div>'+
                                            '</div>'+
                                            '<div class="row">'+
                                                '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Importo da pagare</label>'+
                                                '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+da_pagare+'</div>'+
                                            '</div>'+
                                            '<div class="row">'+
                                                '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Rate rimanenti</label>'+
                                                '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+rate_rimanenti+'</div>'+
                                            '</div>'+
                                            '<div class="row">'+
                                                delete_button+
                                            '</div>'+
                                        '</div>'+
                                        '<br/>');
                           }
                        }
                        else if (message.command == '28'){
                            alert("Tabella non riempita");
                        }

                        oggetto = {
                            command:"25",
                            cod_utente: localStorage.getItem("cod_Utente"),
                        };
                        
                        websocket.send(JSON.stringify(oggetto));

                        websocket.onmessage = function (event) {
                            var message = JSON.parse(event.data);
                            if (message.command == '27'){
                                for(var i = 0; i < message.resultQuery.length; i++){
                                    var data = message.resultQuery[i].Data_Avvio.split("T");
                                    var gg_mm_aaaa = data[0].split("-");
                                    var da_pagare = message.resultQuery[i].Importo_Totale-message.resultQuery[i].Importo;
                                    var rate_rimanenti = message.resultQuery[i].Numero_Pagamenti - (message.resultQuery[i].Importo/(message.resultQuery[i].Importo_Totale/message.resultQuery[i].Numero_Pagamenti));
                                    var delete_button = "<div class='col-sm-12 col-md-12 col-lg-12 col-xl-12'><button class='cancelButton' onclick='deletePeriodic(this);'><div class='buttonText'>Rimuovi</div></button></div>";
                                    
                                    $(".container").append('<div class="managePeriodicContainer">'+
                                            '<div class="row">'+
                                                '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Conto</label>'+
                                                '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">Online</div>'+
                                            '</div>'+
                                            '<div class="row">'+
                                                '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Esercizio commerciale</label>'+
                                                '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+message.resultQuery[i].Nome_Esercizio+'</div>'+
                                            '</div>'+
                                            '<div class="row">'+
                                                '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Importo totale</label>'+
                                                '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+message.resultQuery[i].Importo_Totale+'</div>'+
                                            '</div>'+
                                            '<div class="row">'+
                                                '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Data avvio</label>'+
                                                '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+gg_mm_aaaa[2]+"/"+gg_mm_aaaa[1]+"/"+gg_mm_aaaa[0]+'</div>'+
                                            '</div>'+
                                            '<div class="row">'+
                                                '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Importo pagato</label>'+
                                                '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+message.resultQuery[i].Importo+'</div>'+
                                            '</div>'+
                                            '<div class="row">'+
                                                '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Importo da pagare</label>'+
                                                '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+da_pagare+'</div>'+
                                            '</div>'+
                                            '<div class="row">'+
                                                '<label class="col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label" id="myLabel">Rate rimanenti</label>'+
                                                '<div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">'+rate_rimanenti+'</div>'+
                                            '</div>'+
                                            '<div class="row">'+
                                                delete_button+
                                            '</div>'+
                                        '</div>'+
                                        '<br/>');
                                }
                            }
                            else if (message.command == '28'){
                                alert("Tabella non riempita");
                            }
                        }
                    }
                }
            }
        }
    }
 
    websocket.onerror = function(evt) { 
        alert(`WebSocket error: ` + evt.data);
    }
}

/*
 ELIMINARE PERIODICITA
 */
function deletePeriodic(btn){
    //navigo nel DOM per capire in quale riga mi trovo e quindi quale periodicita eliminare
    //button-->div-->div(row)-->div(mangaePeriodicContainer)-->div(row)-->label-->div-->valore
    var tipo = btn.parentNode.parentNode.parentNode.firstChild.firstChild.nextSibling.firstChild.nodeValue.split(" ");
    
    if(tipo[0] == "Carta"){
        
        var websocket = new WebSocket("ws://www.dsp.it:8080/")
 
        websocket.onopen = () => {
            var oggetto = {
                command:"26",
                cod_utente: localStorage.getItem("cod_Utente"),
                codice_carta: tipo[1],
            };
            
            websocket.send(JSON.stringify(oggetto));
    
        }  
    
        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            
            if (message.command == '29'){
                alert("Periodicità eliminata");
                location.reload();
            }
            else if (message.command == '30'){
                alert(message.message);
            }
        }
    
        websocket.onerror = function(evt) { 
            alert(`WebSocket error: ` + evt.data);
        }
    }
    else if(tipo[0] == "IBAN"){
        var websocket = new WebSocket("ws://www.dsp.it:8080/")
 
        websocket.onopen = () => {
            var oggetto = {
                command:"27",
                cod_utente: localStorage.getItem("cod_Utente"),
                iban:tipo[1],
            };
            
            websocket.send(JSON.stringify(oggetto));
    
        }  
    
        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            
            if (message.command == '29'){
                alert("Periodicità eliminata");
                location.reload();
            }
            else if (message.command == '30'){
                alert(message.message);
            }
        }
    
        websocket.onerror = function(evt) { 
            alert(`WebSocket error: ` + evt.data);
        }
    }
    else if(tipo == "Versamento"){
        var websocket = new WebSocket("ws://www.dsp.it:8080/")
 
        websocket.onopen = () => {
         var oggetto = {
             command:"28",
             cod_utente: localStorage.getItem("cod_Utente"),
         };
         
         websocket.send(JSON.stringify(oggetto));
 
     }  
 
     websocket.onmessage = function (event) {
         var message = JSON.parse(event.data);
         
         if (message.command == '29'){
            alert("Periodicità eliminata");
            location.reload();
        }
        else if (message.command == '30'){
            alert(message.message);
        }
     }
 
     websocket.onerror = function(evt) { 
         alert(`WebSocket error: ` + evt.data);
     }
    }
    
 }