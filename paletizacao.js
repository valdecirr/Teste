var texto;

function LoadForm() {
    // formID = GetURLParameter('GID');
    // LoadCurrentUser();
    // login = SiteUser.Name;

    LoadUF();
}

$(document).on('click', '#imprimir', function () {

    if ($('#projeto').val() == "") {
        texto = "PROJETO";
        Alerta(texto);
        $('#projeto').focus();
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
        msg: 'O Campo ' + texto + ' é obrigatório',
        title: 'Notificação',
        className: 'error',
        duration: 2000,
    });

    return false
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

$(document).on('click', '#adicionarcampos', function () {
    var valortensao = $('#textotensao').val();

    if (valortensao == "" || valortensao == null) {
        texto = "TENSÃO";
        Alerta(texto);
        $('#textotensao').focus();
        return false;
    }

    $('#addcampos').append(
        '<div class="custom-control custom-radio custumize-radio" style="float:left;" >' +
        '<input id="' + valortensao + '"  name="tensaoA" type="radio" class="custom-control-input">' +
        '<label class="custom-control-label" for="' + valortensao + '">' + valortensao + '</label>' +
        '</div>',
    )

    $('#textotensao').val('')
})

$(document).on('click', '#btnCancel', function () {
    $('#textotensao').val('');
})

$(document).on('click', '#swgsim', function () {
    $('#textoinfo').html(
        '<div class = "custom-control custumize-radio" style = "color: red;margin-top: 10px;float:left" > ' +
        '<label for="swginf">A informação deve ser coletada e repassada através de um esboço.</label>' +
        '</div>',
    );
})

$(document).on('click', '#swgnao', function () {
    $('#textoinfo').html('');
})




function deletarTensao() {



}