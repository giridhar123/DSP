var WebSocketServer = require('websocket').server;
var http = require('http');
var commands = require('./commands');
var userHandler = require('./userHandler');
var periodicPaymentHandler = require('./periodicPaymentHandler');
var manageMethodsHandler = require('./manageMethodsHandler');
var showTransactionHandler = require('./showTransactionHandler');
var variousHandler = require('./variousHandler');
var requestsHandler = require('./requestsHandler');
var checkHandler = require('./checkHandler');
var cron = require('node-cron');

var nodemailer = require('nodemailer');

//MANDARE EMAIL
var emailSender = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dspprogetto@gmail.com',
    pass: 'hey, you!'
  }
});

// TELEGRAM
const { TelegramClient } = require('messaging-api-telegram');
 
// get accessToken from telegram [@BotFather](https://telegram.me/BotFather)
const client = TelegramClient.connect('wowowow');


//RATEIZZAZIONI
//eseguo script ogni giorno a mezzanotte 
cron.schedule('0 0 * * *', () => {
  
  //prendo le rateizzazioni con date di avvio < di oggi
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var sql = "SELECT * FROM periodicita WHERE Data_Avvio <= '"+date+"'";
  sqlConnection.query(sql, function(err, result){
    for(var i = 0; i < result.length; i++){
      if(err) throw err;
      //se giorni rimanenti = 0 --> pago --> giorni rimanenti = numero giorni
      if(result[i].Giorni_rimanenti == 0){
          
          var soldi = result[i].Importo_Totale;
          var rate = result[i].Numero_Pagamenti;
          var mittente = result[i].Ref_Mittente;
          var metodo = result[i].Ref_Metodo;
          var esercizio = result[i].Nome_Esercizio;
          var importo = result[i].Importo;
          var importo_totale = result[i].Importo_Totale;

          //verifico quale metodo di pagamento sto utilizzando

          //CARTA
          var sql2 = "SELECT c.Saldo, c.Codice, u.Email, u.TelegramChatId FROM Carta c, Utente u WHERE c.Ref_Utente = u.Cod_Utente AND c.Ref_Utente = "+mittente+" AND c.Ref_Metodo = "+metodo;
          sqlConnection.query(sql2, function(err2, result2){
            if(result2.length > 0){
              var email = result2[0].Email;
              var telegramID = result2[0].TelegramChatId;
              checkHandler.oncheckSaldo(metodo, mittente, "Carta", soldi/rate,sqlConnection,function(data_saldo){
                if(data_saldo){
                  //controllo se sono stati superati i limiti spesa
                  checkHandler.oncheckLimiti(metodo, mittente, importo,sqlConnection,function(data_limiti){
                      if(data_limiti){
                        //faccio l'aggiornamento del saldo della carta
                        var update = "UPDATE Carta SET Saldo = Saldo - "+(soldi/rate)+" WHERE Ref_Metodo = "+metodo+" AND Ref_Utente = "+mittente;
                        sqlConnection.query(update, function(err_update, result_update){
                            if(err_update) throw err_update;
                        });
                        variousHandler.onPeriodicPayment(mittente, soldi, rate, metodo, esercizio, importo, importo_totale, sqlConnection);
                        client.sendMessage(telegramID, 'Pagamento periodico verso ' + esercizio + ' di ' + soldi/rate + ' eseguito correttamente', {
                          disable_web_page_preview: true,
                          disable_notification: true,
                        });
                      } 
                      else{
                        var mailOptions = {
                          from: 'dspprogetto@gmail.com',
                          to: email,
                          subject: 'Superamento limiti spesa',
                          text: 'Caro utente non è stato possibile effettuare il pagamento periodico a causa del superamento dei limiti spesa impostati nella carta'
                        };
                      
                        emailSender.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });

                        client.sendMessage(telegramID, 'Caro utente non è stato possibile effettuare il pagamento periodico a causa del superamento dei limiti spesa impostati nella carta', {
                          disable_web_page_preview: true,
                          disable_notification: true,
                        });
                        
                      }
                  });
                }
    
                else{
                  var mailOptions = {
                    from: 'dspprogetto@gmail.com',
                    to: email,
                    subject: 'Saldo non disponibile',
                    text: 'Caro utente non è stato possibile effettuare il pagamento periodico a causa della non disponibilità del saldo della carta'
                  };
                
                  emailSender.sendMail(mailOptions, function (error, info) {
                      if (error) {
                          console.log(error);
                      } else {
                          console.log('Email sent: ' + info.response);
                      }
                  }); 
                  
                  client.sendMessage(telegramID, 'Caro utente non è stato possibile effettuare il pagamento periodico a causa della non disponibilità del saldo della carta', {
                    disable_web_page_preview: true,
                    disable_notification: true,
                  });
                }      
            });
          }
        });

        //CONTO BANCARIO
        var sql3 = "SELECT c.Saldo, c.Iban, u.Email, u.TelegramChatId FROM conto_bancario c, Utente u WHERE c.Ref_Utente = u.Cod_Utente AND c.Ref_Utente = "+mittente+" AND c.Ref_Metodo = "+metodo;
        sqlConnection.query(sql3, function(err3, result3){
          if(result3.length > 0){
            var email = result3[0].Email;
            var telegramID = result3[0].TelegramChatId;
            
            checkHandler.oncheckSaldo(metodo, mittente, "IBAN", soldi/rate, sqlConnection, function(data_saldo){
              if(data_saldo){
                //controllo se sono stati superati i limiti spesa
                checkHandler.oncheckLimiti(metodo, mittente, importo, sqlConnection,function(data_limiti){
                  if(data_limiti){
                    //faccio l'aggiornamento del saldo dell'iban
                    var update = "UPDATE conto_bancario SET Saldo = Saldo - "+(soldi/rate)+" WHERE Ref_Metodo = "+metodo+" AND Ref_Utente = "+mittente;
                    sqlConnection.query(update, function(err_update, result_update){
                      if(err_update) throw err_update;
                    });

                    variousHandler.onPeriodicPayment(mittente, soldi, rate, metodo, esercizio, importo, importo_totale, sqlConnection);
                    console.log("aaa");
                    client.sendMessage(telegramID, 'Pagamento periodico verso ' + esercizio + ' di ' + soldi/rate + ' eseguito correttamente', {
                      disable_web_page_preview: true,
                      disable_notification: true,
                    });
                  }
                  else{
                    var mailOptions = {
                      from: 'dspprogetto@gmail.com',
                      to: email,
                      subject: 'Superamento limiti spesa',
                      text: 'Caro utente non è stato possibile effettuare il pagamento periodico a causa del superamento dei limiti spesa impostati nell iban',
                    };
                  
                    emailSender.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    }); 
                    
                    client.sendMessage(telegramID, 'Caro utente non è stato possibile effettuare il pagamento periodico a causa del superamento dei limiti spesa impostati nell iban', {
                      disable_web_page_preview: true,
                      disable_notification: true,
                    });
                  }
                });
              }

              else{
                var mailOptions = {
                  from: 'dspprogetto@gmail.com',
                  to: email,
                  subject: 'Saldo non disponibile',
                  text: 'Caro utente non è stato possibile effettuare il pagamento periodico a causa della non disponibilità del saldo dell iban'
                };
              
                emailSender.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                }); 
                client.sendMessage(telegramID, 'Caro utente non è stato possibile effettuare il pagamento periodico a causa della non disponibilità del saldo dell iban', {
                  disable_web_page_preview: true,
                  disable_notification: true,
                });
              }      
            });
          }
        });

          //CONTO ONLINE
          var sql4 = "SELECT c.Saldo, u.Email, u.TelegramChatId FROM conto_online c, Utente u WHERE c.Ref_Utente = u.Cod_Utente AND c.Ref_Utente = "+mittente+" AND c.Ref_Metodo = "+metodo;
           sqlConnection.query(sql4, function(err4, result4){
            if(result4.length > 0){
              var email = result4[0].Email;
              var telegramID = result4[0].TelegramChatId;
              checkHandler.oncheckSaldo(metodo, mittente, "ONLINE", soldi/rate, sqlConnection, function(data_saldo){
                if(data_saldo){
                  //controllo se sono stati superati i limiti spesa
                  checkHandler.oncheckLimiti(metodo, mittente, importo, sqlConnection,function(data_limiti){
                    if(data_limiti){
                          //faccio l'aggiornamento del saldo del conto
                          var update = "UPDATE conto_online SET Saldo = Saldo - "+(soldi/rate)+" WHERE Ref_Metodo = "+metodo+" AND Ref_Utente = "+mittente;
                          sqlConnection.query(update, function(err_update, result_update){
                            if(err_update) throw err_update;
                          });

                          variousHandler.onPeriodicPayment(mittente, soldi, rate, metodo, esercizio, importo, importo_totale, sqlConnection);
                          client.sendMessage(telegramID, 'Pagamento periodico verso ' + esercizio + ' di ' + soldi/rate + ' eseguito correttamente', {
                            disable_web_page_preview: true,
                            disable_notification: true,
                          });
                    }
                    else{
                      var mailOptions = {
                        from: 'dspprogetto@gmail.com',
                        to: email,
                        subject: 'Superamento limiti spesa',
                        text: 'Caro utente non è stato possibile effettuare il pagamento periodico a causa del superamento dei limiti spesa impostati nel conto',
                      };
                    
                      emailSender.sendMail(mailOptions, function (error, info) {
                          if (error) {
                              console.log(error);
                          } else {
                              console.log('Email sent: ' + info.response);
                          }
                      }); 
                      
                      client.sendMessage(telegramID, 'Caro utente non è stato possibile effettuare il pagamento periodico a causa del superamento dei limiti spesa impostati nel conto', {
                        disable_web_page_preview: true,
                        disable_notification: true,
                      });
                    }
                  });
                }
  
                else{
                  var mailOptions = {
                    from: 'dspprogetto@gmail.com',
                    to: email,
                    subject: 'Saldo non disponibile',
                    text: 'Caro utente non è stato possibile effettuare il pagamento periodico a causa della non disponibilità del saldo del conto'
                  };
                
                  emailSender.sendMail(mailOptions, function (error, info) {
                      if (error) {
                          console.log(error);
                      } else {
                          console.log('Email sent: ' + info.response);
                      }
                  });

                  client.sendMessage(telegramID, 'Caro utente non è stato possibile effettuare il pagamento periodico a causa della non disponibilità del saldo del conto', {
                    disable_web_page_preview: true,
                    disable_notification: true,
                  });
                }      
              });
            }
          });
          
         
      }
      else{
        //scalo i giorni rimanenti al prossimo pagamento
        var update = "UPDATE periodicita SET Giorni_rimanenti = Giorni_rimanenti - 1 WHERE Ref_Mittente = "+result[i].Ref_Mittente+" AND Ref_Metodo = "+result[i].Ref_Metodo;
        sqlConnection.query(update, function(err1, result1){
          if(err1) throw err1;
        });
      }
      
    }
    
  });
});

