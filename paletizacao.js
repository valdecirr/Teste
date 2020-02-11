var texto;

function LoadForm() {
    // formID = GetURLParameter('GID');
    // LoadCurrentUser();
    // login = SiteUser.Name;

    LoadUF();
}

$(document).on('click', '#imprimir', function () {

    if ($('#nome').val() == "") {
        texto = "NOME";
        Alerta();
        $('#nome').focus();
    } else if ($('#lastName').val() == "") {
        alert('Favor Informe um Nome!');
        $('#lastName').focus();
    } else if ($('#empresa').val() == "") {
        alert('Favor Informe um Nome!');
        $('#empresa').focus();
    }

});

function Alerta() {
    var birdAlert = new BirdAlert();
    birdAlert.notify({
        msg: 'O Campo' + texto +'é obrigatório',
        title: 'Confirmação de Exclusão',
        className: 'success',
        duration: 200000,
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