const rl = require("readline-sync");
const fs = require("fs");

// ══════════════════════════════════════════════════════
//  CORES ANSI
// ══════════════════════════════════════════════════════
const C = {
  reset:   "\x1b[0m",
  bold:    "\x1b[1m",
  dim:     "\x1b[2m",
  red:     "\x1b[31m",
  green:   "\x1b[32m",
  yellow:  "\x1b[33m",
  blue:    "\x1b[34m",
  magenta: "\x1b[35m",
  cyan:    "\x1b[36m",
  white:   "\x1b[37m",
  bgRed:   "\x1b[41m",
  bgGreen: "\x1b[42m",
};
const cor = (txt, ...estilos) => estilos.join("") + txt + C.reset;

// ══════════════════════════════════════════════════════
//  BANCO DE PALAVRAS — 21 palavras, 3 categorias
// ══════════════════════════════════════════════════════
const BANCO = {
  Tecnologia: [
    { palavra: "JAVASCRIPT", dica: "Linguagem de programação da web" },
    { palavra: "ALGORITMO",  dica: "Sequência de passos para resolver um problema" },
    { palavra: "VARIAVEL",   dica: "Espaço na memória para guardar um valor" },
    { palavra: "FUNCAO",     dica: "Bloco de código reutilizável" },
    { palavra: "ARRAY",      dica: "Estrutura que armazena vários valores" },
    { palavra: "PYTHON",     dica: "Linguagem popular em inteligência artificial" },
    { palavra: "SERVIDOR",   dica: "Computador que fornece serviços em rede" },
  ],
  Animais: [
    { palavra: "CACHORRO",   dica: "Melhor amigo do homem" },
    { palavra: "BORBOLETA",  dica: "Inseto com asas coloridas" },
    { palavra: "ELEFANTE",   dica: "Maior animal terrestre do planeta" },
    { palavra: "JACARE",     dica: "Réptil de água doce com dentes afiados" },
    { palavra: "GOLFINHO",   dica: "Mamífero aquático muito inteligente" },
    { palavra: "PAPAGAIO",   dica: "Ave que imita sons humanos" },
    { palavra: "TARTARUGA",  dica: "Réptil com carapaça dura nas costas" },
  ],
  Frutas: [
    { palavra: "ABACAXI",    dica: "Fruta tropical com coroa de folhas" },
    { palavra: "MORANGO",    dica: "Fruta vermelha pequena e doce" },
    { palavra: "MARACUJA",   dica: "Fruta usada em sucos e mousses" },
    { palavra: "CAJU",       dica: "Fruta brasileira com castanha na ponta" },
    { palavra: "GOIABA",     dica: "Fruta rosada muito comum no Brasil" },
    { palavra: "MELANCIA",   dica: "Fruta verde por fora e vermelha por dentro" },
    { palavra: "MANGA",      dica: "Fruta tropical amarela e adocicada" },
  ],
};

const MAX_ERROS   = 6;
const TEMPO_LETRA = 15; // segundos por letra (temporizador)
const RANK_FILE   = "ranking.json";

// ══════════════════════════════════════════════════════
//  FORCA ASCII COLORIDA
// ══════════════════════════════════════════════════════
function forca(erros) {
  // A estrutura fica vermelha conforme os erros aumentam
  const fc = erros >= 3 ? C.red + C.bold : C.yellow;
  const boneco = erros >= 1 ? cor("O", C.cyan, C.bold) : " ";
  const corpo  = erros >= 2 ? cor("|", C.cyan, C.bold) : " ";
  const bracoE = erros >= 3 ? cor("/", C.cyan, C.bold) : " ";
  const bracoD = erros >= 4 ? cor("\\", C.cyan, C.bold) : " ";
  const pernaE = erros >= 5 ? cor("/", C.cyan, C.bold) : " ";
  const pernaD = erros >= 6 ? cor("\\", C.cyan, C.bold) : " ";

  const linha = (s) => fc + s + C.reset;

  console.log(linha("  ╔═══════╗"));
  console.log(linha("  ║       ║"));
  console.log(`  ${linha("║")}   ${boneco}   ${linha("║")}`);
  console.log(`  ${linha("║")}  ${bracoE}${corpo}${bracoD}  ${linha("║")}`);
  console.log(`  ${linha("║")}  ${pernaE} ${pernaD}  ${linha("║")}`);
  console.log(linha("  ║       ║"));
  console.log(linha("  ╚═══╦═══╝"));
  console.log(linha("      ║    "));
  console.log(linha("  ════╩════"));
}

