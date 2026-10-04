import { SessaoModel } from '../models/SessaoModel.js';
import { SessaoView } from '../views/SessaoView.js';

export class SessaoController {
  constructor() {
    this.view = new SessaoView();
    this.configurarEventos();
  }

  async abrirSessoesDoIdoso(idoso) {
    this.view.abrirModal(idoso);
    await this.carregarHistorico(idoso.id);
  }

  async carregarHistorico(idosoId) {
    try {
      const sessoes = await SessaoModel.buscarPorIdoso(idosoId);
      this.view.renderizarHistorico(sessoes);
    } catch (erro) {
      alert('Erro ao carregar histórico de sessões: ' + erro.message);
    }
  }

  configurarEventos() {
    this.view.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dados = this.view.obterDadosFormulario();

      try {
        await SessaoModel.criar(dados);
        this.view.limparFormulario();
        await this.carregarHistorico(dados.idosoId);
      } catch (erro) {
        alert('Erro ao registrar sessão: ' + erro.message);
      }
    });
  }
}