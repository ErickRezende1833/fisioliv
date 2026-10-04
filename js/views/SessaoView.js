export class SessaoView {
  constructor() {
    this.modalElement = document.getElementById('modalSessoes');
    this.modalBs = new bootstrap.Modal(this.modalElement);
    this.modalNomeIdoso = document.getElementById('modal-nome-idoso');
    this.form = document.getElementById('form-sessao');
    this.inputIdosoId = document.getElementById('sessao-idoso-id');
    this.containerHistorico = document.getElementById('historico-sessoes-container');
  }

  abrirModal(idoso) {
    this.modalNomeIdoso.textContent = idoso.nome;
    this.inputIdosoId.value = idoso.id;
    this.limparFormulario();
    this.modalBs.show();
  }

  renderizarHistorico(sessoes) {
    this.containerHistorico.innerHTML = '';

    if (sessoes.length === 0) {
      this.containerHistorico.innerHTML = `
        <div class="alert alert-secondary text-center small mb-0">
          Nenhuma sessão registrada para este paciente até o momento.
        </div>`;
      return;
    }

    sessoes.forEach(sessao => {
      const dataHora = new Date(sessao.data_sessao).toLocaleString('pt-BR');

      const card = document.createElement('div');
      card.className = 'card mb-2 border-0 bg-light shadow-sm';
      card.innerHTML = `
        <div class="card-body p-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-secondary">${dataHora}</span>
            <div class="small text-muted">
              ${sessao.pressao_arterial ? `<span class="me-2"><strong>PA:</strong> ${sessao.pressao_arterial}</span>` : ''}
              ${sessao.frequencia_cardiaca ? `<span class="me-2"><strong>FC:</strong> ${sessao.frequencia_cardiaca} bpm</span>` : ''}
              ${sessao.saturacao_oxigenio ? `<span><strong>SpO2:</strong> ${sessao.saturacao_oxigenio}%</span>` : ''}
            </div>
          </div>
          <p class="card-text small mb-0 text-dark">
            ${sessao.observacoes ? sessao.observacoes : '<em>Sem observações registradas.</em>'}
          </p>
        </div>
      `;
      this.containerHistorico.appendChild(card);
    });
  }

  obterDadosFormulario() {
    return {
      idosoId: this.inputIdosoId.value,
      pressaoArterial: document.getElementById('pa').value.trim(),
      frequenciaCardiaca: document.getElementById('fc').value,
      saturacaoOxigenio: document.getElementById('spo2').value,
      observacoes: document.getElementById('observacoes').value.trim()
    };
  }

  limparFormulario() {
    this.form.reset();
  }
}