// chess.js
// Versão 1.0.0

// Verifica se o usuário está em um dispositivo móvel (essencial para o bom funcionamento do jogo)

var isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

// Quando a página estiver pronta, executa o código
$(document).ready(function () {
  let container = $(".container"); // container principal
  let tabuleiro = $("#tabuleiroXadrez"); // tabuleiro de xadrez
  let titulo = $("#titulo"); // título do jogo

  container.hide(); // inicialmente esconde o container
  tabuleiro.hide(); // inicialmente esconde o tabuleiro

  // Animação de fade-in para o container e título
  container.fadeIn(500, function () { 
    titulo.fadeIn(800, function () {
      // Exibe o passo 1 após o título
      $("#passo1").fadeIn(850).removeClass("d-none");
    }).removeClass("d-none"); // Remove a classe d-none do título
  });

  // Controle de navegação entre os passos
  $("#next1").on("click", function () {
    // Verifica se o modo de jogo é contra a CPU
    if ($("#modoJogo").val() === "cpu") {
      // Se for contra a CPU, vai para o passo 2
      $("#passo1").fadeOut(300, function () {
        $("#passo2").fadeIn(400).removeClass("d-none");
      }).addClass("d-none"); // Adiciona a classe d-none para esconder o passo 1
    } else {
      // Se for contra outro jogador, vai direto para o passo 3
      $("#passo1").fadeOut(300, function () {
        $("#passo3").fadeIn(400).removeClass("d-none"); 
      }).addClass("d-none"); // Adiciona a classe d-none para esconder o passo 1
    }
  });

  $("#next2").on("click", function () {
    // Passo 2 para o passo 3
    $("#passo2").fadeOut(300, function () {
      $("#passo3").fadeIn(400).removeClass("d-none");
    }).addClass("d-none"); // Adiciona a classe d-none para esconder o passo 2
  });

  $("#back2").on("click", function () {
    // Volta do passo 2 para o passo 1
    $("#passo2").fadeOut(300, function () {
      $("#passo1").fadeIn(400).removeClass("d-none");
    }).addClass("d-none"); // Adiciona a classe d-none para esconder o passo 2
  });

  $("#back3").on("click", function () {
    // Volta do passo 3 para o passo 2 ou passo 1, dependendo do modo de jogo
    if ($("#modoJogo").val() === "cpu") {
      // Se for contra a CPU, volta para o passo 2
      $("#passo3").fadeOut(300, function () {
        $("#passo2").fadeIn(400).removeClass("d-none");
      }).addClass("d-none"); // Adiciona a classe d-none para esconder o passo 3
    } else {
      // Se for contra outro jogador, volta para o passo 1
      $("#passo3").fadeOut(300, function () {
        $("#passo1").fadeIn(400).removeClass("d-none");
      }).addClass("d-none"); // Adiciona a classe d-none para esconder o passo 3
    }
  });

  $("#startGame").on("click", function (e) {
    e.preventDefault(); // Previne que a página seja recarregada antes de iniciar o jogo
    $("#titulo").fadeOut(300); // Esconde o título
    // Esconde o passo 3 e exibe o tabuleiro
    $("#passo3").fadeOut(300, function () {
      tabuleiro.fadeIn(600);
    }).addClass("d-none"); // Adiciona a classe d-none para esconder o passo 3
    $("#startGame, #next1, #next2, #back2, #back3").hide(); // Esconde os botões de navegação
    // Alerta básico para o jogador sobre a engine do js-chess-engine (problemas de otimização)
    if($(`#dificuldade`).val() === "4") {
      alert("Atenção! A dificuldade máxima pode levar mais tempo para calcular os melhores movimentos! Tenha paciência e boa sorte!");
    }
    // Chama o jogo de xadrez
    jogoXadrez();
  });
});
function jogoXadrez() {
  // Inicializa o objeto das regras com chess.js
  var jogo = new Chess();
  // Pega a cor das peças selecionada pelo jogador
  var jogadorCor = $('input[name="corPecas"]:checked').val();
  // Inicializa o objeto do tabuleiro com chessboard.js
  var tabuleiroXadrez = Chessboard("tabuleiroXadrez", {
    pieceTheme: "assets/img/{piece}.png", // tema das peças
    draggable: !isMobile, // se o jogo é em um dispositivo móvel, desabilita o arrastar e soltar
    position: "start", // posição inicial do tabuleiro
    orientation: jogadorCor, // define a orientação do tabuleiro de acordo com a cor escolhida
    onDrop: movimentoPeca, // função que é chamada quando uma peça é solta
    onDragStart: jogadasPermitidas, // função que é chamada quando uma peça é arrastada
    onMouseoutSquare: removerDestaqueMovimentos, // função que é chamada quando o mouse sai de uma casa
    onMouseoverSquare: destacarMovimentos, // função que é chamada quando o mouse passa por cima de uma casa
    onSnapEnd: atualizaTabuleiro, // função que é chamada quando o movimento é finalizado
    moveSpeed: 180, // velocidade do movimento das peças
  });
    // Se for mobile, temos a opção de clicar nas casas para mover as peças
    if (isMobile) {
    let casaSelecionada = null; // Pega a casa selecionada
    // Eventos de clique nas casas do tabuleiro, quando há uma peça na casa (obviamente)
    $("#tabuleiroXadrez").on("click", ".square-55d63", function() {
      let square = $(this).attr("data-square"); // Pega o data-square da casa clicada do tabuleiro
      let peca = jogo.get(square); // Pega a peça na casa clicada com o método get do chess.js

      // Se não houver uma casa selecionada ainda, verifica se a peça é do jogador atual, para não dar conflito 
      if (!casaSelecionada) {
        if (peca && ((jogo.turn() === "w" && peca.color === "w" && jogadorCor === "white") ||
                    (jogo.turn() === "b" && peca.color === "b" && jogadorCor === "black"))) {
          casaSelecionada = square; // Define a casa selecionada no data-square onde a peça foi 
          destacarMovimentos(square); // Destaca os movimentos possíveis da peça selecionada
        }
      // Se já houver uma casa selecionada, verifica se a peça é do jogador atual e se é diferente da casa selecionada
      } else {
        // Chama a mesma função do drag&drop!
        movimentoPeca(casaSelecionada, square); // Finaliza o movimento da peça
        removerDestaqueMovimentos(); // Remove o destaque dos movimentos possíveis
        casaSelecionada = null; // Reseta a casa selecionada para null, para que o jogador possa selecionar outra peça
        /* 
          Aqui não precisamos chamar CPU, pois no movimentoPeca já chamamos a função jogaMaquina() se o modo de jogo for contra a CPU
          Se o jogador for branco, a máquina jogará depois do movimento do jogador, e se for preto, a máquina jogará antes do movimento do jogador
          Assim, o jogo flui normalmente, sem precisar de um clique extra para a máquina jogar
        */
      }
    });
  }
  // Variável para controlar se a máquina está jogando
  // Isso é necessário para evitar que o jogador jogue enquanto a máquina está jogando
  var maquinaJogando = false;
  // Se o jogador for preto, a máquina joga primeiro
  // Isso é necessário para que o jogo comece com a máquina jogando primeiro, se o jogador for preto
  if (jogadorCor === "black") {
    jogaMaquina();
  }

  // Funções de som

  // Inicializa os sons para as ações do jogo
  let somMove = new Audio("assets/sounds/move-self.mp3");
  function tocarSomMovimento() {
    console.log("Tocando som...");
    somMove.play();
  }
  // Som para captura
  let somCaptura = new Audio("assets/sounds/capture.mp3");
  function tocarSomCaptura() {
    console.log("Tocando som captura...");
    somCaptura.play();
  }
  // Som para roque
  let somRoque = new Audio("assets/sounds/castle.mp3");
  function tocarSomRoque() {
    console.log("Tocando som roque...");
    somRoque.play();
  }
  // Som para xeque
  let somXeque = new Audio("assets/sounds/move-check.mp3");
  function tocarSomXeque() {
    console.log("Tocando som xeque");
    somXeque.play();
  }
  // Função que toca o som de acordo com o movimento feito, pegando o metodo san do objeto move
  function tocarSom(move) {
  if (!move || !move.san) return;
  // Verifica se o movimento é uma captura, roque ou xeque
  if (move.san.includes("x")) {
    if (move.san.includes("#") || move.san.includes("+")) {
      tocarSomXeque(); // Toca o som de xeque se houver, mesmo que seja uma captura
    } else {
      tocarSomCaptura(); // Toca o som de captura se for uma captura simples
    }
  // Verifica se o movimento é um roque
  } else if (move.san.includes("O-O")) {
    tocarSomRoque();
  // Verifica se o movimento é um xeque ou xeque-mate
  } else if (move.san.includes("#") || move.san.includes("+")) {
    tocarSomXeque();
  // Se não for captura, roque ou xeque, toca o som de movimento normal
  } else {
    tocarSomMovimento();
  }
}
  // Função que executa o movimento da peça
  // Esta função é chamada quando uma peça é solta no tabuleiro
  function movimentoPeca(local, alvo) {
    // Pega o tipo da peça na casa de origem (p, r, n, b, q, k)
    let peca = jogo.get(local).type;
    // pega o turno do jogo (w ou b)
    let turno = jogo.turn();
    console.log(alvo[1])
    // Verifica se o movimento é uma promoção de peão, alvo[1] simboliza a linha de destino (alvo)
    // Se o peão chegar na oitava linha (para brancas) ou na primeira linha (para pretas), é uma promoção
    let isPromocao =
      (peca === "p" && turno === "w" && alvo[1] === "8") ||
      (peca === "p" && turno === "b" && alvo[1] === "1");

    let promocao = "q"; // Padrão de promoção para rainha

    
    if (isPromocao) {
      // Atualiza as imagens conforme a cor
      $("#promocaoCustom img").each(function() {
        // pega o tipo da promoção do botão (p, r, n, b, q) com o atributo data-promocao do botao e coloca upperCase
        let tipo = $(this).closest('button').data("promocao").toUpperCase();
        // Define o prefixo da imagem de acordo com o turno (w ou b)
        let prefix = (turno === "w") ? "w" : "b";
        // Atualiza o src da imagem com o prefixo e tipo
        $(this).attr("src", `assets/img/${prefix}${tipo}.png`);
      });

      // Mostra o menu customizado feito no html
      $("#promocaoCustom").fadeIn(300);

      // Remove eventos antigos para evitar múltiplos binds
      $("#btnPromocao .btn-promocao-custom").off("click");

      // Adiciona evento para os botões de promoção
      $("#btnPromocao .btn-promocao-custom").on("click", function() {
        // Pega o data-promocao do botão clicado
        let promocao = $(this).data("promocao");
        // Retira a customização do menu de promoção
        $("#promocaoCustom").fadeOut(400);
        // Verifica se o movimento é válido e faz o movimento com a possivel promoção
        let move = jogo.move({
          from: local,
          to: alvo,
          promotion: promocao
        });
        // Faz o movimento e chama todas as outras funções
        finalizarMovimento(move, local, alvo);
        // Se o modo de jogo for contra a CPU e o turno atual for diferente da cor do jogador, chama a função jogaMaquina
        if ($("#modoJogo").val() === "cpu" && jogo.turn() !== jogadorCor[0]) {
          jogaMaquina();
        }
      });
      return "snapback";
    }
    // Se não for promoção, faz o movimento normalmente
    let move = jogo.move({
      from: local,
      to: alvo,
      promotion: promocao,
    });
    // Faz o movimento e chama todas as outras funções
    finalizarMovimento(move, local, alvo);
    // Se o modo de jogo for contra a CPU e o turno atual for diferente da cor do jogador, chama a função jogaMaquina
    if ($("#modoJogo").val() === "cpu" && jogo.turn() !== jogadorCor[0]) {
      jogaMaquina();
    }
  }

  // Função de controles de jogadas e validações

  // Função que verifica se as jogadas são permitidas
  function jogadasPermitidas(local, peca) {
    removerDestaqueMovimentos(); // Remove o destaque dos movimentos feitos logo no começo
    // Se o jogo já acabou, não permite mais jogadas
    if (jogo.game_over()) {
      return;
    }
    // Se a peça não for do jogador atual, não permite mais jogadas, bem como se for máquina jogando
    if (
      (jogo.turn() === "w" && peca.search(/w/) === -1) ||
      (jogo.turn() === "b" && peca.search(/b/) === -1) ||
      maquinaJogando
    ) {
      return false; // Não permite jogadas se a peça não for do jogador atual ou se a máquina estiver jogando
    }
    let pecaSelecionada = local; // Pega a casa selecionada no local
    console.log(`Selecionado em local:  ${pecaSelecionada}`); 
    return true; // Permite jogadas se a peça for do jogador atual e não for máquina jogando
  }
  // Função que atualiza o tabuleiro após cada movimento
  function atualizaTabuleiro() {
    tabuleiroXadrez.position(jogo.fen());
  }
  // Função que finaliza e "estiliza" o movimentos
  function finalizarMovimento(move, origem, destino) {
    if (!move) return "snapback"; // retorna tudo se não for válido
    tabuleiroXadrez.position(jogo.fen()); // atualiza o tabuleiro com a nova posição
    destacarMovimentos(origem); // destaca os movimentos possíveis da peça selecionada
    removerDestaque(); // remove o destaque dos movimentos feitos
    destacarCasa(origem, destino); // destaca a casa de origem e destino
    tocarSom(move); // toca o som de acordo com o movimento feito
    isGameOver(); // verifica se o jogo acabou
  }
  function mostrarMensagem(texto, cor = "#fff", sombra) {
    $("#mensagemXadrez").text(texto).css({
      "box-shadow": sombra, 
      "color": cor,
      "display": "block",
      "opacity": 0,
    }).animate({
      opacity: 1
    }, 400);
    setTimeout(() => {
      $("#mensagemXadrez").fadeOut(400, function() {
        $(this).text("").css("display", "none");
      });
    }, 2000);
  }
  // Função que verifica se o jogo acabou
  function isGameOver() {
    // Se o jogo acabou, exibe a mensagem de fim de jogo
    if (jogo.in_checkmate()) {
      mostrarMensagem("!!!", "#ff3b3b", "8px 12px 24px 0 #ff3b3bcc");
      setTimeout(() => {
        mostrarMensagem("Xeque-mate! Fim de jogo!", "#ff3b3b", "8px 12px 24px 0 #ff3b3bcc");
        // Exibe o botão de novo jogo após 3 segundos 
        $('#btnNewGame').on("click", function() {
          // Pergunta se o jogador deseja continuar com a mesma configuração
          let continuar = confirm("Deseja continuar com a mesma configuração?");
          // Se o jogador quiser continuar, reseta o jogo e o tabuleiro
          if(continuar) {
            jogo.reset(); // Reseta o jogo
            tabuleiroXadrez.start(); // Reseta o tabuleiro
            removerDestaque(); // Remove o destaque das casas
            // Reseta a mensagem de fim de jogo
            $("#mensagemXadrez").fadeOut(400, function() { 
              $(this).text("").css({
                "display": "none"
              });
            });
            $("#btnNewGame").hide();
          // Se o jogador não quiser continuar, recarrega a página
          } else {
            location.reload(); // Recarrega a página para reiniciar o jogo
          }
        }).fadeIn(1000).removeClass("d-none"); // Exibe o botão de novo jogo
      }, 3000);
    // Se o jogo não acabou, verifica se está em xeque ou empate e exibe a mensagem correspondente
    } else if (jogo.in_check()) {
      mostrarMensagem("Xeque!", "#ffe066", "8px 12px 24px 0 rgba(255, 205, 6, 0.685)");
    } else if (jogo.in_draw()) {
      mostrarMensagem("Empate!", "#66d9ff", "8px 12px 24px 0 #66d9ffcc");
    }
  }

  // Funções de destaque

  // Destacar movimentos feitos

  // Função que destaca as casas de origem e destino
  function destacarCasa(origem, destino) {
    let origemElemento = $(`[data-square="${origem}"]`); // Pega o data-square da casa de origem
    let destinoElemento = $(`[data-square="${destino}"]`); // Pega o data-square da casa de destino

    let classeBranco = "white-1e1d7"; // Classe para casas brancas

    // Verifica a cor da casa de origem

    if (origemElemento.hasClass(classeBranco)) {
      origemElemento.addClass("destaque-origem-branco");
    } else {
      origemElemento.addClass("destaque-origem-preto");
    }

    // Verifica a cor da casa de destino

    if (destinoElemento.hasClass(classeBranco)) {
      destinoElemento.addClass("destaque-destino-branco");
    } else {
      destinoElemento.addClass("destaque-destino-preto");
    }
  }

  // Função que remove o destaque das casas de origem e destino
  function removerDestaque() {
    $(
      ".destaque-origem-branco, .destaque-origem-preto, .destaque-destino-branco, .destaque-destino-preto"
    ).removeClass(
      "destaque-origem-branco destaque-origem-preto destaque-destino-branco destaque-destino-preto"
    );
  }

  // Funções para onmouseenter e onmouseout, mostrando onde as peças podem ir

  // Função que destaca os movimentos possíveis de uma peça selecionada
  function destacarMovimentos(origem) {
    // Retorna um array com os movimentos possíveis da peça selecionada
    let movimentosPossiveis = jogo.moves({
      square: origem,
      verbose: true,
    });
    // Se não houver movimentos possíveis, retorna
    if (movimentosPossiveis === 0) return;
    // Variável para todas as peças do jogo
    let peca = "piece-417db";
    // Se maquina não estiver jogando, destaca os movimentos possíveis com a bolinha e a bola
    if (!maquinaJogando) {
      movimentosPossiveis.forEach((move) => {
        let imgSquare = $(`[data-square="${move.to}"] img.${peca}`); // Pega a imagem da peça na casa de destino
        // Se houver uma peça na casa de destino, adiciona a classe bola e estiliza
        if (imgSquare.length > 0) {
          $(imgSquare).addClass("bola").css({
            "border-radius": "50%",
            "box-shadow": "inset 0 0 3px 3px rgb(34, 34, 34)",
          });
          // Coloca a bola se tiver peça no meio
          $(imgSquare).attr("id", "ibola");
        // Se não houver peça na casa de destino, adiciona a div destaque-movimentos com a bolinha
        } else {
          $(`[data-square="${move.to}"]`).append(
            `<div class="destaque-movimentos" id="idestaque"><div class="bolinha" id="ibolinha"></div></div>`
          );
        }
      });
      // Estiliza a div destaque-movimentos e a bolinha para ficar centralizado usando o d-flex
      $(`.destaque-movimentos`).css({
        "display": "flex",
        "height": "100%",
        "justify-content": "center",
        "align-items": "center",
      });
      $(`.bolinha`).css({
        "border-radius": "50%",
        "width": "15px",
        "height": "15px",
        "box-shadow": "inset 0 0 3px 3px rgb(34, 34, 34)",
      });
    }
  }
  // Função que remove o destaque dos movimentos feitos
  function removerDestaqueMovimentos() {
    $(`#ibolinha, #idestaque`).remove();
    $(`img`).removeClass("bola").css({
      "border-radius": "",
      "box-shadow": "",
    });
  }
  // Função que inicia o jogo da máquina, verificando se o modo de jogo é contra a CPU
  function jogaMaquina() {
    let modoJogoSelecionado = $("#modoJogo").val(); // Pega o modo de jogo selecionado
    // Se o modo de jogo não for contra a CPU, não faz nada
    if (modoJogoSelecionado !== "cpu") return;
    // Atualiza para true
    maquinaJogando = true;
    // Se o jogo já acabou, não faz nada
    if (jogo.game_over()) {
      maquinaJogando = false;
      return;
    }
    // Pega o valor da dificuldade selecionada
    let dificuldade = $("#dificuldade").val();
    let origem, destino; // Variáveis para a origem e destino do movimento
    // Se a dificuldade for fácil, seu valor é aleatório, então escolhe um movimento aleatório
    if (dificuldade === "aleatorio") {
      let movimentosPossiveis = jogo.moves({ verbose: true }); // Pega os movimentos possíveis 
      // Se não houver movimentos possíveis, não faz nada
      if (movimentosPossiveis.length === 0) {
        maquinaJogando = false;
        return;
      }
      // Escolhe um movimento aleatório entre os possíveis, randomizando entre os índices do array 
      let movimentoAleatorio = movimentosPossiveis[Math.floor(Math.random() * movimentosPossiveis.length)];
      // Pega a origem e destino do movimento aleatório com .from e .to
      origem = movimentoAleatorio.from;
      destino = movimentoAleatorio.to;

      setTimeout(() => {
        let move = jogo.move({
          from: origem,
          to: destino,
          promotion: "q"
        });

        finalizarMovimento(move, origem, destino);
        maquinaJogando = false;
      }, 700); // tempo curto para aleatório
    // Se não for fácil, usa-se a engine js-chess-engine para calcular o melhor movimento
    } else {
      // Verifica se a dificuldade é um número válido e converte para inteiro
      let nivel = parseInt(dificuldade);

      setTimeout(() => {
        // Cria uma nova instância do jogo com a posição atual 
        const engine = new window["js-chess-engine"].Game(jogo.fen());
        // Chama o método aiMove da engine para calcular o melhor movimento usando a notação FEN atual do jogo
        const bestMove = engine.aiMove(nivel);
        // Pega a origem e destino do melhor movimento
        origem = Object.keys(bestMove)[0];
        // Pega o destino do melhor movimento a partir da origem da peça
        destino = bestMove[origem];
        // Se não houver origem ou destino, não faz nada
        if (!origem || !destino) {
          maquinaJogando = false;
          return;
        }
        // Converte a origem e destino para minúsculas, para evitar problemas de case-sensitive, pois o chess.js usa letras minúsculas.
        // OBS: O js-chess-engine retorna os seus cálculos em UpperCase, por isso é necessário converter para minúsculas
        origem = origem.toLowerCase();
        destino = destino.toLowerCase();

        setTimeout(() => {
          let move = jogo.move({
            from: origem,
            to: destino,
            promotion: "q"
          });

          finalizarMovimento(move, origem, destino);
          maquinaJogando = false;

        }, 800); // tempo de "pensar" da máquina
      }, 200); // pequeno delay para não travar a interface
    }
  }
}
