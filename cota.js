function Cota(nome, valor )
{
  this.Nome = nome;
  this.Valor = valor;  
}

exports.NovaCota = (nome, valor) => new Cota(nome, valor); 