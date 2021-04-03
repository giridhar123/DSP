module.exports = {
    onPeriodicPaymentRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di rateizzazione");
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        //STO PAGANDO CON CARTA
        if(receivedPacket.metodo_pagamento=="Carta"){
            var cod_carta = receivedPacket.codice.split(" ")[0];
            //seleziono il codice del metodo di pagamento selezionato
            var sql = "SELECT Ref_Metodo FROM carta WHERE Codice ="+cod_carta+" AND Ref_Utente="+receivedPacket.cod_utente;
            sqlConnection.query(sql, function(err, result){
                //inserisco la rateizzaione in periodicita
                var insert = "INSERT INTO periodicita VALUES("+receivedPacket.cod_utente+", "+ result[0].Ref_Metodo+" , '"+receivedPacket.data_avvio+"', '"+time+"', '"+receivedPacket.nome_esercizio+"', 0, "+receivedPacket.periodicita+", "+receivedPacket.periodicita+", "+receivedPacket.rate+", "+receivedPacket.importo+")";
                sqlConnection.query(insert, function(err3, result3){
                    if(err3) {
                        oggetto = {command: commands.PERIODIC_PAYMENT_NOT_OK, message: "Errore nell'inserimento della rateizzazione"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else {
                        oggetto = {command: commands.PERIODIC_PAYMENT_OK, message: "Rateizzazione effettuata"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });
            });              
        }
        //STO PAGANDO CON IBAN
        else if(receivedPacket.metodo_pagamento=="Conto Corrente"){
            var iban = receivedPacket.codice;
            var sql = "SELECT Ref_Metodo FROM conto_bancario WHERE IBAN = '"+iban+"' AND Ref_Utente="+receivedPacket.cod_utente;
            sqlConnection.query(sql, function(err, result){
                //inserisco la rateizzaione in periodicita
                var insert = "INSERT INTO periodicita VALUES("+receivedPacket.cod_utente+", "+ result[0].Ref_Metodo+" , '"+receivedPacket.data_avvio+"', '"+time+"', '"+receivedPacket.nome_esercizio+"', 0, "+receivedPacket.periodicita+", "+receivedPacket.periodicita+", "+receivedPacket.rate+", "+receivedPacket.importo+")";
                sqlConnection.query(insert, function(err3, result3){
                    if(err3){
                        oggetto = {command: commands.PERIODIC_PAYMENT_NOT_OK, message: "Errore nell'inserimento della rateizzazione"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        oggetto = {command: commands.PERIODIC_PAYMENT_OK, message: "Rateizzazione effettuata"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }    
                });
            });
        }
        //DA CONTO ONLINE
        else if(receivedPacket.metodo_pagamento=="Conto Online"){
            console.log("pagamento con conto entrato");
            var cod_utente = receivedPacket.cod_utente;
            var sql = "SELECT Ref_Metodo FROM conto_online WHERE Ref_Utente ="+cod_utente;
            sqlConnection.query(sql, function(err, result){
                //inserisco la rateizzaione in periodicita
                var insert = "INSERT INTO periodicita VALUES("+receivedPacket.cod_utente+", "+ result[0].Ref_Metodo+" , '"+receivedPacket.data_avvio+"', '"+time+"', '"+receivedPacket.nome_esercizio+"', 0, "+receivedPacket.periodicita+", "+receivedPacket.periodicita+", "+receivedPacket.rate+", "+receivedPacket.importo+")";
                sqlConnection.query(insert, function(err3, result3){
                    if(err3){
                        console.log(insert);
                        oggetto = {command: commands.PERIODIC_PAYMENT_NOT_OK, message: "Errore nell'inserimento della rateizzazione"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        oggetto = {command: commands.PERIODIC_PAYMENT_OK, message: "Rateizzazione effettuata"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });
            });
        }
    },

    onPeriodicPaymentCardRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di compilazione tabella (periodicita con carta)");
        var sql = "SELECT carta.Codice, periodicita.Nome_Esercizio, periodicita.Importo, periodicita.Numero_giorni, periodicita.Giorni_rimanenti, periodicita.Numero_Pagamenti, periodicita.Importo_Totale, periodicita.Data_Avvio FROM periodicita, metodo_pagamento, carta WHERE periodicita.Ref_Mittente = metodo_pagamento.Ref_Utente AND periodicita.Ref_Metodo = metodo_pagamento.Cod_Metodo AND carta.Ref_Utente = metodo_pagamento.Ref_Utente AND carta.Ref_Metodo = metodo_pagamento.Cod_Metodo AND periodicita.Ref_Mittente ="+receivedPacket.cod_utente+" AND carta.Ref_Metodo = metodo_pagamento.Cod_Metodo";
        sqlConnection.query(sql, function(err, result){
            if(err){
                oggetto = {command: commands.TABLE_PERIODIC_PAYMENT_NOT_OK};
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
            else{
                oggetto = {command: commands.TABLE_PERIODIC_PAYMENT_OK, resultQuery: result};
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
        });
    },

    onTablePeriodicPaymentIbanRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di compilazione tabella (periodicita con iban)");
        var sql = "SELECT conto_bancario.IBAN, periodicita.Nome_Esercizio, periodicita.Importo, periodicita.Numero_giorni, periodicita.Giorni_rimanenti, periodicita.Numero_Pagamenti, periodicita.Importo_Totale, periodicita.Data_Avvio FROM periodicita, metodo_pagamento, conto_bancario WHERE periodicita.Ref_Mittente = metodo_pagamento.Ref_Utente AND periodicita.Ref_Metodo = metodo_pagamento.Cod_Metodo AND conto_bancario.Ref_Utente = metodo_pagamento.Ref_Utente AND conto_bancario.Ref_Metodo = metodo_pagamento.Cod_Metodo AND periodicita.Ref_Mittente ="+receivedPacket.cod_utente+" AND conto_bancario.Ref_Metodo = metodo_pagamento.Cod_Metodo";
        sqlConnection.query(sql, function(err, result){
            if(err){
                oggetto = {command: commands.TABLE_PERIODIC_PAYMENT_NOT_OK};
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
            else{
                oggetto = {command: commands.TABLE_PERIODIC_PAYMENT_OK, resultQuery: result};
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
        });
    },

    onPeriodicPaymentOnlineRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di compilazione tabella (periodicita con versamento)");
        var sql = "SELECT periodicita.Nome_Esercizio, periodicita.Importo, periodicita.Numero_giorni, periodicita.Giorni_rimanenti, periodicita.Numero_Pagamenti, periodicita.Importo_Totale, periodicita.Data_Avvio FROM periodicita, metodo_pagamento, conto_online WHERE periodicita.Ref_Mittente = metodo_pagamento.Ref_Utente AND periodicita.Ref_Metodo = metodo_pagamento.Cod_Metodo AND conto_online.Ref_Utente = metodo_pagamento.Ref_Utente AND conto_online.Ref_Metodo = metodo_pagamento.Cod_Metodo AND periodicita.Ref_Mittente ="+receivedPacket.cod_utente+" AND conto_online.Ref_Metodo = metodo_pagamento.Cod_Metodo";
        sqlConnection.query(sql, function(err, result){
            if(err){
                oggetto = {command: commands.TABLE_PERIODIC_PAYMENT_NOT_OK};
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
            else{
                oggetto = {command: commands.TABLE_PERIODIC_PAYMENT_OK, resultQuery: result};
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
        });
    },

    onDeletePeriodicPaymentCardRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di eliminazione periodicita(carta)");
        //ricavo il codice del metodo dalla carta
        var select_metodo = "SELECT Ref_Metodo FROM carta WHERE Codice = '"+receivedPacket.codice_carta+"'";
        sqlConnection.query(select_metodo, function(err_select, result_select){
            if(err_select) throw err_select;
            var metodo = result_select[0].Ref_Metodo;

            //ricavo l'importo che mi manca da pagare nella periodicita
            var sql = "SELECT * FROM periodicita WHERE Ref_Mittente = "+ receivedPacket.cod_utente+" AND Ref_Metodo = "+metodo;
            sqlConnection.query(sql, function(err, result){
                if(err) throw err;
                var nome_esercizio = result[0].Nome_Esercizio;
                var importo = result[0].Importo_Totale - result[0].Importo;
                
                var sql2 = "SELECT Saldo FROM carta WHERE Ref_Utente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+metodo;
                sqlConnection.query(sql2, function(err2, result2){
                    if(result2[0].Saldo > importo){
                        //faccio l'aggiornamento del saldo della carta
                        var update = "UPDATE carta SET Saldo = Saldo - "+importo+" WHERE Ref_Metodo = "+metodo+" AND Ref_Utente = "+receivedPacket.cod_utente;
                        sqlConnection.query(update, function(err3, result3){
                            if(err3) throw err3;
                        });
                        
                        var today = new Date();
                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                        //inserisco la transazione nella tebella pagamento
                        var insert = "INSERT INTO pagamento VALUES("+receivedPacket.cod_utente+", "+metodo+" , '"+nome_esercizio+"', "+importo+", '"+date+"', '"+time+"')";
                        sqlConnection.query(insert, function(err4, result4){
                            if(err4) throw err4;
                        });
                        //elimino da periodicita
                        var delete1 = "DELETE FROM periodicita WHERE Ref_Mittente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+metodo;
                        sqlConnection.query(delete1, function(err5, result5){
                            if(err5) throw err5;
                        });

                        oggetto = {command: commands.DELETE_PERIODIC_PAYMENT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        oggetto = {command: commands.DELETE_PERIODIC_PAYMENT_NOT_OK, message: "Credito insufficiente per stornare il pagamento"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }    
                });
            });
        });
    },

    onDeletePeriodicPaymentIbanRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di eliminazione periodicita(iban)");
        //ricavo il codice del metodo dalla carta
        var select_metodo = "SELECT Ref_Metodo FROM conto_bancario WHERE IBAN = '"+receivedPacket.iban+"'";
        sqlConnection.query(select_metodo, function(err_select, result_select){
        if(err_select) throw err_select;
        var metodo = result_select[0].Ref_Metodo;
    
        //ricavo l'importo che mi manca da pagare nella periodicita
        var sql = "SELECT * FROM periodicita WHERE Ref_Mittente = "+ receivedPacket.cod_utente+" AND Ref_Metodo = "+metodo;
            sqlConnection.query(sql, function(err, result){
                if(err) throw err;
                var nome_esercizio = result[0].Nome_Esercizio;
                var importo = result[0].Importo_Totale - result[0].Importo;
    
                var sql2 = "SELECT Saldo FROM conto_bancario WHERE Ref_Utente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+metodo;
                sqlConnection.query(sql2, function(err2, result2){
                    if(result2[0].Saldo > importo){
                        //faccio l'aggiornamento del saldo della carta
                        var update = "UPDATE conto_bancario SET Saldo = Saldo - "+importo+" WHERE Ref_Metodo = "+metodo+" AND Ref_Utente = "+receivedPacket.cod_utente;
                        sqlConnection.query(update, function(err3, result3){
                            if(err3) throw err3;
                        });
                        var today = new Date();
                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                        //inserisco la transazione nella tebella pagamento
                        var insert = "INSERT INTO pagamento VALUES("+receivedPacket.cod_utente+", "+metodo+" , '"+nome_esercizio+"', "+importo+", '"+date+"', '"+time+"')";
                        sqlConnection.query(insert, function(err4, result4){
                            if(err4) throw err4;
                        });
                        //elimino da periodicita
                        var delete1 = "DELETE FROM periodicita WHERE Ref_Mittente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+metodo;
                        sqlConnection.query(delete1, function(err5, result5){
                            if(err5) throw err5;
                        });
    
                        oggetto = {command: commands.DELETE_PERIODIC_PAYMENT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        oggetto = {command: commands.DELETE_PERIODIC_PAYMENT_NOT_OK, message: "Credito insufficiente per stornare il pagamento"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }              
                });
            });
        });
    },

    onDeletePeriodicPaymentOnlineRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di eliminazione periodicita(versamento)");
        //ricavo il codice del metodo dalla carta
        var select_metodo = "SELECT Ref_Metodo FROM conto_online WHERE Ref_Utente = '"+receivedPacket.cod_utente+"'";
        sqlConnection.query(select_metodo, function(err_select, result_select){
            if(err_select) throw err_select;
            var metodo = result_select[0].Ref_Metodo;
    
            //ricavo l'importo che mi manca da pagare nella periodicita
            var sql = "SELECT * FROM periodicita WHERE Ref_Mittente = "+ receivedPacket.cod_utente+" AND Ref_Metodo = "+metodo;
            sqlConnection.query(sql, function(err, result){
                if(err) throw err;
                var nome_esercizio = result[0].Nome_Esercizio;
                var importo = result[0].Importo_Totale - result[0].Importo;
    
                var sql2 = "SELECT Saldo FROM conto_online WHERE Ref_Utente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+metodo;
                sqlConnection.query(sql2, function(err2, result2){
                    if(result2[0].Saldo > importo){
                        //faccio l'aggiornamento del saldo della carta
                        var update = "UPDATE conto_online SET Saldo = Saldo - "+importo+" WHERE Ref_Metodo = "+metodo+" AND Ref_Utente = "+receivedPacket.cod_utente;
                        sqlConnection.query(update, function(err3, result3){
                            if(err3) throw err3;
                        });
                        var today = new Date();
                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                        //inserisco la transazione nella tebella pagamento
                        var insert = "INSERT INTO pagamento VALUES("+receivedPacket.cod_utente+", "+metodo+" , '"+nome_esercizio+"', "+importo+", '"+date+"', '"+time+"')";
                        sqlConnection.query(insert, function(err4, result4){
                            if(err4) throw err4;
                        });
                        //elimino da periodicita
                        var delete1 = "DELETE FROM periodicita WHERE Ref_Mittente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+metodo;
                        sqlConnection.query(delete1, function(err5, result5){
                            if(err5) throw err5;
                        });
    
                        oggetto = {command: commands.DELETE_PERIODIC_PAYMENT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        oggetto = {command: commands.DELETE_PERIODIC_PAYMENT_NOT_OK, message: "Credito insufficiente per stornare il pagamento"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });
            });
        });
    },

    onNumberOfPeriodicsRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di numero di periodicità esistenti");
        var select_metodo = "SELECT COUNT(*) as Totale FROM periodicita WHERE Ref_Mittente = "+receivedPacket.cod_utente;
        sqlConnection.query(select_metodo, function(err_select, result){
            if(err_select) throw err_select;
            var oggetto = {command: commands.NUMBRER_OF_PERIODICS, resultQuery: result[0].Totale};
            socketConnection.sendUTF(JSON.stringify(oggetto));
        });
    }
};