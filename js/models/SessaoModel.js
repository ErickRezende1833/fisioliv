import { supabase } from '../config/supabase.js';

export class SessaoModel {
  static async buscarPorIdoso(idosoId) {
    const { data, error } = await supabase
      .from('sessoes_fisioterapia')
      .select('*')
      .eq('idoso_id', idosoId)
      .order('data_sessao', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  static async criar(sessao) {
    const { data, error } = await supabase
      .from('sessoes_fisioterapia')
      .insert([
        {
          idoso_id: sessao.idosoId,
          pressao_arterial: sessao.pressaoArterial,
          frequencia_cardiaca: sessao.frequenciaCardiaca ? parseInt(sessao.frequenciaCardiaca) : null,
          saturacao_oxigenio: sessao.saturacaoOxigenio ? parseInt(sessao.saturacaoOxigenio) : null,
          observacoes: sessao.observacoes
        }
      ])
      .select();

    if (error) throw new Error(error.message);
    return data;
  }

  static async atualizar(id, sessao) {
    const { data, error } = await supabase
      .from('sessoes_fisioterapia')
      .update({
        pressao_arterial: sessao.pressaoArterial,
        frequencia_cardiaca: sessao.frequenciaCardiaca ? parseInt(sessao.frequenciaCardiaca) : null,
        saturacao_oxigenio: sessao.saturacaoOxigenio ? parseInt(sessao.saturacaoOxigenio) : null,
        observacoes: sessao.observacoes
      })
      .eq('id', id)
      .select();

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      throw new Error('Nenhum registro foi alterado. Verifique as permissões de UPDATE (RLS) da tabela sessoes_fisioterapia no Supabase.');
    }
    return data;
  }

  static async remover(id) {
    const { data, error } = await supabase
      .from('sessoes_fisioterapia')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      throw new Error('Nenhum registro foi removido. Verifique as permissões de DELETE (RLS) da tabela sessoes_fisioterapia no Supabase.');
    }
    return data;
  }

  static async calcularResumoUltimasSessoes(idosoId) {
    const { data: sessoes, error } = await supabase
      .from('sessoes_fisioterapia')
      .select('pressao_arterial, frequencia_cardiaca, saturacao_oxigenio, data_sessao')
      .eq('idoso_id', idosoId)
      .order('data_sessao', { ascending: false })
      .limit(5);

    if (error) throw new Error(error.message);

    if (!sessoes || sessoes.length === 0) {
      return { totalSessoes: 0 };
    }

    // Filtra e calcula Média da Pressão Arterial (Sistólica / Diastólica)
    const pas = sessoes
      .map(s => s.pressao_arterial)
      .filter(v => v && v.includes('/'))
      .map(v => {
        const partes = v.split('/');
        return { sistolica: parseInt(partes[0]), diastolica: parseInt(partes[1]) };
      })
      .filter(v => !isNaN(v.sistolica) && !isNaN(v.diastolica));

    let mediaPA = null;
    // Sem seta quando há só 1 medição (não há com o que comparar)
    let tendenciaPA = null;

    if (pas.length > 0) {
      const mediaSis = Math.round(pas.reduce((a, b) => a + b.sistolica, 0) / pas.length);
      const mediaDia = Math.round(pas.reduce((a, b) => a + b.diastolica, 0) / pas.length);
      mediaPA = `${mediaSis}/${mediaDia}`;

      if (pas.length >= 2) {
        tendenciaPA = 'estavel';
        if (pas[0].sistolica > pas[pas.length - 1].sistolica) tendenciaPA = 'subindo';
        else if (pas[0].sistolica < pas[pas.length - 1].sistolica) tendenciaPA = 'descendo';
      }
    }

    // Filtra e calcula Média da Frequência Cardíaca
    const fcs = sessoes.map(s => s.frequencia_cardiaca).filter(v => v !== null && v !== undefined);
    const mediaFC = fcs.length > 0 ? Math.round(fcs.reduce((a, b) => a + b, 0) / fcs.length) : null;

    // Sem seta quando há só 1 medição (não há com o que comparar)
    let tendenciaFC = null;
    if (fcs.length >= 2) {
      tendenciaFC = 'estavel';
      if (fcs[0] > fcs[fcs.length - 1]) tendenciaFC = 'subindo';
      else if (fcs[0] < fcs[fcs.length - 1]) tendenciaFC = 'descendo';
    }

    // Filtra e calcula Média da Saturação
    const spo2s = sessoes.map(s => s.saturacao_oxigenio).filter(v => v !== null && v !== undefined);
    const mediaSpO2 = spo2s.length > 0 ? Math.round(spo2s.reduce((a, b) => a + b, 0) / spo2s.length) : null;

    // Sem seta quando há só 1 medição (não há com o que comparar)
    let tendenciaSpO2 = null;
    if (spo2s.length >= 2) {
      tendenciaSpO2 = 'estavel';
      if (spo2s[0] > spo2s[spo2s.length - 1]) tendenciaSpO2 = 'subindo';
      else if (spo2s[0] < spo2s[spo2s.length - 1]) tendenciaSpO2 = 'descendo';
    }

    return {
      totalSessoes: sessoes.length,
      mediaPA,
      mediaFC,
      mediaSpO2,
      tendenciaPA,
      tendenciaFC,
      tendenciaSpO2
    };
  }
}