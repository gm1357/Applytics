exports.index = (req, res) => {
    let message = req.flash('message');
    res.render('home/case', {message: message});
}