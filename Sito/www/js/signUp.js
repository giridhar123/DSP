$(document).ready(function(){
    //REGEX per la password
    $.validator.addMethod("PatternPWD",function(value,element){
        return this.optional(element) || /(?=.+\d)(?=.+[a-z])(?=.+[A-Z]).{6,12}/.test(value);
    },"La password deve essere compresa tra 6 e 12 caratteri e contere almeno una lettera minuscola, una maiuscola e un numero");

    //REGEX per il codice fiscale
    $.validator.addMethod("PatternCF", function(value,element) { 
        return this.optional(element) || /(?=.+\d)(?=.+[A-z]).{16}/.test(value);  
    }, "Formato del codice fiscale errato");

    //REGEX per il cellulare
    $.validator.addMethod("PatternCell", function(value,element) { 
        return this.optional(element) || /^\d{10}$/.test(value);  
    }, "Numero non valido!");


    $("#myForm").validate({
        rules:{
          'nome':{
            required: true,
          },
          'cognome':{
            required: true,
          },
          'cf':{
            required: true,
            PatternCF: true,
          },
          'data':{
            required:true,
          },
          'citta_nascita':{
            required:true,
          },
          'residenza':{
            required:true,
          },
          'email':{
            required: true,
            email:true,
          },
          'cellulare':{
            required:true,
            PatternCell: true,
          },
          'telegram_ID':{
            required:false,
          },
          'password':{
            required:true,
            PatternPWD:true,
          },
          'c_password':{
              equalTo:"#passwordID",
          }
        },
        messages:{
            'nome':{
                required: "Inserire nome!",
            },
            'cognome':{
                required: "Ineserire cognome!",
            },
            'cf':{
                required: "Inserire codice fiscale!",
            },
            'data':{
                required: "Inserire data di nascita!",
            },
            'citta_nascita':{
                required:"Inserire città di nascita!"
            },
            'residenza':{
                required:"Inserire città di residenza!",
            },
            'email':{
                required: "Inserire email!",
                email: "Formato non valido",
            },
            'cellulare':{
                required: "Inserire cellulare!",
            },
            'password':{
                required:"Ineserire password!",
            },
            'c_password':{
                equalTo:"Le password non coincidono!",
            }
        },
      
        submitHandler: function(){
            onSignUpButtonClicked();        
        }
    });
});


function onSignUpButtonClicked(){
    
   var websocket = new WebSocket("ws://localhost:8080/")

    websocket.onopen = () => {
        var oggetto = {
            command:"2",
            nome: document.getElementsByName("nome")[0].value,
            cognome: document.getElementsByName("cognome")[0].value,
            cf: document.getElementsByName("cf")[0].value,
            sesso: $('input[name="sesso"]:checked').val(),
            data: document.getElementsByName("data")[0].value,
            citta_nascita: document.getElementsByName("citta_nascita")[0].value,
            residenza: document.getElementsByName("residenza")[0].value,
            email: document.getElementsByName("email")[0].value,
            cellulare: document.getElementsByName("cellulare")[0].value,
            telegramChatId: document.getElementsByName("telegram_ID")[0].value,
            password: document.getElementsByName("password")[0].value,
        };
        websocket.send(JSON.stringify(oggetto));
    }  

    websocket.onmessage = function (event) {
    	var message = JSON.parse(event.data);
    	
    	if (message.command == '3'){
            alert("Registrazione effettuata");
            location.href = 'index.html';
            $("#myForm")[0].reset();
    	}
    	else if (message.command == '4'){
    		alert("Errore nella registrazione: email e cellulare sono già collegati ad un account esistente");
    	}
    }

    websocket.onerror = function(evt) { 
        alert(`WebSocket error: ` + evt.data);
    }
}