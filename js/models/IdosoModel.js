import { supabase } from '../config/supabase.js';

export class IdosoModel {
  static async buscarTodos() {
    const { data, error } = await supabase
      .from('idosos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  static async criar(idoso) {
    const { data, error } = await supabase
      .from('idosos')
      .insert([
        { nome: idoso.nome, data_nascimento: idoso.dataNascimento }
      ])
      .select();

    if (error) throw new Error(error.message);
    return data;
  }

  static async atualizar(id, idoso) {
    const { data, error } = await supabase
      .from('idosos')
      .update({ nome: idoso.nome, data_nascimento: idoso.dataNascimento })
      .eq('id', id)
      .select();

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      throw new Error('Nenhum registro foi alterado. Verifique as permissões de UPDATE (RLS) da tabela idosos no Supabase.');
    }
    return data;
  }

  static async remover(id) {
    // Remove primeiro as sessões do idoso, para não violar a chave estrangeira
    const { error: erroSessoes } = await supabase
      .from('sessoes_fisioterapia')
      .delete()
      .eq('idoso_id', id);

    if (erroSessoes) throw new Error(erroSessoes.message);

    const { data, error } = await supabase
      .from('idosos')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      throw new Error('Nenhum registro foi removido. Verifique as permissões de DELETE (RLS) da tabela idosos no Supabase.');
    }
    return data;
  }
}
