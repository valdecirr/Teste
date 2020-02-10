


function LoadForm() {
	// formID = GetURLParameter('GID');
	// LoadCurrentUser();

    // login = SiteUser.Name;
}

$(document).on('click', '#imprimir', function () {

    if ($('#firstName').val() == "") {
        let texto = "NOME";
        Alerta(texto);
        $('#firstName').focus();
    } else if ($('#lastName').val() == "") {
        alert('Favor Informe um Nome!');
        $('#lastName').focus();
    } else if ($('#empresa').val() == "") {
        alert('Favor Informe um Nome!');
        $('#empresa').focus();
    }

});

function Alerta(texto) {
    var birdAlert = new BirdAlert();
    birdAlert.notify({
        msg: 'O campo <b>' + texto + '</b> é obrigatório',
        title: 'Atenção',
        className: 'error',
        duration: 5000,
    });          
}