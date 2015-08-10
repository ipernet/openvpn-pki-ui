var	fs				=   require('fs'),
	hbs				=	require('express-handlebars'),
	cookieParser	=	require('cookie-parser'),

    // Express
    express			=	require('express'),
	app				=	express(),
    expressServer 	=	require('http').Server(app),

	// Libs
	auth	=	require('./app/auth'),
	config	=	require('./app/config'),
	pki		=	require('./app/pki'),

	conf
;

/*
 * Middlewares
 */
config.load(function(c)
{
	conf = c;

	expressServer.listen(conf.listen.port, conf.listen.address);

	console.log('Listening on ' + conf.listen.address + ':' + conf.listen.port);
});

// HBS templating
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'main.hbs'}));
app.set('view engine', 'hbs');

// Assets
app.use(express.static('public'));

// Express parsers
app.use(cookieParser());

// Auth
app.use(function(req, res, next)
{
	// Change your authentication system if needed.
	auth.check(conf.sso.api, conf.sso.cookie, req.cookies[conf.sso.cookie]).then(function(cred)
	{
		req.certCommonName	=	cred.email;

		next();
	})
	.catch(function()
	{
		return res.status(401).send('Invalid SSO credentials.');
	});
});

/*
 * App
 */
app.get('/', function(req, res)
{
	var endpoints = [];
	
	for(var endpoint in conf.endpoints)
		endpoints.push({id: endpoint, name: conf.endpoints[endpoint].name});
	
	res.render('index', {endpoints: endpoints});
});

app.get('/download', function(req, res)
{
	if( ! req.query.e || ! conf.endpoints[req.query.e])
		return res.status(401).send('Invalid endpoint.');
	
	if( ! req.query.p)
		return res.status(401).send('Invalid passphrase.');
	
	var zip	=	pki.zip(conf, req.certCommonName, req.query.p, conf.endpoints[req.query.e]);

	if( ! zip)
		return res.status(401).send('Generation error.');

	res.contentType('application/zip');
	res.setHeader('content-disposition','attachment; filename=Credentials-' + conf.endpoints[req.query.e].suffix + '.zip');

	res.send(zip);
});
