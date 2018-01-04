"use strict"

class Cota
{
  constructor (nome, valor )
  {
      this.Nome = nome;
      this.Valor = valor;
      this.MaiorPreco;
      // privada
      var ultimoPreco;    
  }

  get UltimoPreco(){
    return this.ultimoPreco;
  }

  set UltimoPreco(value){
    this.ultimoPreco = value;

    if(value > this.MaiorPreco)
    this.MaiorPreco = value;
  }
}

module.exports = Cota;