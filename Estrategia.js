var CTPClient = require('./coreCTPClient.js');

async function MelhorVender(cota) {
  var periodoTempoParaAnalisar = 1;
  var percentualMaximoPerda = -10;
  var vender = false;

  if (cota.EstaEmQueda()) {
    var tendencia = await AnalisarHistoricoMercado(cota.Label, periodoTempoParaAnalisar);

    switch (tendencia) {
      case TendenciaMercado.QUEDA:
        vender = true;
        break;
      case TendenciaMercado.ALTA:
        vender = false;
        break;
      case TendenciaMercado.LATERALIZADO:
        if (cota.VariacaoPercentualPreco() < percentualMaximoPerda)
          vender = false;
        break;
    }
  }

  return vender;
}

async function AnalisarHistoricoMercado(Label, Tempo = 1) {

  var result = await CTPClient.BuscarUltimasOrdensEfetivadas(Label, Tempo);

  if (result != null)
    return await CalculaTendenciaPorOrdens(result);
  else
    console.log("deu ruim ");
}

function CalculaTendenciaPorOrdens(ordens) {
  var histOrdens = ordens;
  var tendenciaLonga = CalculaTendenciaPorRange(histOrdens, 200);
  var tendenciaCurta = CalculaTendenciaPorRange(histOrdens, 20);

  var tendencia;

  if (tendenciaCurta == TendenciaMercado.QUEDA &&
    tendenciaLonga == TendenciaMercado.QUEDA)
    tendencia = TendenciaMercado.QUEDA;

  if (tendenciaCurta == TendenciaMercado.QUEDA &&
    tendenciaLonga == TendenciaMercado.LATERALIZADO)
    tendencia = TendenciaMercado.QUEDA;

  if (tendenciaCurta == TendenciaMercado.QUEDA &&
    tendenciaLonga == TendenciaMercado.ALTA)
    tendencia = TendenciaMercado.LATERALIZADO;

  if (tendenciaCurta == TendenciaMercado.LATERALIZADO &&
    tendenciaLonga == TendenciaMercado.LATERALIZADO)
    tendencia = TendenciaMercado.LATERALIZADO;

  if (tendenciaCurta == TendenciaMercado.LATERALIZADO &&
    tendenciaLonga == TendenciaMercado.QUEDA)
    tendencia = TendenciaMercado.LATERALIZADO;

  if (tendenciaCurta == TendenciaMercado.LATERALIZADO &&
    tendenciaLonga == TendenciaMercado.ALTA)
    tendencia = TendenciaMercado.LATERALIZADO;

  if (tendenciaCurta == TendenciaMercado.ALTA &&
    tendenciaLonga == TendenciaMercado.ALTA)
    tendencia = TendenciaMercado.ALTA;

  if (tendenciaCurta == TendenciaMercado.ALTA &&
    tendenciaLonga == TendenciaMercado.LATERALIZADO)
    tendencia = TendenciaMercado.ALTA;

  if (tendenciaCurta == TendenciaMercado.ALTA &&
    tendenciaLonga == TendenciaMercado.QUEDA)
    tendencia = TendenciaMercado.LATERALIZADO;

  return tendencia;
}

function CalculaTendenciaPorRange(ordens, qtdOrdensAAnalisar) {
  var valorProporcao = (15 / 100) * qtdOrdensAAnalisar;
  var amostraOrdens = ordens.slice(0, qtdOrdensAAnalisar);

  var compra = amostraOrdens.filter(function (item) {
    return item.Type == "Buy";
  });

  var venda = amostraOrdens.filter(function (item) {
    return item.Type == "Sell";
  });

  var proporcaoCxV = compra.length - venda.length;

  var tendencia;

  if (Math.abs(proporcaoCxV) < valorProporcao)
    tendencia = TendenciaMercado.LATERALIZADO;
  else if (proporcaoCxV > 0)
    tendencia = TendenciaMercado.ALTA;
  else
    tendencia = TendenciaMercado.QUEDA;

  console.log(tendencia + ' ' + proporcaoCxV);
  return tendencia;
}

async function GerarMelhorOrdemVenda() {
  // Busca as ultimas ordens
  var result = await CTPClient.BuscarUltimasOrdensEfetivadas(Label);
  // pega as ordens de venda ordenado decrescente por data
  // verifica um valor comum das ultimas 5 ordens
  // cria ordem de venda

  // ou pega ultimas ordens de venda existentes
  // ve um valor comum e remove alguns centavos
}

module.exports.AnalisarHistoricoMercado = AnalisarHistoricoMercado;
module.exports.MelhorVender = MelhorVender;

const TendenciaMercado = {
  QUEDA: 'queda',
  ALTA: 'alta',
  LATERALIZADO: 'lateralizado'
};