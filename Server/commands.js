module.exports = Object.freeze({
    //Client To Server
    LOGIN_REQUEST: '1',
    SIGNUP_REQUEST: '2',
    UPDATE_DATA_REQUEST: '3',
    TABLE_CARD_FILL_REQUEST: '4',
    INSERT_CARD_REQUEST: '5',
    DEFAULT_CARD_REQUEST: '7',
    PAYMENT_SHOP_REQUEST: '8',
    SHOW_TRANSACTIONS_CARD_REQUEST: '9',
    JOIN_METHOD_CARD: '10',
    JOIN_METHOD_ONLINE: '11',
    JOIN_METHOD_IBAN: '12',
    INSERT_IBAN_REQUEST: '13',
    RECHARGE_ONLINE_REQUEST: '14',
    TABLE_IBAN_FILL_REQUEST: '15',
    TABLE_ONLINE_FILL_REQUEST: '16',
    DEFAULT_IBAN_REQUEST: '19',
    DEFAULT_ONLINE_REQUEST: '20',
    SEND_MONEY_REQUEST: '21',
    PERIODIC_PAYMENT_REQUEST: '22',
    TABLE_PERIODIC_PAYMENT_CARD_REQUEST: '23',
    TABLE_PERIODIC_PAYMENT_IBAN_REQUEST: '24',
    TABLE_PERIODIC_PAYMENT_ONLINE_REQUEST: '25',
    DELETE_PERIODIC_PAYMENT_CARD_REQUEST: '26',
    DELETE_PERIODIC_PAYMENT_IBAN_REQUEST: '27',
    DELETE_PERIODIC_PAYMENT_ONLINE_REQUEST: '28',
    SHOW_TRANSACTIONS_ONLINE_REQUEST: '29',
    SHOW_TRANSACTIONS_IBAN_REQUEST: '30',
    RECEIVE_MONEY_REQUEST: '31',
    INSERT_REQUEST_MONEY: '32',
    TABLE_REQUEST_FILL: '33',
    DELETE_REFUSE_REQUEST: '34',
    SET_LIMIT_CARD_REQUEST:'35',
    SET_LIMIT_IBAN_REQUEST:'36',
    SET_LIMIT_ONLINE_REQUEST:'37',
    UPDATE_LIMIT_CARD_REQUEST:'38',
    UPDATE_LIMIT_IBAN_REQUEST:'39',
    UPDATE_LIMIT_ONLINE_REQUEST:'40',
    NUMBER_OF_TRANSACTIONS_REQUEST: '41',
    NUMBER_OF_PERIODICS_REQUEST: '42',
    INSERT_TRANSACTION: '43',
    FORGOT_PASSWORD_REQUEST: '44',
    SHOW_TRANSACTIONS_ACCREDIT_CARD_REQUEST: '45',
    SHOW_TRANSACTIONS_ACCREDIT_IBAN_REQUEST: '46',
    SHOW_TRANSACTIONS_ACCREDIT_ONLINE_REQUEST: '47',

    //Server To Client
    LOGIN_OK: '1',
    LOGIN_NOT_OK: '2',
    SIGNUP_OK: '3',
    SIGNUP_NOT_OK: '4',
    UPDATE_DATA_OK: '5',
    UPDATE_DATA_NOT_OK: '6',
    TABLE_FILL_OK: '7',
    TABLE_FILL_NOT_OK: '8',
    INSERT_CARD_OK: '9',
    INSERT_CARD_NOT_OK: '10',
    DEFAULT_METHOD_OK: '13',
    DEFAULT_METHOD_NOT_OK: '14',
    PAYMENT_SHOP_OK: '15',
    PAYMENT_SHOP_NOT_OK: '16',
    SHOW_TRANSACTIONS_OK: '17',
    SHOW_TRANSACTIONS_NOT_OK: '18',
    INSERT_IBAN_OK : '19',
    INSERT_IBAN_NOT_OK: '20',
    RECHARGE_ONLINE_OK : '21',
    RECHARGE_ONLINE_NOT_OK: '22',
    SEND_MONEY_OK: '23',
    SEND_MONEY_NOT_OK: '24',
    PERIODIC_PAYMENT_OK: '25',
    PERIODIC_PAYMENT_NOT_OK: '26',
    TABLE_PERIODIC_PAYMENT_OK: '27',
    TABLE_PERIODIC_PAYMENT_NOT_OK: '28',
    DELETE_PERIODIC_PAYMENT_OK: '29',
    DELETE_PERIODIC_PAYMENT_NOT_OK: '30',
    RECEIVE_MONEY_OK: '31',
    RECEIVE_MONEY_NOT_OK: '32',
    INSERT_REQUEST_MONEY_NOT_OK: '33',
    INSERT_REQUEST_MONEY_OK: '34',
    DELETE_REFUSE_REQUEST_OK: '35',
    DELETE_REFUSE_REQUEST_NOT_OK:'36',
    SET_LIMIT_OK:'37',
    SET_LIMIT_NOT_OK:'38',
    UPDATE_LIMIT_OK:'39',
    UPDATE_LIMIT_NOT_OK:'40',
    NUMBER_OF_TRANSACTIONS: '41',
    NUMBRER_OF_PERIODICS: '42',
    INSERT_TRANSACTION_OK: '43',
    INSERT_TRANSACTION_NOT_OK: '44',
    FORGOT_PASSWORD_NOT_OK: '45',
    FORGOT_PASSWORD_OK: '46',
});