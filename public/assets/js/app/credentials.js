$(document).ready(function()
{
	$('button').on('click', function()
	{
		$('.progress').removeClass('hide');
		$('button').hide();

		$('iframe').attr('src', '/download?p=' + encodeURIComponent($('#password').val()));

		window.setTimeout(function()
		{
			$('.progress').addClass('hide');
			$('button').show();
			$('#password').val('')
		}, 5000);
	});

	$('#password').complexify({}, function(valid, complexity)
	{
		var progressBar	=	$('#complexity-bar');

		progressBar.toggleClass('progress-bar-success', valid);
		progressBar.toggleClass('progress-bar-danger', !valid);
		progressBar.css({'width': complexity + '%'});

		$('#complexity').text(Math.round(complexity) + '%');

		if(complexity > 40)
			$('button').attr('disabled', false);
		else
			$('button').attr('disabled', true);
	});
});