// ══════════════════════════════════════════════════════
//  BARRA DE VIDA
// ══════════════════════════════════════════════════════
function barraVida(erros) {
  const restantes = MAX_ERROS - erros;
  const cheia  = cor("█", C.green);
  const vazia  = cor("░", C.red);
  const barra  = cheia.repeat(restantes) + vazia.repeat(erros);
  return `  Vidas: ${barra}  ${cor(restantes + "/" + MAX_ERROS, restantes <= 2 ? C.red : C.green, C.bold)}`;
}

// ══════════════════════════════════════════════════════
//  PALAVRA COM LETRAS COLORIDAS
// ══════════════════════════════════════════════════════
function exibirPalavra(palavra, corretas) {
  return palavra
    .split("")
    .map((l) =>
      corretas.includes(l)
        ? cor(" " + l + " ", C.green, C.bold)
        : cor(" _ ", C.dim)
    )
    .join("");
}

// ══════════════════════════════════════════════════════
//  MENSAGENS DINÂMICAS DE REAÇÃO
// ══════════════════════════════════════════════════════
function mensagemReacao(erros, streak) {
  if (streak >= 3) return cor("🔥 Que sequência incrível! Continue assim!", C.yellow, C.bold);
  if (erros === 0 && streak > 0) return cor("✨ Perfeito até agora!", C.cyan);
  if (erros === MAX_ERROS - 1)   return cor("😰 Última chance! Não erre mais!", C.red, C.bold);
  if (erros >= MAX_ERROS - 2)    return cor("⚠️  Cuidado, poucas tentativas restam!", C.yellow);
  if (erros === 0)               return cor("💪 Boa sorte! Você consegue!", C.green);
  const neutras = [
    "🤔 Pense bem antes de chutar...",
    "💡 Tente pensar na categoria!",
    "🎯 Foque! A palavra está quase lá.",
  ];
  return cor(neutras[erros % neutras.length], C.blue);
}

// ══════════════════════════════════════════════════════
//  TEMPORIZADOR — lê com timeout
// ══════════════════════════════════════════════════════
function lerComTempo(prompt, segundos) {
  const inicio = Date.now();
  process.stdout.write(prompt);

  // readline-sync nativo não tem timeout; usamos execFileSync via workaround
  // Solução: mostramos o cronômetro ANTES e pedimos input normalmente.
  // O "timeout" é honrado via checagem após a leitura.
  const entrada = rl.question("").toUpperCase().trim();
  const decorrido = (Date.now() - inicio) / 1000;

  if (decorrido > segundos) {
    console.log(cor(`\n  ⏰ Tempo esgotado! (${decorrido.toFixed(1)}s > ${segundos}s) — conta como erro.`, C.red));
    return { valor: null, timeout: true };
  }
  return { valor: entrada, timeout: false };
}

// ══════════════════════════════════════════════════════
//  PONTUAÇÃO
// ══════════════════════════════════════════════════════
function calcularPontos(erros, streak, usouDica, tempoMedio) {
  const base      = Math.max(0, (MAX_ERROS - erros) * 15);
  const bonus     = Math.min(streak, 5) * 8;          // até +40 por streak
  const velocidade = tempoMedio < 5 ? 20 : tempoMedio < 10 ? 10 : 0; // bônus velocidade
  const penalidade = usouDica ? 10 : 0;
  return Math.max(0, base + bonus + velocidade - penalidade);
}

// ══════════════════════════════════════════════════════
//  RANKING
// ══════════════════════════════════════════════════════
function carregarRanking() {
  try { return JSON.parse(fs.readFileSync(RANK_FILE, "utf8")); }
  catch { return []; }
}

