var	restler	=	require('restler'),
	promise	=	require('bluebird')
;

exports.check =	function(apiEndpoint, cookieName, cookieValue)
{	
	return new promise(function(resolv, reject)
	{
		if( ! cookieValue)
			reject('Invalid SSO cookie.');
		
		restler.get(apiEndpoint, {
			headers: {
				Cookie: cookieName + '=' + cookieValue
			}
		}).on('complete', function(result, response)
		{		
			if(result instanceof Error || response.statusCode !== 200)
				reject('Invalid SSO credentials.');

			resolv(result);
		});
	});
}
