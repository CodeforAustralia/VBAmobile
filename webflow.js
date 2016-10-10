let fs = require('fs')
let cheerio = require('cheerio')
let config = require('./webflow.config')
let mkdirp = require('mkdirp');
let ncp = require('ncp').ncp;
ncp.limit = 16;

// WARNING everything is in Sync mode, sory for that...

config.layouts.forEach(function(layoutFileName){
	let layoutsDir = './_views/layouts'
	let content = fs.readFileSync('./vbamobile.webflow/'+ layoutFileName + '.html')
	let $ = cheerio.load(content)

	$('main').remove()
	$('header').after('\n\n\t{{{body}}}\n')
	$('.titles').after('\n\t{{#if loggedIn}}\n\t\t<p class="username">{{username}}</p>\n\t{{else}}')
	$('header').append('{{/if}}\n')

	mkdirp.sync(layoutsDir, function (err) {
    if (err) console.error('creation of _view directory failed' + err)
    else console.log(layoutsDir + ' created')
	});
	fs.writeFileSync(layoutsDir + '/' + layoutFileName + '.handlebars', $.html())

})

config.templates.forEach(function(templateFileName){
	let templatesDir = './_views'
	let content = fs.readFileSync('./vbamobile.webflow/'+ templateFileName + '.html')
	let $ = cheerio.load(content)

	fs.writeFileSync(templatesDir+ '/' + templateFileName + '.handlebars', $.html('main'))
})

config.folders.forEach(function(folder){
	ncp('./vbamobile.webflow/' + folder, './_views/' + folder, function(err) {
 		if (err) {
   		return console.error(err);
 		}
 		console.log('coyping '+ folder +' done!');
	})
})
console.log('Webflow to handlebars conversion done !')

