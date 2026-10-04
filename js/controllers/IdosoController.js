import { IdosoModel } from '../models/IdosoModel.js';
import { IdosoView } from '../views/IdosoView.js';

export class IdosoController {
  constructor() {
    this.view = new IdosoView();
  }

  async inicializar() {
    this.configurarEventos();
    await this.carregarIdosos();
  }

  async carregarIdosos() {
    try {
      const idosos = await IdosoModel.buscarTodos();
      this.view.renderizarLista(idosos);
    } catch (erro) {
      alert('Erro ao carregar idosos: ' + erro.message);
    }
  }

  configurarEventos() {
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
  }
}