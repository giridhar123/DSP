var checkHandler = require('./checkHandler');

module.exports = {
    onInsertRequestMoney: function(commands, receivedPacket, sqlConnection, socketConnection, emailSender) {
        console.log("Ricevuta richiesta di protocollazione richiesta di soldi");
        var tel=receivedPacket.numero_dest;
        var email=receivedPacket.email_dest;
        var tipoMetodo=receivedPacket.metodo_pagamento;
        var codice=receivedPacket.codice;
        var query="SELECT m.Cod_Metodo, u.Cod_Utente,u.Email,u.Cellulare FROM metodo_pagamento m, utente u WHERE u.Cod_Utente=m.Ref_Utente AND m.Di_Default=1 AND (u.Cellulare= '"+tel+"' OR u.Email= '"+email+"')";
        sqlConnection.query(query, function(err4,resultPerson){
            if(err4) throw err4;
            if(resultPerson.length > 1){
                oggetto = {command: commands.SEND_MONEY_NOT_OK, message:"I dati inseriti non identificano la stessa persona riprovare"};
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
            else if(resultPerson.length == 0){
                var mittente = "SELECT Email, Cellulare FROM utente WHERE Cod_Utente = "+receivedPacket.cod_utente;
                sqlConnection.query(mittente, function(err_mittente, resultMittente){
                    if(err_mittente) throw err_mittente;
                    //mando email a utente non registrato
                    var mailOptions = {
                        from: 'dspprogetto@gmail.com',
                        to: email,
                        subject: 'Richiesta di registrazione DSP',
                        html: "Registrati per ricevere il denaro che ti è stato mandato e inserisci un metodo di pagamento di default, <a href='http://www.dsp.it:8000/signUp.html'>Registrati</a><br> Completata la procedura ricontattami all'email: " + resultMittente[0].Email + " o al cellulare : " + resultMittente[0].Cellulare,
                    };          
                    emailSender.sendMail(mailOptions, function(error, info){
                        if (error)
                          console.log(error);
                        else
                          console.log('Email sent: ' + info.response);
                    });
                });
            }
            if(tipoMetodo=="Carta")
                var pagamento="SELECT Ref_Metodo FROM carta WHERE Codice='"+codice+"'AND ref_utente="+receivedPacket.cod_utente;
            else if(tipoMetodo=="Conto Corrente")
                var pagamento="SELECT Ref_Metodo FROM conto_bancario WHERE Iban='"+codice+"' AND Ref_Utente="+receivedPacket.cod_utente;
            else if(tipoMetodo=="Conto Online"){
                var pagamento="SELECT Ref_Metodo FROM conto_online WHERE Ref_Utente="+receivedPacket.cod_utente;
            }
            sqlConnection.query(pagamento,function(errPay,result){
                var sql = "SELECT MAX(Cod_Richiesta) as max FROM richiesta";
                sqlConnection.query(sql,function(err,resultMax){
                    var max=(resultMax[0].max)+1;
                    var insert = "INSERT INTO richiesta VALUES("+max+", "+ receivedPacket.cod_utente+" , "+result[0].Ref_Metodo +", '"+email+"' , '"+tel+"' , "+ receivedPacket.importo+" , '"+receivedPacket.tipo+"' )";
                    sqlConnection.query(insert, function(err3, result3){
                        if(err3){
                            oggetto = {command: commands.INSERT_REQUEST_MONEY_NOT_OK, message: "Errore nella protocollazione della richiesta"};
                            socketConnection.sendUTF(JSON.stringify(oggetto));
                        }
                        else{
                            oggetto = {command: commands.INSERT_REQUEST_MONEY_OK, message: "Richiesta eseguita"};
                            socketConnection.sendUTF(JSON.stringify(oggetto));
                        }
                    });
                });
            });
        });
    },

    onTableRequestFill: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Riempimento tabella delle richieste");
        var cod_utente=receivedPacket.cod_utente;
        var query="SELECT concat(u.nome,' ',u.cognome) as Mittente,concat(r.importo,' €') as Importo,r.Tipo,r.Cod_Richiesta FROM richiesta r, utente u, utente u2 WHERE r.Ref_Mittente=u.Cod_Utente AND (r.Cellulare_Destinatario=u2.Cellulare OR r.Email_destinatario=u2.Email) AND u2.Cod_utente="+cod_utente+" AND r.Cod_Richiesta not in(SELECT t.ref_Richiesta FROM transazione t)";
        sqlConnection.query(query,function(err,result){
            if(err){
                oggetto={command: commands.TABLE_FILL_NOT_OK};
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
            else{
                oggetto={command: commands.TABLE_FILL_OK , resultQuery:result };
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
        });
    }
};
