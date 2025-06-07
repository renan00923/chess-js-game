// chess.js
// Versão 1.0.0

$(document).ready(function () {
  let container = $(".container");
  let tabuleiro = $("#tabuleiroXadrez");
  let titulo = $("#titulo");

  container.hide();
  tabuleiro.hide();

  // Controle do passo de dificuldade
  $("#modoJogo").on("change", function () {
    if ($(this).val() === "cpu") {
      $("#passo2").show();
    } else {
      $("#passo2").hide();
    }
  });

  // Já esconde ao carregar se não for cpu
  if ($("#modoJogo").val() !== "cpu") {
    $("#passo2").hide();
  }

  container.fadeIn(500, function () {
    titulo.fadeIn(800, function () {
      $("#passo1").fadeIn(850).removeClass("d-none");
    }).removeClass("d-none");
  });

  $("#next1").on("click", function () {
    if ($("#modoJogo").val() === "cpu") {
      $("#passo1").fadeOut(300, function () {
        $("#passo2").fadeIn(400).removeClass("d-none");
      }).addClass("d-none");
    } else {
      $("#passo1").fadeOut(300, function () {
        $("#passo3").fadeIn(400).removeClass("d-none");
      }).addClass("d-none");
    }
  });

  $("#next2").on("click", function () {
    $("#passo2").fadeOut(300, function () {
      $("#passo3").fadeIn(400).removeClass("d-none");
    }).addClass("d-none");
  });

  $("#back2").on("click", function () {
    $("#passo2").fadeOut(300, function () {
      $("#passo1").fadeIn(400).removeClass("d-none");
    }).addClass("d-none");
  });

  $("#back3").on("click", function () {
    if ($("#modoJogo").val() === "cpu") {
      $("#passo3").fadeOut(300, function () {
        $("#passo2").fadeIn(400).removeClass("d-none");
      }).addClass("d-none");
    } else {
      $("#passo3").fadeOut(300, function () {
        $("#passo1").fadeIn(400).removeClass("d-none");
      }).addClass("d-none");
    }
  });

  $("#startGame").on("click", function (e) {
    e.preventDefault();
    $("#titulo").fadeOut(300);
    $("#passo3").fadeOut(300, function () {
      tabuleiro.fadeIn(600);
    }).addClass("d-none");
    $("#startGame, #next1, #next2, #back2, #back3").hide();
    jogoXadrez();
  });
});
function jogoXadrez() {
  var jogo = new Chess();
  var jogadorCor = $('input[name="corPecas"]:checked').val();
  var tabuleiroXadrez = Chessboard("tabuleiroXadrez", {
    pieceTheme: "assets/img/{piece}.png",
    draggable: true,
    position: "start",
    orientation: jogadorCor,
    onDrop: movimentoPeca,
    onDragStart: jogadasPermitidas,
    onMouseoutSquare: removerDestaqueMovimentos,
    onMouseoverSquare: destacarMovimentos,
    onSnapEnd: function() {
      atualizaTabuleiro();
      jogaMaquina();
    },
    moveSpeed: 180,
  });
  var maquinaJogando = false;
  // Função de movimentos de peças

  if (jogadorCor === "black") {
    jogaMaquina();
  }

  let somMove = new Audio("assets/sounds/move-self.mp3");

  function tocarSomMovimento() {
    console.log("Tocando som...");
    somMove.play();
  }

  let somCaptura = new Audio("assets/sounds/capture.mp3");

  function tocarSomCaptura() {
    console.log("Tocando som captura...");
    somCaptura.play();
  }
  let somRoque = new Audio("assets/sounds/castle.mp3");

  function tocarSomRoque() {
    console.log("Tocando som roque...");
    somRoque.play();
  }
  let somXeque = new Audio("assets/sounds/move-check.mp3");

  function tocarSomXeque() {
    console.log("Tocando som xeque");
    somXeque.play();
  }
  function tocarSom(move) {
  if (!move || !move.san) return;

  if (move.san.includes("x")) {
    if (move.san.includes("#") || move.san.includes("+")) {
      tocarSomXeque();
    } else {
      tocarSomCaptura();
    }
  } else if (move.san.includes("O-O")) {
    tocarSomRoque();
  } else if (move.san.includes("#") || move.san.includes("+")) {
    tocarSomXeque();
  } else {
    tocarSomMovimento();
  }
}

  function movimentoPeca(local, alvo) {
    let peca = jogo.get(local).type;
    let turno = jogo.turn();

    let isPromocao =
      (peca === "p" && turno === "w" && alvo[1] === "8") ||
      (peca === "p" && turno === "b" && alvo[1] === "1");

    let promocao = "q";

    if (isPromocao) {
      // Atualiza as imagens conforme a cor
      $("#promocaoCustom img").each(function() {
        let tipo = $(this).closest('button').data("promocao").toUpperCase();
        let prefix = (turno === "w") ? "w" : "b";
        $(this).attr("src", `assets/img/${prefix}${tipo}.png`);
      });

      // Mostra o menu customizado
      $("#promocaoCustom").fadeIn(300);

      // Remove eventos antigos para evitar múltiplos binds
      $("#btnPromocao .btn-promocao-custom").off("click");

      // Adiciona evento para os botões de promoção
      $("#btnPromocao .btn-promocao-custom").on("click", function() {
        let promocao = $(this).data("promocao");
        $("#promocaoCustom").fadeOut(400);

        let move = jogo.move({
          from: local,
          to: alvo,
          promotion: promocao
        });

        if (!move) return "snapback";
        tabuleiroXadrez.position(jogo.fen());
        destacarMovimentos(local);
        removerDestaque();
        destacarCasa(local, alvo);
        tocarSom(move);
        isGameOver();
      });
      return "snapback";
    }

    let move = jogo.move({
      from: local,
      to: alvo,
      promotion: promocao,
    });
    
    if (!move) return "snapback";
    tabuleiroXadrez.position(jogo.fen());
    
    console.log(jogo.history());
    console.log(move.san);

    destacarMovimentos(local);
    removerDestaque();
    destacarCasa(local, alvo);
    tocarSom(move);
    isGameOver();
  }
  // Função de controles de jogadas e validações

  // Função que verifica se as jogadas são permitidas
  function jogadasPermitidas(local, peca) {
    removerDestaqueMovimentos();
    if (jogo.game_over()) {
      return;
    }
    if (
      (jogo.turn() === "w" && peca.search(/w/) === -1) ||
      (jogo.turn() === "b" && peca.search(/b/) === -1) ||
      maquinaJogando
    ) {
      return false;
    }
    let pecaSelecionada = local;
    console.log(`Selecionado em local:  ${pecaSelecionada}`);
    return true;
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
    if (jogo.in_checkmate()) {
      mostrarMensagem("!!!", "#ff3b3b", "8px 12px 24px 0 #ff3b3bcc");
      setTimeout(() => {
        mostrarMensagem("Xeque-mate! Fim de jogo!", "#ff3b3b", "8px 12px 24px 0 #ff3b3bcc");
        $('#btnNewGame').on("click", function() {
          let continuar = confirm("Deseja continuar com a mesma configuração?");
          if(continuar) {
            jogo.reset();
            tabuleiroXadrez.start();
            removerDestaque();
            $("#mensagemXadrez").fadeOut(400, function() {
              $(this).text("").css({
                "display": "none"
              });
            });
            $("#btnNewGame").hide();
          } else {
            location.reload();
          }
        }).fadeIn(1000).removeClass("d-none");
      }, 3000);
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
    let origemElemento = $(`[data-square="${origem}"]`);
    let destinoElemento = $(`[data-square="${destino}"]`);

    let classeBranco = "white-1e1d7";

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
    let movimentosPossiveis = jogo.moves({
      square: origem,
      verbose: true,
    });

    if (movimentosPossiveis === 0) return;

    let peca = "piece-417db";

    if (!maquinaJogando) {
      movimentosPossiveis.forEach((move) => {
        let imgSquare = $(`[data-square="${move.to}"] img.${peca}`);
        if (imgSquare.length > 0) {
          $(imgSquare).addClass("bola").css({
            "border-radius": "50%",
            "box-shadow": "inset 0 0 3px 3px rgb(34, 34, 34)",
          });
          $(imgSquare).attr("id", "ibola");
        } else {
          $(`[data-square="${move.to}"]`).append(
            `<div class="destaque-movimentos" id="idestaque"><div class="bolinha" id="ibolinha"></div></div>`
          );
        }
      });

      $(`.destaque-movimentos`).css({
        display: "flex",
        height: "100%",
        "justify-content": "center",
        "align-items": "center",
      });
      $(`.bolinha`).css({
        "border-radius": "50%",
        width: "15px",
        height: "15px",
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
    let modoJogoSelecionado = $("#modoJogo").val();
    if (modoJogoSelecionado !== "cpu") return;

    maquinaJogando = true;

    if (jogo.game_over()) {
      maquinaJogando = false;
      return;
    }

    let dificuldade = $("#dificuldade").val();
    let origem, destino;

    if (dificuldade === "aleatorio") {
      let movimentosPossiveis = jogo.moves({ verbose: true });
      if (movimentosPossiveis.length === 0) {
        maquinaJogando = false;
        return;
      }
      let movimentoAleatorio = movimentosPossiveis[Math.floor(Math.random() * movimentosPossiveis.length)];
      origem = movimentoAleatorio.from;
      destino = movimentoAleatorio.to;

      setTimeout(() => {
        let move = jogo.move({
          from: origem,
          to: destino,
          promotion: "q"
        });

        if (!move) {
          maquinaJogando = false;
          return;
        }

        tabuleiroXadrez.position(jogo.fen());
        removerDestaque();
        destacarCasa(origem, destino);
        tocarSom(move);
        isGameOver();
        maquinaJogando = false;
      }, 700); // tempo curto para aleatório
    } else {

      let nivel = parseInt(dificuldade);

      setTimeout(() => {
        const engine = new window["js-chess-engine"].Game(jogo.fen());
        const bestMove = engine.aiMove(nivel);

        origem = Object.keys(bestMove)[0];
        destino = bestMove[origem];

        if (!origem || !destino) {
          maquinaJogando = false;
          return;
        }
        origem = origem.toLowerCase();
        destino = destino.toLowerCase();

        setTimeout(() => {
          let move = jogo.move({
            from: origem,
            to: destino,
            promotion: "q"
          });

          if (!move) {
            maquinaJogando = false;
            return;
          }

          tabuleiroXadrez.position(jogo.fen());
          removerDestaque();
          destacarCasa(origem, destino);
          tocarSom(move);
          isGameOver();
          maquinaJogando = false;
        }, 700); // tempo de "pensar" da máquina
      }, 200); // pequeno delay para não travar a interface
    }
  }
  // Funcão que atualiza jogadas feitas usando a notação FEN e atribuindo a posição
  function atualizaTabuleiro() {
    tabuleiroXadrez.position(jogo.fen());
  }
}
