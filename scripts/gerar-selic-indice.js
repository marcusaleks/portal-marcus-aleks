const fs = require('fs');
const https = require('https');
const path = require('path');

const URL = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json&dataInicial=01/07/1994&dataFinal=08/05/2026';
const OUTPUT_PATH = path.join(__dirname, '../public/data/selic-indice.json');
const METADATA_PATH = path.join(__dirname, '../public/data/selic-metadata.json');

console.log('Iniciando fetch de dados da SELIC (Série 11) do BCB...');

https.get(URL, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const bcbData = JSON.parse(data);
      console.log(`Recebidos ${bcbData.length} registros.`);

      if (!bcbData || bcbData.length === 0) {
        console.error('Nenhum dado recebido do BCB.');
        return;
      }

      let indiceAcumulado = 1.0;
      const processedData = bcbData.map((item, index) => {
        // A API do BCB retorna o valor com vírgula (ex: "0,041700")
        const taxaDiaria = parseFloat(item.valor.replace(',', '.'));
        const fatorDia = 1 + (taxaDiaria / 100);
        
        // Cálculo do índice acumulado: I_n = I_n-1 * (1 + taxa_n/100)
        indiceAcumulado *= fatorDia;

        return {
          data: item.data,
          selichistDiaria: taxaDiaria,
          fatorDia: parseFloat(fatorDia.toFixed(10)),
          indiceAcumulado: parseFloat(indiceAcumulado.toFixed(12)),
          diasUteis: index + 1
        };
      });

      const output = {
        atualizado_em: new Date().toISOString(),
        proximo_copom: "2026-06-02",
        fonte: "Série 11 BCB (% a.d.)",
        dados: processedData
      };

      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
      console.log(`Arquivo gerado em: ${OUTPUT_PATH}`);

      const metadata = {
        total_registros: processedData.length,
        inicio: processedData[0].data,
        fim: processedData[processedData.length - 1].data,
        indice_final: indiceAcumulado,
        ultima_atualizacao: new Date().toISOString()
      };

      fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2));
      console.log(`Metadata gerada em: ${METADATA_PATH}`);

    } catch (e) {
      console.error('Erro ao processar dados:', e.message);
      console.error('Stack:', e.stack);
    }
  });

}).on('error', (err) => {
  console.error('Erro no fetch:', err.message);
});
