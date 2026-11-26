'use strict';

// ==========================================
// 1. CONFIGURAÇÕES DO SISTEMA
// ==========================================

const STORAGE_KEY = 'festivalSabores_participantes_v2';

const STATIONS = [
  { id: 'norte', name: 'Sabores da Amazônia' },
  { id: 'nordeste', name: 'Tradição Nordestina' },
  { id: 'sudeste', name: 'Encontro de Sabores' },
  { id: 'sul', name: 'Sabores do Sul' }
];

const REQUIRED_PRESENCES = 3;

let participanteSelecionado = null;

const $ = (selector) => document.querySelector(selector);


// ==========================================
// 2. ARMAZENAMENTO LOCAL
// ==========================================

function carregarParticipantes() {
  try {
    const dados = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    );

    return Array.isArray(dados) ? dados : [];

  } catch (error) {
    console.error('Erro ao carregar participantes:', error);
    return [];
  }
}

function salvarParticipantes(participantes) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(participantes)
    );

    return true;

  } catch (error) {
    console.error('Erro ao salvar participantes:', error);
    return false;
  }
}


// ==========================================
// 3. FUNÇÕES DE CPF
// ==========================================

function somenteNumeros(valor) {
  return String(valor || '').replace(/\D/g, '');
}

function formatarCPF(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  return numeros
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function cpfValido(valor) {
  const cpf = somenteNumeros(valor);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let digito = (soma * 10) % 11;

  if (digito === 10) {
    digito = 0;
  }

  if (digito !== Number(cpf[9])) {
    return false;
  }

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  digito = (soma * 10) % 11;

  if (digito === 10) {
    digito = 0;
  }

  return digito === Number(cpf[10]);
}


// ==========================================
// 4. MENSAGENS DO SISTEMA
// ==========================================

function mostrarMensagem(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.className = `message ${tipo}`;
}


// ==========================================
// 5. LOCALIZAR PARTICIPANTE
// ==========================================

function localizarParticipantePorCPF(cpf) {
  const numero = somenteNumeros(cpf);

  return carregarParticipantes().find(
    (participante) => participante.cpf === numero
  );
}


// ==========================================
// 6. GERAR INGRESSO E QR CODE
// ==========================================

function atualizarIngresso(participante) {
  $('#ticketName').textContent = participante.nome;
  $('#ticketEmail').textContent = participante.email;

  $('#ticketCode').textContent =
    `CÓDIGO: ${participante.id}`;

  const qrContainer = $('#qrCode');
  const placeholder = $('#qrPlaceholder');

  // Limpa qualquer QR Code anterior.
  qrContainer.replaceChildren();

  placeholder.hidden = false;

  // Verifica se a biblioteca foi carregada.
  if (typeof QRCode === 'undefined') {
    console.error('Biblioteca QR Code não carregada.');
    return false;
  }

  try {
    // O QR Code contém somente o identificador do ingresso.
    // O CPF não é incluído no conteúdo do código.

    const conteudoQR =
      `FESTIVAL-SABORES-BRASIL|${participante.id}`;

    new QRCode(qrContainer, {
      text: conteudoQR,
      width: 180,
      height: 180,
      colorDark: '#172f24',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    placeholder.hidden = true;

    return true;

  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);

    placeholder.hidden = false;

    return false;
  }
}


// ==========================================
// 7. ATUALIZAR PROGRESSO DAS ESTAÇÕES
// ==========================================

function atualizarProgresso(participante) {
  const presencas = participante
    ? participante.presencas
    : [];

  const total = presencas.length;

  $('#progressName').textContent = participante
    ? participante.nome
    : 'Aguardando participante';

  $('#progressCount').textContent = `${total}/4`;

  $('#progressBar').style.width =
    `${(total / STATIONS.length) * 100}%`;

  $('#progressText').textContent = participante
    ? (
        total >= REQUIRED_PRESENCES
          ? 'Parabéns! Você atingiu a presença mínima para emitir o comprovante.'
          : `Faltam ${REQUIRED_PRESENCES - total} presença(s) para liberar o comprovante.`
      )
    : 'Informe o CPF no check-in para consultar o progresso.';

  const lista = $('#stationStatus');

  lista.replaceChildren();

  STATIONS.forEach((estacao) => {
    const concluida = presencas.includes(estacao.id);

    const item = document.createElement('li');

    if (concluida) {
      item.classList.add('done');
    }

    const bolinha = document.createElement('span');
    bolinha.className = 'status-dot';

    const nome = document.createElement('span');
    nome.textContent = estacao.name;

    const estado = document.createElement('span');
    estado.className = 'status-state';
    estado.textContent = concluida
      ? 'Concluída'
      : 'Pendente';

    item.append(bolinha, nome, estado);

    lista.appendChild(item);
  });

  $('#downloadPdf').disabled =
    !participante || total < REQUIRED_PRESENCES;
}


// ==========================================
// 8. LIMPAR PAINEL DO PARTICIPANTE
// ==========================================

function limparPainelParticipante() {
  participanteSelecionado = null;

  $('#ticketName').innerHTML =
    'Seu nome<br>aparecerá aqui';

  $('#ticketEmail').textContent =
    'Faça sua inscrição para gerar o ingresso.';

  $('#ticketCode').textContent =
    'CÓDIGO: AGUARDANDO INSCRIÇÃO';

  // Limpa o QR Code e mostra o espaço reservado.
  $('#qrCode').replaceChildren();
  $('#qrPlaceholder').hidden = false;

  atualizarProgresso(null);
}


// ==========================================
// 9. FORMATAÇÃO AUTOMÁTICA DO CPF
// ==========================================

$('#cpf').addEventListener('input', (event) => {
  event.target.value = formatarCPF(event.target.value);
});

$('#checkinCpf').addEventListener('input', (event) => {
  event.target.value = formatarCPF(event.target.value);
});


// ==========================================
// 10. CADASTRO DO PARTICIPANTE
// ==========================================

$('#registrationForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const mensagem = $('#registrationMessage');

  const nome = $('#name').value
    .trim()
    .replace(/\s+/g, ' ');

  const cpf = somenteNumeros($('#cpf').value);

  const email = $('#email').value
    .trim()
    .toLowerCase();

  const preferencia = $('#foodPreference').value;

  const restricao = $('#restriction').value.trim();


  // Validar nome.

  if (nome.length < 3) {
    mostrarMensagem(
      mensagem,
      'Informe seu nome completo (mínimo de 3 caracteres).',
      'error'
    );

    return;
  }


  // Validar CPF.

  if (!cpfValido(cpf)) {
    mostrarMensagem(
      mensagem,
      'CPF inválido. Confira os números digitados.',
      'error'
    );

    return;
  }


  // Validar e-mail.

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    mostrarMensagem(
      mensagem,
      'Informe um endereço de e-mail válido.',
      'error'
    );

    return;
  }


  // Validar preferência alimentar.

  if (!preferencia) {
    mostrarMensagem(
      mensagem,
      'Selecione sua preferência alimentar.',
      'error'
    );

    return;
  }


  // Verificar CPF duplicado.

  const participantes = carregarParticipantes();

  if (participantes.some((p) => p.cpf === cpf)) {
    mostrarMensagem(
      mensagem,
      'Já existe uma inscrição com esse CPF neste navegador.',
      'error'
    );

    return;
  }


  // Gerar identificador exclusivo.

  const identificador = window.crypto?.randomUUID
    ? window.crypto.randomUUID().slice(0, 8).toUpperCase()
    : Date.now().toString(36).toUpperCase();


  // Criar participante.

  const participante = {
    id: `FSB-${identificador}`,
    nome,
    cpf,
    email,
    preferencia,
    restricao,
    presencas: [],
    criadoEm: new Date().toISOString()
  };


  // Salvar no localStorage.

  participantes.push(participante);

  if (!salvarParticipantes(participantes)) {
    mostrarMensagem(
      mensagem,
      'Não foi possível salvar. Verifique as configurações do navegador.',
      'error'
    );

    return;
  }


  // Atualizar interface.

  participanteSelecionado = participante;

  const qrGerado = atualizarIngresso(participante);

  atualizarProgresso(participante);

  $('#checkinCpf').value = formatarCPF(cpf);

  mostrarMensagem(
    mensagem,
    qrGerado
      ? 'Inscrição realizada com sucesso! Seu ingresso foi gerado.'
      : 'Inscrição salva, mas não foi possível gerar o QR Code. Verifique sua conexão e atualize a página.',
    qrGerado ? 'success' : 'error'
  );

  $('#ticketName').scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
});


