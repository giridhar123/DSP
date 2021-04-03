var path = location.pathname.split('/');
path = path[path.length-1].split(".");
var pageName = path[0];

switch (pageName) {
	case "index":
		$("#home").addClass("active");
		break;
}

// Get the modal
var loginForm = document.getElementById('loginForm');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == loginForm) {
        loginForm.style.display = "none";
    }
}

if (localStorage.getItem("cod_Utente") != null)
	showUserMenu();
else
	showGuestMenu();

function showGuestMenu() {
	$(".navbar-right").append('<li><a href="#" onClick="onLoginTopButtonClicked();"><span class="glyphicon glyphicon-log-in"></span> Area Riservata</a></li>')
		.append('<li><a href="http://localhost:8000/signUp.html"><span class="glyphicon glyphicon-log-in"></span> Apri il tuo conto</a></li>');
}

function showUserMenu() {
	$(".navbar-right").append('<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#">'+localStorage.getItem("nome")+'<span class="caret"></span></a>'+
									'<ul class="dropdown-menu">'+
										'<li><a href="http://localhost:8000/user/manageAccount.html">Gestisci Account</a></li>'+
										'<li><a href="http://localhost:8000/user/recharge.html">Ricarica conto</a></li>'+
										'<li><a href="http://localhost:8000/user/manageMethods.html">Metodi di Pagamento</a></li>'+
										'<li><a href="http://localhost:8000/user/managePeriodic.html">Gestisci rateizzazioni</a></li>'+
										'<li><a href="http://localhost:8000/user/requestPage.html">Gestione richieste</a></li>'+
										'<li><a href="#" onClick="logOutButtonPressed();"><span class="glyphicon glyphicon-log-in"></span>'+' Log Out'+'</a></li>'+
									'</ul>'+
								'</li>');
}

function onLoginTopButtonClicked() {
	document.getElementById('loginForm').style.display='block';
}

function onLoginButtonClicked() {
	var websocket = new WebSocket("ws://localhost:8080/")

    websocket.onopen = () => {
        var oggetto = {command:"1", email:$('#email').val(), password:$('#password').val()};
        websocket.send(JSON.stringify(oggetto));
    }  

    websocket.onerror = function(evt) { 
		alert(`WebSocket error: ` + evt.data);
		document.getElementById('loginForm').style.display='none';
    }
    
    websocket.onmessage = function (event) {
    	var message = JSON.parse(event.data);
    	
    	if (message.command == '1')
    	{
    		localStorage.setItem("cod_Utente", message.cod_Utente);
    		localStorage.setItem("codice_Fiscale", message.codice_Fiscale);
    		localStorage.setItem("nome", message.nome);
    		localStorage.setItem("cognome", message.cognome);
    		localStorage.setItem("sesso", message.sesso);
    		localStorage.setItem("data_Nascita", message.data_Nascita);
    		localStorage.setItem("citta_Nascita", message.citta_Nascita);
    		localStorage.setItem("residenza", message.residenza);
    		localStorage.setItem("email", message.email);
    		localStorage.setItem("password", message.password);
			localStorage.setItem("cellulare", message.cellulare);
			localStorage.setItem("telegramChatId", message.telegramChatId);
    		
    		location.href = "http://localhost:8000/index.html","_self";
    	}
    	else if (message.command == '2')
    		alert("Login non effettuato");
    }
}

$(document).mouseup(function (e)
{
	//Non chiudere la finestra di login se clicco su di essa
	if(($(e.target).parents('#loginBox').length > 0))
		return;
	
    if (!(e.target.id === 'loginButton') && !($('#loginButton').hasClass("active")))
    {
    	$('#loginButton').addClass("active");
    	$('#loginBox').fadeOut( "slow");
    }
});

function logOutButtonPressed() {
	localStorage.clear();
	location.href = "http://localhost:8000/index.html","_self";
}