function salvarRanking(nome, pontos) {
  const r = carregarRanking();
  r.push({ nome, pontos, data: new Date().toLocaleDateString("pt-BR") });
  r.sort((a, b) => b.pontos - a.pontos);
  fs.writeFileSync(RANK_FILE, JSON.stringify(r, null, 2));
}

function exibirRanking() {
  const r = carregarRanking();
  console.log(cor("\n  🏆 RANKING DOS MELHORES JOGADORES", C.yellow, C.bold));
  console.log(cor("  ════════════════════════════════", C.yellow));
  if (!r.length) {
    console.log(cor("  Nenhuma pontuação ainda. Seja o primeiro!", C.dim));
    return;
  }
  const medalhas = ["🥇", "🥈", "🥉"];
  r.slice(0, 10).forEach((x, i) => {
    const icone = medalhas[i] || `  ${i + 1}.`;
    const linha = `  ${icone} ${x.nome.padEnd(14)} ${String(x.pontos).padStart(5)} pts   ${x.data}`;
    console.log(i < 3 ? cor(linha, C.yellow) : cor(linha, C.white));
  });
  console.log();
}

// ══════════════════════════════════════════════════════
//  TELA DE ABERTURA ANIMADA
// ══════════════════════════════════════════════════════
function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function telaAbertura() {
  console.clear();
  const titulo = [
    cor("   ██████╗  ██████╗ ██████╗  ██████╗ ██╗", C.cyan, C.bold),
    cor("   ██╔══██╗██╔═══██╗██╔══██╗██╔════╝ ██║", C.cyan, C.bold),
    cor("   ██████╔╝██║   ██║██████╔╝██║      ██║", C.green, C.bold),
    cor("   ██╔══██╗██║   ██║██╔══██╗██║      ██║", C.green, C.bold),
    cor("   ██║  ██║╚██████╔╝██║  ██║╚██████╔╝██║", C.yellow, C.bold),
    cor("   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝", C.yellow, C.bold),
  ];
  titulo.forEach((l) => { console.log(l); sleep(120); });

  console.log(cor("\n          ✦  JOGO DA FORCA  ✦", C.magenta, C.bold));
  console.log(cor("        Node.js Edition — v2.0\n", C.dim));
  sleep(400);
}

