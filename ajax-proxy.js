function AJAX(url,callback)
{
	this.name='AJAX proxy';

	if(callback) this.on_load=callback;

	var e = new Date();
	var host='';	//REMOTE (ogc) host with path
	url.replace(/(.*)\/.*?/,function(str, p1, p2, offset, s) { host=p1; } );
	this.pipe=new CookiePipe('ajaxPipe'+e.getTime(),host);

	var host='';	//MY host with path
	var a=window.location.href; a.replace(/(.*)\/.*?/,function(str, p1, p2, offset, s) { host=p1; } );
	var pipe=this.pipe;
	loadFrame('ajax-frame',url+"#"+this.pipe.name+'&'+host,function(){
		pipe.send('load',function(response) {
			if(callback) callback(response);
			});
		});
}




AJAX.prototype.AJAXSendCommand=function(url,action,callback)
{
	this.pipe.send('send|'+url+'|'+action,function(response){
		//response=response.replace(/<palka>/g,'|');
		callback(response);
		});
}



function fakeAJAXSendCommand(url,action,callback)
{
	var e = document.createElement('script');
	e.async = true;
	e.src = url + action + '&callback='+callback;
	e.type = "text/javascript";
	document.getElementById('fb-root').appendChild(e);
	e.id = 'ajax-script';
	//e.onload = function() { eval(callback+'();'); }
	//e.onreadystatechange = function() { eval(callback+'();'); };
}

