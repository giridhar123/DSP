var checkHandler = require('./checkHandler');
module.exports = {
    onPaymentShopRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di pagamento esercizio commerciale");

        if(receivedPacket.metodo_pagamento == "Carta"){
            var sql = "SELECT Ref_Metodo FROM carta WHERE Codice = '"+receivedPacket.codice+"' AND Ref_Utente="+receivedPacket.cod_utente;
            sqlConnection.query(sql, function(err, result){
                //controllo se il saldo è maggiore dell'importo
                checkHandler.oncheckSaldo(result[0].Ref_Metodo, receivedPacket.cod_utente, "Carta", receivedPacket.importo,sqlConnection,function(data_saldo){
                    if(data_saldo){
                        //controllo se sono stati superati i limiti spesa
                        checkHandler.oncheckLimiti(result[0].Ref_Metodo, receivedPacket.cod_utente, receivedPacket.importo,sqlConnection,function(data_limiti){
                            if(data_limiti){
                                //faccio l'aggiornamento dell'importo della carta
                                var update = "UPDATE carta SET Saldo = Saldo - "+receivedPacket.importo +" WHERE Codice = "+ receivedPacket.codice;
                                sqlConnection.query(update, function(err2, result2){
                                    if(err2){
                                        oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, error: "Errore nel pagamento con CARTA"};
                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                    }
                                    else{
                                        var today = new Date();
                                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                        //inserisco la transazione nella tebella pagamento
                                        var insert = "INSERT INTO pagamento VALUES("+receivedPacket.cod_utente+", "+ result[0].Ref_Metodo+" , '"+ receivedPacket.nome_esercizio+"', "+ receivedPacket.importo+", '"+date+"', '"+time+"' )";
                                        sqlConnection.query(insert, function(err3, result3){
                                            if(err3){
                                                oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, error: "Errore nel pagamento"};
                                                connection.sendUTF(JSON.stringify(oggetto));
                                            }
                                            else{
                                                oggetto = {command: commands.PAYMENT_SHOP_OK};
                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                            }
                                        });
                                    }
                                });
                            }
                            else{
                                oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, error: "Limiti spesa superati"};
                                socketConnection.sendUTF(JSON.stringify(oggetto));
                            }
                        });
                    }
        
                    else{
                        oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, error: "Credito insufficiente"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }  
                });
            });
        }

        else if(receivedPacket.metodo_pagamento=="IBAN"){
            var sql = "SELECT Ref_Metodo FROM conto_bancario WHERE IBAN = '"+receivedPacket.codice+"' AND Ref_Utente="+receivedPacket.cod_utente;
            sqlConnection.query(sql, function(err, result){
                //controllo se il saldo è maggiore dell'importo
                checkHandler.oncheckSaldo(result[0].Ref_Metodo, receivedPacket.cod_utente, "IBAN", receivedPacket.importo,sqlConnection,function(data_saldo){
                    if(data_saldo){
                        //controllo se sono stati superati i limiti spesa
                        checkHandler.oncheckLimiti(result[0].Ref_Metodo, receivedPacket.cod_utente, receivedPacket.importo,sqlConnection,function(data_limiti){
                            if(data_limiti){
                                //faccio l'aggiornamento dell'importo dell'iban
                                var update = "UPDATE conto_bancario SET Saldo = Saldo - "+receivedPacket.importo +" WHERE IBAN = '"+receivedPacket.codice+"' AND Ref_Utente="+receivedPacket.cod_utente;
                                sqlConnection.query(update, function(err2, result2){
                                    if(err2){
                                        oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, error: "Errore nel pagamento con IBAN"};
                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                    }
                                    else{
                                        var today = new Date();
                                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                        //inserisco la transazione nella tabella pagamento
                                        var insert = "INSERT INTO pagamento VALUES("+receivedPacket.cod_utente+", "+ result[0].Ref_Metodo+" , '"+ receivedPacket.nome_esercizio+"', "+ receivedPacket.importo+", '"+date+"', '"+time+"')";
                                        sqlConnection.query(insert, function(err3, result3){
                                            if(err3){
                                                oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, error: "Errore nell'inserire con IBAN"};
                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                            }
                                            else{
                                                oggetto = {command: commands.PAYMENT_SHOP_OK};
                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                            }
                                        });
                                    }
                                });
                            }
                            else{
                                oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, error: "Limiti spesa superati"};
                                socketConnection.sendUTF(JSON.stringify(oggetto));
                            }
                        });
                    }
        
                    else{
                        oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, error: "Credito insufficiente"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }  
                        
                    
                });
            });
        }

        else if(receivedPacket.metodo_pagamento=="ONLINE"){
            var sql = "SELECT Ref_Metodo FROM conto_online WHERE Ref_Utente="+receivedPacket.cod_utente;
            sqlConnection.query(sql, function(err, result){
                //controllo se il saldo è maggiore dell'importo
                checkHandler.oncheckSaldo(result[0].Ref_Metodo, receivedPacket.cod_utente, "ONLINE", receivedPacket.importo,sqlConnection,function(data_saldo){
                    if(data_saldo){
                        //controllo se sono stati superati i limiti spesa
                        checkHandler.oncheckLimiti(result[0].Ref_Metodo, receivedPacket.cod_utente, receivedPacket.importo,sqlConnection,function(data_limiti){
                            if(data_limiti){
                                //faccio l'aggiornamento dell'importo della carta
                                var update = "UPDATE conto_online SET Saldo = Saldo - "+receivedPacket.importo +" WHERE Ref_Utente = "+ receivedPacket.cod_utente;
                                sqlConnection.query(update, function(err2, result2){
                                    if(err2){
                                        oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, error: "Errore nel pagamento con CONTO ONLINE"};
                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                    }
                                    else{
                                        var today = new Date();
                                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                        //inserisco la transazione nella tebella pagamento
                                        var insert = "INSERT INTO pagamento VALUES("+receivedPacket.cod_utente+", "+ result[0].Ref_Metodo +" , '"+ receivedPacket.nome_esercizio+"', "+ receivedPacket.importo+", '"+date+"', '"+time+"')";
                                        sqlConnection.query(insert, function(err3, result3){
                                            if(err3){
                                                oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, error: "Errore nell'inserimento con CONTO ONLINE"};
                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                            }
                                            else{
                                                oggetto = {command: commands.PAYMENT_SHOP_OK};
                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                            }
                                        });
                                    }
                                });
                                
                            }
                            else{
                                oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, error: "Limiti spesa superati"};
                                socketConnection.sendUTF(JSON.stringify(oggetto));
                            }
                        });
                    }
            
                    else{
                        oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, error: "Credito insufficiente"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }  
                });
            });
        }
    },

    
    onSendMoneyRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta sendMoney");
        //modify
        var tel=receivedPacket.cellulare;
        var email=receivedPacket.email;
        var cod_richiesta=receivedPacket.cod_richiesta;
        var query="SELECT m.Tipo,r.Ref_Metodo,r.Ref_Mittente,r.Importo FROM metodo_pagamento m, richiesta r WHERE r.cod_richiesta="+cod_richiesta+" AND r.ref_metodo=m.cod_metodo AND m.ref_utente=r.ref_mittente";
        sqlConnection.query(query, function(err4,resultType){
            if(err4) throw err4;
            else{
                var importo=resultType[0].Importo;
                var cod_utenteMittente=resultType[0].Ref_Mittente;
                var metodoMittente=resultType[0].Ref_Metodo;
                var sqlPerson="SELECT u.Cod_Utente,m.Cod_Metodo,m.Tipo FROM utente u, metodo_pagamento m WHERE u.Cellulare='"+tel+"' AND u.Email='"+email+"' AND m.ref_utente=u.cod_utente AND m.Di_Default=1";
                sqlConnection.query(sqlPerson,function(errPerson,resultPerson){
                    if(errPerson){
                        oggetto={command: commands.SEND_MONEY_NOT_OK, message:"ERRORE"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        var tipo=resultType[0].Tipo;
                        //identifico metodo di pagamento
                        if(tipo=="Carta"){
                            console.log("pagamento con carta entrato");
                            var sql = "SELECT Codice,Saldo,Ref_Metodo FROM carta WHERE Ref_Metodo = "+metodoMittente+" AND Ref_Utente="+cod_utenteMittente;
                            sqlConnection.query(sql, function(err, result){
                                if(err){
                                    oggetto={command : commands.SEND_MONEY_NOT_OK , message:"Errore aggiornamento mittente"};
                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                }
                                else{
                                    //controllo il saldo della carta
                                    var codiceMittente=result[0].Codice;
                                    if(result[0].Saldo >= importo){
                                        //controllo i limiti spesa
                                        var select_limiti = "SELECT Tipo, Limite FROM limite_spesa WHERE Ref_Utente = "+cod_utenteMittente+" AND Ref_Metodo = "+ metodoMittente;
                                        sqlConnection.query(select_limiti, function(err_limiti, result_limiti){
                                            if(err_limiti) throw err_limiti;
                                            
                                            var today = new Date();
                                            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                            
                                            //recupero tutte le transazioni effettute sul metodo scelto oggi
                                            var select_today1 = "SELECT COALESCE(SUM(Importo),0) as totale FROM pagamento WHERE Ref_Mittente = "+cod_utenteMittente+" AND Ref_Metodo = "+ metodoMittente+" AND Data = '"+date+"'";
                                            var select_today2 = "SELECT COALESCE(SUM(Importo),0) as totale FROM transazione t, richiesta r WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND Ref_Mittente = "+metodoMittente+" AND t.Data = '"+date+"'";
                                            var select_today_union = select_today1 + " union all " + select_today2;
                                            sqlConnection.query(select_today_union, function(err_today, result_today){
                                                if(err_today) throw err_today;
                                                var somma = parseFloat(result_today[0].totale) + parseFloat(result_today[1].totale) + parseFloat(importo);
                                                if(result_limiti[0].Limite <  somma){
                                                    oggetto = {command: commands.SEND_MONEY_NOT_OK, message: "Limiti spesa giornalieri superati"};
                                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                                }
                                                else{
                                                    //recupero tutte le transazioni effettute sul metodo scelto in questo mese
                                                    var select_month1 = "SELECT COALESCE(SUM(Importo),0) as totale FROM pagamento WHERE Ref_Mittente = "+cod_utenteMittente+" AND Ref_Metodo = "+ metodoMittente+" AND MONTH(Data) = "+(today.getMonth()+1)+" AND YEAR(Data) = "+today.getFullYear();
                                                    var select_month2 = "SELECT COALESCE(SUM(Importo),0) as totale FROM transazione t, richiesta r WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND Ref_Mittente = "+cod_utenteMittente+" AND Ref_Metodo = "+ metodoMittente+" AND MONTH(t.Data) = "+(today.getMonth()+1)+" AND YEAR(Data) = "+today.getFullYear();
                                                    var select_month_union = select_month1 + " union all " + select_month2;
                                                    sqlConnection.query(select_month_union, function(err_month, result_month){
                                                        if(err_month) throw err_month;
                                                        
                                                        var somma = parseFloat(result_month[0].totale)+ parseFloat(result_month[1].totale) + parseFloat(importo);
                                                        if(result_limiti[1].Limite < somma){
                                                            oggetto = {command: commands.SEND_MONEY_NOT_OK, message: "Limiti spesa mensili superati"};
                                                            socketConnection.sendUTF(JSON.stringify(oggetto));
                                                        }
                                                        else{
                                                            //faccio l'aggiornamento dell'importo della carta
                                                            var update_mittente = "UPDATE carta SET Saldo = Saldo - "+importo+" WHERE Codice = "+ codiceMittente;
                                                            sqlConnection.query(update_mittente, function(err2, result2){
                                                                if(err2){
                                                                    oggetto = {command: commands.SEND_MONEY_NOT_OK, message: "Errore nel pagamento con CARTA"};
                                                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                }
                                                                else{
                                                                    //aggiorno credito del destinatario
                                                                    var metodo=resultPerson[0].Cod_Metodo;
                                                                    var cod_utente=resultPerson[0].Cod_Utente;
                                                                    var tipoCartaDest=resultPerson[0].Tipo;
                                                                    if(tipoCartaDest=="Carta"){
                                                                        var control_dest1="SELECT Codice FROM carta c, metodo_pagamento m WHERE c.Ref_Metodo=m.Cod_Metodo AND m.Ref_Utente=c.Ref_Utente AND m.Ref_Utente="+cod_utente+" AND c.Ref_Metodo="+metodo;
                                                                        sqlConnection.query(control_dest1, function(errDest1,resultDest1){
                                                                            var updateCartaDest= "UPDATE carta SET Saldo = Saldo + "+importo+" WHERE Codice='"+resultDest1[0].Codice+"'";
                                                                            sqlConnection.query(updateCartaDest,function(errSaldo,resultUpdate3){
                                                                                if(errSaldo){
                                                                                    oggetto={command : commands.SEND_MONEY_NOT_OK, message:"Errore aggiornamento Saldo carta"};
                                                                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                                }
                                                                            });
                                                                        });
                                                                    }
                                                                    else if(tipoCartaDest=="IBAN"){
                                                                        //controlla nella tabella IBAN
                                                                        var control_dest2="SELECT Iban FROM conto_bancario c, metodo_pagamento m WHERE c.Ref_Metodo=m.Cod_Metodo AND m.Ref_Utente=c.Ref_Utente AND m.Ref_Utente= "+cod_utente+" AND c.Ref_Metodo="+metodo;
                                                                        sqlConnection.query(control_dest2,function(errDest2,resultDest2){
                                                                            var updateIbanDest= "UPDATE conto_bancario SET Saldo = Saldo + "+importo +" WHERE iban='"+resultDest2[0].Iban+"' AND Ref_Metodo = "+metodo;
                                                                            sqlConnection.query(updateIbanDest,function(errSaldo,resultUpdate3){
                                                                                if(errSaldo){
                                                                                    oggetto={command : commands.SEND_MONEY_NOT_OK, message:"Errore aggiornamento Saldo Iban"};
                                                                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                                }
                                                                            });
                                                                        });
                                                                    }
                                                                    else if(tipoCartaDest=="ONLINE"){
                                                                        var updateOnlineDest = "UPDATE conto_online SET Saldo = Saldo + "+importo+" WHERE Ref_Utente="+cod_utente+" AND Ref_Metodo = "+metodo;
                                                                        sqlConnection.query(updateOnlineDest,function(errSaldo,resultUpdate3){
                                                                            if(errSaldo){
                                                                                oggetto={command : commands.SEND_MONEY_NOT_OK, message:"Errore aggiornamento Saldo online"};
                                                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                            }
                                                                        });
                                                                    }
                                                                    console.log("inserendo in transizione");
                                                                    var today = new Date();
                                                                    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                                                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                                                    //inserisco la transazione nella tabella
                                                                    var insert2 = "INSERT INTO transazione VALUES("+cod_richiesta+",'"+date+"','"+time+"')";
                                                                    sqlConnection.query(insert2, function(err6,result3){
                                                                        if(err6){
                                                                            oggetto={command: commands.SEND_MONEY_NOT_OK , message: "Errore nell'inserimento in transazione"};
                                                                            socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                        }
                                                                        else{
                                                                            oggetto = {command: commands.SEND_MONEY_OK, message: "Effettuato"};
                                                                            socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                         
                                    else{
                                        oggetto = {command: commands.SEND_MONEY_NOT_OK, message: "Credito insufficiente"};
                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                    }
                                }
                            });
                        }
                        else if(tipo=="IBAN"){
                            console.log("pagamento con iban entrato");
                            var sql = "SELECT Iban,Saldo,Ref_Metodo FROM conto_bancario WHERE Ref_Metodo ="+metodoMittente+" AND Ref_Utente="+cod_utenteMittente;
                            sqlConnection.query(sql, function(err, result){
                                if(err){
                                    oggetto={command : commands.SEND_MONEY_NOT_OK , message:"Errore aggiornamento mittente"};
                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                }
                                else{
                                    //controllo il saldo dell'iban
                                    if(result[0].Saldo >= importo){
                                        //controllo i limiti spesa
                                        var select_limiti = "SELECT Tipo, Limite FROM limite_spesa WHERE Ref_Utente = "+cod_utenteMittente+" AND Ref_Metodo = "+ metodoMittente;
                                        sqlConnection.query(select_limiti, function(err_limiti, result_limiti){
                                            if(err_limiti) throw err_limiti;
                                            
                                            var today = new Date();
                                            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                            
                                            //recupero tutte le transazioni effettute sul metodo scelto oggi
                                            var select_today1 = "SELECT COALESCE(SUM(Importo),0) as totale FROM pagamento WHERE Ref_Mittente = "+cod_utenteMittente+" AND Ref_Metodo = "+ metodoMittente+" AND Data = '"+date+"'";
                                            var select_today2 = "SELECT COALESCE(SUM(Importo),0) as totale FROM transazione t, richiesta r WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND Ref_Mittente = "+cod_utenteMittente+" AND Ref_Metodo = "+ metodoMittente+" AND t.Data = '"+date+"'";
                                            var select_today_union = select_today1 + " union all " + select_today2;
                                            sqlConnection.query(select_today_union, function(err_today, result_today){
                                                if(err_today) throw err_today;
                                                var somma = parseFloat(result_today[0].totale) + parseFloat(result_today[1].totale) + parseFloat(receivedPacket.importo);
                                                if(result_limiti[0].Limite <  somma){
                                                    oggetto = {command: commands.SEND_MONEY_NOT_OK, message: "Limiti spesa giornalieri superati"};
                                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                                }
                                                else{
                                                    //recupero tutte le transazioni effettute sul metodo scelto in questo mese
                                                    var select_month1 = "SELECT COALESCE(SUM(Importo),0) as totale FROM pagamento WHERE Ref_Mittente = "+cod_utenteMittente+" AND Ref_Metodo = "+ metodoMittente+" AND MONTH(Data) = "+(today.getMonth()+1)+" AND YEAR(Data) = "+today.getFullYear();
                                                    var select_month2 = "SELECT COALESCE(SUM(Importo),0) as totale FROM transazione t, richiesta r WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND Ref_Mittente = "+metodoMittente+" AND MONTH(t.Data) = "+(today.getMonth()+1)+" AND YEAR(Data) = "+today.getFullYear();
                                                    var select_month_union = select_month1 + " union all " + select_month2;
                                                    sqlConnection.query(select_month_union, function(err_month, result_month){
                                                        if(err_month) throw err_month;
                                                        
                                                        var somma = parseFloat(result_month[0].totale)+ parseFloat(result_month[1].totale) + parseFloat(importo);
                                                        if(result_limiti[1].Limite < somma){
                                                            oggetto = {command: commands.SEND_MONEY_NOT_OK, message: "Limiti spesa mensili superati"};
                                                            socketConnection.sendUTF(JSON.stringify(oggetto));
                                                        }
                                                        else{
                                                            //faccio l'aggiornamento dell'importo dell'iban
                                                            var codiceMittente=result[0].Iban;
                                                            var update_mittente = "UPDATE conto_bancario SET Saldo = Saldo -"+importo+" WHERE Iban= '"+codiceMittente+"'";
                                                            sqlConnection.query(update_mittente, function(err2, result2){
                                                                if(err2){
                                                                    oggetto = {command: commands.SEND_MONEY_NOT_OK, message: "Errore nel pagamento con IBAN"};
                                                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                }
                                                                else{
                                                                    //aggiorno credito del destinatario
                                                                    var metodo=resultPerson[0].Cod_Metodo;
                                                                    var cod_utente=resultPerson[0].Cod_Utente;
                                                                    var tipoCartaDest=resultPerson[0].Tipo;
                                                                    if(tipoCartaDest=="Carta"){
                                                                        var control_dest1="SELECT Codice FROM carta c, metodo_pagamento m WHERE c.Ref_Metodo=m.Cod_Metodo AND m.Ref_Utente=c.Ref_Utente AND m.Ref_Utente="+cod_utente+" AND c.Ref_Metodo="+metodo;
                        
                                                                        sqlConnection.query(control_dest1, function(errDest1,resultDest1){
                                                                            var updateCartaDest= "UPDATE carta SET Saldo = Saldo + "+importo +" WHERE Codice='"+resultDest1[0].Codice+"'";
                                                                            sqlConnection.query(updateCartaDest,function(errSaldo,resultUpdate3){
                                                                                if(errSaldo){
                                                                                    oggetto={command : commands.SEND_MONEY_NOT_OK, message:"Errore aggiornamento Saldo carta"};
                                                                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                                }
                                                                            });
                                                                        });
                                                                    }
                                                                    else if(tipoCartaDest=="IBAN"){
                                                                        //controlla nella tabella IBAN
                                                                        var control_dest2="SELECT Iban FROM conto_bancario c, metodo_pagamento m WHERE c.Ref_Metodo=m.Cod_Metodo AND m.Ref_Utente=c.Ref_Utente AND m.Ref_Utente= "+cod_utente+" AND c.Ref_Metodo="+metodo;
                                                                        sqlConnection.query(control_dest2,function(errDest2,resultDest2){
                                                                            var updateIbanDest= "UPDATE conto_bancario SET Saldo = Saldo + "+importo +" WHERE iban='"+resultDest2[0].Iban+"' AND Ref_Metodo = "+metodo;
                                                                            sqlConnection.query(updateIbanDest,function(errSaldo,resultUpdate3){
                                                                                if(errSaldo){
                                                                                    oggetto={command : commands.SEND_MONEY_NOT_OK, message:"Errore aggiornamento Saldo Iban"};
                                                                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                                }
                                                                            });
                                                                        });
                                                                    }
                                                                    else if(tipoCartaDest=="ONLINE"){
                                                                        var updateOnlineDest = "UPDATE conto_online SET Saldo = Saldo + "+importo +" WHERE Ref_Utente="+cod_utente+" AND Ref_Metodo = "+metodo;
                                                                        sqlConnection.query(updateOnlineDest,function(errSaldo,resultUpdate3){
                                                                            if(errSaldo){
                                                                                oggetto={command : commands.SEND_MONEY_NOT_OK, message:"Errore aggiornamento Saldo online"};
                                                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                            }
                                                                        });
                                                                    }
                                                                    console.log("inserendo in transizione");
                                                                    var today = new Date();
                                                                    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                                                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                                                    //inserisco la transazione
                                                                        var insert2 = "INSERT INTO transazione VALUES("+cod_richiesta+",'"+date+"','"+time+"')";
                                                                        sqlConnection.query(insert2, function(err6,result3){
                                                                            if(err6){
                                                                                oggetto={command: commands.SEND_MONEY_NOT_OK , message: "Errore nell'inserimento in transazione"};
                                                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                            }
                                                                            else{
                                                                                oggetto = {command: commands.SEND_MONEY_OK, message: "Effettuato"};
                                                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            });

                                        }
                                        else{
                                            oggetto = {command: commands.SEND_MONEY_NOT_OK, message: "Credito insufficiente"};
                                            socketConnection.sendUTF(JSON.stringify(oggetto));
                                        }
                                    }
                                });
                            }
                            else if(tipo=="ONLINE"){
                                console.log("pagamento con online entrato");
                                var sql = "SELECT Saldo,Ref_Metodo FROM conto_online WHERE Ref_Metodo = '"+metodoMittente+"' AND Ref_Utente="+cod_utenteMittente;
                                sqlConnection.query(sql, function(err, result){
                                    if(err){
                                        oggetto={command : commands.SEND_MONEY_NOT_OK , message:"Errore aggiornamento mittente"};
                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                    }
                                    else{
                                        //controllo il saldo
                                        if(result[0].Saldo >= importo){
                                            //controllo i limiti spesa
                                            var select_limiti = "SELECT Tipo, Limite FROM limite_spesa WHERE Ref_Utente = "+cod_utenteMittente+" AND Ref_Metodo = "+ metodoMittente;
                                            sqlConnection.query(select_limiti, function(err_limiti, result_limiti){
                                                if(err_limiti) throw err_limiti;

                                                console.log(select_limiti);
                                            
                                                var today = new Date();
                                                var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                                
                                                //recupero tutte le transazioni effettute sul metodo scelto oggi
                                                var select_today1 = "SELECT COALESCE(SUM(Importo),0) as totale FROM pagamento WHERE Ref_Mittente = "+cod_utenteMittente+" AND Ref_Metodo = "+ metodoMittente+" AND Data = '"+date+"'";
                                                var select_today2 = "SELECT COALESCE(SUM(Importo),0) as totale FROM transazione t, richiesta r WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND Ref_Mittente = "+cod_utenteMittente+" AND Ref_Metodo = "+ metodoMittente+" AND t.Data = '"+date+"'";
                                                var select_today_union = select_today1 + " union all " + select_today2;
                                                sqlConnection.query(select_today_union, function(err_today, result_today){
                                                    if(err_today) throw err_today;
                                                    var somma = parseFloat(result_today[0].totale)+ parseFloat(result_today[1].totale) + parseFloat(receivedPacket.importo);
                                                    if(result_limiti[0].Limite <  somma){
                                                        oggetto = {command: commands.SEND_MONEY_NOT_OK, message: "Limiti spesa giornalieri superati"};
                                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                                    }
                                                    else{
                                                        //recupero tutte le transazioni effettute sul metodo scelto in questo mese
                                                        var select_month1 = "SELECT COALESCE(SUM(Importo),0) as totale FROM pagamento WHERE Ref_Mittente = "+cod_utenteMittente+" AND Ref_Metodo = "+ metodoMittente+" AND MONTH(Data) = "+(today.getMonth()+1)+" AND YEAR(Data) = "+today.getFullYear();
                                                        var select_month2 = "SELECT COALESCE(SUM(Importo),0) as totale FROM transazione t, richiesta r WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND Ref_Mittente = "+cod_utenteMittente+" AND Ref_Metodo = "+ metodoMittente+" AND MONTH(t.Data) = "+(today.getMonth()+1)+" AND YEAR(Data) = "+today.getFullYear();
                                                        var select_month_union = select_month1 + " union all " + select_month2;
                                                        sqlConnection.query(select_month_union, function(err_month, result_month){
                                                            if(err_month) throw err_month;
                                                            
                                                            var somma = parseFloat(result_month[0].totale) + parseFloat(result_month[1].totale) + parseFloat(importo);
                                                            if(result_limiti[1].Limite < somma){
                                                                oggetto = {command: commands.SEND_MONEY_NOT_OK, message: "Limiti spesa mensili superati"};
                                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                                            }
                                                            else{
                                                                //faccio l'aggiornamento dell'importo dell'online
                                                                var update_mittente = "UPDATE conto_online SET Saldo = Saldo - "+importo+" WHERE Ref_Metodo = "+metodoMittente+" AND Ref_Utente="+cod_utenteMittente;
                                                                sqlConnection.query(update_mittente, function(err2, result2){
                                                                    if(err2){
                                                                        oggetto = {command: commands.SEND_MONEY_NOT_OK, message: "Errore nel pagamento con ONLINE"};
                                                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                    }
                                                                    else{
                                                                        //aggiorno credito del destinatario
                                                                        var metodo=resultPerson[0].Cod_Metodo;
                                                                        var cod_utente=resultPerson[0].Cod_Utente;
                                                                        var tipoCartaDest=resultPerson[0].Tipo;
                                                                        if(tipoCartaDest=="Carta"){
                                                                            var control_dest1="SELECT Codice FROM carta c, metodo_pagamento m WHERE c.Ref_Metodo=m.Cod_Metodo AND m.Ref_Utente=c.Ref_Utente AND m.Ref_Utente="+cod_utente+" AND c.Ref_Metodo="+metodo;
                                                                            sqlConnection.query(control_dest1, function(errDest1,resultDest1){
                                                                                var updateCartaDest= "UPDATE carta SET Saldo = Saldo + "+importo +" WHERE Codice='"+resultDest1[0].Codice+"'";
                                                                                sqlConnection.query(updateCartaDest,function(errSaldo,resultUpdate3){
                                                                                    if(errSaldo){
                                                                                        oggetto={command : commands.SEND_MONEY_NOT_OK, message:"Errore aggiornamento Saldo carta"};
                                                                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                                    }
                                                                                });
                                                                            });
                                                                        }
                                                                        else if(tipoCartaDest=="IBAN"){
                                                                            //controlla nella tabella IBAN
                                                                            var control_dest2="SELECT Iban FROM conto_bancario c, metodo_pagamento m WHERE c.Ref_Metodo=m.Cod_Metodo AND m.Ref_Utente=c.Ref_Utente AND m.Ref_Utente= "+cod_utente+" AND c.Ref_Metodo="+metodo;
                                                                            sqlConnection.query(control_dest2,function(errDest2,resultDest2){
                                                                                var updateIbanDest= "UPDATE Conto_bancario SET Saldo = Saldo + "+importo +" WHERE iban='"+resultDest2[0].Iban+"' AND Ref_Metodo = "+metodo;
                                                                                sqlConnection.query(updateIbanDest,function(errSaldo,resultUpdate3){
                                                                                    if(errSaldo){
                                                                                        oggetto={command : commands.SEND_MONEY_NOT_OK, message:"Errore aggiornamento Saldo Iban"};
                                                                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                                    }
                                                                                });
                                                                            });
                                                                        }
                                                                        else if(tipoCartaDest=="ONLINE"){
                                                                            var updateOnlineDest = "UPDATE conto_online SET Saldo = Saldo + "+importo +" WHERE Ref_Utente="+cod_utente+" AND Ref_Metodo = "+metodo;
                                                                            sqlConnection.query(updateOnlineDest,function(errSaldo,resultUpdate3){
                                                                                if(errSaldo){
                                                                                    oggetto={command : commands.SEND_MONEY_NOT_OK, message:"Errore aggiornamento Saldo online"};
                                                                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                                }
                                                                            });
                                                                        }
                                                                        console.log("inserendo in transizione");
                                                                        var today = new Date();
                                                                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                                                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                                                        //inserisco la transazione nella tabella pagamento
                                                                        var insert2 = "INSERT INTO transazione VALUES("+cod_richiesta+",'"+date+"','"+time+"')";
                                                                        sqlConnection.query(insert2, function(err6,result3){
                                                                            if(err6){
                                                                                oggetto={command: commands.SEND_MONEY_NOT_OK , message: "Errore nell'inserimento in transazione"};
                                                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                            }
                                                                            else{
                                                                                oggetto = {command: commands.SEND_MONEY_OK, message: "Effettuato"};
                                                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            });

                                        }
                                            
                                        else{
                                            oggetto = {command: commands.SEND_MONEY_NOT_OK, message: "Credito insufficiente"};
                                            socketConnection.sendUTF(JSON.stringify(oggetto));
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
    },
                                                    
    onReceiveMoneyRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        
        console.log("Ricevuta richiesta di receiveMoney");
        var cod_richiesta=receivedPacket.cod_richiesta;
        var cod_utenteDest=receivedPacket.cod_utente;
        var query="SELECT m.Tipo,r.Ref_Metodo,r.Ref_Mittente,r.Importo FROM metodo_pagamento m,richiesta r WHERE r.cod_richiesta="+cod_richiesta+" AND r.ref_metodo=m.cod_metodo AND m.ref_utente=r.ref_mittente";
        sqlConnection.query(query, function(err4,resultType){
            if(err4) throw err4;
            else{
                var importo=resultType[0].Importo;
                var sqlPerson="SELECT m.Cod_Metodo,m.Tipo FROM metodo_pagamento m WHERE m.Ref_utente="+cod_utenteDest+" AND m.Di_Default=1";
                sqlConnection.query(sqlPerson,function dest(errPerson,resultPerson){
                    if(errPerson){
                        oggetto={command: commands.RECEIVE_MONEY_NOT_OK, message:"ERRORE"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        var metodoDest=resultPerson[0].Cod_Metodo;
                        var tipoCartaDest=resultPerson[0].Tipo;
                        //aggiorno credito del destinatario
                        if(tipoCartaDest=="Carta"){
                            var control_dest1="SELECT Codice,Saldo FROM carta c, metodo_pagamento m WHERE c.Ref_Metodo=m.Cod_Metodo AND m.Ref_Utente=c.Ref_Utente AND m.Ref_Utente="+cod_utenteDest+" AND c.Ref_Metodo="+metodoDest;
                            sqlConnection.query(control_dest1, function(errDest1,resultDest1){
                                if(resultDest1[0].Saldo >= importo){
                                    //controllo i limiti spesa
                                    var select_limiti = "SELECT Tipo, Limite FROM limite_spesa WHERE Ref_Utente = "+cod_utenteDest+" AND Ref_Metodo = "+ metodoDest;
                                    sqlConnection.query(select_limiti, function(err_limiti, result_limiti){
                                        if(err_limiti) throw err_limiti;
                                        
                                        var today = new Date();
                                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                        
                                        //recupero tutte le transazioni effettute sul metodo scelto oggi
                                        var select_today1 = "SELECT COALESCE(SUM(Importo),0) as totale FROM pagamento WHERE Ref_Mittente = "+cod_utenteDest+" AND Ref_Metodo = "+ metodoDest+" AND Data = '"+date+"'";
                                        var select_today2 = "SELECT COALESCE(SUM(Importo),0) as totale FROM transazione t, richiesta r WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND Ref_Mittente = "+cod_utenteDest+" AND Ref_Metodo = "+ metodoDest+" AND t.Data = '"+date+"'";
                                        var select_today_union = select_today1 + " union all " + select_today2;
                                        sqlConnection.query(select_today_union, function(err_today, result_today){
                                            if(err_today) throw err_today;
                                            var somma = parseFloat(result_today[0].totale)+ parseFloat(result_today[1].totale) + parseFloat(receivedPacket.importo);
                                            if(result_limiti[0].Limite <  somma){
                                                oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, message: "Limiti spesa giornalieri superati"};
                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                            }
                                            else{
                                                //recupero tutte le transazioni effettute sul metodo scelto in questo mese
                                                var select_month1 = "SELECT COALESCE(SUM(Importo),0) as totale FROM pagamento WHERE Ref_Mittente = "+cod_utenteDest+" AND Ref_Metodo = "+ metodoDest+" AND MONTH(Data) = "+(today.getMonth()+1)+" AND YEAR(Data) = "+today.getFullYear();
                                                var select_month2 = "SELECT COALESCE(SUM(Importo),0) as totale FROM transazione t, richiesta r WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND Ref_Mittente = "+cod_utenteDest+" AND Ref_Metodo = "+ metodoDest+ " AND MONTH(t.Data) = "+(today.getMonth()+1)+" AND YEAR(Data) = "+today.getFullYear();
                                                var select_month_union = select_month1 + " union all " + select_month2;
                                                sqlConnection.query(select_month_union, function(err_month, result_month){
                                                    if(err_month) throw err_month;
                                                    
                                                    var somma = parseFloat(result_month[0].totale) + parseFloat(result_month[1].totale) + parseFloat(receivedPacket.importo);
                                                    if(result_limiti[1].Limite < somma){
                                                        oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, message: "Limiti spesa mensili superati"};
                                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                                    }
                                                    else{

                                                        //aggiorno saldo carta
                                                        var updateCartaDest= "UPDATE carta SET Saldo = Saldo - "+importo +" WHERE Codice='"+resultDest1[0].Codice+"'";
                                                        sqlConnection.query(updateCartaDest,function(errSaldo,resultUpdate3){
                                                            if(errSaldo){
                                                                oggetto={command : commands.RECEIVE_MONEY_NOT_OK, message:"Errore aggiornamento Saldo carta"};
                                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                                            }else{
                                                                oggetto = {command: commands.RECEIVE_MONEY_OK, message: "Effettuato"};
                                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                                            }
                                                        });
                                                    }
                                                });
                                            }    
                                        });
                                
                                    });
                                }
                                else{
                                    oggetto={command : commands.RECEIVE_MONEY_NOT_OK, message:"Errore saldo insufficente"};
                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                }
                            });
                        }
                        else if(tipoCartaDest=="IBAN"){
                            //controlla nella tabella IBAN
                            var control_dest2="SELECT Iban,Saldo FROM conto_bancario c, metodo_pagamento m WHERE c.Ref_Metodo=m.Cod_Metodo AND m.Ref_Utente=c.Ref_Utente AND m.Ref_Utente= "+cod_utenteDest+" AND c.Ref_Metodo="+metodoDest;
                            sqlConnection.query(control_dest2,function(errDest2,resultDest2){
                                if(resultDest2[0].Saldo >= importo){
                                    //controllo i limiti spesa
                                    var select_limiti = "SELECT Tipo, Limite FROM limite_spesa WHERE Ref_Utente = "+cod_utenteDest+" AND Ref_Metodo = "+ metodoDest;
                                    sqlConnection.query(select_limiti, function(err_limiti, result_limiti){
                                        if(err_limiti) throw err_limiti;
                                        
                                        var today = new Date();
                                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                        
                                        //recupero tutte le transazioni effettute sul metodo scelto oggi
                                        var select_today1 = "SELECT COALESCE(SUM(Importo),0) as totale FROM pagamento WHERE Ref_Mittente = "+cod_utenteDest+" AND Ref_Metodo = "+ metodoDest+" AND Data = '"+date+"'";
                                        var select_today2 = "SELECT COALESCE(SUM(Importo),0) as totale FROM transazione t, richiesta r WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND Ref_Mittente = "+cod_utenteDest+" AND Ref_Metodo = "+ metodoDest+" AND t.Data = '"+date+"'";
                                        var select_today_union = select_today1 + " union all " + select_today2;
                                        sqlConnection.query(select_today_union, function(err_today, result_today){
                                            if(err_today) throw err_today;
                                            var somma = parseFloat(result_today[0].totale)+ parseFloat(result_today[1].totale) + parseFloat(receivedPacket.importo);

                                            if(result_limiti[0].Limite <  somma){
                                                oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, message: "Limiti spesa giornalieri superati"};
                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                            }
                                            else{
                                                //recupero tutte le transazioni effettute sul metodo scelto in questo mese
                                                var select_month1 = "SELECT COALESCE(SUM(Importo),0) as totale FROM pagamento WHERE Ref_Mittente = "+cod_utenteDest+" AND Ref_Metodo = "+ metodoDest+" AND MONTH(Data) = "+(today.getMonth()+1)+" AND YEAR(Data) = "+today.getFullYear();
                                                var select_month2 = "SELECT COALESCE(SUM(Importo),0) as totale FROM transazione t, richiesta r WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND Ref_Mittente = "+cod_utenteDest+" AND MONTH(t.Data) = "+(today.getMonth()+1)+" AND YEAR(Data) = "+today.getFullYear();
                                                var select_month_union = select_month1 + " union all " + select_month2;
                                                sqlConnection.query(select_month_union, function(err_month, result_month){
                                                    if(err_month) throw err_month;
                                                    
                                                    var somma = parseFloat(result_month[0].totale) + parseFloat(result_month[1].totale) + parseFloat(receivedPacket.importo);
                                                    if(result_limiti[1].Limite < somma){
                                                        oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, message: "Limiti spesa mensili superati"};
                                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                                    }
                                                    else{
                                                        //aggiorno saldo iban
                                                        var updateIbanDest= "UPDATE conto_bancario SET Saldo = Saldo - "+importo +" WHERE iban='"+resultDest2[0].Iban+"' AND Ref_Metodo = "+metodoDest;
                                                        sqlConnection.query(updateIbanDest,function(errSaldo,resultUpdate3){
                                                            if(errSaldo){
                                                                oggetto={command : commands.RECEIVE_MONEY_NOT_OK, message:"Errore aggiornamento Saldo Iban"};
                                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                                            }else{
                                                                oggetto = {command: commands.RECEIVE_MONEY_OK, message: "Effettuato"};
                                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                                            }
                                                        });
                                                    }
                                                });
                                            }    
                                        });
            
                                    });
                                }
                                else{
                                    oggetto={command : commands.RECEIVE_MONEY_NOT_OK, message:"Errore saldo insufficente"};
                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                } 
                            });
                        }
                        else if(tipoCartaDest=="ONLINE"){
                            var control_dest2="SELECT c.Saldo FROM conto_online c WHERE c.Ref_Utente="+cod_utenteDest+" AND c.Ref_Metodo="+metodoDest;
                            sqlConnection.query(control_dest2,function (errDest3,resultDest3){
                                if(resultDest3[0].Saldo >= importo){
                                    //controllo i limiti spesa
                                    var select_limiti = "SELECT Tipo, Limite FROM limite_spesa WHERE Ref_Utente = "+receivedPacket.cod_utente+" AND Ref_Metodo = "+ metodoDest;
                                    sqlConnection.query(select_limiti, function(err_limiti, result_limiti){
                                        if(err_limiti) throw err_limiti;
                                        
                                        var today = new Date();
                                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                        
                                        //recupero tutte le transazioni effettute sul metodo scelto oggi
                                        var select_today1 = "SELECT COALESCE(SUM(Importo),0) as totale FROM pagamento WHERE Ref_Mittente = "+cod_utenteDest+" AND Ref_Metodo = "+ metodoDest+" AND Data = '"+date+"'";
                                        var select_today2 = "SELECT COALESCE(SUM(Importo),0) as totale FROM transazione t, richiesta r WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND Ref_Mittente = "+cod_utenteDest+" AND Ref_Metodo = "+ metodoDest+" AND t.Data = '"+date+"'";
                                        var select_today_union = select_today1 + " union all " + select_today2;
                                        sqlConnection.query(select_today_union, function(err_today, result_today){
                                            if(err_today) throw err_today;
                                            var somma = parseFloat(result_today[0].totale)+ parseFloat(result_today[1].totale) + parseFloat(receivedPacket.importo);

                                            if(result_limiti[0].Limite <  somma){
                                                oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, message: "Limiti spesa giornalieri superati"};
                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                            }
                                            else{
                                                //recupero tutte le transazioni effettute sul metodo scelto in questo mese
                                                var select_month1 = "SELECT COALESCE(SUM(Importo),0) as totale FROM pagamento WHERE Ref_Mittente = "+cod_utenteDest+" AND Ref_Metodo = "+ metodoDest+" AND MONTH(Data) = "+(today.getMonth()+1)+" AND YEAR(Data) = "+today.getFullYear();
                                                var select_month2 = "SELECT COALESCE(SUM(Importo),0) as totale FROM transazione t, richiesta r WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND Ref_Mittente = "+cod_utenteDest+" AND MONTH(t.Data) = "+(today.getMonth()+1)+" AND YEAR(Data) = "+today.getFullYear();
                                                var select_month_union = select_month1 + " union all " + select_month2;
                                                sqlConnection.query(select_month_union, function(err_month, result_month){
                                                    if(err_month) throw err_month;
                                                    
                                                    var somma = parseFloat(result_month[0].totale) + parseFloat(result_month[1].totale) + parseFloat(receivedPacket.importo);
                                                    if(result_limiti[1].Limite < somma){
                                                        oggetto = {command: commands.PAYMENT_SHOP_NOT_OK, message: "Limiti spesa mensili superati"};
                                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                                    }
                                                    else{
                                                        //aggiornamento saldo online
                                                        var updateOnlineDest = "UPDATE conto_online SET Saldo = Saldo - "+importo+" WHERE conto_online.Ref_Utente="+cod_utenteDest+" AND Ref_Metodo = "+metodoDest;
                                                        sqlConnection.query(updateOnlineDest,function(errSaldo,resultUpdate3){
                                                            if(errSaldo){
                                                                oggetto={command : commands.RECEIVE_MONEY_NOT_OK, message:"Errore aggiornamento Saldo online"};
                                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                                            }else{
                                                                oggetto = {command: commands.RECEIVE_MONEY_OK, message: "Effettuato"};
                                                                socketConnection.sendUTF(JSON.stringify(oggetto));
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    });
                                }
                                else{
                                    oggetto={command : commands.RECEIVE_MONEY_NOT_OK, message:"Errore saldo insufficente"};
                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                } 
                            });
                        }
                    }
                });
            }
        });
    },

    onDeleteRefuseRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("cancellazione dalla tabella delle richieste");
        var cod_richiesta=receivedPacket.cod_richiesta;
        var deleteQuery="DELETE FROM richiesta WHERE Cod_Richiesta="+cod_richiesta;
        sqlConnection.query(deleteQuery,function(deleteError,deleteResult){
            if(deleteError){
                oggetto={command:commands.DELETE_REFUSE_REQUEST_NOT_OK, message:"Errore nella eliminazione della richiesta"};
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
            else{
                oggetto={command: commands.DELETE_REFUSE_REQUEST_OK, message:"Eliminata richiesta di transazione"};
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
        });

    },


    onInsertTransaction: function(commands, receivedPacket, sqlConnection, socketConnection){
        console.log("inserendo in transazione");
        cod_richiesta=receivedPacket.cod_richiesta;
        var mittQuery="SELECT m.Tipo,r.Ref_Metodo,r.Ref_Mittente,r.Importo FROM metodo_pagamento m, richiesta r WHERE r.cod_richiesta="+cod_richiesta+" AND r.ref_metodo=m.cod_metodo AND m.ref_utente=r.ref_mittente";
        sqlConnection.query(mittQuery,function(mittQueryErr,mitt){
            if(mittQueryErr){
                oggetto={command : commands.INSERT_TRANSACTION_NOT_OK, message:"Errore aggiornamento saldo mittente richiesta"};
                sqlConnection.sendUTF(JSON.stringify(oggetto));
            }
            else{
                var tipoMitt=mitt[0].Tipo;
                var metodoMitt=mitt[0].Ref_Metodo;
                var codMitt=mitt[0].Ref_Mittente;
                var importo=mitt[0].Importo;
                if(tipoMitt=="Carta"){
                    console.log("aggiornamento con carta entrato");
                    var sql = "SELECT Codice FROM carta WHERE Ref_Metodo ="+metodoMitt+" AND Ref_Utente="+codMitt;
                    sqlConnection.query(sql, function (err, result){
                        if(err){
                            oggetto={command : commands.RECEIVE_MONEY_NOT_OK , message:"Errore aggiornamento mittente"};
                            socketConnection.sendUTF(JSON.stringify(oggetto));
                        }
                        else{
                            var codiceMitt=result[0].Codice;
                            var update_mittente = "UPDATE carta SET Saldo = Saldo + "+importo+" WHERE Codice = '"+codiceMitt+"'";
                            sqlConnection.query(update_mittente, function(err2, result2){
                                if(err2){
                                    oggetto = {command: commands.RECEIVE_MONEY_NOT_OK, message: "Errore nel pagamento con CARTA"};
                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                }
                            });
                        }
                    });
                }
                if(tipoMitt=="IBAN"){
                    console.log("aggiornamento con carta entrato");
                    var sql = "SELECT Iban FROM conto_bancario WHERE ref_Metodo ="+metodoMitt+" AND Ref_Utente="+codMitt;
                    sqlConnection.query(sql, function (err, result){
                        if(err){
                            oggetto={command : commands.RECEIVE_MONEY_NOT_OK , message:"Errore aggiornamento mittente"};
                            socketConnection.sendUTF(JSON.stringify(oggetto));
                        }
                        else{
                            var codiceMitt=result[0].Codice;
                            var update_mittente = "UPDATE conto_bancario SET Saldo = Saldo + "+importo+" WHERE codice = '"+codiceMitt+"'";
                            sqlConnection.query(update_mittente, function(err2, result2){
                                if(err2){
                                    oggetto = {command: commands.RECEIVE_MONEY_NOT_OK, message: "Errore nel pagamento con IBAN"};
                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                }
                            });
                        }
                    });
                }
                if(tipoMitt=="ONLINE"){
                    console.log("aggiornamento Online entrato");
                    var update_mittente = "UPDATE conto_online SET saldo = saldo +"+importo+" WHERE ref_Metodo ="+metodoMitt+" AND ref_Utente="+codMitt;
                    sqlConnection.query(update_mittente, function(err2, result2){
                        if(err2){
                            oggetto = {command: commands.RECEIVE_MONEY_NOT_OK, message: "Errore nel pagamento con ONLINE"};
                            socketConnection.sendUTF(JSON.stringify(oggetto));
                        }
                    });
                }
                var today = new Date();
                var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                //inserisco la transazione nella tabella transazione
                var insert2 = "INSERT INTO transazione VALUES("+cod_richiesta+",'"+date+"','"+time+"')";
                sqlConnection.query(insert2, function(err6,result3){
                    if(err6){
                        oggetto={command: commands.INSERT_TRANSACTION_NOT_OK, message: "Errore nell'inserimento in transazione"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else{
                        oggetto = {command: commands.INSERT_TRANSACTION_OK, message: "Transazione eseguita"};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                });
            }
        });
    },

    onPeriodicPayment: function(mittente, soldi, rate, metodo, esercizio, importo, importo_totale, sqlConnection){
        var update = "UPDATE periodicita SET Giorni_rimanenti = Numero_giorni, Importo = Importo + "+soldi/rate+" WHERE Ref_Mittente = "+mittente+" AND Ref_Metodo = "+metodo;
          sqlConnection.query(update, function(err, result){
            if(err) throw err;
          });

          var today = new Date();
          var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
          var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          //inserisco la transazione nella tebella pagamento
          var insert = "INSERT INTO Pagamento VALUES("+mittente+", "+ metodo+" , '"+esercizio+"', "+soldi/rate+", '"+date+"', '"+time+"')";
          sqlConnection.query(insert, function(err, result){
            if(err) throw err;
          });

          //se ho finito le rate elimino da periodicita
        if(importo == importo_totale){
            var delete1 = "DELETE FROM periodicita WHERE Ref_Mittente = "+mittente+" AND Ref_Metodo = "+metodo;
            sqlConnection.query(delete1, function(err, result){
                if(err) throw err;
            });
        }
    }
};





