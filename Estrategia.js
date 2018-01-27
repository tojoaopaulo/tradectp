var CTPClient = require('./coreCTPClient.js');
var Carteira = require('./Carteira.js');
var Bitcoin = require('./Bitcoin.js');
const AT = require('technicalindicators');
var Cota = require('./Cota.js');

var IGNORARQUEDABTC = true;
var periodoTempoParaAnalisar = 1;
var quantidadeMinimaPossivelOperar = 0.0005;

module.exports.MelhorVender = async function MelhorVender(cota) {

  var percentualMaximoPerda = -10;
  var vender = false;

  // BITCOIN % VARIACAO ULTIMAS 24H + 7D OU HORA Q COMPREI BTCS

  var BTC = await Bitcoin.CotacaoBTC();

  if (!IGNORARQUEDABTC && (BTC.Variacao7d < -10 || BTC.Variacao24h < -6 || BTC.Variacao1h < -4)) {
    Bitcoin.tempoAtualizacaoPreco = 1;
    return true;
  }
  else if (cota.Nome != BTC.Nome) {
    if (cota.EstaEmQuedaBizarra())
      vender = true;
    else if (cota.EstaEmQueda()) {
      Bitcoin.tempoAtualizacaoPreco = 3;
      var tendencia = await this.AnalisarHistoricoMercado(cota.Label, periodoTempoParaAnalisar);

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
  }
  return vender;
}

module.exports.AnalisarHistoricoMercado = async function AnalisarHistoricoMercado(Label, Tempo = 1) {

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
  var meioQtd = parseInt(qtdOrdensAAnalisar / 2);

  try {
    if (Math.abs(proporcaoCxV) < valorProporcao)
      tendencia = TendenciaMercado.LATERALIZADO;
    else if (proporcaoCxV > 0 && amostraOrdens[meioQtd].Price < amostraOrdens[0].Price)
      tendencia = TendenciaMercado.ALTA;
    else
      tendencia = TendenciaMercado.QUEDA;

  } catch (error) {
    console.log(meioQtd + ' ' + amostraOrdens[0] + ' ' + amostraOrdens.length)
  }

  console.log(tendencia + ' ' + proporcaoCxV);
  return tendencia;
}

// Gera uma ordem de venda com o valor proximo as ultimas ordens de venda criadas
module.exports.GerarMelhorOrdemVenda = async function GerarMelhorOrdemVenda(cota) {

  try {
    var result = await CTPClient.BuscarUltimasOrdensAbertas(cota.Label);

    // TODO: Se a quantidade da primeira ordem for um numero alto, então passar a considerar a primeira ordem
    // Se a primeira for um valor a baixo da segunda, colocar como segunda a ser executada
    var valorVenda = result.Sell[0].Price - 0.00000001;

    // chama um processo em paralelo sem considerar tempo para atualizar a quantidade e verificar se o menor valor mudou
    //this.GerenciarVenda(cota);

    await Carteira.EmitirOrdemVenda(cota, valorVenda);
  }
  catch (error) {
    console.log("DEU MERDA FEIA PARA VENDER" + error.message)
  }
}

module.exports.GerenciarVenda = async function GerenciarVenda(cota) {

  var cotas = Carteira.MinhaCarteira();
  cota = cotas.filter(c => c.Nome == cota.Nome);

  if (cota.quantidade > quantidadeMinimaPossivelOperar) {
    var ultimasOrdens = await CTPClient.BuscarUltimasOrdensAbertas(cota.Label);

    var valorVenda = ultimasOrdens.Sell[0].Price - 0.00000001;

    await Carteira.EmitirOrdemVenda(cota, valorVenda);
  }



}

module.exports.ExecutarEstrategia = async function ExecutarEstrategia(cota) {

  if (IGNORARQUEDABTC)
    console.log("IGNORANDO QUEDA DO BTC ");

  console.log("ESTRATEGIA " + cota.Nome)

  if (cota.Quantidade > quantidadeMinimaPossivelOperar) {
    // Cancela as ordens em aberto para gerar com valor atualizado
    await Carteira.CancelarOrdem(cota);

    // Por hora so executa a estrategia para BTX
    if (await this.MelhorVender(cota))
    //if(await this.MelhorVender(cota))
    {
      console.log("CRIANDO ORDEM PARA VENDER " + cota.Nome)
      await this.GerarMelhorOrdemVenda(cota);
    }
  }
}

const TendenciaMercado = {
  QUEDA: 'queda',
  ALTA: 'alta',
  LATERALIZADO: 'lateralizado'
};

// somente sobre top 5 volume 
module.exports.SugestaoCompra = async function SugestaoCompra() {

  var todosMercados = await CTPClient.BuscarMercados('BTC');
  var sugestoes = [];

  // Ordena por volume
  todosMercados.sort(ComparaPorVolume);

  for (var i = 0; i < todosMercados.length || sugestoes.length < 10; i++) {
    var cota = todosMercados[i];
    //if(cota.Variacao24h > 0)
    //{
    var tendencia = await this.AnalisarHistoricoMercado(cota.Label, periodoTempoParaAnalisar);

    if (tendencia == TendenciaMercado.ALTA) {
      sugestoes.push(cota);

      console.log(JSON.stringify(cota));
    }
    //}
  }

  return sugestoes;
}

function ComparaPorVolume(a, b) {
  let comparacao = 0;

  if (a.Volume > b.Volume)
    comparacao = -1;
  else if (a.Volume < b.Volume)
    comparacao = 1;

  return comparacao;
}

module.exports.AnalisarTendenciaAtivo = async function AnalisarTendenciaAtivo() {

  var result = await CTPClient.BuscarUltimasOrdensAbertas('LUX');

  var MACDInput = {
    values: [],
    fastPeriod: 5,
    slowPeriod: 8,
    signalPeriod: 3,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  };

  AT.MACD.calculate();

  if (result != null)
    return await CalculaTendenciaPorOrdens(result);
  else
    console.log("deu ruim ");
}

module.exports.Comprar = async function Comprar(Label) {
  console.log(Label);
  try {
    var livroOrdens = await CTPClient.BuscarUltimasOrdensAbertas(Label);
    var minhaOrdem = await CTPClient.BuscarMinhasOrdensEmAberto(Label);

    var ValorOrdemCompraMaisAlta = livroOrdens.Buy[0].Price;

    var cota = new Cota();
    cota.Label = Label;

    // ordem existe com valor igual - nao gera ordem
    if(minhaOrdem != undefined && ValorOrdemCompraMaisAlta == minhaOrdem.Cota.ValorCompra)
      return;

    // ordem existe com valor diferente - cancela e gera ordem
    if (minhaOrdem != undefined && ValorOrdemCompraMaisAlta != minhaOrdem.Cota.ValorCompra)
    {
      await Carteira.CancelarOrdem(minhaOrdem.Cota);
      cota.Quantidade = minhaOrdem.Restante;
    }

    await this.GerarMelhorOrdemCompra(cota, ValorOrdemCompraMaisAlta);
  }
  catch (error) {
    console.log("DEU MERDA PARA COMPRAR" + error.message)
  }
}

module.exports.GerarMelhorOrdemCompra = async function GerarMelhorOrdemCompra(cota, ultimoValorCompra) {

  cota.ValorCompra = ultimoValorCompra + 0.00000001;

  if (cota.Quantidade == 0) {
    var quantidadeParaCadaAtivo = await Carteira.CalcularTotal() / 5;
    cota.Quantidade = quantidadeParaCadaAtivo / cota.ValorCompra;
  }

  // gera nova ordem de compra
  await Carteira.EmitirOrdemCompra(cota);
}

