export class IdosoView {
  constructor() {
    this.tabela = document.getElementById('tabela-idosos');
    this.form = document.getElementById('form-idoso');
    this.inputPesquisa = document.getElementById('input-pesquisa');
  }

  // Função auxiliar para calcular a idade
  calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getUTCFullYear();
    const mes = hoje.getMonth() - nascimento.getUTCMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getUTCDate())) {
      idade--;
    }
    return idade;
  }

  // Função auxiliar para criar o badge de tendência
  gerarIndicadorTendencia(tendencia) {
    if (tendencia === 'subindo') {
      return '<span class="badge bg-danger ms-1" title="Tendência de alta">↑ Subindo</span>';
    } else if (tendencia === 'descendo') {
      return '<span class="badge bg-success ms-1" title="Tendência de queda">↓ Descendo</span>';
    } else if (tendencia === 'estavel') {
      return '<span class="badge bg-secondary ms-1" title="Estável">→ Estável</span>';
    }
    return '';
  }

  renderizarLista(idosos, mediasPorIdoso = {}) {
    this.tabela.innerHTML = '';

    if (idosos.length === 0) {
      this.tabela.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-3">Nenhum paciente encontrado.</td>
        </tr>`;
      return;
    }

    idosos.forEach(idoso => {
      const idade = this.calcularIdade(idoso.data_nascimento);
      const dataFormatada = new Date(idoso.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      
      const resumo = mediasPorIdoso[idoso.id];

      let textoMediaPA = '<span class="text-muted small">Sem dados</span>';
      let textoMediaFC = '<span class="text-muted small">Sem dados</span>';
      let textoMediaSpO2 = '<span class="text-muted small">Sem dados</span>';

      if (resumo && resumo.totalSessoes > 0) {
        if (resumo.mediaPA !== null) {
          textoMediaPA = `<strong>${resumo.mediaPA}</strong> ${this.gerarIndicadorTendencia(resumo.tendenciaPA)}`;
        }
        if (resumo.mediaFC !== null) {
          textoMediaFC = `<strong>${resumo.mediaFC} bpm</strong> ${this.gerarIndicadorTendencia(resumo.tendenciaFC)}`;
        }
        if (resumo.mediaSpO2 !== null) {
          textoMediaSpO2 = `<strong>${resumo.mediaSpO2}%</strong> ${this.gerarIndicadorTendencia(resumo.tendenciaSpO2)}`;
        }
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="fw-medium">
          ${idoso.nome}
          <div class="small text-muted">${idade} anos (${dataFormatada})</div>
        </td>
        <td class="small">${textoMediaPA}</td>
        <td class="small">${textoMediaFC}</td>
        <td class="small">${textoMediaSpO2}</td>
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