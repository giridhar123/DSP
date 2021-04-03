$(document).ready(function(){
    //verifico la validità dei campi
    //formato soldi
    $.validator.addMethod("PatternMoney",function(value,element){
        return this.optional(element) || /^-?(0\.\d*[1-9]|[1-9]\d*(\.\d+)?)$/.test(value);
    },"Il formato deve essere euro.cents");

    //data maggiore di today
    $.validator.addMethod("greater", function (value, element) {
        var day = value.split('-');
        var today = new Date();
        if (parseInt(day[0]) >= today.getFullYear() && parseInt(day[1]) >= (today.getMonth()+1) && parseInt(day[2]) >= today.getDay() )
            return true;
        else
            return false;
    }, "La data di avvio non può essere minore della data odierna");

    $("#myForm").validate({
        rules:{
          'nome_esercizio':{
            required: true,
          },
          'soldi_da_versare':{
            required: true,
            PatternMoney: true,
          },
          'data_avvio':{
            required:true,
            greater: true,
              
          },
          'periodicita':{
            required:true,
            digits:true,
          },
          'numero_rate':{
            required:true,
            digits:true,
          },
          'codice_pagamento':{
            required: true,
          },
        },
        messages:{
            'nome_esercizio':{
                required: "Inserire nome esercizio!",
            },
            'soldi_da_versare':{
                required: "Inserire somma da versare!",
            },
            'data_avvio':{
                required:"Data di avvio richiesta",
            },
            'periodicita':{
                required:"Inserire periodicità",
                digits:"Valore non valido",
            },
            'numero_rate':{
                required:"Inserire numero rate",
                digits:"Valore non valido",
            },
            'codice_pagamento':{
                required: "Selezionare un metodo di pagamento",
            },
        },
      
        submitHandler: function(){
            startPeriodicPayment();         
        }
    });
});

/*
INSERISCO I METODI DI PAGAMENTO NELLA COMBOBX DOPO AVER SELEZIONATO IL TIPO
*/
function insertCards(){

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
        for(var i = 0; i < message.resultQuery.length; i++){
            var default_value = message.resultQuery[i].Di_Default;
            if(default_value == 0)
                $("#selectMethod").append("<option value="+i+">"+message.resultQuery[i].Codice +"</option>");
            else
                $("#selectMethod").append("<option selected value="+i+">"+message.resultQuery[i].Codice +"</option>"); 
        }
        
    }

    websocket.onerror = function(evt) { 
        alert(`WebSocket error: ` + evt.data);
    }
}

function insertIban(){

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
    if(insert.value=="Conto_corrente"){
        var table=document.getElementById("selectMethod");
        table.disabled=false;
        insertIban();
    }
    if(insert.value=="Conto_online"){ 
        var table=document.getElementById("selectMethod");
        table.disabled=true;
    }
    
}


//effettuo rateizzazione
function startPeriodicPayment(){
    
   var websocket = new WebSocket("ws://localhost:8080/")
 
     websocket.onopen = () => {
         
            var oggetto = {
                command:"22",
                cod_utente: localStorage.getItem("cod_Utente"),
                nome_esercizio: document.getElementsByName("nome_esercizio")[0].value,
                
                importo: document.getElementsByName("soldi_da_versare")[0].value,
                data_avvio:document.getElementsByName("data_avvio")[0].value,
                periodicita: document.getElementsByName("periodicita")[0].value,
                rate: document.getElementsByName("numero_rate")[0].value,
                metodo_pagamento: $('select[name=selezione_metodo] option:selected').html(),
                codice: $('select[name=codice_pagamento] option:selected').html(),
            };

         websocket.send(JSON.stringify(oggetto));
 
     }  
 
     websocket.onmessage = function (event) {
         var message = JSON.parse(event.data);
         
         if (message.command == '25'){
             alert(message.message);
             $("#myForm")[0].reset();
         }
         else if (message.command == '26'){
             alert(message.message);
         }
     }
 
     websocket.onerror = function(evt) { 
         alert(`WebSocket error: ` + evt.data);
     }
}