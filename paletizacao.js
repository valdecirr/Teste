function LoadForm() {
    // formID = GetURLParameter('GID');
    // LoadCurrentUser();
    // login = SiteUser.Name;

    LoadUF();
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

function LoadUF() {

    $('#uf').empty();
    AddDropDownItem('uf', '', '');

    UF.forEach(function (item) {
        AddDropDownItem('uf', item.uf, item.uf)
    });

}

$(document).on('change', '#uf', function () {

    let uflocal = $('#uf').val();

    $('#cidade').empty();
    AddDropDownItem('cidade', '', '');

    UF.forEach(function (item) {
        if (uflocal == item.uf) {
            uflocal = item.codigo_uf
        }
    });

    Municipio.forEach(function (item) {
        if (uflocal == item.codigo_uf) {
            AddDropDownItem('cidade', item.nome, item.nome)
        }

    });

})