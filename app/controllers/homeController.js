exports.index = (req, res) => {
    let message = req.flash('message');
    res.render('home/index', {message: message});
}