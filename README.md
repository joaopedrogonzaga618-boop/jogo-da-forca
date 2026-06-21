# Jogo da Forca — Node.js

**Autor:** João Pedro Gonzaga

---

## Regras do jogo

O jogador escolhe uma categoria e tenta adivinhar a palavra oculta, uma letra por vez. A cada letra errada, uma parte do boneco é adicionada na forca. O limite é de 6 erros — passando disso, o jogador perde a rodada. Para vencer, é preciso descobrir todas as letras antes de esgotar as tentativas.

A pontuação leva em conta quantos erros você cometeu, se usou dica ou não, a velocidade das respostas e se você manteve uma sequência de acertos (streak).

---

## Como jogar

Ao iniciar, você informa seu nome e escolhe uma categoria. A cada jogada, você pode chutar uma letra, pedir uma dica ou desistir da rodada. Tente acertar as letras o mais rápido possível — cada jogada tem um limite de 15 segundos.

No modo 2 jogadores, os dois se revezam em rodadas com categorias sorteadas. Ao final, o jogo mostra quem fez mais pontos.

---

## Como executar

Você precisa ter o Node.js instalado na máquina.

```bash
git clone https://github.com/<seu-usuario>/jogo-da-forca.git
cd jogo-da-forca
npm install
npm start
```

---

## O que tem de diferente nesse projeto

A parte visual foi toda feita com cores ANSI direto no terminal — a forca muda de cor conforme os erros aumentam, as letras certas aparecem em verde e as erradas em vermelho. Tem também uma barra de vidas colorida e uma tela de abertura animada.

No gameplay, o diferencial principal é o sistema de streak: acertar letras em sequência sem errar acumula bônus de pontos. Usar a dica reseta esse bônus. Além disso, cada letra tem um temporizador de 15 segundos — demorar demais conta como erro.

---

## Bônus implementados

**Sistema de dicas** — cada palavra tem uma dica associada. Pedir a dica custa 10 pontos e reseta o streak.

**Ranking** — ao final de cada rodada, o resultado é salvo em um arquivo `ranking.json`. O menu principal exibe o top 10 de todas as partidas.

**Modo 2 jogadores** — dois jogadores se revezam com categorias sorteadas e um placar ao vivo.

---

## Créditos

- Documentação do Node.js: https://nodejs.org/docs
- Pacote readline-sync: https://www.npmjs.com/package/readline-sync
- Referência de códigos ANSI: https://en.wikipedia.org/wiki/ANSI_escape_code