// ══════════════════════════════════════════════════════
//  RODADA PRINCIPAL
// ══════════════════════════════════════════════════════
function jogarRodada(nome, categoria) {
  const lista  = BANCO[categoria];
  const item   = lista[Math.floor(Math.random() * lista.length)];
  const palavra = item.palavra;

  let corretas  = [];
  let erradas   = [];
  let erros     = 0;
  let streak    = 0;         // sequência de acertos consecutivos
  let usouDica  = false;
  let tempos    = [];        // tempo de cada jogada

  while (erros < MAX_ERROS) {
    console.clear();

    // Cabeçalho
    console.log(cor(`\n  👤 ${nome}   📂 ${categoria}   🔥 Streak: ${streak}`, C.cyan));
    console.log(cor("  ─────────────────────────────────────────\n", C.dim));

    // Forca + barra de vida lado a lado
    forca(erros);
    console.log(barraVida(erros));
    console.log();

    // Palavra
    console.log("  " + exibirPalavra(palavra, corretas));
    console.log();

    // Letras tentadas
    const tentadasStr = [...corretas, ...erradas].sort().map((l) =>
      corretas.includes(l) ? cor(l, C.green, C.bold) : cor(l, C.red)
    ).join("  ");
    console.log(`  Letras tentadas: ${tentadasStr || cor("nenhuma", C.dim)}`);
    console.log();

    // Mensagem de reação
    console.log("  " + mensagemReacao(erros, streak));
    console.log();

    // Verificar vitória
    if (palavra.split("").every((l) => corretas.includes(l))) {
      const pts = calcularPontos(erros, streak, usouDica,
        tempos.length ? tempos.reduce((a, b) => a + b, 0) / tempos.length : 10);
      console.log(cor(`\n  🎉 PALAVRA CORRETA! → ${palavra}`, C.green, C.bold));
      console.log(cor(`  ⭐ Pontuação: ${pts} pts  (streak: ${streak}, dica: ${usouDica ? "sim" : "não"})`, C.yellow));
      sleep(300);
      return { venceu: true, palavra, pts };
    }

    // Opções
    console.log(cor(`  [L] Chutar letra   (⏱ ${TEMPO_LETRA}s por jogada)`, C.white));
    if (!usouDica) console.log(cor("  [D] Pedir dica     (-10 pts, reseta streak)", C.dim));
    console.log(cor("  [S] Desistir da rodada", C.red));
    console.log();

    const opcao = rl.question(cor("  Opção: ", C.bold)).toUpperCase().trim();

    if (opcao === "S") {
      console.log(cor(`\n  🏳️  Você desistiu. A palavra era: ${cor(palavra, C.yellow, C.bold)}`, C.red));
      sleep(300);
      return { venceu: false, palavra, pts: 0 };
    }

    if (opcao === "D" && !usouDica) {
      usouDica = true;
      streak   = 0; // perde o streak ao usar dica
      console.log(cor(`\n  💡 Dica: ${item.dica}`, C.cyan, C.bold));
      rl.question(cor("  Pressione Enter para continuar...", C.dim));
      continue;
    }

    // Chutar letra
    console.log(cor(`\n  ⏱  Você tem ${TEMPO_LETRA} segundos para digitar a letra!`, C.yellow));
    const { valor, timeout } = lerComTempo(cor("  Letra: ", C.bold), TEMPO_LETRA);

    if (timeout) {
      erros++;
      streak = 0;
      rl.question(cor("  Pressione Enter para continuar...", C.dim));
      continue;
    }

    if (!valor || valor.length !== 1 || !/[A-Z]/.test(valor)) {
      console.log(cor("  ⚠️  Entrada inválida. Digite apenas uma letra.", C.yellow));
      rl.question(cor("  Pressione Enter...", C.dim));
      continue;
    }
    if (corretas.includes(valor) || erradas.includes(valor)) {
      console.log(cor("  ⚠️  Você já tentou essa letra!", C.yellow));
      rl.question(cor("  Pressione Enter...", C.dim));
      continue;
    }

    if (palavra.includes(valor)) {
      corretas.push(valor);
      streak++;
      const ocorrencias = palavra.split("").filter((l) => l === valor).length;
      console.log(cor(`\n  ✅ Acertou! "${valor}" aparece ${ocorrencias}x na palavra. Streak: ${streak}🔥`, C.green, C.bold));
    } else {
      erradas.push(valor);
      erros++;
      streak = 0;
      console.log(cor(`\n  ❌ "${valor}" não está na palavra.`, C.red));
    }
    rl.question(cor("  Pressione Enter para continuar...", C.dim));
  }

  // Derrota
  console.clear();
  forca(MAX_ERROS);
  console.log(cor(`\n  💀 FIM DE JOGO! A palavra era: ${cor(palavra, C.yellow, C.bold)}`, C.red, C.bold));
  sleep(300);
  return { venceu: false, palavra, pts: 0 };
}

// ══════════════════════════════════════════════════════
//  MODO 1 JOGADOR
// ══════════════════════════════════════════════════════
function modo1Jogador() {
  const nome = rl.question(cor("\n  👤 Seu nome: ", C.cyan)).trim() || "Anônimo";
  console.log();

  const cats = Object.keys(BANCO);
  console.log(cor("  Escolha uma categoria:", C.bold));
  cats.forEach((c, i) => console.log(`  [${i + 1}] ${c}`));
  console.log(`  [${cats.length + 1}] 🎲 Categoria aleatória`);

  const op     = parseInt(rl.question(cor("\n  Opção: ", C.bold)), 10);
  const catEscolhida = (op >= 1 && op <= cats.length) ? cats[op - 1] : cats[Math.floor(Math.random() * cats.length)];

  let totalPts = 0;
  let jogar    = true;

  while (jogar) {
    const res = jogarRodada(nome, catEscolhida);
    totalPts += res.pts;
    salvarRanking(nome, res.pts);

    console.log(cor(`\n  📊 Pontuação acumulada: ${totalPts} pts`, C.cyan));
    jogar = rl.question(cor("\n  Jogar novamente? (s/n): ", C.bold)).toLowerCase() === "s";
  }

  console.log(cor(`\n  Valeu, ${nome}! Total: ${totalPts} pts 🎮\n`, C.magenta, C.bold));
}

