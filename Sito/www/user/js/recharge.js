function init() {
    var websocket = new WebSocket("ws://localhost:8080/")
 
        websocket.onopen = () => {
            var oggetto = {
                command:"16",
                cod_utente: localStorage.getItem("cod_Utente"),
            };
        
            websocket.send(JSON.stringify(oggetto));
        }  

        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            
            if (message.command == '7')
                $('#title').append(message.resultQuery[0].Saldo + " €</p>");
            else if (message.command == '8')
                alert("Tabella non riempita");
        }

        websocket.onerror = function(evt) { 
            alert(`WebSocket error: ` + evt.data);
        }
}

function checkInsertedValue(){
    var opzione = $('select[name=tipo] option:selected').html();
    $("#method_form")[0].reset();
    $("select[name=cod_carta] option").remove();
    $("select[name=iban] option").remove();
    
    $('select[name=cod_carta]').removeAttr('disabled');
    $(".confirmButton").removeAttr('disabled');
    $('select[name=iban]').removeAttr('disabled');
     
    if(opzione == "Carta"){
        //CARTE
        $("select[name=tipo]").val("Carta");
        var websocket = new WebSocket("ws://localhost:8080/")
 
        websocket.onopen = () => {
            var oggetto = {
                command:"4",
                cod_utente: localStorage.getItem("cod_Utente"),
            };
        
            websocket.send(JSON.stringify(oggetto));
        }  

        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            
            if (message.command == '7'){
                for(var i = 0; i < message.resultQuery.length; i++){

                    $('select[name=cod_carta]').append("<option>"+message.resultQuery[i].Codice+"</option>");
            
                    $("#method_form").validate({
                        rules:{
                        },
                        messages:{
                        },
                        submitHandler: function(){
                            onSubmit();
                        }
                    });
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
    else if(opzione == "IBAN"){
        //IBAN
        $("select[name=tipo]").val("IBAN");
        var websocket = new WebSocket("ws://localhost:8080/")
 
        websocket.onopen = () => {
            var oggetto = {
                command:"15",
                cod_utente: localStorage.getItem("cod_Utente"),
            };
        
            websocket.send(JSON.stringify(oggetto));
        }  

        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            
            if (message.command == '7'){
                for(var i = 0; i < message.resultQuery.length; i++){

                    $('select[name=iban]').append("<option>"+message.resultQuery[i].IBAN+"</option>");
            
                    $("#method_form").validate({
                        rules:{
                        },
                        messages:{
                        },
                        submitHandler: function(){
                            onSubmit();
                        }
                    });
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
}

function onSubmit(){
    var websocket = new WebSocket("ws://localhost:8080/")
 
    websocket.onopen = () => {
        var codice;

        if ($("[name='tipo']").val() == "Carta")
            codice = $("[name='cod_carta']").val();
        else if ($("[name='tipo']").val() == "IBAN")
            codice = $("[name='iban']").val();

        var oggetto = {
            command:"14",
            cod_utente: localStorage.getItem("cod_Utente"),
            saldo: $("[name='saldo']").val(),
            metodo: $("[name='tipo']").val(),
            cod: codice,
        };
         
        websocket.send(JSON.stringify(oggetto));
 
    }  
 
    websocket.onmessage = function (event) {
        var message = JSON.parse(event.data);
         
        if (message.command == '21'){
            alert("Versamento eseguito");
            $(".confirmButton").attr('disabled','disabled');
            location.reload();
        }
        else if (message.command == '22'){
            alert(message.error);
        }
    }
 
    websocket.onerror = function(evt) { 
        alert(`WebSocket error: ` + evt.data);
    }
}

function openManageLimit(btn){
    sessionStorage.setItem("tipo", "Online");
    window.open("http://localhost:8000/user/manageLimit.html");
}