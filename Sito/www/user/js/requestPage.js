function setTable(){
    var websocket = new WebSocket("ws://localhost:8080/")
    
    websocket.onopen = () => {
        var oggetto = {
            command:"33",
            cod_utente: localStorage.getItem("cod_Utente"),
        };
         
        websocket.send(JSON.stringify(oggetto));
    }  
 
    websocket.onmessage = function (event) {
        var message = JSON.parse(event.data);
        if (message.command == '7'){
            if (message.resultQuery.length == 0)
                $(".container").append("<div align='center'>Nessun Richiesta Ricevuta</div>");
            else {
                for(var i = 0; i < message.resultQuery.length; i++){
                    var bottoneAccetta = "<div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 btn-toolbar' role='toolbar'><button class='confirmButton acceptButton' onclick='acceptRequest("+message.resultQuery[i].Cod_Richiesta+")'><div class='buttonText'>Accetta</div></button></div>";
                    var bottoneRifiuta = "<div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 btn-toolbar' role='toolbar'><button class='cancelButton declineButton' onclick='refuseRequest("+message.resultQuery[i].Cod_Richiesta+")'><div class='buttonText'>Rifiuta</div></button></div>";
                    $(".container").append("<div class='requestContainer'>"+
                            "<div class='row' id='"+message.resultQuery[i].Cod_Richiesta+"'>"+
                                "<label class='col-xs-12 col-sm-4 col-md-4 col-lg-4 col-xl-4 control-label'><div class='field'>Mittente:</div></label>"+
                                "<label class='col-xs-12 col-sm-4 col-md-4 col-lg-4 col-xl-4 control-label' id='mittente'>"+message.resultQuery[i].Mittente+"</label>"+
                                "<label class='col-xs-12 col-sm-4 col-md-4 col-lg-4 col-xl-4 control-label'><div class='field'>Importo:</div></label>"+
                                "<label class='col-xs-12 col-sm-4 col-md-4 col-lg-4 col-xl-4 control-label' id='importo'>"+message.resultQuery[i].Importo+"</label>"+
                                "<label class='col-xs-12 col-sm-4 col-md-4 col-lg-4 col-xl-4 control-label'><div class='field'>Tipo:</div></label>"+
                                "<label class='col-xs-12 col-sm-4 col-md-4 col-lg-4 col-xl-4 control-label' id='tipo'>"+message.resultQuery[i].Tipo+"</label>"+
                                bottoneAccetta+bottoneRifiuta+
                            "</div>"+
                        "</div>");
                }
            }
        }
        else if (message.command == '8'){
             alert("Tabella dei movimenti non riempita");
        }
    }

    websocket.onerror = function(evt) { 
        alert(`WebSocket error: ` + evt.data);
    }
}

function refuseRequest(cod_richiesta){
    var websocket = new WebSocket("ws://localhost:8080/")

    websocket.onopen = () => {
            var oggetto = {
                command:"34",
                cod_utente: localStorage.getItem("cod_Utente"),
                cod_richiesta: cod_richiesta,
            };
        websocket.send(JSON.stringify(oggetto));
    }
     
    websocket.onmessage = function (event) {
        var message = JSON.parse(event.data);
         
        if (message.command == '35'){
            alert(message.message);
            location.reload();
        }
        else if (message.command == '36'){
            alert(message.message);
        }
    }
    websocket.onerror = function(evt){ 
        alert(`WebSocket error: ` + evt.data);
    }
}

function insertTransaction(richiesta){
    var codice=richiesta;
    var websocket = new WebSocket("ws://localhost:8080/")
    
    websocket.onopen = () => {        
            var oggetto = {
                command:"43",
                cod_utente: localStorage.getItem("cod_Utente"),
                cod_richiesta: codice,
            };
        websocket.send(JSON.stringify(oggetto));
    }
     
    websocket.onmessage = function (event) {
        var message = JSON.parse(event.data);

        if (message.command == '43')
            alert(message.message);
        else if (message.command == '44')
            alert(message.message);
    }
    websocket.onerror = function(evt){ 
        alert(`WebSocket error: ` + evt.data);
    }
}

function acceptRequest(cod_richiesta){
    var riga = $("#"+cod_richiesta);
    var tipo = riga.find("#tipo").text();
    
    if(tipo=="invio"){
        var websocket = new WebSocket("ws://localhost:8080/")
    
        websocket.onopen = () => {
                var oggetto = {
                    command:"21",
                    cod_utente: localStorage.getItem("cod_Utente"),
                    cod_richiesta:cod_richiesta,
                    email : localStorage.getItem("email"),
                    cellulare : localStorage.getItem("cellulare"),
                };
            websocket.send(JSON.stringify(oggetto));
        }  
     
        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
         
            if (message.command == '23'){
                alert(message.message);
                location.reload();
            }
            else if (message.command == '24')
                alert(message.message);
        }
        websocket.onerror = function(evt){ 
            alert(`WebSocket error: ` + evt.data);
        }
    }
    else if(tipo=="richiesta"){
        var websocket = new WebSocket("ws://localhost:8080/")
    
        websocket.onopen = () => {
                var oggetto = {
                    command:"31",
                    cod_utente: localStorage.getItem("cod_Utente"),
                    cod_richiesta:cod_richiesta,
                    email : localStorage.getItem("email"),
                    cellulare : localStorage.getItem("cellulare"),
                };
            websocket.send(JSON.stringify(oggetto));
        }  
     
        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
         
            if (message.command == '31'){
                alert(message.message);
                insertTransaction(cod_richiesta);
                location.reload();
            }
            else if (message.command == '32')
                 alert(message.message);
        }
        websocket.onerror = function(evt){ 
            alert(`WebSocket error: ` + evt.data);
        }
    }
}