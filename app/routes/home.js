module.exports = function() {
    app.get('/', (req, res) => {
        res.render('home/index');
    });
}