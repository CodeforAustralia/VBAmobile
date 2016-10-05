var express = require('express');
var staticSite = express.Router();
var staticSiteCtrl = require('../controllers/staticSiteCtrl.js');

staticSite.get('/', function(req, res) {
	return staticSiteCtrl.landingPage(req, res);
});

staticSite.get('/project', function(req, res) {
	return staticSiteCtrl.projectPage(req, res);
});

staticSite.get('/projects', function(req, res) {
	return staticSiteCtrl.projectsPage(req, res);
});

staticSite.get('/project/:id/surveys', function(req, res) {
	return staticSiteCtrl.surveys(req, res);
});

staticSite.get('/survey/:id/species', function(req, res) {
	return staticSiteCtrl.species(req, res);
});

staticSite.get('/login', function(req, res) {
	res.render('login')
});

staticSite.get('/survey', function(req, res) {
	return staticSiteCtrl.surveys(req, res);
});

staticSite.post('/login', function(req, res) {
	return staticSiteCtrl.login(req, res);
})

staticSite.post('/project', function(req, res) {
	return staticSiteCtrl.newProject(req, res);
})

module.exports = staticSite;