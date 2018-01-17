'use strict';

class Cota {
  constructor(nome, valor, quantidade = 0) {
    this.Nome = nome;
    this.Label = nome === 'BTC' ? 'BTC/USDT' : nome + '/BTC';
    this.ValorCompra = new Number(valor);
    this.Quantidade = new Number(quantidade);
    this.MaiorPreco = 0;
    // privada
    var ultimoPreco;

    var TradePairId;

    var Variacao1h;
    var Variacao24h;
    var Variacao7d;
  }

  get UltimoPreco() {
    return this.ultimoPreco;
  }

  set UltimoPreco(value) {
    this.ultimoPreco = value;

    if (typeof this.MaiorPreco != 'number' || this.MaiorPreco === undefined || this.MaiorPreco == '' || value > this.MaiorPreco)
      this.MaiorPreco = value;
  }

  VariacaoDePreco() {
    return this.UltimoPreco - this.ValorCompra;
  }

  VariacaoPercentualPreco() {
    return this.VariacaoDePreco() / this.ValorCompra;
  }

  QuantidadeBTC() {
    if (this.Nome === 'BTC')
      return this.Quantidade;

    return this.UltimoPreco * this.Quantidade;
  }

  VariacaoMaiorPreco() {
    return Math.round(((this.UltimoPreco - this.MaiorPreco) / this.MaiorPreco) * 100);
  }

  EstaEmQueda() {
    var jaTeveAlgumGanho = this.MaiorPreco > this.ValorCompra;
    var quedaAceitavelStopMovel = jaTeveAlgumGanho ? -5 : -8;

    return this.VariacaoMaiorPreco() < quedaAceitavelStopMovel;
  }
}

module.exports = Cota;