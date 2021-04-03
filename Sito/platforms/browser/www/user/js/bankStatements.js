function setPDF(){
    //creo i pdf degli estratti conto
    var rows = [];
    var websocket = new WebSocket("ws://www.dsp.it:8080/")
 
    websocket.onopen = () => {
        var oggetto = {
            command:"9",
            cod_utente: localStorage.getItem("cod_Utente"),
        };
        websocket.send(JSON.stringify(oggetto));
    }  
 
    websocket.onmessage = function (event) {
        var message = JSON.parse(event.data);
        if (message.command == '17'){
           for(var i = 0; i < message.resultQuery.length; i++){
                var data = message.resultQuery[i].Data.split("T");

                var myData = {
                    tipo: "Carta",
                    codice: message.resultQuery[i].Codice,
                    destinatario: message.resultQuery[i].Nome,
                    importo: message.resultQuery[i].Importo,
                    data: data[0],
                    ora: message.resultQuery[i].Ora,
                    };
                
                rows.push(myData);
            }
        }
        else if (message.command == '18'){
             alert("Tabella dei movimenti non riempita aa");
        }
        firstTest(rows);
    }
}

function firstTest(rows) {
    var websocket2 = new WebSocket("ws://www.dsp.it:8080/")
 
    websocket2.onopen = () => {
        var oggetto = {
            command:"29",
            cod_utente: localStorage.getItem("cod_Utente"),
        };
         
        websocket2.send(JSON.stringify(oggetto));
    }  
    websocket2.onmessage = function (event) {
        var message = JSON.parse(event.data);
         
        if (message.command == '17'){
            for(var i = 0; i < message.resultQuery.length; i++){
                var data = message.resultQuery[i].Data.split("T");
                
                var myData = {
                    tipo: 'ONLINE',
                    codice: message.resultQuery[i].Codice,
                    destinatario: message.resultQuery[i].Nome,
                    importo: message.resultQuery[i].Importo,
                    data: data[0],
                    ora: message.resultQuery[i].Ora,
                };

                rows.push(myData);
            }
        }
        else if (message.command == '18'){
             alert("Tabella dei movimenti non riempita bb");
        }
        secondTest(rows);
    }
}

function secondTest(rows) {
    var websocket3 = new WebSocket("ws://www.dsp.it:8080/")
 
    websocket3.onopen = () => {
        var oggetto = {
            command:"30",
            cod_utente: localStorage.getItem("cod_Utente"),
        };
         
        websocket3.send(JSON.stringify(oggetto));
    }  
    websocket3.onmessage = function (event) {
        var message = JSON.parse(event.data);
        if (message.command == '17'){
            for(var i = 0; i < message.resultQuery.length; i++){
                var data = message.resultQuery[i].Data.split("T");
                
                var myData = {
                    tipo: 'IBAN',
                    codice: message.resultQuery[i].Codice,
                    destinatario: message.resultQuery[i].Nome,
                    importo: message.resultQuery[i].Importo,
                    data: data[0],
                    ora: message.resultQuery[i].Ora,
                };
                
                rows.push(myData);
            }
        }
        else if (message.command == '18'){
             alert("Tabella dei movimenti non riempita cc");
        }

        var doc = new jsPDF('p', 'pt', 'a4');

        doc.autoTable({
            body: rows,
            columns: [{header: 'Tipo', dataKey: 'tipo'}, {header: 'Codice', dataKey: 'codice'}, {header: 'Destinatario', dataKey: 'destinatario'}, {header: 'Importo', dataKey: 'importo'}, {header: 'Data', dataKey: 'data'}, {header: 'Ora', dataKey: 'ora'}]
        })

        doc.save('estrattoConto.pdf');
    }
}

 

 