// ==========================================
// 11. REGISTRO DE CHECK-IN
// ==========================================

$('#checkinForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const mensagem = $('#checkinMessage');

  const cpfDigitado = $('#checkinCpf').value;


  // Validar CPF.

  if (!cpfValido(cpfDigitado)) {
    limparPainelParticipante();

    mostrarMensagem(
      mensagem,
      'Digite um CPF válido para consultar a inscrição.',
      'error'
    );

    return;
  }


  // Procurar participante.

  const participantes = carregarParticipantes();

  const indice = participantes.findIndex(
    (p) => p.cpf === somenteNumeros(cpfDigitado)
  );

  if (indice === -1) {
    limparPainelParticipante();

    mostrarMensagem(
      mensagem,
      'Inscrição não encontrada neste navegador. Faça o cadastro primeiro.',
      'error'
    );

    return;
  }


  // Verificar estação.

  const estacaoId = $('#station').value;

  if (!estacaoId) {
    mostrarMensagem(
      mensagem,
      'Selecione a estação que deseja registrar.',
      'error'
    );

    return;
  }


  const participante = participantes[indice];


  // Verificar se a estação já foi registrada.

  if (participante.presencas.includes(estacaoId)) {
    participanteSelecionado = participante;

    atualizarIngresso(participante);
    atualizarProgresso(participante);

    mostrarMensagem(
      mensagem,
      'Essa estação já foi registrada para este participante.',
      'error'
    );

    return;
  }


  // Registrar presença.

  participante.presencas.push(estacaoId);


  // Salvar alteração.

  if (!salvarParticipantes(participantes)) {
    mostrarMensagem(
      mensagem,
      'Não foi possível salvar o check-in. Tente novamente.',
      'error'
    );

    return;
  }


  // Atualizar painel.

  participanteSelecionado = participante;

  atualizarIngresso(participante);
  atualizarProgresso(participante);

  const nomeEstacao = STATIONS.find(
    (s) => s.id === estacaoId
  ).name;

  mostrarMensagem(
    mensagem,
    `Check-in confirmado: ${nomeEstacao}.`,
    'success'
  );
});


