$(document).ready(function () {

  // BUSCA ENDEREÇO PELO CEP
  $('#cep').on('blur', function () {
    const cep = $(this).val().replace(/\D/g, '');

    if (cep.length !== 8) return;

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(response => response.json())
      .then(data => {
        if (!data.erro) {
          $('#endereco').val(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
        } else {
          alert('CEP não encontrado.');
        }
      });
  });


  // PRODUTOS - ADICIONAR LINHA
  $('#adicionarProduto').click(function () {
    const linha = `
      <tr>
        <td><input type="text" class="form-control descricao" required></td>
        <td>
          <select class="form-select unidade" required>
            <option value="">Selecione</option>
            <option value="UN">UN</option>
            <option value="KG">KG</option>
            <option value="LT">LT</option>
          </select>
        </td>
        <td><input type="number" class="form-control qtd" min="0" required></td>
        <td><input type="number" class="form-control valor" min="0" step="0.01" required></td>
        <td class="valorTotal">0.00</td>
        <td><button type="button" class="btn btn-danger btn-sm remover">🗑</button></td>
      </tr>
    `;
    $('#tabelaProdutos tbody').append(linha);
  });


  // PRODUTOS - CALCULAR TOTAL
  $('#tabelaProdutos').on('input', '.qtd, .valor', function () {
    const linha = $(this).closest('tr');
    const qtd = parseFloat(linha.find('.qtd').val()) || 0;
    const valor = parseFloat(linha.find('.valor').val()) || 0;
    const total = (qtd * valor).toFixed(2);
    linha.find('.valorTotal').text(total);
    atualizarTotalGeral();
  });

  function atualizarTotalGeral() {
    let totalGeral = 0;
    $('#tabelaProdutos tbody tr').each(function () {
      const valor = parseFloat($(this).find('.valorTotal').text()) || 0;
      totalGeral += valor;
    });
    $('#totalGeral').text(totalGeral.toFixed(2));
  }


  // REMOVER PRODUTO
  $('#tabelaProdutos').on('click', '.remover', function () {
    $(this).closest('tr').remove();
    atualizarTotalGeral();
  });


  // ANEXOS
  const anexos = [];

  $('#anexoFornecedor').on('change', function () {
    const arquivos = this.files;
    const lista = $('#listaAnexos');
    lista.empty();
    anexos.length = 0;

    for (let i = 0; i < arquivos.length; i++) {
      const file = arquivos[i];
      const blob = new Blob([file], { type: file.type });

      const obj = {
        nome: file.name,
        blob: blob
      };

      anexos.push(obj);

      const item = $(`
        <div>
          ${file.name}
          <button type="button" class="btn btn-outline-primary btn-sm visualizar" data-index="${i}">👁</button>
          <button type="button" class="btn btn-outline-danger btn-sm excluir" data-index="${i}">🗑</button>
        </div>
      `);

      lista.append(item);
    }

    sessionStorage.setItem('anexos', JSON.stringify(anexos.map(a => a.nome)));
  });

  // VISUALIZAR ANEXO (download)
  $('#listaAnexos').on('click', '.visualizar', function () {
    const index = $(this).data('index');
    const file = anexos[index];

    const url = URL.createObjectURL(file.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.nome;
    a.click();
    URL.revokeObjectURL(url);
  });

  // EXCLUIR ANEXO
  $('#listaAnexos').on('click', '.excluir', function () {
    const index = $(this).data('index');
    anexos.splice(index, 1);
    $(this).parent().remove();
    sessionStorage.setItem('anexos', JSON.stringify(anexos.map(a => a.nome)));
  });


  $('#form-fornecedor').on('submit', function (e) {
    e.preventDefault();


    const modal = new bootstrap.Modal(document.getElementById('modalLoading'));
    modal.show();

    setTimeout(() => {
      modal.hide();

      // MONTA O JSON
      const fornecedor = {
        razaoSocial: $('#razaoSocial').val(),
        nomeFantasia: $('#nomeFantasia').val(),
        cnpj: $('#cnpj').val(),
        inscricaoEstadual: $('#inscricaoEstadual').val(),
        inscricaoMunicipal: $('#inscricaoMunicipal').val(),
        cep: $('#cep').val(),
        endereco: $('#endereco').val(),
        contato: $('#contato').val(),
        telefone: $('#telefone').val(),
        email: $('#email').val(),
        produtos: [],
        anexos: anexos.map(a => a.nome)
      };

      $('#tabelaProdutos tbody tr').each(function () {
        fornecedor.produtos.push({
          descricao: $(this).find('.descricao').val(),
          unidade: $(this).find('.unidade').val(),
          quantidade: $(this).find('.qtd').val(),
          valorUnitario: $(this).find('.valor').val(),
          valorTotal: $(this).find('.valorTotal').text()
        });
      });

      console.log("JSON Final:", JSON.stringify(fornecedor, null, 2));
      alert("Dados prontos para envio! Verifique o console.");
    }, 2000);
  });
});
