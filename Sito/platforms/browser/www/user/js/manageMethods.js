function setUserMethod(){
    //riempio i dati relativi ai metodi di pagamento dell'utente

    //CARTE
    var websocket = new WebSocket("ws://www.dsp.it:8080/")
 
    websocket.onopen = () => {
        var oggetto = {
            command:"4",
            cod_utente: localStorage.getItem("cod_Utente"),
        };
         
        websocket.send(JSON.stringify(oggetto));
    }  
 
    websocket.onmessage = function (event) {
        var message = JSON.parse(event.data);
         
        var id = 0;

        if (message.command == '7'){
            for(var i = 0; i < message.resultQuery.length; i++, id++){
                
                var data = message.resultQuery[i].Scadenza.split("T");
                var gg_mm_aaaa = data[0].split("-");
                var default_value = message.resultQuery[i].Di_Default;
                //disabilito bottone che rende defualt se il metodo è già di default
                if(default_value == 0)
                    default_value = "";
                else
                    default_value = "disabled";
                
                var menu = "<div class='col-12 col-sm-12 col-md-6 col-lg-1 col-xl-1 btn-group'><button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown'><span class='caret'></span></button><ul class='dropdown-menu' role='menu'><li><button onclick='setDefault("+id+")' class='confirmButton' "+default_value+">Default</button></li><li><button onclick='openManageLimit("+id+");'>Limiti spesa</button></li></ul></div>";
                
                $(".container").append("<div class='manageMethodsContainer'>"+
                        "<div class='row' id = '"+id+"'>"+
                            "<label class='col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 control-label' id='tipo'><div class='field'>Carta:</div></label>"+
                            "<label class='col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 control-label' id='codice'>"+message.resultQuery[i].Codice+"</label>"+
                            "<label class='col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 control-label'><div class='field'>Scadenza:</div></label>"+
                            "<label class='col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 control-label' id='scadenza'>"+gg_mm_aaaa[1]+"/"+gg_mm_aaaa[0]+"</label>"+
                            "<label class='col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 control-label'><div class='field'>CVV:</div></label>"+
                            "<label class='col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 control-label' id='cvv'>"+message.resultQuery[i].CVV+"</label>"+
                            "<label class='col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 control-label'><div class='field'>Saldo:</div></label>"+
                            "<label class='col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 control-label' id='saldo'>"+message.resultQuery[i].Saldo+" €</label>"+
                            menu+
                        "</div>"+
                    "</div>");
            }
        }
        else if (message.command == '8'){
            alert("Tabella non riempita");
        }    
 
        var oggetto = {
             command:"15",
             cod_utente: localStorage.getItem("cod_Utente"),
        };
         
        websocket.send(JSON.stringify(oggetto));
 
        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            
            if (message.command == '7'){
                for(var i = 0; i < message.resultQuery.length; i++){
                    var default_value = message.resultQuery[i].Di_Default;
                    //disabilito bottone che rende defualt se il metodo è già di default
                    if(default_value == 0)
                        default_value = "";
                    else
                        default_value = "disabled";
                    
                    var menu = "<div class='col-12 col-sm-12 col-md-6 col-lg-1 col-xl-1 btn-group'><button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown'><span class='caret'></span></button><ul class='dropdown-menu' role='menu'><li><button onclick='setDefault("+id+")' class='confirmButton' "+default_value+">Default</button></li><li><button onclick='openManageLimit("+id+");'>Limiti spesa</button></li></ul></div>";
                    $(".container").append("<div class='manageMethodsContainer'>"+
                            "<div class='row' id = '"+id+"'>"+
                                "<label class='col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 control-label' id='tipo'><div class='field'>IBAN:</div></label>"+
                                "<label class='col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 control-label' id='iban'>"+message.resultQuery[i].IBAN+"</label>"+
                                "<label class='col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 control-label'><div class='field'>Saldo:</div></label>"+
                                "<label class='col-xs-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 control-label' id='saldo'>"+message.resultQuery[i].Saldo+" €</label>"+
                                menu+
                            "</div>"+
                        "</div>");
                }
            }
            else if (message.command == '8'){
                alert("Tabella non riempita");
            }
        }
        websocket.onerror = function(evt) { 
            alert(`WebSocket error: ` + evt.data);
        }
    }

    websocket.onerror = function(evt) { 
        alert(`WebSocket error: ` + evt.data);
    }
}


