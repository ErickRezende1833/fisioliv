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
}