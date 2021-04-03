function openPayShop(){
   if(localStorage.getItem("cod_Utente") == null){
        alert("Esegui il login");
    }
    else{
        location.href = "payShop.html","_self";
    }
}

function openShowTransactions(){
    if(localStorage.getItem("cod_Utente") == null){
        alert("Esegui il login");
    }
    else{
        location.href = "showTransactions.html","_self";
    }

}

function openPeriodicPayment(){
    if(localStorage.getItem("cod_Utente") == null){
        alert("Esegui il login");
    }
    else{
        location.href = "periodicPayment.html","_self";
    }

}

function openSendMoney(){
    if(localStorage.getItem("cod_Utente") == null){
        alert("Esegui il login");
    }
    else{
        location.href = "sendMoney.html","_self";
    }

}

function openReceiveMoney(){
    if(localStorage.getItem("cod_Utente") == null){
        alert("Esegui il login");
    }
    else{
        location.href = "receiveMoney.html","_self";
    }
    location.href = "receiveMoney.html","_self";
}

function openBankStatements(){
    if(localStorage.getItem("cod_Utente") == null){
        alert("Esegui il login");
    }
    else{
        location.href = "bankStatements.html","_self";
    }
}