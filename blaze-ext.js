

var INVITE_W=760;
var INVITE_H=408;


var checkInviteCookie=null;

Blaze.prototype._waitForInviteCookie=function (name,callback)
		{
		checkInviteCookie = setInterval(function() { 
			var invite_succeed = getCookie(name);
			if (invite_succeed) {
				deleteCookie(name);
				clearInterval(checkInviteCookie); 
				if(callback) callback(invite_succeed);
				}
			}, 250);
		};



// ======================== our simplified Functions (using JS SDK) =========================== 


Blaze.prototype.JSpostFeed=function(user,obj,callback)
		{
		var path='me';
		if(user) path=user
		this.api('/'+path+'/feed', 'post', obj, callback);
		};


Blaze.prototype.JSshare=function(url,callback)
		{
		url=this._getChannelURL(url,'share',blaze.game_generated);

		var obj={ method:'stream.share', u:url, href:url, title:url };	//MORE???

		this.ui( obj, function(ret) { callback(ret); } );
		};


Blaze.prototype.JSuserInfo=function(callback)
		{
		this.api('/me',callback);
		};


Blaze.prototype.JSpostWall=function(obj,callback)
		{
		this.ui(obj,callback);
		};



// ======================== our simplified Functions (using XFBML) =========================== 

Blaze.prototype._dialog=function(code,awidth,aheight,callback)
{
	loadStyles('http://sdk.oberon-media.com/JS/images/dialog.css',function(){ updatePosition(); });

	var div=document.getElementById('dialog-div');
	if(div) {
		var rm=function(obj) {
			var nodes=obj.childNodes;
			for(var i=0;i<nodes.length;i++) { 
				rm(nodes[i]);
				obj.removeChild(nodes[i]);
				}
			}
		rm(div);
		}
	else {
		div=document.createElement('div');
		div.id='dialog-div';
		document.body.appendChild(div);
		}
	div.style.display='';
	div.className='dialog-div';

	var table=document.createElement('table');
	table.cellPadding='0';
	table.cellSpacing='0';
	table.border='0';
	div.appendChild(table);
	var tbody=document.createElement('tbody');
	table.appendChild(tbody);
	var tr1=document.createElement('tr');
	var tr2=document.createElement('tr');
	var tr3=document.createElement('tr');
	tbody.appendChild(tr1);
	tbody.appendChild(tr2);
	tbody.appendChild(tr3);
	var td11=document.createElement('td');
	var td12=document.createElement('td');
	var td13=document.createElement('td');
	tr1.appendChild(td11);
	tr1.appendChild(td12);
	tr1.appendChild(td13);
	var td21=document.createElement('td');
	var td22=document.createElement('td');
	var td23=document.createElement('td');
	tr2.appendChild(td21);
	tr2.appendChild(td22);
	tr2.appendChild(td23);
	var td31=document.createElement('td');
	var td32=document.createElement('td');
	var td33=document.createElement('td');
	tr3.appendChild(td31);
	tr3.appendChild(td32);
	tr3.appendChild(td33);

	td11.className='dialog-td11';
	td13.className='dialog-td13';
	td31.className='dialog-td31';
	td33.className='dialog-td33';
	td12.className='dialog-td-brd';
	td21.className='dialog-td-brd';
	td32.className='dialog-td-brd';
	td23.className='dialog-td-brd';
	td22.className='dialog-td-mid';

	var iframe=document.createElement('iframe');
	iframe.style.border='none';
	iframe.style.overflow='hidden';
	iframe.style.padding='0px';
	iframe.style.margin='0px';
	td22.appendChild(iframe);

	var doc=getIframeDocument(iframe);
//	doc.write('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 1.1 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">');
//	doc.write('<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">');
	doc.write("<body BOTTOMMARGIN='0' height='100%' style='border:none;background:transparent;padding:0px;margin:0px;overflow:hidden;width:"+awidth+"px;height:"+aheight+"px;'>"+code+"</body>");
//	doc.write('</html>');


	var updatePosition=function() {
		iframe.style.width=awidth+'px';
		iframe.style.height=aheight+'px';

		//doc.body.width=awidth;
		//doc.body.height=aheight;

		var win_width=window.innerWidth ? window.innerWidth : document.body.offsetWidth;
		var win_height=window.innerHeight ? window.innerHeight : document.body.offsetHeight;

		if(window.innerWidth){
			win_width = window.innerWidth;
			win_height = window.innerHeight;
		} else if (document.documentElement && document.documentElement.clientWidth){
			win_width = document.documentElement.clientWidth;
			win_height = document.documentElement.clientHeight;
		} else if (document.body.clientWidth){
			win_width = document.body.clientWidth;
			win_height = document.body.clientHeight;
		}

		var offset= self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop);

		var div_width=div.offsetWidth;
		var div_height=div.offsetHeight;

		div.style.left=win_width/2 - div_width/2  + 'px';
		div.style.top=win_height/2 - div_height/2  + offset + 'px';
		}
	if("attachEvent" in window) window.attachEvent('onresize',updatePosition);
	else if("addEventListener" in window) window.addEventListener('resize',updatePosition,false);

	if("attachEvent" in window) window.attachEvent('onscroll',updatePosition);
	else if("addEventListener" in window) window.addEventListener('scroll',updatePosition,false);

	setTimeout(updatePosition,100);
}


