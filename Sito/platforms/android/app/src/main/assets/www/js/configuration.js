
function sendIP(){

    localStorage.setItem('ip', $('input[type=text]').val());

    location.href = "index.html","_self";
}