var CTPClient = require('./coreCTPClient.js');
var Carteira = require('./Carteira.js');
var Bitcoin = require('./Bitcoin.js');

var IGNORARQUEDABTC = true;

async function MelhorVender(cota) {
  var periodoTempoParaAnalisar = 1;
  var percentualMaximoPerda = -10;
  var vender = false;

  // BITCOIN % VARIACAO ULTIMAS 24H + 7D OU HORA Q COMPREI BTCS

  var BTC = await Bitcoin.CotacaoBTC();

  if( !IGNORARQUEDABTC && (BTC.Variacao7d < -10 || BTC.Variacao24h < -6 || BTC.Variacao1h < -4))
  {
    Bitcoin.tempoAtualizacaoPreco = 1;
    return true;
  }
  else if (cota.EstaEmQueda()) {
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

// Gera uma ordem de venda com o valor proximo as ultimas ordens de venda criadas
async function GerarMelhorOrdemVenda(cota) {

  try {
    var result = await CTPClient.BuscarUltimasOrdensAbertas(cota.Label);

    // TODO: Se a quantidade da primeira ordem for um numero alto, então passar a considerar a primeira ordem
    var valorVenda = result.Sell[1].Price - 0.00000001;
    
    await Carteira.EmitirOrdemVenda(cota, valorVenda);
  }
  catch (error) {
    console.log("DEU MERDA FEIA PARA VENDER" + error.message)
  }
}

module.exports.ExecutarEstrategia = async function ExecutarEstrategia(cota) {
  console.log("ESTRATEGIA " + cota.Nome)

  // Cancela as ordens em aberto para gerar com valor atualizado
  await Carteira.CancelarOrdem(cota);

  // Por hora so executa a estrategia para BTX
  if(await this.MelhorVender(cota))
  //if(await this.MelhorVender(cota))
  {
    console.log("CRIANDO ORDEM PARA VENDER " + cota.Nome)
    await this.GerarMelhorOrdemVenda(cota);
  }
    
}

module.exports.AnalisarHistoricoMercado = AnalisarHistoricoMercado;
module.exports.MelhorVender = MelhorVender;
module.exports.GerarMelhorOrdemVenda = GerarMelhorOrdemVenda;

const TendenciaMercado = {
  QUEDA: 'queda',
  ALTA: 'alta',
  LATERALIZADO: 'lateralizado'
};