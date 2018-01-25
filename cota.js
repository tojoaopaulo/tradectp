'use strict';

class Cota {
  constructor(nome, valor, quantidade = 0) {
    this.Nome = nome;
    this.Label = nome === 'BTC' || nome === 'USDT' ? 'BTC/USDT' : nome + '/BTC';
    this.ValorCompra = nome == 'USDT' ? 1 : new Number(valor);
    this.Quantidade = new Number(quantidade);
    this.MaiorPreco = 0;
    // privada
    var ultimoPreco;

    var TradePairId;

    var Volume;

    var Variacao1h;
    var Variacao24h;
    var Variacao7d;
  }

  get UltimoPreco() {
    return this.ultimoPreco;
  }

  set UltimoPreco(value) {
    this.ultimoPreco = value;

    if (typeof this.MaiorPreco != 'number') {
      if (this.ultimoPreco > this.MaiorPreco)
        this.MaiorPreco = this.ultimoPreco;
      else
        this.MaiorPreco = this.ValorCompra;
    }
    else if (this.ultimoPreco > this.MaiorPreco)
      this.MaiorPreco = this.ultimoPreco;
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
    //var quedaAceitavelStopMovel = jaTeveAlgumGanho ? -4 : -7;
    var quedaAceitavelStopMovel = -3;

    return this.VariacaoMaiorPreco() < quedaAceitavelStopMovel;
  }

  EstaEmQuedaBizarra() {
    return this.VariacaoMaiorPreco() <= -10;
  }

}

module.exports = Cota;