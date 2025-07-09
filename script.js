const dados = [
  { tipo: 'Liso', oleo: 'Normal', quimica: 'Sim', pintado: 'Sim', shampoo: 'Shampoo Cresce Cabelo' },
  { tipo: 'Liso', oleo: 'Normal', quimica: 'Sim', pintado: 'Não', shampoo: 'Shampoo Ilumini Blond' },
  { tipo: 'Liso', oleo: 'Normal', quimica: 'Não', pintado: 'Sim', shampoo: 'Shampoo Essencial Bio' },
  { tipo: 'Liso', oleo: 'Normal', quimica: 'Não', pintado: 'Não', shampoo: 'Shampoo Tutano' },
  { tipo: 'Liso', oleo: 'Oleoso', quimica: 'Sim', pintado: 'Sim', shampoo: 'Shampoo Cresce Cabelo' },
  // Adicione mais registros conforme necessário
];

document.getElementById('formShampoo').addEventListener('submit', function(e) {
  e.preventDefault();

  const tipo = document.getElementById('tipoCabelo').value;
  const oleo = document.getElementById('oleosidade').value;
  const quimica = document.getElementById('temQuimica').value;
  const pintado = document.getElementById('pintado').value;

  const resultado = dados.find(d =>
    d.tipo === tipo &&
    d.oleo === oleo &&
    d.quimica === quimica &&
    d.pintado === pintado
  );

  const divResultado = document.getElementById('resultado');
  if (resultado) {
    divResultado.innerHTML = `<p>✨ Shampoo recomendado: <strong>${resultado.shampoo}</strong></p>`;
  } else {
    divResultado.innerHTML = `<p style="color:red;">❌ Nenhuma recomendação encontrada.</p>`;
  }
});