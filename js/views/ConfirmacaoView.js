// Janela de confirmação reutilizável (usada antes de remover registros)
export class ConfirmacaoView {
  constructor() {
    this.modalElement = document.getElementById('modalConfirmacao');
    this.modalBs = new bootstrap.Modal(this.modalElement);
    this.texto = document.getElementById('texto-confirmacao');
    this.btnConfirmar = document.getElementById('btn-confirmar-remocao');
  }

  // Retorna uma Promise: true se o usuário confirmou, false se cancelou
  perguntar(mensagem) {
    return new Promise(resolve => {
      this.texto.textContent = mensagem;
      let confirmou = false;

      const aoConfirmar = () => {
        confirmou = true;
        this.modalBs.hide();
      };
      const aoFechar = () => {
        this.btnConfirmar.removeEventListener('click', aoConfirmar);
        resolve(confirmou);
      };

      this.btnConfirmar.addEventListener('click', aoConfirmar);
      this.modalElement.addEventListener('hidden.bs.modal', aoFechar, { once: true });
      this.modalBs.show();
    });
  }
}