Blaze.prototype._dialogPlain=function(code,awidth,aheight,callback)
{
	loadStyles('http://sdk.oberon-media.com/JS/images/dialog.css',function(){ updatePosition(); });

	var div=document.getElementById('dialog-div');
	if(div) {
		var rm=function(obj) {
			var nodes=obj.childNodes;
			for(var i=0;i<nodes.length;i++) { 
				rm(nodes[i]);
				obj.removeChild(nodes[i]);
				}
			}
		rm(div);
		}
	else {
		div=document.createElement('div');
		div.id='dialog-div';
		document.body.appendChild(div);
		}
	div.style.display='';
	div.className='dialog-div';

	var table=document.createElement('table');
	table.cellPadding='0';
	table.cellSpacing='0';
	table.border='0';
	div.appendChild(table);
	var tbody=document.createElement('tbody');
	table.appendChild(tbody);
	var tr1=document.createElement('tr');
	var tr2=document.createElement('tr');
	var tr3=document.createElement('tr');
	tbody.appendChild(tr1);
	tbody.appendChild(tr2);
	tbody.appendChild(tr3);
	var td11=document.createElement('td');
	var td12=document.createElement('td');
	var td13=document.createElement('td');
	tr1.appendChild(td11);
	tr1.appendChild(td12);
	tr1.appendChild(td13);
	var td21=document.createElement('td');
	var td22=document.createElement('td');
	var td23=document.createElement('td');
	tr2.appendChild(td21);
	tr2.appendChild(td22);
	tr2.appendChild(td23);
	var td31=document.createElement('td');
	var td32=document.createElement('td');
	var td33=document.createElement('td');
	tr3.appendChild(td31);
	tr3.appendChild(td32);
	tr3.appendChild(td33);

	td11.className='dialog-td11';
	td13.className='dialog-td13';
	td31.className='dialog-td31';
	td33.className='dialog-td33';
	td12.className='dialog-td-brd';
	td21.className='dialog-td-brd';
	td32.className='dialog-td-brd';
	td23.className='dialog-td-brd';
	td22.className='dialog-td-mid';


	td22.style.width=awidth+'px';
	td22.style.height=aheight+'px';

	td22.innerHTML=code;

	var updatePosition=function() {

		var win_width=window.innerWidth ? window.innerWidth : document.body.offsetWidth;
		var win_height=window.innerHeight ? window.innerHeight : document.body.offsetHeight;

		if(window.innerWidth){
			win_width = window.innerWidth;
			win_height = window.innerHeight;
		} else if (document.documentElement && document.documentElement.clientWidth){
			win_width = document.documentElement.clientWidth;
			win_height = document.documentElement.clientHeight;
		} else if (document.body.clientWidth){
			win_width = document.body.clientWidth;
			win_height = document.body.clientHeight;
		}

		var offset= self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop);

		var div_width=div.offsetWidth;
		var div_height=div.offsetHeight;

		div.style.left=win_width/2 - div_width/2  + 'px';
		div.style.top=win_height/2 - div_height/2  + offset + 'px';
		}
	if("attachEvent" in window) window.attachEvent('onresize',updatePosition);
	else if("addEventListener" in window) window.addEventListener('resize',updatePosition,false);

	if("attachEvent" in window) window.attachEvent('onscroll',updatePosition);
	else if("addEventListener" in window) window.addEventListener('scroll',updatePosition,false);

	setTimeout(updatePosition,100);
	setTimeout(updatePosition,200);

}



