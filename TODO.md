# 🎮 TODO - Modos de Jogo (Campo Minado)

## ✅ Modo Pontos

- [ ] Implementar renderização alternativa de números
- [ ] Substituir números por quantidade equivalente de pontos (•)
- [ ] Ajustar espaçamento/visual para múltiplos pontos

**Ideia:**
Transforma a leitura numérica em leitura visual. Em vez de números, o jogador interpreta a quantidade de bombas ao redor através de pontos. Mantém a lógica do jogo, mas muda a forma de percepção.

---

## 🧠 Modo Memória

- [ ] Exibir números por alguns segundos no início
- [ ] Ocultar números após o tempo definido
- [ ] Manter apenas células abertas sem indicação

**Ideia:**
O jogador vê o tabuleiro inicialmente, mas depois precisa confiar na memória para continuar jogando. Aumenta a dificuldade ao exigir retenção de informação e reconhecimento de padrões.

---

## ⏱️ Modo Pressão

- [ ] Adicionar temporizador global
- [ ] Definir limite de tempo para partida
- [ ] (Opcional) Implementar mecânica de penalidade com o tempo

**Ideia:**
O jogador precisa resolver o tabuleiro sob pressão de tempo. Introduz urgência e reduz o tempo de análise, tornando o jogo mais dinâmico e tenso.

---

## ❤️ Modo Vida

- [ ] Implementar sistema de vidas (ex: 1 ou 2 chances)
- [ ] Permitir erro sem encerrar o jogo imediatamente
- [ ] Exibir contador de vidas na interface

**Ideia:**
Adiciona tolerância ao erro. Em vez de perder instantaneamente ao clicar em uma bomba, o jogador tem uma ou mais chances extras. Torna o jogo mais acessível e menos punitivo.

---

## 🔀 Modo Caos

- [ ] Permitir movimentação ou alteração das bombas durante a partida
- [ ] Atualizar números dinamicamente após mudanças
- [ ] Garantir consistência do estado do jogo

**Ideia:**
O tabuleiro não é estático. Bombas podem mudar de posição ou o estado pode evoluir ao longo do tempo. Quebra completamente a lógica tradicional e exige adaptação constante do jogador.

---

## ⚠️ Modo Decisão

- [ ] Remover sistema de bandeiras
- [ ] Ajustar interface para ausência de marcações
- [ ] Balancear dificuldade (opcional)

**Ideia:**
O jogador não pode marcar possíveis bombas. Cada decisão é definitiva, aumentando o risco e exigindo mais confiança na própria análise.

---
