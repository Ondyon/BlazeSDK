
function blaze_FBlogin()
{
	blaze.login(function(response)
		{
		if (response.session) {	// user successfully logged in
			alert('success');
			}
		else {			// user cancelled login
			alert('cancelled');
			}
		},
		{perms:'read_stream,publish_stream,offline_access'}
	);
}

function blaze_FBgetLoginStatus()
{
	blaze.getLoginStatus(function(response) {
	  if (response.session) {
		// logged in and connected user, someone you know
		alert('IS logged. FacebookId:'+response.session.uid);
		//blaze.on_error(response.session.uid);
		//document.execCommand('copy',response.session.uid);
	  } else {
	    // no user session available, someone you dont know
		alert('NOT logged');
	  }
	});
}



function blaze_Test_queryChannelURL(game_id,user_id,channel,isForceCreated,backref,callback)
{
	if(!blaze.userId || !blaze.srLoginResponse) { alert('you are not logged in!'); return; }

	var link_type='';
	if(this.game_generated) link_type='game';
	else link_type=(window.location.href.indexOf('facebook.com')!=-1 || !this.channel || this.channel=='0') ? 'userFb' : 'userCh';


	blaze._queryChannelUrl(callback,
		game_id,
		user_id,
		blaze.channel,
		isForceCreated,
		link_type,
		backref
		);
}


function blaze_postWall()
{
	var text="Text of my Post";
	var attach=
	    {
	       name: 'Name of attachment',
	       caption: 'Title of Attachment',
	       description: ( 'text of attachment' ),
	       href: 'http://blaze.com/my_link_to_share'
	     }
	var link={ text: 'Click this link', href: 'http://github.com/facebook/connect-js' }


	var obj = {
			method: 'stream.publish',
			message: text,
			attachment: attach,
			action_links: [ link ],
			user_message_prompt: 'Post message'
		};

	blaze.ui(
		obj,
		function(response)
		   {
		     if (response && response.post_id) {
		       alert('Post was published. id='+response.post_id);
		     } else {
		       alert('Post was not published.');
		     }
		   }
		);


}


function blaze_publish()
{

	var text="Text of my Post";
	var attach=
	    {
	       name: 'Name of attachment',
	       caption: 'Title of Attachment',
	       description: ( 'text of attachment' ),
	       href: 'http://blaze.com/my_link_to_share'
	     }
	var link={ text: 'Click this link', href: 'http://github.com/facebook/connect-js' }

	blaze.streamPublish(text,attach,[link],null,'user_message_prompt',
		function(response)
		   {
		     if (response && response.post_id) {
		       alert('Post was published. id='+response.post_id);
		     } else {
		       alert('Post was not published.');
		     }
		   },
	false,
	null);
}



function blaze_postFeed(user)
{
	var text = 'AAA This text will be posted to friends feed';

	var obj={
		message: 'Test message posted using blaze.postFeed',
		caption: 'Test Caption from blaze.postFeed()',
		link: 'http://ya.ru'
	 }	//message, picture, link, name, caption, description, source


	blaze.JSpostFeed(
		user,
		obj,
		function(response) {
		  if (!response || response.error) {
			if(!response) { alert("no response"); }
			else {	alert('Error occured '+response.error.message); }

		  } else {
		    alert('Post ID: ' + response.id);
		  }
		}
		);
}


function FB_postFeed(user)
{
	var text = 'AAA This text will be posted to friends feed';

	var obj={
		message: 'Test message posted using blaze.postFeed',
		caption: 'Test Caption from blaze.postFeed()',
		link: 'http://ya.ru'
	 }	//message, picture, link, name, caption, description, source


	FB.api('/'+user+'/feed', 'post', obj, 
		function(response) {
		  if (!response || response.error) {
			if(!response) { alert("no response"); }
			else {	alert('Error occured '+response.error.message); }

		  } else {
		    alert('Post ID: ' + response.id);
		  }
		}
		);
}



function blaze_share(url)
{
	blaze.JSshare(url,
		function(response) {
			alert(response);
			if(response) alert('share succeed');
			else alert('share cancelled');
			}
		);
}




function blaze_bookmark(root)
{
	var url='http://oberon-media.com';
	var game_name='test game';
	blaze.MLbookmark(root,
		function(response) {
			if(response) alert('bookmark succeed');
			else alert('bookmark cancelled');
			}
		);
}



function blaze_board(root)
{
	blaze.MLboard(root);
}




function blaze_isAppUser()
{
	if(!blaze.userId) { alert('you are not logged in!'); return; }

	window.blaze._isAppUser( function(response) { alert(response); } );

}




function blaze_srLogin()
{
	document.body.style.backgroundColor='#FF0000';
	window.blaze._srLogin(function(param) { document.body.style.backgroundColor='#FFFFFF'; alert(JSON2str(param)); });
}



function blaze_Omniture22()
{
	blaze._omnitureSend(22,{});
}


function blaze_Omniture23()
{
	blaze._omnitureSend(23,{});
}


function addGameCallback(res)
{
 if(!res || res==0) {
	alert("Error occures. Probably GameId is not valid"); 
	}
else {
	var el=document.createElement('option');
	el.value=res.gameId;
	el.label=res.name;
	var select=document.getElementById('game_switch');
	select.appendChild(el);
	alert(res.name+' is added to your games list');
	}
}




