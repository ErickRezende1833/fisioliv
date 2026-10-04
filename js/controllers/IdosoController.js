import { IdosoModel } from '../models/IdosoModel.js';
import { IdosoView } from '../views/IdosoView.js';
import { SessaoController } from './SessaoController.js';
import { SessaoModel } from '../models/SessaoModel.js';

export class IdosoController {
  constructor() {
    this.view = new IdosoView();
    this.sessaoController = new SessaoController();
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

    // Cadastro de Idoso
    this.view.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dados = this.view.obterDadosFormulario();

      try {
        await IdosoModel.criar(dados);
        this.view.limparFormulario();
        await this.carregarIdosos();
      } catch (erro) {
        alert('Erro ao cadastrar idoso: ' + erro.message);
      }
    });

    // Clique no botão "Sessões" da tabela de Idosos
    this.view.tabela.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-sessoes');
      if (btn) {
        const idosoId = btn.getAttribute('data-id');
        const idosoEncontrado = this.idososCache.find(i => i.id == idosoId);

        if (idosoEncontrado) {
          this.sessaoController.abrirSessoesDoIdoso(idosoEncontrado);
        }
      }
    });
  }
}