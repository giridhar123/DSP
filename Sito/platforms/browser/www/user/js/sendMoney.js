$(document).ready(function(){
    //verifico la validità dei campi
    $.validator.addMethod("PatternMoney",function(value,element){
        return this.optional(element) || /^-?(0\.\d*[1-9]|[1-9]\d*(\.\d+)?)$/.test(value);
    },"Il formato deve essere euro.cents");

    $("#myForm").validate({
        rules:{
            'email_destinatario':{
                email: true,
            },
            'numero_telefono_destinatario':{
                digits: true,
            },
            'nome_esercizio':{
                required: true,
            },
            'soldi_da_versare':{
                required: true,
                PatternMoney: true,
            },
            'codice_pagamento':{
                required: true,
            },
        },
        messages:{
            'email_destinatario':{
                email: "Formato email non valido",
            },
            'numero_telefono_destinatario':{
                digits: "Cellulare non valido",
            },
            'nome_esercizio':{
                required: "Inserire nome esercizio!",
            },
            'soldi_da_versare':{
                required: "Inserire somma da versare!",
            },
            'codice_pagamento':{
                required: "Selezionare un metodo di pagamento",
            },
        },
      
        submitHandler: function(){
            doPayment();         
        }
    });
});


function insertCards(){

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
        for(var i = 0; i < message.resultQuery.length; i++){
            var default_value = message.resultQuery[i].Di_Default;
            if(default_value == 0)
                $("#selectMethod").append("<option value="+i+">"+message.resultQuery[i].Codice+"</option>");
            else
                $("#selectMethod").append("<option selected value="+i+">"+message.resultQuery[i].Codice+"</option>"); 
        }
        
    }

    websocket.onerror = function(evt) { 
        alert(`WebSocket error: ` + evt.data);
    }
}

function insertIban(){

    var websocket = new WebSocket("ws://www.dsp.it:8080/")
 
    websocket.onopen = () => {
        var oggetto = {
            command:"15",
            cod_utente: localStorage.getItem("cod_Utente"),

        };
        websocket.send(JSON.stringify(oggetto));
    }  

    websocket.onmessage = function (event) {
       
        var message = JSON.parse(event.data);
        for(var i = 0; i < message.resultQuery.length; i++){
            
            var default_value = message.resultQuery[i].Di_Default;
            if(default_value == 0)
                $("#selectMethod").append("<option value="+i+">"+message.resultQuery[i].IBAN +"</option>");
            else
                $("#selectMethod").append("<option selected value="+i+">"+message.resultQuery[i].IBAN +"</option>"); 
        }
        
        
    }

    websocket.onerror = function(evt) { 
        alert(`WebSocket error: ` + evt.data);
    }
}  


function methodTypeSelection(){
    $('#selectMethod').empty();
    var insert= document.getElementById("selectMethodType");
    
    if(insert.value=="Carta"){
        var table=document.getElementById("selectMethod");
        table.disabled=false;
        insertCards();
    }
    if(insert.value=="IBAN"){
        var table=document.getElementById("selectMethod");
        table.disabled=false;
        insertIban();
    }
    if(insert.value=="ONLINE"){ 
        var table=document.getElementById("selectMethod");
        table.disabled=true;
    }
    
}


//effettuo pagamento
function doPayment(){
    
    var websocket = new WebSocket("ws://www.dsp.it:8080/")
 
     websocket.onopen = () => {

            var oggetto = {
                command:"32",
                cod_utente: localStorage.getItem("cod_Utente"),
                importo: document.getElementsByName("soldi_da_versare")[0].value,
                metodo_pagamento: $('select[name=selezione_metodo] option:selected').html(),
                codice: $('select[name=codice_pagamento] option:selected').html(),
                numero_dest: document.getElementsByName("numero_telefono_destinatario")[0].value,
                email_dest: document.getElementsByName("email_destinatario")[0].value,
                tipo : "invio"
            };

         websocket.send(JSON.stringify(oggetto));
 
     }  
 
     websocket.onmessage = function (event) {
         var message = JSON.parse(event.data);
         
         if (message.command == '34'){
             alert(message.message);
             $("#myForm")[0].reset();
         }
         else if (message.command == '33'){
             alert(message.message);
         }
     }
 
     websocket.onerror = function(evt) { 
         alert(`WebSocket error: ` + evt.data);
     }
}