function blaze_shareXFBML(url)
{
	var a = 
	'	<fb:serverFbml>'+
	'	<script type="text/fbml">'+ 
	'	<fb:share-button class="url" href="'+url+'" title="'+url+'" action="http://sdk.oberon-media.com/JS/test/test.htm"/>'+
	'	<\/script>'+
	'	</fb:serverFbml>';

	var el=document.getElementById("share_div");

	el.style.display='';
	el.innerHTML = a;
	blaze.parse(el);
}






function localAJAX()
{
this.name='static AJAX';
}


localAJAX.prototype.CreateRequest=function()
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





localAJAX.prototype.AJAXSendCommand=function(url,action,callback,do_get)
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


function blaze_old_streamPublish_permissions()
{

	var callback=function(res){alert('OLDpublish:'+res);};

	if(blaze.Connect) {
		//alert('And now StreamPublish (1)');
		blaze.Connect.showPermissionDialog('read_stream,publish_stream',function(res){alert(res);});
		}
	else {
		window.blaze._requireOldApi(["Connect"], function(res) {
			blaze.Connect.showPermissionDialog('read_stream,publish_stream',function(res){alert(res);});
			});
		}
}





function blaze_old_streamPublish()
{
	var user_message='Message Test Posted from OLD API (test Application)';
	attachment={
			name: 'Title of Attachment',
			href: 'http://ya.ru',
			caption: 'Caption of a post',
			description: 'Descriptive text...',
			properties: '',	//anchors in this text
			media: [
					{ 
					"type": "image", 	//"flash", "music"
					"src": "http://sdk.oberon-media.com/JS/images/logo.png", 
					"href": "http://sdk.oberon-media.com/JS/index.html"
					}
				]
			};
	var action_links=[ { text:'ActionLink...', href:'http://sdk.oberon-media.com/JS/index.html' } ];		//array
	var target_id=blaze.userId;
	var user_message_prompt='user_message_prompt';
	var callback='callback';
	var auto_publish='true';
	var actor_id='';


	var callback=function(res){alert('OLDpublish:'+res);};

	if(blaze.Connect) {
		//alert('And now StreamPublish (1)');
		blaze.Connect.streamPublish(user_message,attachment,action_links,target_id,user_message_prompt,callback,auto_publish,actor_id);
		}
	else {
		window.blaze._requireOldApi(["Connect"], function(res) {
			//alert('FB.Connect is ready');
			//alert('And now StreamPublish (2)');
			window.blaze.Connect.streamPublish(user_message,attachment,action_links,target_id,user_message_prompt,callback,auto_publish,actor_id);
			});
		}
}


//var pay_obj = new FB.Payments();
//pay_obj.setParam('order_info', 'itemnum:23,code:45');
//pay_obj.setParam('next_js', callback_func);
//pay_obj.submitOrder();


function blaze_rest_post_permissions()
{
	blaze.login(function(res){alert('Permissions OK:'+JSON2str(res));},{perms:'read_stream,publish_stream'});
}

function blaze_rest_post()
{

	var obj=new Object();
	obj.message= 'Test TEXT from REST API';

	obj.attachment={
			name: 'Title of Attachment',
			href: 'http://ya.ru',
			caption: 'Caption of a post',
			description: 'Descriptive text...',
			properties: '',	//anchors in this text
			media: [
					{ 
					"type": "image", 	//"flash", "music"
					"src": "http://sdk.oberon-media.com/JS/images/logo.png", 
					"href": "http://sdk.oberon-media.com/JS/index.html"
					}
				]
			};

	obj.action_links=[ { text:'ActionLink...', href:'http://sdk.oberon-media.com/JS/index.html' } ];		//array
	obj.privacy={
			value : "EVERYONE"	// CUSTOM, ALL_FRIENDS, NETWORKS_FRIENDS, FRIENDS_OF_FRIENDS, SELF
			//friends : ''		// for CUSTOM  (EVERYONE, NETWORKS_FRIENDS, FRIENDS_OF_FRIENDS, ALL_FRIENDS, SOME_FRIENDS, SELF,  NO_FRIENDS 
			//networks : 'id,id,id'	// for CUSTOM
			//allow : 'id,id,id'		// if  friends='SOME_FRIENDS'
			//deny : 'id,id,id'		// if  friends='SOME_FRIENDS'
			};

	window.blaze._RESTPost(window.blaze.userId,obj,function(err,res){alert('RESTpost() ANSWER:'+err+':'+res);});
}


function blaze_like(root)
{
	loadScript('http://connect.facebook.net/en_US/all.js#xfbml=1',function(){
		var str='<fb:like href="%gameUrl%" show_faces="true" width="450"></fb:like>';
		str=str.replace(/%gameUrl%/,blaze._getChannelURL('http://ya.ru','like',blaze.game_generated));
		root.innerHTML=str;
//		blaze.parse(root);
		});
	blaze.FB.Event.subscribe('edge.create', function(response) {
		alert('like trigged');
		});
	blaze.FB.Event.subscribe('edge.remove', function(response) {
		alert('UN like trigged');
		});
}