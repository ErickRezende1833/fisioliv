export class SessaoView {
  constructor() {
    this.modalElement = document.getElementById('modalSessoes');
    this.modalBs = new bootstrap.Modal(this.modalElement);
    this.modalNomeIdoso = document.getElementById('modal-nome-idoso');
    this.form = document.getElementById('form-sessao');
    this.inputIdosoId = document.getElementById('sessao-idoso-id');
    this.containerHistorico = document.getElementById('historico-sessoes-container');
    this.inputSessaoId = document.getElementById('sessao-id');
    this.tituloForm = document.getElementById('titulo-form-sessao');
    this.btnSalvar = document.getElementById('btn-salvar-sessao');
    this.btnCancelar = document.getElementById('btn-cancelar-sessao');
    this.sessoesAtuais = [];
  }

  abrirModal(idoso) {
    this.modalNomeIdoso.textContent = idoso.nome;
    this.inputIdosoId.value = idoso.id;
    this.limparFormulario();
    this.modalBs.show();
  }

  // Fecha a janela e espera a animação terminar (usado antes de abrir a confirmação)
  esconderModal() {
    return new Promise(resolve => {
      this.modalElement.addEventListener('hidden.bs.modal', () => resolve(), { once: true });
      this.modalBs.hide();
    });
  }

  mostrarModal() {
    this.modalBs.show();
  }

  renderizarHistorico(sessoes) {
    this.sessoesAtuais = sessoes;
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
            <div class="text-nowrap">
              <button class="btn btn-sm btn-outline-secondary btn-editar-sessao" data-id="${sessao.id}">Editar</button>
              <button class="btn btn-sm btn-outline-danger btn-remover-sessao" data-id="${sessao.id}">Remover</button>
            </div>
          </div>
          <div class="small text-muted mb-2">
            ${sessao.pressao_arterial ? `<span class="me-2"><strong>PA:</strong> ${sessao.pressao_arterial}</span>` : ''}
            ${sessao.frequencia_cardiaca ? `<span class="me-2"><strong>FC:</strong> ${sessao.frequencia_cardiaca} bpm</span>` : ''}
            ${sessao.saturacao_oxigenio ? `<span><strong>SpO2:</strong> ${sessao.saturacao_oxigenio}%</span>` : ''}
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

  buscarSessaoCarregada(id) {
    return this.sessoesAtuais.find(s => s.id == id);
  }

  // Coloca o formulário em modo de edição, preenchido com os dados da sessão
  preencherFormulario(sessao) {
    this.inputSessaoId.value = sessao.id;
    document.getElementById('pa').value = sessao.pressao_arterial || '';
    document.getElementById('fc').value = sessao.frequencia_cardiaca ?? '';
    document.getElementById('spo2').value = sessao.saturacao_oxigenio ?? '';
    document.getElementById('observacoes').value = sessao.observacoes || '';
    this.tituloForm.textContent = 'Editar Sessão';
    this.btnSalvar.textContent = 'Salvar Alterações';
    this.btnCancelar.classList.remove('d-none');
    this.modalElement.querySelector('.modal-body').scrollTo({ top: 0, behavior: 'smooth' });
  }

  obterIdEmEdicao() {
    return this.inputSessaoId.value;
  }

  limparFormulario() {
    // Guarda o id do idoso, pois o reset do formulário apagaria o campo oculto
    const idosoId = this.inputIdosoId.value;
    this.form.reset();
    this.inputIdosoId.value = idosoId;
    this.inputSessaoId.value = '';
    this.tituloForm.textContent = 'Registrar Nova Sessão';
    this.btnSalvar.textContent = 'Salvar Sessão';
    this.btnCancelar.classList.add('d-none');
  }
}