function setTransactionsTable(){
    
    var websocket = new WebSocket("ws://www.dsp.it:8080/")
 
    websocket.onopen = () => {
        var oggetto = {
            command:"41",
            cod_utente: localStorage.getItem("cod_Utente"),
        };
         
        websocket.send(JSON.stringify(oggetto));
    }  
 
    websocket.onmessage = function (event) {
        var message = JSON.parse(event.data);
        
        if (message.command == '41'){
            if (message.resultQuery == 0) {
                $("#myContent").append('<div align="center">Nessun movimento effettuato</div>'+
                    '<a href="http://www.dsp.it:8000/index.html"><button class="cancelButton"><div class="buttonText">Indietro</div></button></a>');
            }
            else {
                /*
                ADDEBITI
                */
                var oggetto = {
                    command:"9",
                    cod_utente: localStorage.getItem("cod_Utente"),
                    email: localStorage.getItem("email"),
                    cellulare: localStorage.getItem("cellulare")
                };
                 
                websocket.send(JSON.stringify(oggetto));

                websocket.onmessage = function (event) {
                    var message = JSON.parse(event.data);
                    if (message.command == '17'){
                        for(var i = 0; i < message.resultQuery.length; i++){
                            var data = message.resultQuery[i].Data.split("T");
                            var gg_mm_aaaa = data[0].split("-");
                            var row = "<tr><td>Carta</td><td>"+message.resultQuery[i].Codice+"</td><td>"+message.resultQuery[i].Nome+"</td><td>Addebito</td><td>"+message.resultQuery[i].Importo+"</td><td>"+gg_mm_aaaa[2]+"/"+gg_mm_aaaa[1]+"/"+gg_mm_aaaa[0]+"</td><td>"+message.resultQuery[i].Ora+"</td></tr>";
                            $row = $(row); 
                            $("#myTable").append($row).trigger('addRows', [$row]);
                        }
                    }
                    else if (message.command == '18'){
                        alert("Tabella dei movimenti non riempita(carta)");
                    }

                    oggetto = {
                        command:"29",
                        cod_utente: localStorage.getItem("cod_Utente"),
                    };
                
                    websocket.send(JSON.stringify(oggetto));

                    websocket.onmessage = function (event) {
                        var message = JSON.parse(event.data);
                        
                        if (message.command == '17'){
                            for(var i = 0; i < message.resultQuery.length; i++){
                                var data = message.resultQuery[i].Data.split("T");
                                var gg_mm_aaaa = data[0].split("-");
                                var row ="<tr><td>Conto Online</td><td></td><td>"+message.resultQuery[i].Nome+"</td><td>Addebito</td><td>"+message.resultQuery[i].Importo+"</td><td>"+gg_mm_aaaa[2]+"/"+gg_mm_aaaa[1]+"/"+gg_mm_aaaa[0]+"</td><td>"+message.resultQuery[i].Ora+"</td></tr>";
                                $row = $(row); 
                                $("#myTable").append($row).trigger('addRows', [$row]);
                            }
                        }
                        else if (message.command == '18'){
                            alert("Tabella dei movimenti non riempita(online)");
                        }

                        oggetto = {
                            command:"30",
                            cod_utente: localStorage.getItem("cod_Utente"),
                            email: localStorage.getItem("email"),
                            cellulare: localStorage.getItem("cellulare")
                        };
                        
                        websocket.send(JSON.stringify(oggetto));

                        websocket.onmessage = function (event) {
                            var message = JSON.parse(event.data);
                            
                            if (message.command == '17'){
                                for(var i = 0; i < message.resultQuery.length; i++){
                                    var data = message.resultQuery[i].Data.split("T");
                                    var gg_mm_aaaa = data[0].split("-");
                                    var row = "<tr><td>IBAN</td><td>"+message.resultQuery[i].Codice+"</td><td>"+message.resultQuery[i].Nome+"</td><td>Addebito</td><td>"+message.resultQuery[i].Importo+"</td><td>"+gg_mm_aaaa[2]+"/"+gg_mm_aaaa[1]+"/"+gg_mm_aaaa[0]+"</td><td>"+message.resultQuery[i].Ora+"</td></tr>";
                                    $row = $(row); 
                                    $("#myTable").append($row).trigger('addRows', [$row]);
                                }
                            }
                            else if (message.command == '18'){
                                alert("Tabella dei movimenti non riempita(iban)");
                            }
                        
            
                            //ACCREDITI
                            //carta
                            var oggetto = {
                                command:"45",
                                cod_utente: localStorage.getItem("cod_Utente"),
                                email: localStorage.getItem("email"),
                                cellulare: localStorage.getItem("cellulare")
                            };
                            
                            websocket.send(JSON.stringify(oggetto));

                            websocket.onmessage = function (event) {
                                var message = JSON.parse(event.data);
                                if (message.command == '17'){
                                    for(var i = 0; i < message.resultQuery.length; i++){
                                        var data = message.resultQuery[i].Data.split("T");
                                        var gg_mm_aaaa = data[0].split("-");
                                        var row = "<tr><td>Carta</td><td>"+message.resultQuery[i].Codice+"</td><td>"+message.resultQuery[i].Nome+"</td><td>Accredito</td><td>"+message.resultQuery[i].Importo+"</td><td>"+gg_mm_aaaa[2]+"/"+gg_mm_aaaa[1]+"/"+gg_mm_aaaa[0]+"</td><td>"+message.resultQuery[i].Ora+"</td></tr>";
                                        $row = $(row); 
                                        $("#myTable").append($row).trigger('addRows', [$row]);
                                    }
                                }
                                else if (message.command == '18'){
                                    alert("Tabella dei movimenti non riempita(carta accr)");
                                }
                                //online
                                oggetto = {
                                    command:"47",
                                    cod_utente: localStorage.getItem("cod_Utente"),
                                    email: localStorage.getItem("email"),
                                    cellulare: localStorage.getItem("cellulare")
                                };
                            
                                websocket.send(JSON.stringify(oggetto));

                                websocket.onmessage = function (event) {
                                    var message = JSON.parse(event.data);
                                    
                                    if (message.command == '17'){
                                        for(var i = 0; i < message.resultQuery.length; i++){
                                            var data = message.resultQuery[i].Data.split("T");
                                            var gg_mm_aaaa = data[0].split("-");
                                            var row ="<tr><td>Conto Online</td><td></td><td>"+message.resultQuery[i].Nome+"</td><td>Accredito</td><td>"+message.resultQuery[i].Importo+"</td><td>"+gg_mm_aaaa[2]+"/"+gg_mm_aaaa[1]+"/"+gg_mm_aaaa[0]+"</td><td>"+message.resultQuery[i].Ora+"</td></tr>";
                                            $row = $(row); 
                                            $("#myTable").append($row).trigger('addRows', [$row]);
                                        }
                                    }
                                    else if (message.command == '18'){
                                        alert("Tabella dei movimenti non riempita(online accr)");
                                    }
                                    //iban
                                    oggetto = {
                                        command:"46",
                                        cod_utente: localStorage.getItem("cod_Utente"),
                                    };
                                    
                                    websocket.send(JSON.stringify(oggetto));

                                    websocket.onmessage = function (event) {
                                        var message = JSON.parse(event.data);
                                        
                                        if (message.command == '17'){
                                            for(var i = 0; i < message.resultQuery.length; i++){
                                                var data = message.resultQuery[i].Data.split("T");
                                                var gg_mm_aaaa = data[0].split("-");
                                                var row = "<tr><td>IBAN</td><td>"+message.resultQuery[i].Codice+"</td><td>"+message.resultQuery[i].Nome+"</td><td>Accredito</td><td>"+message.resultQuery[i].Importo+"</td><td>"+gg_mm_aaaa[2]+"/"+gg_mm_aaaa[1]+"/"+gg_mm_aaaa[0]+"</td><td>"+message.resultQuery[i].Ora+"</td></tr>";
                                                $row = $(row); 
                                                $("#myTable").append($row).trigger('addRows', [$row]);
                                            }
                                        }
                                        else if (message.command == '18'){
                                            alert("Tabella dei movimenti non riempita(iban accr)");
                                        }

                                        $("#myContent").append('<a href="http://www.dsp.it:8000/index.html"><button class="cancelButton"><div class="buttonText">Indietro</div></button></a>');
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }    

    /*
    TABLESORTER
    */
    $('#reset_button').click(function() {
        $("#myTable").trigger('filterReset').trigger('sortReset');
        return false;
    });

    $("#myTable").tablesorter({ 
        widgets: ['filter'],
        sortList: [[5,1], [6, 1]],
        widgetOptions : {
            
            filter_reset:'button.reset',
            filter_formatter : {
                4: function($cell, indx) {
                    return $.tablesorter.filterFormatter.html5Range( $cell, indx, {
                        value: 0,
                        min: 0,
                        max: 1000,
                        delayed: true,
                        valueToHeader: true,
                        compare : [ '=', '>=', '<=' ],
                        selected: 1
                    });
            
                },
            },

        }
    });

}   

