function openPayShop(){
    if(localStorage.getItem("cod_Utente") == null){
        alert("Esegui il login");
    }
    else{
        location.href = "http://localhost:8000/user/payShop.html","_self";
    }
}

function openShowTransactions(){
    if(localStorage.getItem("cod_Utente") == null){
        alert("Esegui il login");
    }
    else{
        location.href = "http://localhost:8000/user/showTransactions.html","_self";
    }
}

function openPeriodicPayment(){
    if(localStorage.getItem("cod_Utente") == null){
        alert("Esegui il login");
    }
    else{
        location.href = "http://localhost:8000/user/periodicPayment.html","_self";
    }
}

function openSendMoney(){
    if(localStorage.getItem("cod_Utente") == null){
        alert("Esegui il login");
    }
    else{
        location.href = "http://localhost:8000/user/sendMoney.html","_self";
    }
}

function openReceiveMoney(){
    if(localStorage.getItem("cod_Utente") == null){
        alert("Esegui il login");
    }
    else{
        location.href = "http://localhost:8000/user/receiveMoney.html","_self";
    }
}

function openBankStatements(){
    if(localStorage.getItem("cod_Utente") == null){
        alert("Esegui il login");
    }
    else{
        location.href = "http://localhost:8000/user/bankStatements.html","_self";
    }
}