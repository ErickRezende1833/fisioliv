export class IdosoView {
  constructor() {
    this.tabela = document.getElementById('tabela-idosos');
    this.form = document.getElementById('form-idoso');
  }

  renderizarLista(idosos) {
    this.tabela.innerHTML = '';

    if (idosos.length === 0) {
      this.tabela.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-muted py-3">Nenhum idoso cadastrado.</td>
        </tr>`;
      return;
    }

    idosos.forEach(idoso => {
      const dataFormatada = new Date(idoso.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="fw-medium">${idoso.nome}</td>
        <td>${dataFormatada}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary btn-sessoes" data-id="${idoso.id}">
            Sessões
          </button>
        </td>
      `;
      this.tabela.appendChild(tr);
    });
  }

  obterDadosFormulario() {
    return {
      nome: document.getElementById('nome').value.trim(),
      dataNascimento: document.getElementById('dataNascimento').value
    };
  }

  limparFormulario() {
    this.form.reset();
  }
}