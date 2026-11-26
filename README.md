# 🍽️ Festival Sabores do Brasil

Sistema web desenvolvido para gerenciar inscrições e participantes de um evento gastronômico fictício que celebra a diversidade da culinária brasileira.

## 👨‍🎓 Informações Acadêmicas

- **Aluno:** Victor Lucas Batista e Silva
- **Curso:** Análise e Desenvolvimento de Sistemas (ADS)
- **Período:** 2º Período

## 📌 Sobre o Projeto

O **Festival Sabores do Brasil** é uma aplicação web criada com o objetivo de praticar conceitos fundamentais do desenvolvimento web, utilizando HTML5, CSS3 e JavaScript.

A aplicação permite organizar inscrições, acompanhar a participação dos visitantes e gerenciar as atividades do evento.

## 🚀 Funcionalidades

- Cadastro de participantes.
- Validação de CPF.
- Verificação de inscrições duplicadas.
- Armazenamento de dados utilizando LocalStorage.
- Geração de ingressos individuais com QR Code.
- Consulta de participantes.
- Controle de check-in nas estações do evento.
- Prevenção de registros duplicados de presença.
- Acompanhamento da participação dos visitantes.
- Emissão de certificados em PDF.

## 🛠️ Tecnologias Utilizadas

- **HTML5:** estrutura da aplicação.
- **CSS3:** estilização e responsividade.
- **JavaScript:** funcionalidades e interatividade.
- **LocalStorage:** armazenamento local dos dados.
- **QRCode.js:** geração dos QR Codes.
- **jsPDF:** criação dos certificados em PDF.
- **html2canvas:** captura de conteúdo para geração dos certificados.

## 📂 Estrutura do Projeto

```text
Festival-Sabores-do-Brasil/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## ▶️ Como Executar

1. Faça o download ou clone este repositório.
2. Abra a pasta do projeto no Visual Studio Code.
3. Execute o arquivo `index.html` utilizando a extensão Live Server.
4. A aplicação será aberta no navegador.

**Observação:** é necessário ter conexão com a internet para carregar as bibliotecas externas utilizadas no projeto.

## 💾 Armazenamento de Dados

Os dados dos participantes são armazenados utilizando o LocalStorage do navegador.

As informações permanecem disponíveis após atualizar ou fechar a página, desde que o armazenamento do navegador não seja apagado.

## 📱 Responsividade

A interface foi desenvolvida para se adaptar a diferentes tamanhos de tela, proporcionando uma experiência de utilização em computadores, tablets e dispositivos móveis.

## ⚠️ Observações

- O QR Code é gerado individualmente para identificar o ingresso do participante.
- Nesta versão, o check-in é realizado por meio da consulta do CPF, não pela leitura automática do QR Code.
- O armazenamento é local e não compartilhado entre diferentes dispositivos.
- O projeto possui finalidade acadêmica e demonstrativa.

---

## 👨‍💻 Desenvolvedor

**Victor Lucas Batista e Silva**

Estudante de Análise e Desenvolvimento de Sistemas (ADS).

Projeto desenvolvido como atividade prática de desenvolvimento de aplicações web.

**Festival Sabores do Brasil** 🇧🇷

*Celebrando a diversidade e os sabores da culinária brasileira.*