////////////////////////////////////////////////////////////////////////////////////////
//                  Get/Set Cookies   and   'CookiePipe' communication object         //
////////////////////////////////////////////////////////////////////////////////////////


function getCookie(name)
{
	var arg = name + "=";
	var alen = arg.length;
	var clen = document.cookie.length;
	var i = 0;
	while (i < clen) {
		var j = i + alen;
		if (document.cookie.substring(i, j) == arg) {
			var endstr = document.cookie.indexOf(";", j);
			if (endstr == -1) endstr = document.cookie.length;
			return unescape(document.cookie.substring(j, endstr));
			}
		i = document.cookie.indexOf(" ", i) + 1;
		if (i == 0)
			break;
	}
	return null;
}


function getCookieLike(arg)		// get cookie with name begins with arg...
					//returns  obj.id - full name of cookie   and obj.value
{
	var alen = arg.length;
	var str = document.cookie;
	var clen = str.length;
	var i = 0;
	while (i < clen) {
		var pos=str.indexOf('=',i);
		if(str.substr(i,alen) == arg) {
			var pos_end=str.indexOf(';',i);
			if(pos_end==-1) pos_end=str.length;
			var obj=new Object();
			obj.id=str.substr(i,pos-i);
			obj.value=unescape(str.substr(pos+1,pos_end - pos - 1));
			return obj;
			}
		i = str.indexOf(" ", i) + 1;
		if (i == 0)
			break;
	}
	return null;
}


function setCookie(name, value, domain, path, expires, secure)
{
	if(typeof(domain)=='undefined') domain='';
	if(typeof(path)=='undefined') path = '/';
	if(typeof(expires)=='undefined') expires=null;
	if(typeof(secure)=='undefined') secure = false;
	document.cookie = name + '=' + escape(value) + (expires ? ("; expires=" + expires.toGMTString()) : "" ) + "; path=" + path
				+ "; domain=" + domain ;
}


function deleteCookie(name,domain,path)
{
	if(typeof(domain)=='undefined') domain='';
	if(typeof(path)=='undefined') path = '/';

	var expires = new Date();
	expires.setTime(expires.getTime() - 1);
	var value = getCookie(name);

	document.cookie = name + '=' + value + "; expires=" + expires.toGMTString() + "; path=" + path + "; domain=" + domain ;
}



function setCookieRemote(cname,data,adomain,id)
{
	loadFrame('back-frame-'+id,adomain+'/setcookie.htm#'+cname+'&'+escape(data));
}

function killFrame(id)
{
	var iframe=document.getElementById('back-frame-'+id);
	if(iframe) iframe.parentNode.removeChild(iframe);
}


function loadFrame(id,url,callback)
{
	var iframe=document.getElementById(id);
	if(!iframe) {
		iframe=document.createElement('iframe');
		document.body.appendChild(iframe);
		iframe.id=id;
		}
	iframe.src='';
	iframe.src=url;
	iframe.style.display='none';

	var func=function() { 
		if(callback) callback();
		}
	iframe.onload = func;
	iframe.onstatuschanged = func;
	if("attachEvent" in iframe) iframe.attachEvent('onload', func);

	return iframe;
}


/////////////////////////////////////////////////////////////////////////////////////
//                             CookiePipe object
/////////////////////////////////////////////////////////////////////////////////////
// init:	var e = new Date();
//		var host=window.location.hostname;
// 		var pipe=new CookiePipe('omniPipe'+e.getTime(),host);
//		pipe.listen(function(id,data){alert('init callback')});
//		newframe.src=URL+'#'+pipe.name+'&'+host;
// in frame:	var back_host=GET FROM window.location.hash;
//		var pipe_id=GET FROM window.location.hash;
//		pipe=new CookiePipe(pipe_id,back_host);
//		pipe.listen(function(id,data){ .... pipe.reply(id,data2); }
//		pipe.send('init OK');
//
//		pipe.send(data,callback(response));
//		pipe.send(data)			//without reply
//		pipe.listen(callback)		//set listen procedure
//		pipr.reply(id,data)			//id get from listen()'s callback

function CookiePipe(aname,adomain)
{
	this.name=aname;
	this.domain=adomain;	//REMOTE domain (with path)
}

CookiePipe.prototype=
{
	makeId : function()
		{
		var e = new Date();
		this.seed++;
		return this.seed+e.getTime();
		},

	seed : 0,

	send : function(data,callback,rand)
		{
		var id=this.makeId();
		if(rand) id-=rand*100;

		if(callback) {
			var domain=window.location.hostname;	//LOCAL domain
			var cookie_name=this.name+'reply'+id;
			var timer=setInterval(function() {
				var value=getCookie(cookie_name);
				if(!value) { return; }
				clearInterval(timer);
//alert("reply found "+cookie_name+"="+value);
				deleteCookie(cookie_name,domain);
				killFrame(id);
				callback(unescape(value));
				},20);
			}
		//setCookie(this.name+'send'+id,data,this.domain);	//REMOTE doamin
		setCookieRemote(this.name+'send'+id,data,this.domain,id);
		},

	listen : function(callback)
		{
		var cookie_name=this.name+'send';
		var domain=window.location.hostname;	//LOCAL domain
		var timer=setInterval(function() {
			var obj=getCookieLike(cookie_name);
			if(!obj) { return; }

			var id=obj.id.substr(cookie_name.length);
			deleteCookie(obj.id,domain);
			callback(id,unescape(obj.value));
			},2000);
		},
		
	reply : function(id,data)
		{
		//setCookie(this.name+'reply'+id,data,this.domain);	//REMOTE
		setCookieRemote(this.name+'reply'+id,data,this.domain,id);
		setTimeout(function() { killFrame(id); },10000);
		}

}
