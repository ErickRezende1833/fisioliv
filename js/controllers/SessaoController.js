import { SessaoModel } from '../models/SessaoModel.js';
import { SessaoView } from '../views/SessaoView.js';

export class SessaoController {
  // confirmacao: janela de confirmação compartilhada
  // aoAlterarSessoes: função chamada quando uma sessão é criada, editada ou removida (atualiza as médias)
  constructor(confirmacao, aoAlterarSessoes = () => {}) {
    this.view = new SessaoView();
    this.confirmacao = confirmacao;
    this.aoAlterarSessoes = aoAlterarSessoes;
    this.idosoAtualId = null;
    this.houveAlteracao = false;
    this.configurarEventos();
  }

  async abrirSessoesDoIdoso(idoso) {
    this.idosoAtualId = idoso.id;
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
    // Salvar (nova sessão ou edição)
    this.view.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dados = this.view.obterDadosFormulario();
      const idEmEdicao = this.view.obterIdEmEdicao();

      try {
        if (idEmEdicao) {
          await SessaoModel.atualizar(idEmEdicao, dados);
        } else {
          await SessaoModel.criar(dados);
        }
        this.view.limparFormulario();
        this.houveAlteracao = true;
        await this.carregarHistorico(dados.idosoId);
      } catch (erro) {
        alert('Erro ao salvar sessão: ' + erro.message);
      }
    });

    // Cancelar edição
    this.view.btnCancelar.addEventListener('click', () => {
      this.view.limparFormulario();
    });

    // Botões Editar / Remover de cada sessão do histórico
    this.view.containerHistorico.addEventListener('click', async (e) => {
      const btnEditar = e.target.closest('.btn-editar-sessao');
      const btnRemover = e.target.closest('.btn-remover-sessao');

      if (btnEditar) {
        const sessao = this.view.buscarSessaoCarregada(btnEditar.getAttribute('data-id'));
        if (sessao) this.view.preencherFormulario(sessao);
      }

      if (btnRemover) {
        await this.removerSessao(btnRemover.getAttribute('data-id'));
      }
    });

    // Ao fechar a janela de sessões, atualiza as médias da tabela se algo mudou
    this.view.modalElement.addEventListener('hidden.bs.modal', () => {
      if (this.houveAlteracao && !this.confirmandoRemocao) {
        this.houveAlteracao = false;
        this.aoAlterarSessoes();
      }
    });
  }

  async removerSessao(id) {
    const sessao = this.view.buscarSessaoCarregada(id);
    const dataHora = sessao ? new Date(sessao.data_sessao).toLocaleString('pt-BR') : '';

    // Fecha a janela de sessões enquanto a confirmação está aberta
    this.confirmandoRemocao = true;
    await this.view.esconderModal();
    const confirmou = await this.confirmacao.perguntar(`A sessão de ${dataHora} será apagada.`);
    this.confirmandoRemocao = false;
    this.view.mostrarModal();

    if (!confirmou) return;

    try {
      await SessaoModel.remover(id);
      if (this.view.obterIdEmEdicao() == id) this.view.limparFormulario();
      this.houveAlteracao = true;
      await this.carregarHistorico(this.idosoAtualId);
    } catch (erro) {
      alert('Erro ao remover sessão: ' + erro.message);
    }
  }
}
