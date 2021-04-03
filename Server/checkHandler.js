module.exports = {

    oncheckSaldo: function(codiceMetodo, cod_utente, tipo_metodo, importo, sqlConnection, callback){
        if(tipo_metodo == "Carta"){
            var sql = "SELECT Saldo FROM carta c, metodo_pagamento m WHERE c.Ref_Metodo=m.Cod_Metodo AND m.Ref_Utente=c.Ref_Utente AND m.Ref_Utente= "+cod_utente+" AND c.Ref_Metodo="+codiceMetodo;
            sqlConnection.query(sql, function(err, result){
                if(err) throw err;
                //controllo il saldo della carta
                if(result[0].Saldo >= importo){
                    callback(true);
                }
                else{
                    callback(false);
                }
            });
        }

        else if(tipo_metodo == "IBAN"){
            var sql ="SELECT Saldo FROM conto_bancario c, metodo_pagamento m WHERE c.Ref_Metodo=m.Cod_Metodo AND m.Ref_Utente=c.Ref_Utente AND m.Ref_Utente= "+cod_utente+" AND c.Ref_Metodo="+codiceMetodo;
            sqlConnection.query(sql,function(err,result){
                if(err) throw err;
                if(result[0].Saldo >= importo){
                    callback(true);
                }
                else{
                    callback(false);
                }
                 
            });
        }

        else if(tipo_metodo == "ONLINE"){
            var sql = "SELECT Saldo FROM conto_online c, metodo_pagamento m WHERE c.Ref_Metodo=m.Cod_Metodo AND m.Ref_Utente=c.Ref_Utente AND m.Ref_Utente= "+cod_utente+" AND c.Ref_Metodo="+codiceMetodo;;
            sqlConnection.query(sql, function(err, result){
                if(err) throw err;
                //controllo il saldo della carta
                if(result[0].Saldo >= importo){
                    callback(true);
                }
                else{
                    callback(false);
                }
            });
        }
        
    },

    oncheckLimiti: function(codiceMetodo, cod_utente, saldo, sqlConnection, callback){
        var select_limiti = "SELECT Tipo, Limite FROM limite_spesa WHERE Ref_Utente = "+cod_utente+" AND Ref_Metodo = "+ codiceMetodo;
        sqlConnection.query(select_limiti, function(err_limiti, result_limiti){
            if(err_limiti) throw err_limiti;
            
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            
            //recupero tutte le transazioni effettute sul metodo scelto oggi
            var select_today1 = "SELECT COALESCE(SUM(Importo),0) as totale FROM pagamento WHERE Ref_Mittente = "+cod_utente+" AND Ref_Metodo = "+ codiceMetodo+" AND Data = '"+date+"'";
            var select_today2 = "SELECT COALESCE(SUM(Importo),0) as totale FROM transazione t, richiesta r WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND Ref_Mittente = "+cod_utente+" AND Ref_Metodo = "+ codiceMetodo+" AND t.Data = '"+date+"'";
            var select_today_union = select_today1 + " union all " + select_today2;
            sqlConnection.query(select_today_union, function(err_today, result_today){
                if(err_today) throw err_today;
                var somma = parseFloat(result_today[0].totale)+ parseFloat(result_today[1].totale) + parseFloat(saldo);
                if(result_limiti[0].Limite <  somma){
                    callback(false);
                }
                else{
                    //recupero tutte le transazioni effettute sul metodo scelto in questo mese
                    var select_month1 = "SELECT COALESCE(SUM(Importo),0) as totale FROM pagamento WHERE Ref_Mittente = "+cod_utente+" AND Ref_Metodo = "+ codiceMetodo+" AND MONTH(Data) = "+(today.getMonth()+1)+" AND YEAR(Data) = "+today.getFullYear();
                    var select_month2 = "SELECT COALESCE(SUM(Importo),0) as totale FROM transazione t, richiesta r WHERE t.ref_richiesta = r.cod_richiesta AND r.tipo = 'invio' AND Ref_Mittente = "+cod_utente+" AND Ref_Metodo = "+ codiceMetodo+" AND MONTH(t.Data) = "+(today.getMonth()+1)+" AND YEAR(Data) = "+today.getFullYear();
                    var select_month_union = select_month1 + " union all " + select_month2;
                    sqlConnection.query(select_month_union, function(err_month, result_month){
                        if(err_month) throw err_month;
                        
                        var somma = parseFloat(result_month[0].totale) + parseFloat(result_month[1].totale) + parseFloat(saldo);
                        if(result_limiti[1].Limite < somma){
                            callback(false);
                        }
                            
                        else {
                            callback(true);
                        }  
                            
                    });
                }
    
            });
        });
    }
}