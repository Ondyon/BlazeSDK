function AJAX()
{
this.name='static AJAX';
}



AJAX.prototype.CreateRequest=function()
{
	var request;
	if (window.XMLHttpRequest) { // Mozilla, Safari, ...
		try { request = new XMLHttpRequest(); } catch(e) { alert('ERROR init AJAX'); }
		if(request.overrideMimeType)	//does not work on IE7
			request.overrideMimeType('text/html; charset=windows-1251');
		}
	else if (window.ActiveXObject) { // IE
		request = new ActiveXObject("Microsoft.XMLHTTP");
		try {  request = new ActiveXObject("Msxml2.XMLHTTP"); } 
		catch (e) {
			try { request = new ActiveXObject("Microsoft.XMLHTTP"); } 
			catch (e) {}
			}
		}
	if (!request) {
		alert('Cannot create an XMLHTTP instance - AJAX is not supported. Change your Browser!');
		return null;
		}

	return request;
}





AJAX.prototype.AJAXSendCommand=function(url,action,callback,do_get)
{
	var req=this.CreateRequest();
	req.onreadystatechange = function() {
		if(req.readyState != 4) return false;
		if(req.status != 200) {
			alert("ERROR status:"+req.status);
			// for example the response may be a 404 (Not Found)
			// or 500 (Internal Server Error) response codes
			alert(req.responseText);
			return false;
			}
		callback(req.responseText);
		return true;
		};

	var method='POST';
	if(do_get) method='GET';
	try { req.open(method,url,true); }
	catch(ex) { alert("ERROR "+ex.number+" OPEN "+ex.name+":"+ex.message+"\r\n"+ex.description+"\r\n"+url+" ["+action+"]"); }

	if(req.setRequestHeader) req.setRequestHeader('Content-Type', 'application/json'); //'application/x-www-form-urlencoded');

	try { req.send(action); }
	catch(ex) { alert("ERROR "+ex.number+" SEND "+ex.name+":"+ex.message+"\r\n"+ex.description+"\r\n"+url+" ["+action+"]"); }

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

