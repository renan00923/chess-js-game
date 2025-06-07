let janela = $(window); // Captura a janela do navegador
// Quando a janela for scrollada, executa a função
janela.on("scroll", function() {
    // Verifica se a posição do scroll é maior que 30 pixels e já muda a navbar
    if (janela.scrollTop() > 30) {
        $('.navbar').css({
            'background': 'rgba(0, 0, 0, 0.85)',
            'box-shadow': '0 2px 10px rgba(0, 0, 0, 0.5)',
        });
    } 
    // Se não, mantém a navbar transparente
    else {
        $('.navbar').css({
            'background': 'rgba(0, 0, 0, 0.3)',
            'box-shadow': '',
        });
    }
});
