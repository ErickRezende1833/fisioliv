import { IdosoModel } from '../models/IdosoModel.js';
import { IdosoView } from '../views/IdosoView.js';
import { ConfirmacaoView } from '../views/ConfirmacaoView.js';
import { SessaoController } from './SessaoController.js';
import { SessaoModel } from '../models/SessaoModel.js';

export class IdosoController {
  constructor() {
    this.view = new IdosoView();
    this.confirmacao = new ConfirmacaoView();
    this.sessaoController = new SessaoController(this.confirmacao, () => this.carregarIdosos());
    this.idososCache = []; 
    this.mediasCache = {};
  }

  async inicializar() {
    this.configurarEventos();
    await this.carregarIdosos();
  }

  async carregarIdosos() {
    try {
      this.idososCache = await IdosoModel.buscarTodos();
      
      // Guarda as médias no cache
      this.mediasCache = {};
      for (const idoso of this.idososCache) {
        this.mediasCache[idoso.id] = await SessaoModel.calcularResumoUltimasSessoes(idoso.id);
      }

      this.aplicarFiltroEPrefazerLista();
    } catch (erro) {
      alert('Erro ao carregar idosos: ' + erro.message);
    }
  }

  aplicarFiltroEPrefazerLista() {
    const termo = this.view.inputPesquisa.value.toLowerCase().trim();
    
    // Filtra idosos cujo nome contenha o termo pesquisado
    const idososFiltrados = this.idososCache.filter(idoso => 
      idoso.nome.toLowerCase().includes(termo)
    );

    this.view.renderizarLista(idososFiltrados, this.mediasCache);
  }

  configurarEventos() {
    // Evento de digitação na caixa de pesquisa
    this.view.inputPesquisa.addEventListener('input', () => {
      this.aplicarFiltroEPrefazerLista();
    });

    // Cadastro ou edição de Idoso
    this.view.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dados = this.view.obterDadosFormulario();
      const idEmEdicao = this.view.obterIdEmEdicao();

      try {
        if (idEmEdicao) {
          await IdosoModel.atualizar(idEmEdicao, dados);
        } else {
          await IdosoModel.criar(dados);
        }
        this.view.limparFormulario();
        await this.carregarIdosos();
      } catch (erro) {
        alert('Erro ao salvar idoso: ' + erro.message);
      }
    });

    // Cancelar edição
    this.view.btnCancelar.addEventListener('click', () => {
      this.view.limparFormulario();
    });

    // Botões da tabela de Idosos: Sessões, Editar e Remover
    this.view.tabela.addEventListener('click', async (e) => {
      const btn = e.target.closest('.btn-sessoes, .btn-editar-idoso, .btn-remover-idoso');
      if (!btn) return;

      const idosoId = btn.getAttribute('data-id');
      const idosoEncontrado = this.idososCache.find(i => i.id == idosoId);
      if (!idosoEncontrado) return;

      if (btn.classList.contains('btn-sessoes')) {
        this.sessaoController.abrirSessoesDoIdoso(idosoEncontrado);
      } else if (btn.classList.contains('btn-editar-idoso')) {
        this.view.preencherFormulario(idosoEncontrado);
      } else if (btn.classList.contains('btn-remover-idoso')) {
        await this.removerIdoso(idosoEncontrado);
      }
    });
  }

  async removerIdoso(idoso) {
    const totalSessoes = this.mediasCache[idoso.id]?.totalSessoes || 0;
    const aviso = totalSessoes > 0
      ? `${idoso.nome} e todas as sessões dele(a) serão apagados.`
      : `${idoso.nome} será apagado(a).`;

    const confirmou = await this.confirmacao.perguntar(aviso);
    if (!confirmou) return;

    try {
      await IdosoModel.remover(idoso.id);
      if (this.view.obterIdEmEdicao() == idoso.id) this.view.limparFormulario();
      await this.carregarIdosos();
    } catch (erro) {
      alert('Erro ao remover idoso: ' + erro.message);
    }
  }
}
