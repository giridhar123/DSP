var checkHandler = require('./checkHandler');

module.exports = {
    onTableCardFillRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di compilazione tabella (carte)");
        var sql = "SELECT carta.Codice, carta.Scadenza, carta.CVV, carta.IBAN, carta.Saldo, metodo_pagamento.Di_Default FROM carta, metodo_pagamento  WHERE metodo_pagamento.Ref_Utente ='"+receivedPacket.cod_utente+"' AND metodo_pagamento.Ref_Utente = carta.Ref_Utente AND carta.Ref_Metodo = metodo_pagamento.Cod_Metodo";
        sqlConnection.query(sql, function(err, result){
            if (err)
                oggetto = {command: commands.TABLE_FILL_NOT_OK};
            else
                oggetto = {command: commands.TABLE_FILL_OK, resultQuery: result};
                
            socketConnection.sendUTF(JSON.stringify(oggetto));          
        });
    },

    onTableIbanFillRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di compilazione tabella (iban)");
        var sql = "SELECT conto_bancario.IBAN, conto_bancario.Saldo, metodo_pagamento.Di_Default FROM conto_bancario, metodo_pagamento  WHERE metodo_pagamento.Ref_Utente ='"+receivedPacket.cod_utente+"' AND metodo_pagamento.Ref_Utente = conto_bancario.Ref_Utente AND conto_bancario.Ref_Metodo = metodo_pagamento.Cod_Metodo";
        sqlConnection.query(sql, function(err, result){
            if (err)
                oggetto = {command: commands.TABLE_FILL_NOT_OK};
            else
                oggetto = {command: commands.TABLE_FILL_OK, resultQuery: result};
            
                socketConnection.sendUTF(JSON.stringify(oggetto));
        });
    },

    onTableOnlineFillRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di compilazione tabella (versamenti)");
        var sql = "SELECT conto_online.Saldo, metodo_pagamento.Di_Default FROM conto_online, metodo_pagamento  WHERE metodo_pagamento.Ref_Utente ='"+receivedPacket.cod_utente+"' AND metodo_pagamento.Ref_Utente = conto_online.Ref_Utente AND conto_online.Ref_Metodo = metodo_pagamento.Cod_Metodo";
        sqlConnection.query(sql, function(err, result){
            if (err)
                oggetto = {command: commands.TABLE_FILL_NOT_OK};
            else
                oggetto = {command: commands.TABLE_FILL_OK, resultQuery: result};
            
                socketConnection.sendUTF(JSON.stringify(oggetto));            
        });
    },

    onInsertCardRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di inserimento carta");
        //Controllo se non esiste un'altra carta con lo stesso codice per lo stesso utente
        var select = "SELECT COUNT(*) as Totale FROM carta WHERE codice = '" + receivedPacket.cod_carta +"' AND Ref_Utente = '"+receivedPacket.cod_utente+"'";
        sqlConnection.query(select, function(err, result){
            if (err) throw err;
            else {
                if (result[0].Totale == 0) {
                    select = "SELECT MAX(Cod_Metodo) as massimo FROM metodo_pagamento WHERE Ref_Utente ='"+receivedPacket.cod_utente+"'";
                    sqlConnection.query(select, function(err, result){
                        if (err) throw err;
                        //se è il primo metodo di pagamento inserito va di default
                        var primo = "SELECT COUNT(*) AS numero FROM metodo_pagamento WHERE Ref_Utente = '"+receivedPacket.cod_utente+"'";
                        sqlConnection.query(primo, function(err_primo, result_primo){
                            if(err_primo) throw err_primo;
                            var metodo_default = 0;
                            if(result_primo[0].numero == 0)
                                metodo_default = 1;

                            var refMetodo = result[0].massimo +1;
                            //insert in metodo pagamento
                            var insertMetodo = "INSERT INTO metodo_pagamento VALUES("+receivedPacket.cod_utente+", "+refMetodo+", "+metodo_default+", 'Carta')";
                            sqlConnection.query(insertMetodo, function(err3, result3){
                                if(err3) throw err3;
                            });
                            //insert in limite spesa
                            var insertLimite = "INSERT INTO limite_spesa VALUES("+receivedPacket.cod_utente+", "+refMetodo+", '500', 'G'), ("+receivedPacket.cod_utente+", "+refMetodo+", '1500', 'M')";
                            sqlConnection.query(insertLimite, function(err_limite, result_limite){
                                if(err_limite) throw err_limite;
                            });
                            var saldo = (Math.random()*1000).toFixed(2);
                            //insert in carta
                            var insertCarta = "INSERT INTO carta VALUES("+receivedPacket.cod_utente+",  "+refMetodo+", "+receivedPacket.cod_carta+", '"+receivedPacket.scadenza+"', "+receivedPacket.cvv+", "+saldo+", '"+receivedPacket.iban +"')";
                            sqlConnection.query(insertCarta, function(err2, result2){          
                                if (err2) {
                                    oggetto = {command: commands.INSERT_CARD_NOT_OK};
                                    throw err2;
                                }
                                else
                                    oggetto = {command: commands.INSERT_CARD_OK};
                                
                                socketConnection.sendUTF(JSON.stringify(oggetto));                
                            });
                                
                        });
                    });
                }
                else {
                    oggetto = {command: commands.INSERT_CARD_NOT_OK};
                    socketConnection.sendUTF(JSON.stringify(oggetto));
                }
            }
        });
    },

    onInsertIbanRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di inserimento iban");
        var select = "SELECT MAX(Cod_Metodo) as massimo FROM metodo_pagamento WHERE Ref_Utente ='"+receivedPacket.cod_utente+"'";
        sqlConnection.query(select, function(err, result){
            if (err) throw err;
            //se è il primo metodo di pagamento inserito va di default
            var primo = "SELECT COUNT(*) AS numero FROM metodo_pagamento WHERE Ref_Utente = '"+receivedPacket.cod_utente+"'";
            sqlConnection.query(primo, function(err_primo, result_primo){
                if(err_primo) throw err_primo;
                var metodo_default = 0;
                if(result_primo[0].numero == 0)
                    metodo_default = 1;

                var refMetodo = result[0].massimo +1;
                //insert in metodo pagamento
                var insertMetodo = "INSERT INTO metodo_pagamento VALUES("+receivedPacket.cod_utente+", "+refMetodo+", "+metodo_default+", 'IBAN')";
                sqlConnection.query(insertMetodo, function(err3, result3){
                    if(err3) throw err3;
                });
                //insert in limite spesa
                var insertLimite = "INSERT INTO limite_spesa VALUES("+receivedPacket.cod_utente+", "+refMetodo+", '500', 'G'), ("+receivedPacket.cod_utente+", "+refMetodo+", '1500', 'M')";
                sqlConnection.query(insertLimite, function(err_limite, result_limite){
                    if(err_limite) throw err_limite;
                });
                var saldo = (Math.random()*1000).toFixed(2);
                
                //insert in conto bancario
                var insertConto = "INSERT INTO conto_bancario VALUES("+receivedPacket.cod_utente+", "+refMetodo+", '"+receivedPacket.iban +"', "+saldo+")";
                sqlConnection.query(insertConto, function(err2, result2){          
                    if (err2)
                        oggetto = {command: commands.INSERT_IBAN_NOT_OK};
                    else
                        oggetto = {command: commands.INSERT_IBAN_OK};    
                        socketConnection.sendUTF(JSON.stringify(oggetto));            
                });
            });
        });
    },

    onRechargeOnlineRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di versamento");
        if (receivedPacket.metodo == "Carta") {
            sql = "SELECT Ref_Metodo FROM carta WHERE Codice = '" + receivedPacket.cod + "' AND Ref_Utente = "+receivedPacket.cod_utente;
            sql2 = "UPDATE carta SET Saldo = (Saldo - " + receivedPacket.saldo + ") WHERE Codice = '" + receivedPacket.cod + "' AND Ref_Utente = "+receivedPacket.cod_utente;
        }
        else if (receivedPacket.metodo == "IBAN") {
            sql = "SELECT Ref_Metodo FROM conto_bancario WHERE IBAN = '" + receivedPacket.cod + "'";
            sql2 = "UPDATE conto_bancario SET Saldo = (Saldo - " + receivedPacket.saldo + ") WHERE IBAN = '" + receivedPacket.cod + "' AND Ref_Utente = "+receivedPacket.cod_utente;
        }

        sqlConnection.query(sql, function(err2, result2){  
            if (err2) {
                oggetto = {command: commands.RECHARGE_ONLINE_NOT_OK};
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
            else {
                var codiceMetodo = result2[0].Ref_Metodo;

                //controllo se il saldo è maggiore dell'importo
                checkHandler.oncheckSaldo(codiceMetodo, receivedPacket.cod_utente, receivedPacket.metodo, receivedPacket.saldo,sqlConnection,function(data_saldo){
                    if(data_saldo){
                        //controllo se sono stati superati i limiti spesa
                        checkHandler.oncheckLimiti(codiceMetodo, receivedPacket.cod_utente, receivedPacket.saldo,sqlConnection,function(data_limiti){
                            if(data_limiti){
                                sqlConnection.query(sql2, function(err2, result2){  
                                    if (err2) {
                                        oggetto = {command: commands.RECHARGE_ONLINE_NOT_OK, error: "Errore nell'aggioamento del saldo"};
                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                    }
                                    else {
                                        var today = new Date();
                                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                        var insert = "INSERT INTO pagamento VALUES ("+receivedPacket.cod_utente+", "+codiceMetodo+", 'Ricarica conto Online', "+ receivedPacket.saldo + ", '"+date+"', '"+time+"')";
                                        sqlConnection.query(insert, function(err_insert, result_insert){  
                                            if (err_insert)
                                                oggetto = {command: commands.RECHARGE_ONLINE_NOT_OK, error: "Errore nel pagamento"};
                                            else
                                                oggetto = {command: commands.RECHARGE_ONLINE_OK};
                                                
                                            socketConnection.sendUTF(JSON.stringify(oggetto));
                                        });
                                        //update saldo del conto online
                                        var update = "UPDATE conto_online SET Saldo = Saldo + "+receivedPacket.saldo+" WHERE Ref_Utente = '"+receivedPacket.cod_utente+"'";
                                        sqlConnection.query(update, function(err_update, result_update){  
                                            if (err_update) {
                                                oggetto = {command: commands.RECHARGE_ONLINE_NOT_OK, error: "Errore nell'aggiornamento del saldo"};
                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                            }
                                            else
                                                oggetto = {command: commands.RECHARGE_ONLINE_OK};
                                            
                                        });
                                    }
                                });
                            }
                            else {
                                oggetto = {command: commands.RECHARGE_ONLINE_NOT_OK, error: "Limiti spesa superati"};
                                socketConnection.sendUTF(JSON.stringify(oggetto));
                            }  
                            
                        });
                    }
                    else{
                        oggetto = {command: commands.RECHARGE_ONLINE_NOT_OK, error: "Saldo insufficiente"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });
                
            }
        });
    },

    onDefaultCardRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di carta di default");
        var select = "SELECT Ref_Metodo FROM carta WHERE Codice = '"+ receivedPacket.cod_carta+"' AND Ref_Utente = "+receivedPacket.cod_utente;
        sqlConnection.query(select, function(err1, result1){
            if (err1) throw err1;
            else{
                var sql2 = "UPDATE metodo_pagamento SET Di_Default = CASE WHEN Cod_Metodo = "+ result1[0].Ref_Metodo+ " THEN 1 WHEN Cod_Metodo <> "+ result1[0].Ref_Metodo+ " THEN 0 END WHERE Ref_Utente = "+receivedPacket.cod_utente;
                sqlConnection.query(sql2, function(err2, result2){
                    if (err2)
                        oggetto = {command: commands.DEFAULT_METHOD_NOT_OK};
                    else
                        oggetto = {command: commands.DEFAULT_METHOD_OK};

                    socketConnection.sendUTF(JSON.stringify(oggetto));
                });
            }
        });
    },

    onDefaultIbanRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di iban di default");
        var select = "SELECT Ref_Metodo FROM conto_bancario WHERE IBAN = '"+ receivedPacket.iban+"' AND Ref_Utente = "+receivedPacket.cod_utente;
        sqlConnection.query(select, function(err1, result1){
            if (err1) throw err1;
            else{
                var sql2 = "UPDATE metodo_pagamento SET Di_Default = CASE WHEN Cod_Metodo = "+ result1[0].Ref_Metodo+ " THEN 1 WHEN Cod_Metodo <> "+ result1[0].Ref_Metodo+ " THEN 0 END WHERE Ref_Utente = "+receivedPacket.cod_utente;
                sqlConnection.query(sql2, function(err2, result2){
                    if (err2)
                        oggetto = {command: commands.DEFAULT_METHOD_NOT_OK};
                    else
                        oggetto = {command: commands.DEFAULT_METHOD_OK};
                    
                    socketConnection.sendUTF(JSON.stringify(oggetto));
                });
            }
        });
    },

    onDefaultOnlineRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di conto online di default");
        var sql = "SELECT Ref_Metodo FROM conto_online WHERE Ref_Utente = "+ receivedPacket.cod_utente;
        sqlConnection.query(sql, function(err, result1){
            if (err){
                oggetto = {command: commands.DELETE_METHOD_NOT_OK};
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
            else{
                var sql2 = "UPDATE metodo_pagamento SET Di_Default = CASE WHEN Cod_Metodo = "+ result1[0].Ref_Metodo+ " THEN 1 WHEN Cod_Metodo <> "+ result1[0].Ref_Metodo+ " THEN 0 END WHERE Ref_Utente = "+receivedPacket.cod_utente;
                sqlConnection.query(sql2, function(err2, result2){
                    if (err2){
                        oggetto = {command: commands.DELETE_METHOD_NOT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        oggetto = {command: commands.DELETE_METHOD_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });            
            }
        });
    },


    onSetLimitCardRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di settaggio limiti(carta)");
        var select = "SELECT Ref_Metodo FROM carta WHERE Codice = '"+ receivedPacket.codice+"' AND Ref_Utente = "+receivedPacket.cod_utente;
        sqlConnection.query(select, function(err1, result1){
            if (err1) throw err1;
            else{
                var sql = "SELECT limite_spesa.tipo, limite_spesa.limite FROM limite_spesa, metodo_pagamento WHERE metodo_pagamento.Ref_Utente=limite_spesa.Ref_Utente AND metodo_pagamento.Cod_Metodo=limite_spesa.Ref_Metodo AND metodo_pagamento.Ref_Utente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+result1[0].Ref_Metodo;
                sqlConnection.query(sql, function(err, result){
                    if(err){
                        oggetto = {command: commands.SET_LIMIT_NOT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        oggetto = {command: commands.SET_LIMIT_OK, resultQuery: result};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });
            }
        });
    },

    onSetLimitIbanRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di settaggio limiti(iban)");
        var select = "SELECT Ref_Metodo FROM conto_bancario WHERE Iban = '"+ receivedPacket.iban+"' AND Ref_Utente = "+receivedPacket.cod_utente;
        sqlConnection.query(select, function(err1, result1){
            if (err1) throw err1;
            else{
                var sql = "SELECT limite_spesa.tipo, limite_spesa.limite FROM limite_spesa, metodo_pagamento WHERE metodo_pagamento.Ref_Utente=limite_spesa.Ref_Utente AND metodo_pagamento.Cod_Metodo=limite_spesa.Ref_Metodo AND metodo_pagamento.Ref_Utente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+result1[0].Ref_Metodo;
                sqlConnection.query(sql, function(err, result){
                    if(err){
                        oggetto = {command: commands.SET_LIMIT_NOT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        oggetto = {command: commands.SET_LIMIT_OK, resultQuery: result};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });
            }
        });
    },

    onSetLimitOnlineRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di settaggio limiti(online)");
        var select = "SELECT Ref_Metodo FROM conto_online WHERE Ref_Utente = '"+ receivedPacket.cod_utente+"'";
        sqlConnection.query(select, function(err1, result1){
            if (err1) throw err1;
            else{
                var sql = "SELECT limite_spesa.tipo, limite_spesa.limite FROM limite_spesa, metodo_pagamento WHERE metodo_pagamento.Ref_Utente=limite_spesa.Ref_Utente AND metodo_pagamento.Cod_Metodo=limite_spesa.Ref_Metodo AND metodo_pagamento.Ref_Utente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+result1[0].Ref_Metodo;
                sqlConnection.query(sql, function(err, result){
                    if(err){
                        oggetto = {command: commands.SET_LIMIT_NOT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        oggetto = {command: commands.SET_LIMIT_OK, resultQuery: result};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });
            }
        });
    },

    onUpdateLimitCardRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di modifica limiti(carta)");
        var select = "SELECT Ref_Metodo FROM carta WHERE Codice = '"+ receivedPacket.codice+"' AND Ref_Utente = "+receivedPacket.cod_utente;
        sqlConnection.query(select, function(err1, result1){
            if (err1) throw err1;
            else{
                var sql = "UPDATE limite_spesa SET limite = "+receivedPacket.giornaliero +" WHERE Ref_Utente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+result1[0].Ref_Metodo+ " AND Tipo = 'G'";
                sqlConnection.query(sql, function(err, result){
                    if(err){
                        oggetto = {command: commands.UPDATE_LIMIT_NOT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });
                var sql = "UPDATE limite_spesa SET limite = "+receivedPacket.mensile +" WHERE Ref_Utente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+result1[0].Ref_Metodo+ " AND Tipo = 'M'";
                sqlConnection.query(sql, function(err, result){
                    if(err){
                        oggetto = {command: commands.UPDATE_LIMIT_NOT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        oggetto = {command: commands.UPDATE_LIMIT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });
                
            }
        });
    },

    onUpdateLimitIbanRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di modifica limiti(iban)");
        var select = "SELECT Ref_Metodo FROM conto_bancario WHERE Iban = '"+ receivedPacket.iban+"' AND Ref_Utente = "+receivedPacket.cod_utente;
        sqlConnection.query(select, function(err1, result1){
            if (err1) throw err1;
            else{
                var sql = "UPDATE limite_spesa SET limite = "+receivedPacket.giornaliero +" WHERE Ref_Utente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+result1[0].Ref_Metodo+ " AND Tipo = 'G'";
                sqlConnection.query(sql, function(err, result){
                    if(err){
                        oggetto = {command: commands.UPDATE_LIMIT_NOT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });
                var sql = "UPDATE limite_spesa SET limite = "+receivedPacket.mensile +" WHERE Ref_Utente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+result1[0].Ref_Metodo+ " AND Tipo = 'M'";
                sqlConnection.query(sql, function(err, result){
                    if(err){
                        oggetto = {command: commands.UPDATE_LIMIT_NOT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        oggetto = {command: commands.UPDATE_LIMIT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });
                
            }
        });
    },
    onUpdateLimitOnlineRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di modifica limiti(carta)");
        var select = "SELECT Ref_Metodo FROM conto_online WHERE Ref_Utente = "+receivedPacket.cod_utente;
        sqlConnection.query(select, function(err1, result1){
            if (err1) throw err1;
            else{
                var sql = "UPDATE limite_spesa SET limite = "+receivedPacket.giornaliero +" WHERE Ref_Utente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+result1[0].Ref_Metodo+ " AND Tipo = 'G'";
                sqlConnection.query(sql, function(err, result){
                    if(err){
                        oggetto = {command: commands.UPDATE_LIMIT_NOT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });
                var sql = "UPDATE limite_spesa SET limite = "+receivedPacket.mensile +" WHERE Ref_Utente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+result1[0].Ref_Metodo+ " AND Tipo = 'M'";
                sqlConnection.query(sql, function(err, result){
                    if(err){
                        oggetto = {command: commands.UPDATE_LIMIT_NOT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        oggetto = {command: commands.UPDATE_LIMIT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });
                
            }
        });
    },

};
