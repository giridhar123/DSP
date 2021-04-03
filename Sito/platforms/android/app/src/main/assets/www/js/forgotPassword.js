$(document).ready(function(){
    $("#myForm").validate({
        submitHandler: function(){
            onSignUpButtonClicked();        
        }
    });
});


function onSignUpButtonClicked(){
    
   var websocket = new WebSocket("ws://"+localStorage.getItem('ip')+":8080/")

    websocket.onopen = () => {
        var oggetto = {
            command:"44",
            email: document.getElementsByName("email")[0].value,
        };
        websocket.send(JSON.stringify(oggetto));
    }  

    websocket.onmessage = function (event) {
    	var message = JSON.parse(event.data);
    	
    	if (message.command == '46'){
            alert("Password reimpostata correttamente. A breve riceverei una e-mail con la nuova password.");
            location.href = 'index.html';
            $("#myForm")[0].reset();
    	}
    	else if (message.command == '45'){
    		alert("Errore nella rreimpostazione della password, E-Mail non corretta");
    	}
    }

    websocket.onerror = function(evt) { 
        alert(`WebSocket error: ` + evt.data);
    }
}