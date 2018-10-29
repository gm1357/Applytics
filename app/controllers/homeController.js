exports.index = (req, res) => {
    let message = req.flash('message');
    let teste = 0;
    if (req.user) {
        teste = req.user.teste;
    }
    
    res.render('home/index', {message: message, teste: teste});
}