var WebSocketServer = require('websocket').server;
var http = require('http');
var server = http.createServer(function(request, response) {
    // Qui possiamo processare la richiesta HTTP
    // Dal momento che ci interessano solo le WebSocket, non dobbiamo implmentare nulla
    });


server.listen(8081, function() { });
// Creazione del server
wsServer = new WebSocketServer({
    httpServer: server
});

//connessione al database
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("CREATE DATABASE ciao", function (err, result) {
      if (err) throw err;
      console.log("Database created");
    });
  });

// Gestione degli eventi
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    connection.on('message', function(message) {
        // Metodo eseguito alla ricezione di un messaggio
        if (message.type === 'utf8') {
            // Se il messaggio è una stringa, possiamo leggerlo come segue:
            var obj = JSON.parse(message.utf8Data);
            console.log('Il comando ricevuto è: ' + obj.email);
            console.log('L\'username ricevuto è: ' + obj.type);
            console.log('La password ricevuta è: ' + obj.password);
        }
        connection.sendUTF("Stringa di esempio");
    });
    connection.on('close', function(connection) {
        //metodo ala chiusura della connessione
        console.log("connessione chiusa");
    });
});