/*
SETTA IL METODO DI DEFAULT
*/
function setDefault(id){
    var riga = $("#"+id);
    var tipo = riga.find("#tipo").text();

    if(tipo == "Carta:"){
        var cod_carta = riga.find("#codice").text();
        var websocket = new WebSocket("ws://www.dsp.it:8080/")
 
        websocket.onopen = () => {
            var oggetto = {
                command:"7",
                cod_utente: localStorage.getItem("cod_Utente"),
                cod_carta:cod_carta,
            };
            websocket.send(JSON.stringify(oggetto));
        }
    
        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            
            if (message.command == '13'){
                alert("Cambiamento metodo di default effettuato");
                location.reload();
            }
            else if (message.command == '14'){
                alert("Errore nel cambiamento metodo di default effettuato");
            }
        }
    
        websocket.onerror = function(evt) { 
            alert(`WebSocket error: ` + evt.data);
        }
    }
    else if(tipo == "IBAN:"){
        var iban = riga.find("#iban").text();
        
        var websocket = new WebSocket("ws://www.dsp.it:8080/")
 
        websocket.onopen = () => {
            var oggetto = {
                command:"19",
                cod_utente: localStorage.getItem("cod_Utente"),
                iban:iban,
            };
            websocket.send(JSON.stringify(oggetto));
        }  
    
        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            
            if (message.command == '13'){
                alert("Cambiamento metodo di default effettuato");
                location.reload();
            }
            else if (message.command == '14'){
                alert("Errore nel cambiamento metodo di default effettuato");
            }
        }
    
        websocket.onerror = function(evt) { 
            alert(`WebSocket error: ` + evt.data);
        }
    }
}

 /*
 VERIFICA I DATI DEL METODO DI PAGAMENTO
 */
 function checkInsertedValue(){
     var opzione = $('select[name=tipo] option:selected').html();
     
    if(opzione == "Carta"){
        $("#method_form")[0].reset();
        $("select[name=tipo]").val("Carta");
        $('input[name=saldo]').attr('disabled','disabled');
        $(".confirmButton").removeAttr('disabled');
        $('input[name=cod_carta]').removeAttr('disabled');
        $('select[name=mese]').removeAttr('disabled');
        $('select[name=anno]').removeAttr('disabled');
        $('input[name=cvv]').removeAttr('disabled');
        $('input[name=iban]').attr('disabled','disabled');
        
        $("#method_form").validate({
            rules:{
              'cod_carta':{
                required: true,
                number: true,
                maxlength: 16,
                minlength: 16,
              },
              'mese':{
                required: true,
              },
              'anno':{
                required: true,
              },
              'cvv':{
                required: true,
                number: true,
                maxlength: 3,
                minlength: 3,
              },
              'iban':{
                maxlength: 27,
                minlength: 27,
              },
              
            },
            messages:{
                'cod_carta':{
                    required: "Inserire codice!",
                    number: "Codice non valido",
                    maxlength: "Il codice deve essere di 16 caratteri",
                    minlength: "Il codice deve essere di 16 caratteri",
                },
                'mese':{
                    required: "Ineserire mese!",
                },
                'anno':{
                    required: "Ineserire anno!",
                },
                'cvv':{
                    required: "Inserire cvv!",
                    number: "CVV non valido",
                    maxlength: "CVV non valido",
                    minlength: "CVV non valido",
                },
                'iban':{
                    maxlength: "Codice IBAN non valido",
                    minlength: "Codice IBAN non valido",
                },
                
            },
            submitHandler: function(){
                insertCard();         
            }
          
        });
    }
    else if(opzione == "IBAN"){
        $("#method_form")[0].reset();
        $("select[name=tipo]").val("IBAN");
        $('input[name=cod_carta]').attr('disabled','disabled');
        $('select[name=mese]').attr('disabled','disabled');
        $('select[name=anno]').attr('disabled','disabled');
        $('input[name=cvv]').attr('disabled','disabled');
        $('input[name=saldo]').attr('disabled','disabled');
        $('input[name=iban]').removeAttr('disabled');
        $(".confirmButton").removeAttr('disabled');

        $("#method_form").validate({
            rules:{
                'iban':{
                    required: true,
                    maxlength: 27,
                    minlength: 27,
                  },
            },
            messages:{
                'iban':{
                    required: "Inserisci IBAN",
                    maxlength: "Codice IBAN non valido",
                    minlength: "Codice IBAN non valido",
                },
            },
            submitHandler: function(){
                insertIban();         
            }
        });
    }
    else{
        $(".confirmButton").attr('disabled','disabled');
        $('input[name=cod_carta]').attr('disabled','disabled');
        $('select[name=anno]').attr('disabled','disabled');
        $('select[name=mese]').attr('disabled','disabled');
        $('input[name=cvv]').attr('disabled','disabled');
        $('input[name=iban]').attr('disabled','disabled');
        $('input[name=saldo]').attr('disabled','disabled');
    }
}