// ══════════════════════════════════════════════════════
//  MODO 2 JOGADORES (bônus)
// ══════════════════════════════════════════════════════
function modo2Jogadores() {
  console.log(cor("\n  ── MODO 2 JOGADORES ──\n", C.magenta, C.bold));
  const n1 = rl.question(cor("  Nome do Jogador 1: ", C.cyan)).trim() || "Jogador 1";
  const n2 = rl.question(cor("  Nome do Jogador 2: ", C.green)).trim() || "Jogador 2";

  let pts1 = 0, pts2 = 0, turno = 0;
  const cats = Object.keys(BANCO);
  let jogar = true;

  while (jogar) {
    const nome     = turno === 0 ? n1 : n2;
    const corNome  = turno === 0 ? C.cyan : C.green;
    const cat      = cats[Math.floor(Math.random() * cats.length)];

    console.log(cor(`\n  🎮 Vez de `, C.bold) + cor(nome, corNome, C.bold));
    rl.question(cor("  Pressione Enter para começar...", C.dim));

    const res = jogarRodada(nome, cat);
    if (turno === 0) pts1 += res.pts; else pts2 += res.pts;
    salvarRanking(nome, res.pts);

    turno = 1 - turno;

    console.log(cor("\n  📊 Placar:", C.bold));
    console.log(cor(`     ${n1}: ${pts1} pts`, C.cyan));
    console.log(cor(`     ${n2}: ${pts2} pts`, C.green));

    jogar = rl.question(cor("\n  Continuar? (s/n): ", C.bold)).toLowerCase() === "s";
  }

  console.log(cor("\n  ── RESULTADO FINAL ──", C.bold));
  console.log(cor(`  ${n1}: ${pts1} pts`, C.cyan, C.bold));
  console.log(cor(`  ${n2}: ${pts2} pts`, C.green, C.bold));

  if (pts1 > pts2)      console.log(cor(`\n  🏆 ${n1} venceu!\n`, C.yellow, C.bold));
  else if (pts2 > pts1) console.log(cor(`\n  🏆 ${n2} venceu!\n`, C.yellow, C.bold));
  else                  console.log(cor("\n  🤝 Empate!\n", C.magenta));
}

// ══════════════════════════════════════════════════════
//  MENU PRINCIPAL
// ══════════════════════════════════════════════════════
function menu() {
  telaAbertura();

  while (true) {
    console.log(cor("  ╔══════════════════════════════════╗", C.cyan));
    console.log(cor("  ║", C.cyan) + cor("       🎮  MENU PRINCIPAL        ", C.white, C.bold) + cor("║", C.cyan));
    console.log(cor("  ╠══════════════════════════════════╣", C.cyan));
    console.log(cor("  ║  [1]  Jogar (1 jogador)          ║", C.cyan));
    console.log(cor("  ║  [2]  Jogar (2 jogadores)        ║", C.cyan));
    console.log(cor("  ║  [3]  🏆 Ver Ranking             ║", C.cyan));
    console.log(cor("  ║  [4]  Sair                       ║", C.cyan));
    console.log(cor("  ╚══════════════════════════════════╝", C.cyan));

    const op = rl.question(cor("\n  Opção: ", C.bold)).trim();

    if (op === "1") { modo1Jogador(); console.clear(); telaAbertura(); }
    else if (op === "2") { modo2Jogadores(); console.clear(); telaAbertura(); }
    else if (op === "3") { console.clear(); exibirRanking(); rl.question(cor("  Pressione Enter...", C.dim)); console.clear(); telaAbertura(); }
    else if (op === "4") { console.log(cor("\n  Até mais! 👋\n", C.magenta, C.bold)); process.exit(0); }
  }
}

menu();