Blaze.prototype._closeDialog=function()
{
	var div=document.getElementById('dialog-div');
	if(div) {
		div.style.display='none';
		var rm=function(obj) {
			var nodes=obj.childNodes;
			for(var i=0;i<nodes.length;i++) { 
				rm(nodes[i]);
				obj.removeChild(nodes[i]);
				}
			}
		rm(div);
		}
}



Blaze.prototype.SJinvite=function(link,game_name,callback)
		{
		var excludeIds = "";
		//	var idsArray = getFriendsIdsPlayingThisGame();
		//	if (idsArray.length) {
		//		excludeIds = idsArray.join(",");
		//		}

		var url = "http://sdk.oberon-media.com/JS/test/invite.html?url="+escape(link)+"&title="+escape(game_name)+"&ids="+escape(excludeIds);


		deleteCookie("invite_succeed");
		clearInterval(checkInviteCookie); 

		var options="toolbar=0,location=0,menubar=0,resizable=1,status=,scrollbars=0";
		options += ",width=" +760 + ",height=" + 450;
		window.open(url,'Invite',options);

		this._waitForInviteCookie('invite_succeed',callback);
		};



Blaze.prototype.MLgift=function(link,game_name,callback)
		{
		var excludeIds = "";
		//	var idsArray = getFriendsIdsPlayingThisGame();
		//	if (idsArray.length) {
		//		excludeIds = idsArray.join(",");
		//		}

		var url = "http://sdk.oberon-media.com/JS/test/invite.html?url="+escape(link)+"&title="+escape(game_name)+"&ids="+escape(excludeIds)+"&gift=true";

		var options="toolbar=0,location=0,menubar=0,resizable=1,status=,scrollbars=0";
		options += ",width=" +760 + ",height=" + 450;
		window.open(url,'Gift',options);

		this._waitForInviteCookie('invite_succeed',callback);
		};


Blaze.prototype.MLshare=function(link,callback)
		{
		var url = "http://sdk.oberon-media.com/JS/test/share.html?url="+escape(link);

		var options="toolbar=0,location=0,menubar=0,resizable=1,status=,scrollbars=0";
		options += ",width=" +760 + ",height=" + 450;
		window.open(url,'Share',options);

		this._waitForInviteCookie('invite_succeed',callback);
		};


Blaze.prototype.MLbookmark=function(root,callback)
		{
		var code='<fb:fbml>'+
		'<fb:bookmark/>'+
		'</fb:fbml>';

		root.style.display='none';
		root.innerHTML = code;
		this.parse(root);

		var a_node=null;
		var brow=function(obj) {
			if(obj.tagName=='A' || obj.nodeName=='A') {
				a_node=obj;
				}
			var nodes=obj.childNodes;
			for(var node in nodes) brow(nodes[node]);
			}
		brow(root);

		if(a_node && a_node.onclick) {
			a_node.onclick();
			if(callback) callback(1);
			}
		else {
			if(callback) callback(0);
			else alert('Bookmark: FBML parse failed');
			}
		};


Blaze.prototype.MLboard=function(root)
		{
		var code=''+
		'	<fb:serverFbml>'+
		'	<script type="text/fbml">'+ 
		'	<fb:board xid="1" numtopics="100" />'+
		'	<\/script>'+
		'	</fb:serverFbml>';
		root.innerHTML = code;
		this.parse(root);
		};

Blaze.prototype.RESTpost=function(user,obj,callback)
{
		//var url='https://api.facebook.com/method/users.isAppUser';
		var url='https://graph.facebook.com/'+user+'/feed';

		//var command='?access_token='+window.blaze.access_token+'&uid='+window.blaze.userId;
		var command='?access_token='+window.blaze.access_token;
		if(obj.message) command+='&message='+obj.message;
		if(obj.picture) command+='&picture='+obj.picture;
		if(obj.link) command+='&link='+obj.link;
		if(obj.name) command+='&name='+obj.name;
		if(obj.caption) command+='&caption='+obj.caption;
		if(obj.description) command+='&description='+obj.description;
		if(obj.source) command+='&source='+obj.source;

		blaze._statusChanged(1,'RESTpost');

		this._RESTpost_callback_save=callback;
		fakeAJAXSendCommand(url,command,'window.blaze._RESTpost_callback');
}

Blaze.prototype._RESTpost_callback=function(code)
{
	this._RESTpost_callback_save(code);
}



