module.exports = {
    onLoginRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di login");
                
        var sql = "SELECT cod_Utente, codice_Fiscale, nome, cognome, sesso, data_Nascita, citta_Nascita, residenza, email, password, cellulare, telegramChatId FROM utente WHERE email = '" + receivedPacket.email + "' AND BINARY password = '" + receivedPacket.password + "'";
        sqlConnection.query(sql, function (err, result) {
            if (err) throw err;
        
            //Se l'utente esiste
            var oggetto;
            if (result[0])
                oggetto = {command: commands.LOGIN_OK,
                            cod_Utente: result[0].cod_Utente,
                            codice_Fiscale: result[0].codice_Fiscale,
                            nome: result[0].nome,
                            cognome: result[0].cognome,
                            sesso: result[0].sesso,
                            data_Nascita: result[0].data_Nascita,
                            citta_Nascita: result[0].citta_Nascita,
                            residenza: result[0].residenza,
                            email: result[0].email,
                            password: result[0].password,
                            cellulare: result[0].cellulare,
                            telegramChatId: result[0].telegramChatId
                        };
            else
                oggetto = {command: commands.LOGIN_NOT_OK};
                        
            socketConnection.sendUTF(JSON.stringify(oggetto));
        });
    },

    onSignUpRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di registrazione");
        var sql = "SELECT MAX(Cod_Utente) as massimo FROM utente";
        sqlConnection.query(sql, function(err, result){
            if (err) throw err;

            var codUtente = result[0].massimo + 1;

            //faccio la insert
            sql = "INSERT INTO utente VALUES ('"+codUtente+"', '"+receivedPacket.cf+"', '"+receivedPacket.nome+"', '"+receivedPacket.cognome+"', '"+receivedPacket.sesso+"', '"+receivedPacket.data+"', '"+receivedPacket.citta_nascita+"', '"+receivedPacket.residenza+"', '"+receivedPacket.email+"', '"+receivedPacket.password+"', '"+receivedPacket.cellulare+"', '"+receivedPacket.telegramChatId+"')";
            sqlConnection.query(sql, function (err2, result2) {
                var oggetto;
                if (err2) {
                    oggetto = {command: commands.SIGNUP_NOT_OK};
                    socketConnection.sendUTF(JSON.stringify(oggetto));
                }
                else {
                    sql = "INSERT INTO metodo_pagamento VALUES ('"+codUtente+"', 1, 1, 'ONLINE')";
                    sqlConnection.query(sql, function (err3, result2) {
                        if (err3) {
                            oggetto = {command: commands.SIGNUP_NOT_OK};
                            socketConnection.sendUTF(JSON.stringify(oggetto));
                        }
                        else {
                            sql = "INSERT INTO conto_online VALUES ('"+codUtente+"', 1, 0)";
                            sqlConnection.query(sql, function (err4, result2) {
                                if (err4) {
                                    oggetto = {command: commands.SIGNUP_NOT_OK};
                                    socketConnection.sendUTF(JSON.stringify(oggetto));
                                }
                                else {
                                    sql = "INSERT INTO limite_spesa VALUES ('"+codUtente+"', 1, 500, 'G'), ('"+codUtente+"', 1, 1500, 'M')";
                                    sqlConnection.query(sql, function (err5, result2) {
                                        if (err5)
                                            oggetto = {command: commands.SIGNUP_NOT_OK};
                                        else
                                            oggetto = {command: commands.SIGNUP_OK};   
                                            
                                        socketConnection.sendUTF(JSON.stringify(oggetto));
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    },

    onUpdateUserDataRequest: function(commands, receivedPacket, sqlConnection, socketConnection) {
        console.log("Ricevuta richiesta di modifica dei dati");
        var sql = "UPDATE utente SET Nome='"+receivedPacket.nome+"', Cognome='"+receivedPacket.cognome+"', Codice_Fiscale='"+receivedPacket.cf+"', Sesso='"+receivedPacket.sesso+"', Data_Nascita='"+receivedPacket.data+"', Citta_Nascita='"+receivedPacket.citta_nascita+"', Email='"+receivedPacket.email+"', Password='"+receivedPacket.password+"', Cellulare='"+receivedPacket.cellulare+"', TelegramChatId = '"+receivedPacket.telegramChatId+"' WHERE Cod_Utente='"+ receivedPacket.cod_utente+"'" ;
        sqlConnection.query(sql, function(err, result){
            if (err)
                oggetto = {command: commands.UPDATE_DATA_NOT_OK};
            else
                oggetto = {command: commands.UPDATE_DATA_OK};

                socketConnection.sendUTF(JSON.stringify(oggetto));
        });
    },

    onForgotPasswordRequest: function(commands, receivedPacket, sqlConnection, socketConnection, emailSender) {
        console.log("Ricevuta richiesta di modifica password");
        var sql = "SELECT email FROM utente WHERE email = '"+receivedPacket.email+"'";
        var oggetto;
        sqlConnection.query(sql, function(err, result){
            if (err) {
                oggetto = {command: commands.FORGOT_PASSWORD_NOT_OK};
                socketConnection.sendUTF(JSON.stringify(oggetto));
            }
            else {
                //Genero una nuova password casuale di dimensione 10
                var newPassword = Math.random().toString(36).slice(2);
                sql = "UPDATE utente SET password = '"+newPassword+"' WHERE email = '"+receivedPacket.email+"'";
                sqlConnection.query(sql, function(err, result){
                    if (err) {
                        oggetto = {command: commands.FORGOT_PASSWORD_NOT_OK};
                        socketConnection.sendUTF(JSON.stringify(oggetto));
                    }
                    else {
                        //mando email con la nuova password
                        var mailOptions = {
                            from: 'dspprogetto@gmail.com',
                            to: receivedPacket.email,
                            subject: 'Nuova password',
                            html: "La tua nuova password è " + newPassword,
                        };          
                        emailSender.sendMail(mailOptions, function(error, info){
                            if (error) {
                                console.log(error);
                                oggetto = {command: commands.FORGOT_PASSWORD_NOT_OK};
                            }
                            else {
                                console.log('Email sent: ' + info.response);
                                oggetto = {command: commands.FORGOT_PASSWORD_OK};
                            }
                            socketConnection.sendUTF(JSON.stringify(oggetto));
                        });
                    }
                });
            }
        });
    }
};