var server = http.createServer(function(request, response) {
    // Qui possiamo processare la richiesta HTTP
    // Dal momento che ci interessano solo le WebSocket, non dobbiamo implmentare nulla
});

server.listen(8080, function() { });
// Creazione del server
wsServer = new WebSocketServer({
    httpServer: server
});

// Gestione degli eventi
wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  connection.on('message', function(message) {
    // Metodo eseguito alla ricezione di un messaggio
    if (message.type === 'utf8') {
      var receivedPacket = JSON.parse(message.utf8Data);
      switch (receivedPacket.command) {
        case commands.LOGIN_REQUEST:
          userHandler.onLoginRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.SIGNUP_REQUEST:
          userHandler.onSignUpRequest(commands, receivedPacket, sqlConnection, connection);
        break;
        case commands.UPDATE_DATA_REQUEST:
          userHandler.onUpdateUserDataRequest(commands, receivedPacket, sqlConnection, connection);
        break;
        case commands.TABLE_CARD_FILL_REQUEST:
          manageMethodsHandler.onTableCardFillRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.TABLE_IBAN_FILL_REQUEST:
          manageMethodsHandler.onTableIbanFillRequest(commands, receivedPacket, sqlConnection, connection);      
          break;
        case commands.TABLE_ONLINE_FILL_REQUEST:
          manageMethodsHandler.onTableOnlineFillRequest(commands, receivedPacket, sqlConnection, connection);      
          break;
        case commands.INSERT_CARD_REQUEST:
          manageMethodsHandler.onInsertCardRequest(commands, receivedPacket, sqlConnection, connection);      
          break;
        case commands.INSERT_IBAN_REQUEST:
          manageMethodsHandler.onInsertIbanRequest(commands, receivedPacket, sqlConnection, connection);      
          break;
        case commands.RECHARGE_ONLINE_REQUEST:
          manageMethodsHandler.onRechargeOnlineRequest(commands, receivedPacket, sqlConnection, connection);      
          break;
        case commands.DEFAULT_CARD_REQUEST:
          manageMethodsHandler.onDefaultCardRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.DEFAULT_IBAN_REQUEST:
          manageMethodsHandler.onDefaultIbanRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.DEFAULT_ONLINE_REQUEST:
          manageMethodsHandler.onDefaultOnlineRequest(commands, receivedPacket, sqlConnection, connection);
          break;  
        case commands.PAYMENT_SHOP_REQUEST:
          variousHandler.onPaymentShopRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.SHOW_TRANSACTIONS_CARD_REQUEST:
          showTransactionHandler.onShowTransactionCardRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.SHOW_TRANSACTIONS_ONLINE_REQUEST:
          showTransactionHandler.onShowTransactionOnlineRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.SHOW_TRANSACTIONS_IBAN_REQUEST:
          showTransactionHandler.onShowTransactionIbanRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.PERIODIC_PAYMENT_REQUEST:
          periodicPaymentHandler.onPeriodicPaymentRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.SEND_MONEY_REQUEST:
          variousHandler.onSendMoneyRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.RECEIVE_MONEY_REQUEST:
          variousHandler.onReceiveMoneyRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.TABLE_PERIODIC_PAYMENT_CARD_REQUEST:
          periodicPaymentHandler.onPeriodicPaymentCardRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.TABLE_PERIODIC_PAYMENT_IBAN_REQUEST:
          periodicPaymentHandler.onTablePeriodicPaymentIbanRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.INSERT_REQUEST_MONEY:
          requestsHandler.onInsertRequestMoney(commands, receivedPacket, sqlConnection, connection, emailSender);
          break;
        case commands.TABLE_PERIODIC_PAYMENT_ONLINE_REQUEST:
          periodicPaymentHandler.onPeriodicPaymentOnlineRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.DELETE_PERIODIC_PAYMENT_CARD_REQUEST:
          periodicPaymentHandler.onDeletePeriodicPaymentCardRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.DELETE_PERIODIC_PAYMENT_IBAN_REQUEST:
          periodicPaymentHandler.onDeletePeriodicPaymentIbanRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.DELETE_PERIODIC_PAYMENT_ONLINE_REQUEST:
          periodicPaymentHandler.onDeletePeriodicPaymentOnlineRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.TABLE_REQUEST_FILL:
          requestsHandler.onTableRequestFill(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.DELETE_REFUSE_REQUEST:
          variousHandler.onDeleteRefuseRequest(commands, receivedPacket,sqlConnection,connection);
        break;
        case commands.SET_LIMIT_CARD_REQUEST:
          manageMethodsHandler.onSetLimitCardRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.SET_LIMIT_IBAN_REQUEST:
          manageMethodsHandler.onSetLimitIbanRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.SET_LIMIT_ONLINE_REQUEST:
          manageMethodsHandler.onSetLimitOnlineRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.UPDATE_LIMIT_CARD_REQUEST:
            manageMethodsHandler.onUpdateLimitCardRequest(commands, receivedPacket, sqlConnection, connection);
            break;
        case commands.UPDATE_LIMIT_IBAN_REQUEST:
          manageMethodsHandler.onUpdateLimitIbanRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.UPDATE_LIMIT_ONLINE_REQUEST:
          manageMethodsHandler.onUpdateLimitOnlineRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.NUMBER_OF_TRANSACTIONS_REQUEST:
          showTransactionHandler.onNumberOfTransactionRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.NUMBER_OF_PERIODICS_REQUEST:
          periodicPaymentHandler.onNumberOfPeriodicsRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.FORGOT_PASSWORD_REQUEST:
          userHandler.onForgotPasswordRequest(commands, receivedPacket, sqlConnection, connection, emailSender);
          break;
        case commands.INSERT_TRANSACTION:
          variousHandler.onInsertTransaction(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.SHOW_TRANSACTIONS_ACCREDIT_CARD_REQUEST:
          showTransactionHandler.onShowTransactionAccreditCardRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        case commands.SHOW_TRANSACTIONS_ACCREDIT_IBAN_REQUEST:
            showTransactionHandler.onShowTransactionAccreditIbanRequest(commands, receivedPacket, sqlConnection, connection);
            break;
        case commands.SHOW_TRANSACTIONS_ACCREDIT_ONLINE_REQUEST:
          showTransactionHandler.onShowTransactionAccreditOnlineRequest(commands, receivedPacket, sqlConnection, connection);
          break;
        default:
          console.log("Comando non riconosciuto");
          break;
        }
      } 
    });
    connection.on('close', function(connection) {
        //metodo ala chiusura della connessione
        //console.log("connessione chiusa");
    });
});

//connessione al database
var mysql = require('mysql');

var sqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "app"
});

sqlConnection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});