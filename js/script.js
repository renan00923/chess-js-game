let janela = $(window);
janela.on("scroll", function() {
    if (janela.scrollTop() > 30) {
        $('.navbar').css({
            'background': 'rgba(0, 0, 0, 0.85)',
            'box-shadow': '0 2px 10px rgba(0, 0, 0, 0.5)',
        });
    } 
    else {
        $('.navbar').css({
            'background': 'rgba(0, 0, 0, 0.3)',
            'box-shadow': '',
        });
    }
});