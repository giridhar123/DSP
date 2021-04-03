module.exports = {
    onShowTransactionCardRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di compilazione tabella dei movimenti(carta)");
        var sql1="SELECT nome_esercizio as Nome,importo as Importo,data as Data ,ora as Ora , c.codice as Codice FROM pagamento p,metodo_pagamento m,carta c WHERE p.Ref_Mittente = "+receivedPacket.cod_utente+" AND c.ref_utente= p.ref_mittente AND c.ref_utente=m.ref_utente AND c.ref_metodo=m.cod_metodo and m.cod_metodo=p.ref_metodo";
        var sql2="SELECT concat(u.nome,' ',u.cognome) as Nome,r.importo as Importo,t.data as Data,t.ora as Ora ,c.codice as Codice FROM richiesta r,transazione t,utente u,metodo_pagamento m,carta c WHERE (r.ref_mittente="+receivedPacket.cod_utente+") AND r.ref_mittente=m.ref_utente AND (r.cod_richiesta=t.ref_richiesta) and (r.cellulare_destinatario=u.cellulare OR r.email_destinatario=u.email) AND (c.ref_utente=m.ref_utente AND c.ref_metodo=m.cod_metodo) and (m.cod_metodo=r.ref_metodo) AND r.tipo='invio'";
        var sql_union1=sql1+" union "+sql2;
        var sql3 = "SELECT concat(u.nome,' ',u.cognome) as Nome,r.importo as Importo,t.data as Data,t.ora as Ora, c.Codice as codice FROM richiesta r,transazione t,utente u,metodo_pagamento m, carta c WHERE (r.cod_richiesta=t.ref_richiesta) AND (r.cellulare_destinatario='"+receivedPacket.cellulare+"') AND u.cod_utente=r.ref_mittente AND r.tipo='richiesta' AND m.ref_utente = "+receivedPacket.cod_utente+" AND c.ref_metodo = m.Cod_Metodo";
        var sql4 = "SELECT concat(u.nome,' ',u.cognome) as Nome,r.importo as Importo,t.data as Data,t.ora as Ora, c.Codice as codice FROM richiesta r,transazione t,utente u,metodo_pagamento m, carta c WHERE (r.cod_richiesta=t.ref_richiesta) AND (r.email_destinatario='"+receivedPacket.email+"') AND u.cod_utente=r.ref_mittente AND r.tipo='richiesta' AND m.ref_utente = "+receivedPacket.cod_utente+" AND c.ref_metodo = m.Cod_Metodo";
        var sql_union2=sql3 + " union " + sql4;
        var sql_tattico = sql_union1 + " union " + sql_union2;
        sqlConnection.query(sql_tattico, function(err, result){
            
           if (err)
                oggetto = {command: commands.SHOW_TRANSACTIONS_NOT_OK};
            else
                oggetto = {command: commands.SHOW_TRANSACTIONS_OK, resultQuery: result};
            
            socketConnection.sendUTF(JSON.stringify(oggetto));          
        });
    },

    onShowTransactionOnlineRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di compilazione tabella dei movimenti(online)");
        //traccio pagamenti con conto online
        var sql1="SELECT nome_esercizio as Nome,importo as Importo,data as Data ,ora as Ora FROM pagamento p,metodo_pagamento m,conto_online c WHERE p.Ref_Mittente = "+receivedPacket.cod_utente+" and c.ref_utente= p.ref_mittente AND c.ref_utente=m.ref_utente AND c.ref_metodo=m.cod_metodo and m.cod_metodo=p.ref_metodo";
        var sql2="SELECT concat(u.nome,' ',u.cognome) as Nome,r.importo as Importo,t.data as Data,t.ora as Ora FROM richiesta r,transazione t,utente u,metodo_pagamento m,conto_online c WHERE (r.cod_richiesta=t.ref_richiesta) AND (r.cellulare_destinatario=u.cellulare OR r.email_destinatario=u.email) AND (c.ref_utente=m.ref_utente AND c.ref_metodo=m.cod_metodo) AND m.cod_metodo=r.ref_metodo AND m.ref_utente=r.ref_mittente AND r.ref_mittente="+receivedPacket.cod_utente+" AND r.tipo='invio'";
        var sql_union1=sql1+" union "+sql2;
        var sql3 = "SELECT concat(u.nome,' ',u.cognome) as Nome,r.importo as Importo,t.data as Data,t.ora as Ora FROM richiesta r,transazione t,utente u,metodo_pagamento m, conto_online c WHERE (r.cod_richiesta=t.ref_richiesta) AND (r.cellulare_destinatario='"+receivedPacket.cellulare+"') AND u.cod_utente=r.ref_mittente AND r.tipo='richiesta' AND m.ref_utente = "+receivedPacket.cod_utente+" AND c.ref_metodo = m.Cod_Metodo";
        var sql4 = "SELECT concat(u.nome,' ',u.cognome) as Nome,r.importo as Importo,t.data as Data,t.ora as Ora FROM richiesta r,transazione t,utente u,metodo_pagamento m, conto_online c WHERE (r.cod_richiesta=t.ref_richiesta) AND (r.email_destinatario='"+receivedPacket.email+"') AND u.cod_utente=r.ref_mittente AND r.tipo='richiesta' AND m.ref_utente = "+receivedPacket.cod_utente+" AND c.ref_metodo = m.Cod_Metodo";
        var sql_union2=sql3 + " union " + sql4;
        var sql_tattico = sql_union1 + " union " + sql_union2;
        sqlConnection.query(sql_tattico, function(err, result){
            
            if (err)
                oggetto = {command: commands.SHOW_TRANSACTIONS_NOT_OK};
            else
                oggetto = {command: commands.SHOW_TRANSACTIONS_OK, resultQuery: result};

            socketConnection.sendUTF(JSON.stringify(oggetto));          
        });
    },

    onShowTransactionIbanRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di compilazione tabella dei movimenti(iban)");
        //traccio pagamenti con iban
        var sql1="SELECT nome_esercizio as Nome,importo as Importo,data as Data ,ora as Ora , c.iban as Codice FROM pagamento p,metodo_pagamento m,conto_bancario c WHERE p.Ref_Mittente = "+receivedPacket.cod_utente+" and c.ref_utente= p.ref_mittente AND c.ref_utente=m.ref_utente AND c.ref_metodo=m.cod_metodo and m.cod_metodo=p.ref_metodo";
        var sql2="SELECT concat(u.nome,' ',u.cognome) as Nome,r.importo as Importo,t.data as Data,t.ora as Ora ,c.iban as Codice FROM richiesta r,transazione t,utente u,metodo_pagamento m,conto_bancario c WHERE (r.ref_mittente="+receivedPacket.cod_utente+") AND (r.cod_richiesta=t.ref_richiesta) and (r.cellulare_destinatario=u.cellulare OR r.email_destinatario=u.email) AND (c.ref_utente=m.ref_utente AND c.ref_metodo=m.cod_metodo) and (m.cod_metodo=r.ref_metodo) AND m.ref_utente=r.ref_mittente AND r.tipo='invio'";
        var sql_union1=sql1+" union "+sql2;
        var sql3 = "SELECT concat(u.nome,' ',u.cognome) as Nome,r.importo as Importo,t.data as Data,t.ora as Ora, c.Iban as Codice FROM richiesta r,transazione t,utente u,metodo_pagamento m, conto_bancario c WHERE (r.cod_richiesta=t.ref_richiesta) AND (r.cellulare_destinatario='"+receivedPacket.cellulare+"') AND u.cod_utente=r.ref_mittente AND r.tipo='richiesta' AND m.ref_utente = "+receivedPacket.cod_utente+" AND c.ref_metodo = m.Cod_Metodo";
        var sql4 = "SELECT concat(u.nome,' ',u.cognome) as Nome,r.importo as Importo,t.data as Data,t.ora as Ora, c.Iban as Codice FROM richiesta r,transazione t,utente u,metodo_pagamento m, conto_bancario c WHERE (r.cod_richiesta=t.ref_richiesta) AND (r.email_destinatario='"+receivedPacket.email+"') AND u.cod_utente=r.ref_mittente AND r.tipo='richiesta' AND m.ref_utente = "+receivedPacket.cod_utente+" AND c.ref_metodo = m.Cod_Metodo";
        var sql_union2=sql3 + " union " + sql4;
        var sql_tattico = sql_union1 + " union " + sql_union2;
        sqlConnection.query(sql_tattico, function(err, result){
            
            if (err)
                oggetto = {command: commands.SHOW_TRANSACTIONS_NOT_OK};
            else
                oggetto = {command: commands.SHOW_TRANSACTIONS_OK, resultQuery: result};

            socketConnection.sendUTF(JSON.stringify(oggetto));
        });
    },


    onNumberOfTransactionRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        var oggetto;
        console.log("Ricevuta richiesta di numero totale di movimenti");
        //Numero di transazioni fatte con carte
        var sql="SELECT Count(*) as Totale FROM transazione, richiesta r, carta c WHERE Ref_Richiesta = Cod_Richiesta AND Ref_Mittente = " + receivedPacket.cod_utente + " AND r.Ref_Metodo = c.Ref_Metodo";
        sqlConnection.query(sql, function(err, result1){
            if (err) {
                oggetto = {command: commands.SHOW_TRANSACTIONS_NOT_OK};
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
            else {
                //Numero di transazioni fatte con CC
                sql="SELECT Count(*) as Totale FROM transazione, richiesta r, conto_bancario cb WHERE Ref_Richiesta = Cod_Richiesta AND Ref_Mittente = " + receivedPacket.cod_utente + " AND r.Ref_Metodo = cb.Ref_Metodo";
                sqlConnection.query(sql, function(err, result2){
                    if (err) {
                        oggetto = {command: commands.SHOW_TRANSACTIONS_NOT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else {
                        //Numero di transazioni fatte con conto online
                        sql="SELECT Count(*) as Totale FROM transazione, richiesta r, conto_online c WHERE Ref_Richiesta = Cod_Richiesta AND Ref_Mittente = " + receivedPacket.cod_utente + " AND r.Ref_Metodo = c.Ref_Metodo";
                        sqlConnection.query(sql, function(err, result3){
                            if (err) {
                                oggetto = {command: commands.SHOW_TRANSACTIONS_NOT_OK};
                                socketConnection.sendUTF(JSON.stringify(oggetto));
                            }
                            else {
                                //Numero di pagamenti fatte con carte
                                sql="SELECT Count(*) as Totale FROM pagamento p, carta c WHERE Ref_Mittente = " + receivedPacket.cod_utente + " AND p.Ref_Metodo = c.Ref_Metodo";
                                sqlConnection.query(sql, function(err, result4){
                                    if (err) {
                                        oggetto = {command: commands.SHOW_TRANSACTIONS_NOT_OK};
                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                    }
                                    else {
                                        //Numero di pagamenti fatte con cc
                                        sql="SELECT Count(*) as Totale FROM pagamento p, conto_bancario cb WHERE Ref_Mittente = " + receivedPacket.cod_utente + " AND p.Ref_Metodo = cb.Ref_Metodo";
                                        sqlConnection.query(sql, function(err, result5){
                                            if (err){
                                                oggetto = {command: commands.SHOW_TRANSACTIONS_NOT_OK};
                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                            }
                                                
                                            else{
                                                //Numero di pagamenti fatte con conto online
                                                sql="SELECT Count(*) as Totale FROM pagamento p, conto_online c WHERE Ref_Mittente = " + receivedPacket.cod_utente + " AND p.Ref_Metodo = c.Ref_Metodo";
                                                sqlConnection.query(sql, function(err, result6){
                                                    if (err){
                                                        oggetto = {command: commands.SHOW_TRANSACTIONS_NOT_OK};
                                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                                    }
                                                
                                                    else{
                                                        oggetto = {command: commands.NUMBER_OF_TRANSACTIONS, resultQuery: (result1[0].Totale + result2[0].Totale + result3[0].Totale + result4[0].Totale + result5[0].Totale + result6[0].Totale)};
                                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                                    }
                                                
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    },

    onShowTransactionAccreditCardRequest: function(commands, receivedPacket, sqlConnection, socketConnection){
        var oggetto;
        console.log("Ricevuta richiesta di compilazione tabella dei movimenti(carta acc)");
        var sql1 = "SELECT concat(u.nome, ' ', u.cognome) as Nome, r.importo as Importo, t.data as Data, t.ora as Ora, c.codice as Codice FROM richiesta r, transazione t, metodo_pagamento m, carta c, utente u WHERE r.ref_mittente = "+receivedPacket.cod_utente+" AND r.cod_richiesta = t.ref_richiesta AND r.tipo='richiesta' AND m.cod_metodo = r.ref_metodo AND m.ref_utente = r.ref_mittente AND m.cod_metodo = c.ref_metodo AND m.ref_utente = c.ref_utente AND r.email_destinatario = u.email";
        var sql2 = "SELECT concat(u.nome, ' ', u.cognome) as Nome, r.importo as Importo, t.data as Data, t.ora as Ora, c.codice as Codice FROM richiesta r, transazione t, metodo_pagamento m, carta c, utente u WHERE r.ref_mittente = "+receivedPacket.cod_utente+" AND r.cod_richiesta = t.ref_richiesta AND r.tipo='richiesta' AND m.cod_metodo = r.ref_metodo AND m.ref_utente = r.ref_mittente AND m.cod_metodo = c.ref_metodo AND m.ref_utente = c.ref_utente AND r.cellulare_destinatario = u.cellulare";
        var sql3 = "SELECT concat(mitt.Nome, ' ', mitt.Cognome) as Nome, r.importo as Importo, t.data as Data, t.ora as Ora, c.codice as Codice FROM transazione t, richiesta r, metodo_pagamento m, carta c, utente mitt, utente dest WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND r.email_destinatario = '"+receivedPacket.email+"' AND m.ref_utente = "+receivedPacket.cod_utente+"  AND mitt.Cod_Utente = r.Ref_Mittente AND r.Email_Destinatario = dest.Email AND m.cod_metodo = c.ref_metodo AND m.ref_utente = c.ref_utente";
        var sql4 = "SELECT concat(mitt.Nome, ' ', mitt.Cognome) as Nome, r.importo as Importo, t.data as Data, t.ora as Ora, c.codice as Codice FROM transazione t, richiesta r, metodo_pagamento m, carta c, utente mitt, utente dest WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND r.cellulare_destinatario = '"+receivedPacket.cellulare+"' AND m.ref_utente = "+receivedPacket.cod_utente+" AND mitt.Cod_Utente = r.Ref_Mittente AND r.cellulare_destinatario = dest.cellulare AND m.cod_metodo = c.ref_metodo AND m.ref_utente = c.ref_utente";
        var sql_union = sql1 + " union " + sql2 + " union " + sql3+ " union " + sql4;
        sqlConnection.query(sql_union, function(err, result){
            
            if (err)
                oggetto = {command: commands.SHOW_TRANSACTIONS_NOT_OK};
            else
                oggetto = {command: commands.SHOW_TRANSACTIONS_OK, resultQuery: result};

            socketConnection.sendUTF(JSON.stringify(oggetto));
        });
    },

    onShowTransactionAccreditIbanRequest: function(commands, receivedPacket, sqlConnection, socketConnection){
        var oggetto;
        console.log("Ricevuta richiesta di compilazione tabella dei movimenti(iban acc)");
        var sql1 = "SELECT concat(u.nome, ' ', u.cognome) as Nome, r.importo as Importo, t.data as Data, t.ora as Ora, c.iban as Codice FROM richiesta r, transazione t, metodo_pagamento m, conto_bancario c, utente u WHERE r.ref_mittente = "+receivedPacket.cod_utente+" AND r.cod_richiesta = t.ref_richiesta AND r.tipo='richiesta' AND m.cod_metodo = r.ref_metodo AND m.ref_utente = r.ref_mittente AND m.cod_metodo = c.ref_metodo AND m.ref_utente = c.ref_utente AND r.email_destinatario = u.email";
        var sql2 = "SELECT concat(u.nome, ' ', u.cognome) as Nome, r.importo as Importo, t.data as Data, t.ora as Ora, c.iban as Codice FROM richiesta r, transazione t, metodo_pagamento m, conto_bancario c, utente u WHERE r.ref_mittente = "+receivedPacket.cod_utente+" AND r.cod_richiesta = t.ref_richiesta AND r.tipo='richiesta' AND m.cod_metodo = r.ref_metodo AND m.ref_utente = r.ref_mittente AND m.cod_metodo = c.ref_metodo AND m.ref_utente = c.ref_utente AND r.cellulare_destinatario = u.cellulare";
        var sql3 = "SELECT concat(mitt.Nome, ' ', mitt.Cognome) as Nome, r.importo as Importo, t.data as Data, t.ora as Ora, c.iban as Codice FROM transazione t, richiesta r, metodo_pagamento m, conto_bancario c, utente mitt, utente dest WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND r.email_destinatario = '"+receivedPacket.email+"' AND m.ref_utente = "+receivedPacket.cod_utente+"  AND mitt.Cod_Utente = r.Ref_Mittente AND r.Email_Destinatario = dest.Email AND m.cod_metodo = c.ref_metodo AND m.ref_utente = c.ref_utente";
        var sql4 = "SELECT concat(mitt.Nome, ' ', mitt.Cognome) as Nome, r.importo as Importo, t.data as Data, t.ora as Ora, c.iban as Codice FROM transazione t, richiesta r, metodo_pagamento m, conto_bancario c, utente mitt, utente dest WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND r.cellulare_destinatario = '"+receivedPacket.cellulare+"' AND m.ref_utente = "+receivedPacket.cod_utente+" AND mitt.Cod_Utente = r.Ref_Mittente AND r.cellulare_destinatario = dest.cellulare AND m.cod_metodo = c.ref_metodo AND m.ref_utente = c.ref_utente";
        var sql_union = sql1 + " union " + sql2 + " union " + sql3 + " union " + sql4;
        sqlConnection.query(sql_union, function(err, result){
            
            if (err)
                oggetto = {command: commands.SHOW_TRANSACTIONS_NOT_OK};
            else
                oggetto = {command: commands.SHOW_TRANSACTIONS_OK, resultQuery: result};

            socketConnection.sendUTF(JSON.stringify(oggetto));
        });
    },

    onShowTransactionAccreditOnlineRequest: function(commands, receivedPacket, sqlConnection, socketConnection){
        var oggetto;
        console.log("Ricevuta richiesta di compilazione tabella dei movimenti(versamenti acc)");
        var sql1 = "SELECT concat(u.nome, ' ', u.cognome) as Nome, r.importo as Importo, t.data as Data, t.ora as Ora FROM richiesta r, transazione t, metodo_pagamento m, conto_online c, utente u WHERE r.ref_mittente = "+receivedPacket.cod_utente+" AND r.cod_richiesta = t.ref_richiesta AND r.tipo='richiesta' AND m.cod_metodo = r.ref_metodo AND m.ref_utente = r.ref_mittente AND m.cod_metodo = c.ref_metodo AND m.ref_utente = c.ref_utente  AND r.email_destinatario = u.email";
        var sql2 = "SELECT concat(u.nome, ' ', u.cognome) as Nome, r.importo as Importo, t.data as Data, t.ora as Ora FROM richiesta r, transazione t, metodo_pagamento m, conto_online c, utente u WHERE r.ref_mittente = "+receivedPacket.cod_utente+" AND r.cod_richiesta = t.ref_richiesta AND r.tipo='richiesta' AND m.cod_metodo = r.ref_metodo AND m.ref_utente = r.ref_mittente AND m.cod_metodo = c.ref_metodo AND m.ref_utente = c.ref_utente  AND r.cellulare_destinatario = u.cellulare";
        var sql3 = "SELECT concat(mitt.Nome, ' ', mitt.Cognome) as Nome, r.importo as Importo, t.data as Data, t.ora as Ora FROM transazione t, richiesta r, metodo_pagamento m, utente mitt, utente dest, conto_online c WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND r.email_destinatario = '"+receivedPacket.email+"' AND m.ref_utente = "+receivedPacket.cod_utente+"  AND mitt.Cod_Utente = r.Ref_Mittente AND r.Email_Destinatario = dest.Email AND m.cod_metodo = c.ref_metodo AND m.ref_utente = c.ref_utente";
        var sql4 = "SELECT concat(mitt.Nome, ' ', mitt.Cognome) as Nome, r.importo as Importo, t.data as Data, t.ora as Ora FROM transazione t, richiesta r, metodo_pagamento m, utente mitt, utente dest, conto_online c WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND r.cellulare_destinatario = '"+receivedPacket.cellulare+"' AND m.ref_utente = "+receivedPacket.cod_utente+" AND mitt.Cod_Utente = r.Ref_Mittente AND r.cellulare_destinatario = dest.cellulare AND m.cod_metodo = c.ref_metodo AND m.ref_utente = c.ref_utente";
        var sql_union = sql1 + " union " + sql2 + " union " + sql3 + " union " + sql4;
        sqlConnection.query(sql_union, function(err, result){
            
            if (err)
                oggetto = {command: commands.SHOW_TRANSACTIONS_NOT_OK};
            else
                oggetto = {command: commands.SHOW_TRANSACTIONS_OK, resultQuery: result};

            socketConnection.sendUTF(JSON.stringify(oggetto));
        });
    },
};