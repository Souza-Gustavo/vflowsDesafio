$(document).ready(function () {
    $('#cep').on('blur', function () {
        const cep = $(this).val().replace(/\D/g, '');

        if (cep.length === 8) {
            const url = `https://viacep.com.br/ws/${cep}/json/`;

            $.ajax({
                url: url,
                method: 'get',
                dataType: 'json',
                success: function (data) {
                    if (!data.erro) {
                        const enderecoCompleto = `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`;
                        $('#endereco').val(enderecoCompleto);
                    } else {
                        alert('CEP não encontrado.');
                        $('#endereco').val('');
                    }
                },
                error: function () {
                    alert('Erro ao buscar endereço.');
                    $('#endereco').val('');
                }
            });

        } else {
            alert('CEP inválido. Digite 8 números.');
            $('#endereco').val('');
        }
    });

    let contadorProdutos = 0;

    $('#adicionarProduto').on('click', function () {
        contadorProdutos++;

        const novaLinha = `
        <tr data-id="${contadorProdutos}">
            <td><input type="text" class="form-control descricao" required></td>
            <td><input type="text" class="form-control unidade" required></td>
            <td><input type="number" class="form-control quantidade" min="0" required></td>
            <td><input type="number" class="form-control valorUnitario" step="0.01" min="0" required></td>
            <td><input type="text" class="form-control valorTotal" readonly></td>
            <td><button type="button" class="btn btn-danger btn-sm removerProduto">Excluir</button></td>
        </tr>
        `;

        $('#tabelaProdutos tbody').append(novaLinha);

    });

    //CalculoAutomático
    $('#tabelaProdutos').on('input', '.quantidade, .valorUnitario', function () {
        const linha = $(this).closest('tr');
        const quantidade = parseFloat(linha.find('.quantidade').val()) || 0;
        const valorUnitario = parseFloat(linha.find('.valorUnitario').val()) || 0;
        const total = quantidade * valorUnitario;

        linha.find('.valorTotal').val(total.toFixed(2));
    });

    //RemoverProduto
    $('#tabelaProdutos').on('click', '.removerProduto', function () {
        $(this).closest('tr').remove();
    });

});
