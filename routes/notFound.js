function notFound (req, res) {
    res.status(404);
    if (req.accepts('html')) {
        res.render('notFound.hbs');
        return;
    }
}

module.exports = notFound;