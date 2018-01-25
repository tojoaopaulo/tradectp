'use strict';

class Ordem {
  constructor(cota, id, tipo, restante) {
    this.Cota = cota;
    this.Id = id;
    this.Tipo = tipo;
    this.Restante = restante;
  }
}

module.exports = Ordem;
