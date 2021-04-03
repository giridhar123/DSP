function setLimitMethod(){
    //riempio i dati relativi ai metodi di pagamento dell'utente

    if(sessionStorage.getItem("tipo") == "Carta"){
        $("#header_row").append("<label class='col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label'>Carta</label><label class='col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label'>"+sessionStorage.getItem("codice")+"</label>");
        var websocket = new WebSocket("ws://localhost:8080/")
 
        websocket.onopen = () => {
            var oggetto = {
                command:"35",
                cod_utente: localStorage.getItem("cod_Utente"),
                codice: sessionStorage.getItem("codice")
            };
            
            websocket.send(JSON.stringify(oggetto));
        }  
    
        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            
            if (message.command == '37'){
                $('select[name=giornaliero').val(message.resultQuery[0].limite);
                $('select[name=mensile').val(message.resultQuery[1].limite);
            }
            else if(message.command == '38'){
                alert("Errore");
            }
     }
 
     websocket.onerror = function(evt) { 
         alert(`WebSocket error: ` + evt.data);
     }
    }
    else if(sessionStorage.getItem("tipo") == "IBAN"){
        $("#header_row").append("<div class='row'><label class='col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label'>IBAN</label><label class='col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label'>"+sessionStorage.getItem("codice")+"</label></div>");
        
        var websocket = new WebSocket("ws://localhost:8080/")
        websocket.onopen = () => {
            var oggetto = {
                command:"36",
                cod_utente: localStorage.getItem("cod_Utente"),
                iban: sessionStorage.getItem("codice")
            };
            
            websocket.send(JSON.stringify(oggetto));
        }  
    
        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            
            if (message.command == '37'){
                $('select[name=giornaliero').val(message.resultQuery[0].limite);
                $('select[name=mensile').val(message.resultQuery[1].limite);
            }
            else if(message.command == '38'){
                alert("Errore");
            }
     }
 
     websocket.onerror = function(evt) { 
         alert(`WebSocket error: ` + evt.data);
     }
    }
    else if(sessionStorage.getItem("tipo") == "Online"){
        $("#header_row").append("<div class='row'><label class='col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label'>Conto Online</label><label class='col-sm-12 col-md-6 col-lg-6 col-xl-6 control-label'></label></div>");
        
        var websocket = new WebSocket("ws://localhost:8080/")
        websocket.onopen = () => {
            var oggetto = {
                command:"37",
                cod_utente: localStorage.getItem("cod_Utente"),
            };
            
            websocket.send(JSON.stringify(oggetto));
        }  
    
        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            
            if (message.command == '37'){
                $('select[name=giornaliero').val(message.resultQuery[0].limite);
                $('select[name=mensile').val(message.resultQuery[1].limite);
            }
            else if(message.command == '38'){
                alert("Errore");
            }
     }
 
     websocket.onerror = function(evt) { 
         alert(`WebSocket error: ` + evt.data);
     }
    }
    
}

function updateLimit(){
    
    if(sessionStorage.getItem("tipo") == "Carta"){
        var websocket = new WebSocket("ws://localhost:8080/")
 
        websocket.onopen = () => {
            var oggetto = {
                command:"38",
                cod_utente: localStorage.getItem("cod_Utente"),
                codice: sessionStorage.getItem("codice"),
                giornaliero: $('select[name=giornaliero] option:selected').html(),
                mensile: $('select[name=mensile] option:selected').html(),
            };
            
            websocket.send(JSON.stringify(oggetto));
        }  
    
        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            
            if (message.command == '39'){
                alert("Modifica effettuata")
            }
            else if(message.command == '40'){
                alert("Errore");
            }
     }
 
     websocket.onerror = function(evt) { 
         alert(`WebSocket error: ` + evt.data);
     }
    }
    else if(sessionStorage.getItem("tipo") == "IBAN"){
        
        var websocket = new WebSocket("ws://localhost:8080/")
        websocket.onopen = () => {
            var oggetto = {
                command:"39",
                cod_utente: localStorage.getItem("cod_Utente"),
                iban: sessionStorage.getItem("codice"),
                giornaliero: $('select[name=giornaliero] option:selected').html(),
                mensile: $('select[name=mensile] option:selected').html(),
            };
            
            websocket.send(JSON.stringify(oggetto));
        }  
    
        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            
            if (message.command == '39'){
                alert("Modifica effettuata")
            }
            else if(message.command == '40'){
                alert("Errore");
            }
     }
 
     websocket.onerror = function(evt) { 
         alert(`WebSocket error: ` + evt.data);
     }
    }
    else if(sessionStorage.getItem("tipo") == "Online"){
        
        var websocket = new WebSocket("ws://localhost:8080/")
        websocket.onopen = () => {
            var oggetto = {
                command:"40",
                cod_utente: localStorage.getItem("cod_Utente"),
                giornaliero: $('select[name=giornaliero] option:selected').html(),
                mensile: $('select[name=mensile] option:selected').html(),
            };
            
            websocket.send(JSON.stringify(oggetto));
        }  
    
        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            
            if (message.command == '39'){
                alert("Modifica effettuata");
            }
            else if(message.command == '40'){
                alert("Errore");
            }
     }
 
     websocket.onerror = function(evt) { 
         alert(`WebSocket error: ` + evt.data);
     }
    }

}


