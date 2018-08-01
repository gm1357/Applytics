module.exports = function() {
    app.get('/', (req, res) => {
        let message = req.flash('message');
        res.render('home/index', {message: message});
    });
}