Blaze.prototype._doInvite=function(url,label,ids,gift,callback)
{
	var cookie_id=new Date().getTime();
	var cookie_name='';	//'callback-'+'gift'+cookie_id;

	var a='';
	var el=null;

	if(gift && gift != null && gift != "null") {
		cookie_name='callback-'+'gift-'+cookie_id;
		a = 
	'	<fb:serverFbml>'+
	'	<script type="text/fbml">'+ 
	'	<fb:request-form action="http://sdk.oberon-media.com/JS/callback.htm?action=gift&id='+cookie_id+'"'+ 
	'         			method="post"'+ 
	'				invite="false"'+
	'         			type="game gift"'+ 
	'		 			content="Send a gift to your friend who has also playing the '+label+'. Here is the link to the game! <fb:req-choice url=\''+url+'\' label=\'Download\' />"'+ 
	'		<fb:multi-friend-selector rows="3" exclude_ids="'+ids+'" showborder="true" actiontext="Send a gift in '+label+'"/>'+
	'	</fb:request-form>'+
	'	<\/script>'+
	'	</fb:serverFbml>';

		el=document.getElementById("gift_div");
		}
	else {
		cookie_name='callback-'+'invite-'+cookie_id;
		a = 
	'	<fb:serverFbml style="width:500px">'+
	'	<script type="text/fbml">'+ 
	'	<fb:request-form action="http://sdk.oberon-media.com/JS/callback.htm?action=invite&id='+cookie_id+'"'+ 
	'         			method="post"'+ 
	'				invite="true"'+
	'         			type="free game request"'+ 
	'		 			content="I am playing '+label+' and would like you to join me.  Here is a link for a FREE DOWNLOAD of the game! <fb:req-choice url=\''+url+'\' label=\'Download\' />"'+ 
	'		<fb:multi-friend-selector rows="3" exclude_ids="'+ids+'" showborder="true" actiontext="Invite your friends to play '+label+'"/>'+
	'	</fb:request-form>'+
	'	<\/script>'+
	'	</fb:serverFbml>';

		el=document.getElementById("invite_div");
		}


	if(!el) {
		el=document.createElement('div');
		el.id='invite_div';
		el.style.display='none';
		document.body.appendChild(el);
		}
	el.innerHTML = a;
	el.style.display='';
	window.blaze.parse(el);

	setTimeout(function() {
		//blaze._dialog(el.innerHTML,INVITE_W,INVITE_H,callback);
		var f_resize=function(){
			el.style.display='none';
			blaze._dialog(el.innerHTML,INVITE_W,INVITE_H,callback);
			};

//		if("attachEvent" in el) el.attachEvent('onresize',f_resize);
//		else if("addEventListener" in el) el.addEventListener('resize',f_resize,true);
//			OR  (above does not works in Mozilla)
//			emulation of 'onresize' of div
		var wid=el.offsetHeight;
		var wid_timer=setInterval(function(){
			if(wid!=el.offsetHeight) {
				wid=el.offsetHeight;
				clearInterval(wid_timer);
				//alert('SIZE CHANGED!');
				f_resize();
				}
			},50);

		},100);

	this._waitForInviteCookie(cookie_name,function(res) {
		window.blaze._closeDialog();
		if(callback) callback(res);
		});
}




Blaze.prototype._shareDialog=function(link,callback)
{
	var local_ajax=new localAJAX();
	local_ajax.AJAXSendCommand('http://sdk.oberon-media.com/JS/shareDlg.htm',null,function(param) {
			param=param.replace(/%user_id%/g,window.blaze.userId);
			param=param.replace(/%caption%/g,link);
			blaze._dialogPlain(param,575,190,function(){alert('Dialog OK');});
			},
			true);		//true=GET
	if(callback) window.blaze._shareDialog_callback=callback;
	else window.blaze._shareDialog_callback=null;
}


Blaze.prototype._shareDialogSubmit=function()
{
	var text=document.getElementById('share_text').innerText;
	var cap=document.getElementById('share_cap').value;
	var privacy=document.getElementById('security_list').selected;
	if(!privacy) privacy='EVERYONE';

	var obj=new Object();
	obj.text=text;
	obj.caption=cap;
	//obj.picture
	obj.link= this._getChannelURL(cap,'shareREST',this.game_generated);

	obj.privacy=privacy;

	this._RESTShare(obj,function(res,mess){
		if(window.blaze._shareDialog_callback) window.blaze._shareDialog_callback(res,mess);
		});
	this._closeDialog();
}


