function setUserData(){
    //riempio i dati relativi all'utente 
    $("[name='nome']").val(localStorage.getItem("nome")); 
    $("[name='cognome']").val(localStorage.getItem("cognome"));
    $("[name='cf']").val(localStorage.getItem("codice_Fiscale"))
    $("[name='sesso']").val(localStorage.getItem("sesso"));
    var data = localStorage.getItem("data_Nascita").split("T");
    $("[name='data']").val(data[0]);
    $("[name='citta_nascita']").val(localStorage.getItem("citta_Nascita"));
    $("[name='residenza']").val(localStorage.getItem("residenza"));
    $("[name='email']").val(localStorage.getItem("email"));
    $("[name='cellulare']").val(localStorage.getItem("cellulare"));
    $("[name='telegram_ID']").val(localStorage.getItem("telegramChatId"));
    $("[name='password']").val(localStorage.getItem("password"));
}

//Mostra la password
function showPassword(){
    var x = document.getElementsByName("password")[0];
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

/*
MODIFCA I DATI DELL'UTENTE 
*/
function checkUpdateValue(){
    $(".updateButton").removeAttr('disabled');

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
          'sesso':{
            required:true,
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
          'password':{
            required:true,
            PatternPWD:true,
          },
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
            'sesso':{
              required: "Inserire sesso",
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
        },
        submitHandler: function(){
          confirmButtonClicked();         
        }
    });
}

function confirmButtonClicked(){
    var websocket = new WebSocket("ws://www.dsp.it:8080/")
 
    websocket.onopen = () => {
        var oggetto = {
            command:"3",
            cod_utente: localStorage.getItem("cod_Utente"),
            nome: document.getElementsByName("nome")[0].value,
            cognome: document.getElementsByName("cognome")[0].value,
            cf: document.getElementsByName("cf")[0].value,
            sesso: document.getElementsByName("sesso")[0].value,
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
        localStorage.setItem("nome", document.getElementsByName("nome")[0].value);
        localStorage.setItem("cognome", document.getElementsByName("cognome")[0].value);
        localStorage.setItem("codice_Fiscale", document.getElementsByName("cf")[0].value);
        localStorage.setItem("sesso", document.getElementsByName("sesso")[0].value);
        localStorage.setItem("data_Nascita", document.getElementsByName("data")[0].value);
        localStorage.setItem("citta_nascita", document.getElementsByName("citta_nascita")[0].value);
        localStorage.setItem("residenza", document.getElementsByName("residenza")[0].value);
        localStorage.setItem("email", document.getElementsByName("email")[0].value);
        localStorage.setItem("cellulare", document.getElementsByName("cellulare")[0].value);
        localStorage.setItem("telegramChatId", document.getElementsByName("telegram_ID")[0].value);
        localStorage.setItem("password", document.getElementsByName("password")[0].value);
        if (message.command == '5'){
            alert("Modifica dati effettuata");
            $(".updateButton").attr('disabled','disabled');
            location.reload();
        }
        else if (message.command == '6'){
            alert("Errore nella modifica dei dati");
        }
    }
 
    websocket.onerror = function(evt) { 
        alert(`WebSocket error: ` + evt.data);
    }
}