// ==========================================
// 12. GERAR COMPROVANTE EM PDF
// ==========================================

$('#downloadPdf').addEventListener('click', async () => {
  const mensagem = $('#pdfMessage');

  // Verificar regra de participação.

  if (
    !participanteSelecionado ||
    participanteSelecionado.presencas.length < REQUIRED_PRESENCES
  ) {
    mensagem.textContent =
      'O comprovante será liberado após 3 check-ins.';

    return;
  }


  // Verificar bibliotecas.

  if (!window.jspdf || !window.html2canvas) {
    mensagem.textContent =
      'Não foi possível carregar as bibliotecas do PDF. Verifique sua conexão com a internet.';

    return;
  }


  const botao = $('#downloadPdf');

  botao.disabled = true;

  mensagem.textContent = 'Preparando seu comprovante...';


  try {
    // Preencher certificado.

    $('#pdfParticipantName').textContent =
      participanteSelecionado.nome;

    $('#pdfPresenceCount').textContent =
      String(participanteSelecionado.presencas.length);

    $('#pdfDate').textContent =
      `Emitido em ${new Date().toLocaleDateString('pt-BR')}`;


    // Capturar certificado.

    const area = $('#pdfArea');

    const canvas = await html2canvas(
      area.querySelector('.pdf-certificate'),
      {
        scale: 2,
        backgroundColor: '#ffffff'
      }
    );


    const imagem = canvas.toDataURL('image/png');

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });


    // Ajustar certificado à página.

    const largura = 277;

    const altura =
      (canvas.height * largura) / canvas.width;

    pdf.addImage(
      imagem,
      'PNG',
      10,
      Math.max(10, (210 - altura) / 2),
      largura,
      Math.min(190, altura)
    );


    // Baixar PDF.

    pdf.save(
      `comprovante-${participanteSelecionado.id.toLowerCase()}.pdf`
    );

    mensagem.textContent =
      'Comprovante gerado com sucesso!';

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);

    mensagem.textContent =
      'Ocorreu um erro ao gerar o PDF. Tente novamente.';

  } finally {
    botao.disabled =
      !participanteSelecionado ||
      participanteSelecionado.presencas.length < REQUIRED_PRESENCES;
  }
});


// ==========================================
// 13. RESTAURAR DADOS AO ABRIR A PÁGINA
// ==========================================

function restaurarUltimoParticipante() {
  const participantes = carregarParticipantes();

  const ultimo = participantes[participantes.length - 1];

  if (!ultimo) {
    return;
  }

  participanteSelecionado = ultimo;

  atualizarIngresso(ultimo);
  atualizarProgresso(ultimo);

  $('#checkinCpf').value = formatarCPF(ultimo.cpf);
}


// Executar restauração ao carregar o sistema.

restaurarUltimoParticipante();