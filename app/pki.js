var	fs		=   require('fs'),
	forge	=	require('node-forge'),
	zip		=	require('adm-zip'),
	logger	=	require('../app/log')
;

function generateCertificate(config, commonName, passphrase)
{
	// https://github.com/digitalbazaar/forge/issues/152
	// https://github.com/digitalbazaar/forge/issues/265

	// CA info
	var caCert		=	forge.pki.certificateFromPem(config.ca.cert),
		caSubject	=	caCert.subject,
		caKey		=	forge.pki.privateKeyFromPem(config.ca.key);

	// Client info
	var keys	=	forge.pki.rsa.generateKeyPair(config.client.keysize);

	var cert	=	forge.pki.createCertificate();

	cert.publicKey			=	keys.publicKey;
	cert.serialNumber		=	(new Date()).getTime(); // Not the best
	cert.validity.notBefore	=	new Date();
	cert.validity.notAfter	=	new Date();
	cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

	var attrs = [{
			name: 'commonName',
			value: commonName
		}, {
			name: 'countryName',
			value: caSubject.getField('C').value
		}, {
			name: 'stateOrProvinceName',
			value: caSubject.getField('ST').value
		}, {
			name: 'localityName',
			value: caSubject.getField('L').value
		}, {
			name: 'organizationName',
			value: caSubject.getField('O').value
		}
	];

	if(caSubject.getField('OU'))
	{
		attrs.push({
			name: 'organizationalUnitName',
			value: caSubject.getField('OU').value
		});
	}

	cert.setSubject(attrs);
	cert.setIssuer(caSubject.attributes);

	cert.sign(caKey, forge.md.sha256.create());

	var certs	=	{
		privateKey: forge.pki.encryptRsaPrivateKey(keys.privateKey, passphrase),
		publicKey: forge.pki.publicKeyToPem(keys.publicKey),
		certificate: forge.pki.certificateToPem(cert),
		ca: forge.pki.certificateToPem(caCert)
	};

	// Log
	logger.info('[' + (new Date()).toString() + '] Signed new certicate for ' + commonName + ', serial ' + cert.serialNumber);

	// Save the cert, for revokation
	fs.writeFile(__dirname + '/../certs/' + commonName + '-' + cert.serialNumber + '.crt', certs.certificate, function(err)
	{
		if(err)
			logger.error('[' + (new Date()).toString() + '] Can\'t save certificate ' + commonName + ', serial ' + cert.serialNumber);
	});

	return certs;
};

exports.zip	=	function(config, commonName, passphrase)
{
	var files	=	generateCertificate(config, commonName, passphrase);

	if( ! files || ! files.privateKey)
		return false;

	// OVPN content
	var ovpn	=	config.client.ovpn,
		prefix		=	commonName + '-' + config.client.suffix,
		caName		=	prefix + '-ca.crt',
		certName	=	prefix + '.crt',
		pubName		=	prefix + '.pub',
		keyName		=	prefix + '.key',
		ovpnName	=	prefix + '.ovpn',

	ovpn	=	ovpn.replace('{{ca}}', caName);
	ovpn	=	ovpn.replace('{{cert}}', certName);
	ovpn	=	ovpn.replace('{{key}}', keyName);

	// zip
	var archive	=	new zip();

	archive.addFile(keyName, new Buffer(files.privateKey));
	archive.addFile(certName, new Buffer(files.certificate));
	archive.addFile(pubName, new Buffer(files.publicKey));
	archive.addFile(caName, new Buffer(files.ca));
	archive.addFile(ovpnName, new Buffer(ovpn));

	return archive.toBuffer();
}