//INSERIRE NUOVA CARTA
function insertCard(){
    var websocket = new WebSocket("ws://www.dsp.it:8080/")
    var data =  $('select[name=anno] option:selected').html()+"-"+$('select[name=mese] option:selected').html()+"-01";
    websocket.onopen = () => {
        var oggetto = {
            command:"5",
            cod_utente: localStorage.getItem("cod_Utente"),
            cod_carta:$("[name='cod_carta']").val(),
            scadenza:data,
            cvv:$("[name='cvv']").val(),
            iban:$("[name='iban']").val(),
            tipo:$("[name='tipo']").val(),
        };
         
        websocket.send(JSON.stringify(oggetto));
 
    }  
 
    websocket.onmessage = function (event) {
        var message = JSON.parse(event.data);
         
        if (message.command == '9'){
            alert("carta inserita");
            $(".confirmButton").attr('disabled','disabled');
            location.reload();
        }
        else if (message.command == '10'){
            alert("Errore nell'inserimento della carta");
        }
    }
 
    websocket.onerror = function(evt) { 
        alert(`WebSocket error: ` + evt.data);
    }
}

 //INSERIRE NUOVA IBAN
function insertIban(){
    var websocket = new WebSocket("ws://www.dsp.it:8080/")
 
    websocket.onopen = () => {
        var oggetto = {
            command:"13",
            cod_utente: localStorage.getItem("cod_Utente"),
            iban:$("[name='iban']").val(),
        };

        websocket.send(JSON.stringify(oggetto));
 
    }  
 
    websocket.onmessage = function (event) {
        var message = JSON.parse(event.data);
         
        if (message.command == '19'){
            alert("IBAN inserito");
            $(".confirmButton").attr('disabled','disabled');
            location.reload();

        }
        else if (message.command == '20'){
            alert("Errore nell'inserimento dell'IBAN");
        }
    }
 
    websocket.onerror = function(evt) { 
        alert(`WebSocket error: ` + evt.data);
    }
}

 function openManageLimit(id){
    var riga = $("#"+id);
    var tipo = riga.find("#tipo").text();
    
    if(tipo == "Carta:"){
        var cod_carta = riga.find("#codice").text();
        sessionStorage.setItem("tipo", "Carta");
        sessionStorage.setItem("codice", cod_carta);
        
    }
    else if(tipo == "IBAN:"){
        var iban = riga.find("#iban").text();
        sessionStorage.setItem("tipo", "IBAN");
        sessionStorage.setItem("codice", iban);
        
    }
    window.open("http://www.dsp.it:8000/user/manageLimit.html");
 }