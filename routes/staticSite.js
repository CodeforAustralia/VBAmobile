const express = require('express');
const staticSite = express.Router();
const staticSiteCtrl = require('../controllers/staticSiteCtrl.js');

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

staticSite.get('/survey/:surveyId/method/:methodId/taxonRecord', function(req, res) {
	return staticSiteCtrl.createTaxonRecordPage(req, res);
});

staticSite.post('/survey/:surveyId/method/:methodId/taxonRecord', function(req, res) {
	return staticSiteCtrl.createTaxonRecord(req, res);
});

staticSite.post('/survey/:surveyId/method/:methodId/species/destroy', function(req, res) {
	return staticSiteCtrl.deleteTaxonRecord(req, res);
});

staticSite.get('/login', function(req, res) {
	res.render('login')
});

staticSite.get('/logout', function(req, res) {
	return staticSiteCtrl.logout(req, res);
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

staticSite.get('/incobs', function(req, res) {
	return staticSiteCtrl.incObsPage(req, res);
});

staticSite.post('/incobs', function(req, res) {
	return staticSiteCtrl.createIncObs(req, res);
});

module.exports = staticSite;