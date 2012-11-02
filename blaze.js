// =============================================================================
//                                BLAZE SDK Draft
// =============================================================================


// APP_ID must be defined or FB initialized

// init Blaze
//	SURE_Blaze(callback);
//		callback(blaze) {	//here can be set:
//			blaze.gameId='testGame';
//			}
//
// class Blaze
//
// transparent methods:	(hooked FB JS API Functions - see Facebook SDK for details)
//	login(callback)
//		also set variables:
//			blaze.session		- FB session
//			blaze.userId		- FB userId
//			blaze.access_token	- FB token
//	logout(callback)
//	getLoginStatus(callback)
//		also set variables:
//			blaze.session		- FB session
//			blaze.userId		- FB userId
//			blaze.access_token	- FB token
//	getSession()
//	ui(obj,callback)
//	api(path, ... callback)
//	parse(el)  - use instead of FB.XFBML.parse(el)
//
// not FB methods
//	run(function_name,parameters) - try to call FB methods (hooked if hook exists)
//
// protected and methods for internal use
//	_loadFacebook(app_id,callback)
//
//	_getChannelURL(old_url,reason)		//reason: postToWall, share etc
//		return the link to the redirect page with right parameters
//
//	_srLogin(callback);			//Login to Social Ring Server
//	  set variables:
//		blaze.srLoginResult		//error code. if OK==0
//		blaze.srLoginResponse
//			"userId":"a084695d-5328-45e2-9ef8-faadc75df9d6",
//			"parentUserId":"00000000-0000-0000-0000-000000000000",
//			"SRUserName":"2_100000012067019",
//			"SRNickName":"Oren C.",
//			"channel":110005373,
//			"email":{},
//			"emailOptIn":,
//			"allowPublish":,
//			"socialNetworkMaping":{},
//			"avatarPictureURL":{},
//			"isPotential":,
//			"modifiedDate":"06-09-2010"
//		blaze.srSession
//			"SRUserId":"a084695d-5328-45e2-9ef8-faadc75df9d6",
//			"SRToken":"a5f1dcbb8b3d3db55fc441c0722e1539",
//			"SRTokenParams":{
//				"SNW_2":"112613825461047|d893eeb7c4c03f105e0986df-100000012067019|XbAtzX_9tqZnA0_uEZaNQmYWuqQ"}
//				}
//
//	_isAppUser(callback)
//			//callback params:  1=Yes  0=No   NNN=error code
//
//	_queryChannelUrl(callback,gameId,referralUserId)	- ask channel URL from Social Ring server
//			callback(response)
//				response.error	- if not null - contains error description
//				response.link	- result link if error is null
//
//
//	_omnitureInit()
//		
//	_omnitureSend(evNum,evars_obj)		// (event_number,  { eVal1:'value', eVal10:'value' } )
//
//
//	_startLoad("function_name",callback)
//	_statusChanged("function_name")
//
// variables:
//	window.blaze - SINGLETON.
//		init automatically when variable FB created (Facebook SDK loaded)
//
// ==============================================================================


var OMNITURE_INIT={};
var OMNITURE_EVENTS={
'SDKPurchase'				: { pageName:'SDKPurchase',				events : 'purchase',	products : 'Social;%window.blaze.gameName%;1;price', eVar3 : 'purchase' },
'SDKGameInitialization'		: { pageName:'SDKGameInitialization',		events : 'event5',	products : 'Social;%window.blaze.gameId%' },
'SDKGameInitializationUniqueUser'	: { pageName:'SDKGameInitializationUniqueUser',	events : 'event49',	products : 'Social;%window.blaze.gameId%' },
'SDKGameInitializationUniqueGame'	: { pageName:'SDKGameInitializationUniqueGame',	events : 'event50',	products : 'Social;%window.blaze.gameId%' },
'SDKGameSessionStart'		: { pageName:'SDKGameSessionStart',		events : 'event51',	products : 'Social;%window.blaze.gameId%' }
};





var SERVICE_LOGIN_URL='http://ogc.oberon-media.com/sring/usvc';
var SERVICE_INFO_URL='http://ogc.oberon-media.com/sring/gsvc';


function BlazeInit(game_id,init_func)
{
	SURE_Blaze( function(blaze) {
		window.blaze.gameId=game_id;
		var ch=getUrlParameter(window.location.href,'channel');
		if(ch) window.blaze.channel = ch;
		if(init_func(window.blaze)=='break') return;
		window.blaze._waitLoad(function() {
			window.blaze._loadFacebook(APP_ID,function(blaze) {
				window.blaze._loadOldApi(APP_ID, function(res) {
					//window.blaze._requireOldApi(["Connect","XFBML", "CanvasUtil","Payments"], function(res) { alert(res); });
					});
				window.blaze._loadProxy( function() {
					window.blaze._getGameUrl(game_id,function(res) {
						window.blaze._getSettings(function() {
							window.blaze._sureOmniture(function() {
								window,blaze._omnitureLaunch();
								});
							window.blaze._sureFBLogin(function() {
								window.blaze._srLogin(function() {
									window.blaze._redirect();
									});
								});
							});
						});
					});
				});
			});
	 	});
}



// delayed (onTimer) Blaze init
function SURE_Blaze(callback)
{
	if(window.blaze && typeof(window.blaze)=='object') return;	//already initialized
	window.blaze=new Blaze();

	window.onload=function() { window.blaze_loaded_0=true; }
	loadScript('http://sdk.oberon-media.com/JS/ajax-proxy.js',function(){ window.blaze_loaded_1=true; })
	loadScript('http://sdk.oberon-media.com/JS/cookie.js',function(){ window.blaze_loaded_2=true; })
	loadScript('http://sdk.oberon-media.com/JS/s_code.js',function(){ window.blaze_loaded_3=true; })
	loadScript('http://sdk.oberon-media.com/JS/omniture.js',function(){ window.blaze_loaded_4=true; })


	if(callback) { 
		callback(window.blaze);
		}
}




// constructor
function Blaze()
{
	this.name='Blaze';
	this.SUBST_URL='http://apps.facebook.com/blaze-sdk/';
	this.socialNetworkId='';
	this.userId='';
	this.gameId='';
	this.gameName='myGame';
	this.channel='';
	this.access_token='';
	this.srSession=null;
	this.game_generated=false;
	this.omniture_suit='oberonsocialring';
}



Blaze.prototype = {


	// ======================== our protected Functions ===========================

	_getChannelURL : function(url,reason,game_generated)
		{
		if(!this.srLoginResponse) alert('Cannot make substitution link for NOT LOGGED user.');
		var link_type='';
		if(game_generated) link_type='game';
		else link_type=(window.location.href.indexOf('facebook.com')!=-1 || !this.channel || this.channel=='0') ? 'userFb' : 'userCh';
		return this.SUBST_URL+
			'?reason='+reason+
			'&userId='+(this.srLoginResponse ? this.srLoginResponse.userId : '')+
			'&gameId='+this.gameId+
			'&channel='+this.channel+
			'&linkType='+link_type+
			//'&isForceCreated='+window.blaze.user_forced+
			'&url='+url;
		},


	_loadFacebook : function(app_id,callback)
		{
		this._statusChanged(1,'_loadFacebook');

		if(typeof(FB)=='object') { this.FB=FB; blaze._statusChanged(0,'_loadFacebook'); callback(this); return; }

		window.fbAsyncInit = function() {
			FB.init({appId: app_id, status: true, cookie: true, xfbml: true});
			window.fb_loaded=true;
			};
		(function() {
			var e = document.createElement('script');
			e.async = true;
			e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
			e.try_load=function() {
				if(e.ok) return;	//check the double on-load
				if(typeof(FB)=='object') {	//  && window.fb_loaded && countObj(FB)==54) {
					window.blaze.FB=FB;
					e.ok=true;
					window.blaze._statusChanged(0,'_loadFacebook');
					setTimeout(function(){ callback(window.blaze); },10);
					}
				else setTimeout(function(){e.try_load()},10);
				}
			e.onreadystatechange = function() {e.try_load();}
			e.onload=e.onreadystatechange;
			document.getElementById('fb-root').appendChild(e);
			}()
		);
		},

	_sureFBLogin : function(callback)
		{
		this._statusChanged(1,'_sureFBLogin');

		this.getLoginStatus(function() { 
			if(window.blaze.userId) {	// ALREADY LOGGED INTO FB
				window.blaze._statusChanged(0,'_sureFBLogin');
				callback(); 
				}
			else {				//FB is not logged in
				window.blaze.login( function(response) {
					if(response) {
						window.blaze._statusChanged(0,'_sureFBLogin');
						callback();
						}
					else { alert('login unsucceeded'); }
					});
				}
			}
		);
		},


	_srLogin : function(callback)
		{
		if(!this.userId) { alert('you are not logged into Facebook yet!'); return; }

		blaze._statusChanged(1,'_srLogin');


		var url=SERVICE_LOGIN_URL+'/loginByNetwork';
		var command='{"channel" : "0",'+
		'"forceCreate" : true,'+
		'"networkToken" : "'+window.blaze.access_token+'",'+
		'"socialNetworkId" : "facebook.com",'+
		'"socialNetworkUserId" : "'+window.blaze.userId+'"}';

//		window.blaze._debug("_srLogin request:"+command);

		window.ajax.AJAXSendCommand(url,command,function(param) {

			try { eval("var obj="+param); }
			catch(ex) { blaze._statusChanged(0,'_srLogin'); alert("srLogin. User Callback. ERROR eval "+param); return; }

			window.blaze.srLoginResult=obj.errorCode;
			if(obj.errorCode) { 
				window.blaze.on_error("ERROR from server on srLogin. "+param);
				window.blaze.srSession=null;
				window.blaze.srLoginResponse=null;
				}
			else {
				window.blaze.srSession=obj.srSession;
				window.blaze.srLoginResponse=obj.response;
				window.blaze.user_forced=(typeof(obj.response.isForceCreated)!='undefined' && obj.response.isForceCreated)
				}
			if(callback) {
				blaze._statusChanged(0,'_srLogin');
				callback(obj.response);
				} 
			});
		},

	_isAppUser : function(callback)
		{
		var url='https://api.facebook.com/method/users.isAppUser';
		var command='?access_token='+window.blaze.access_token+'&uid='+window.blaze.userId;

		blaze._statusChanged(1,'_isAppUser');

		this._save_isAppUser_callback=callback;
		fakeAJAXSendCommand(url,command,'window.blaze._isAppUser_callback');
		},

	_isAppUser_callback : function(code)
		{
		if(code.indexOf('<error_code>')!=-1) {
			var err_no='';
			code.replace(/<error_code>(.*?)<\/error_code>/,function(str, p1, p2, offset, s) { err_no=p1; } );
			this._save_isAppUser_callback(err_no);
			return;
			}
		blaze._statusChanged(0,'_isAppUser');
		if(code.indexOf('>1<')!=-1) this._save_isAppUser_callback(1);
		else this._save_isAppUser_callback(0);
		},


	_getGameInfo : function(gameId,callback)
		{
		if(!window.blaze.channel || window.blaze.channel=='0') { alert('To get Game Info you need to specify channel'); return; }
		blaze._statusChanged(1,'_getGameInfo');

		var url=SERVICE_INFO_URL+'/getGameInfo';
		var command='{"gameId":"'+ gameId +'",'+
		'"channel":"'+window.blaze.channel+'",'+
		'"gamePlatform":"SocialGames"}';

		//show request for DEBUG
//		this._debug("_getGameInfo request:"+command);

		window.ajax.AJAXSendCommand(url,command,function(param) {
			blaze._statusChanged(0,'_getGameInfo');
//			blaze._debug("_getGameInfo reply:"+param);

			try { eval('var obj='+param); } catch(ex) { var obj=null; }
			if(!obj) { blaze.on_error("_getGameInfo ERROR:"+param); callback(null); return; }

			callback(obj.response);
			});
		},


	_getGameUrl : function(gameId,callback)
		{
		if(!this.channel || this.channel==0 || this.channel=='0' || this.skip_getGameUrl) {
			/*
			this._facebookPromoteSession(function(code){
			//alert('secret session created:'+code);
				window.blaze._getGameUrlFB(function(code){
			//alert(code);
					var obj=new Object();
					obj.name='Unknown game';
					obj.facebookGameURL='';
					obj.error=0;
					callback(obj);
					});
				});	*/
			var obj=new Object();
			obj.name='Current game (no channel)';
			obj.facebookGameURL='';
			obj.error=0;
			callback(obj);
			return;
			}
		blaze._statusChanged(1,'_getGameUrl');

		var url=SERVICE_INFO_URL+'/getGameInfo';
		var command='{"gameId":"'+ gameId +'",'+
		'"channel":"'+window.blaze.channel+'",'+
		'"gamePlatform":"SocialGames"}';

//		this._debug("_getGameUrl request:"+command);

		window.ajax.AJAXSendCommand(url,command,function(param) {
			blaze._statusChanged(0,'_getGameUrl');
			try { eval('var obj='+param); } catch(ex) { var obj=null; }
			if(!obj) { alert('_getGameUrl() ERROR no reply'); return; }
			if(!obj.response) { alert('_getGameUrl() ERROR no reply 2 '); return; }

			if(obj.response && obj.response.facebookGameURL) window.blaze.SUBST_URL=obj.response.facebookGameURL
			if(obj.response) window.blaze.gameName=obj.response.name;

//			window.blaze._debug("_getGameUrl response:"+JSON2str(obj.response));

			obj.error=0;
			callback(obj.response);
			});
		},


	_facebookPromoteSession : function(callback)
		{
		var url='https://api.facebook.com/method/auth.promoteSession';
		var command='?access_token='+window.blaze.access_token;

		blaze._statusChanged(1,'_facebookPromoteSession');

		this._save_facebookPromoteSession_callback=callback;
		fakeAJAXSendCommand(url,command,'window.blaze._facebookPromoteSession_callback');
		},

	_facebookPromoteSession_callback : function(code)
		{
		blaze._statusChanged(0,'_facebookPromoteSession');

		code=code.replace(/<.*?>/g,'');
		code=code.replace(/\s/g,'');
		window.blaze.facebookSecretSession=code;
		window.blaze._save_facebookPromoteSession_callback(code);
		},


	_getGameUrlFB : function(callback)
		{
		var url='https://api.facebook.com/method/admin.getAppProperties';
		//var command='?access_token='+window.blaze.access_token+'&properties=application_name,base_domain';
		var command='?access_token='+window.blaze.access_token+'&client_secret='+window.blaze.facebookSecretSession+'&properties=base_domain';

		blaze._statusChanged(1,'_getGameUrlFB');

		this._save_getGameUrlFB_callback=callback;
		fakeAJAXSendCommand(url,command,'window.blaze._getGameUrlFB_callback');
		},

	_getGameUrlFB_callback : function(code)
		{
		blaze._statusChanged(0,'_getGameUrlFB');
		var obj=new Object();
		obj.facebookGameURL='';
		obj.name='';
		obj.error=0;
//		if(window.blaze._save_getGameUrlFB_callback) window.blaze._save_getGameUrlFB_callback(obj);
		if(window.blaze._save_getGameUrlFB_callback) window.blaze._save_getGameUrlFB_callback(code);
		},


	_queryChannelUrl : function(callback,gameId,referralUserId,referralChannel,isForceCreated,linkType,currentChannel)
		{
		blaze._statusChanged(1,'_queryChannelUrl');

		if(linkType=='userCh' && !referralChannel) { alert('Link Type is channel but channel is empty!'); return; }

		if(!referralUserId || referralUserId=='' || referralUserId=='0') referralUserId="00000000-0000-0000-0000-000000000000";

		var url=SERVICE_INFO_URL+'/getConvertedGameInfo';
		var command='{"gameId":"'+ gameId +'",'+			// from GET
		'"channel":"'+referralChannel+'",'+			// from GET
		'"referralUserId": "'+referralUserId+'",'+		// from GET
		'"isForceCreated": '+isForceCreated+','+			// from GET
		'"linkType":"'+linkType+'",'+				// from GET
		'"currentChannel":"'+currentChannel+'",'+			// from doc.referrer
		'"srSession":'+JSON2str(window.blaze.srSession,'')+','+
		'"gamePlatform":"SocialGames"}';

		//show request for DEBUG
		this._debug("_queryChannelUrl request"+command);

		window.ajax.AJAXSendCommand(url,command,function(param) {
			window.blaze._debug("_queryChannelUrl reply"+param);

			var ret=new Object();
			ret.link='';
			ret.error='';
			try { eval('var obj='+param); } catch(ex) { var obj=null; }
			if(!obj) { ret.error="ERROR:"+ex; blaze._statusChanged(0,'_queryChannelUrl'); callback(ret); return; }
			if(obj.errorCode!="0") { ret.error="ERROR:</H1> "+obj.errorShortDescription+'<BR>'+obj.errorLongDescription+'<BR>REQUEST='+command+'<BR>RESPONSE='+param; blaze._statusChanged(0,'_queryChannelUrl'); callback(ret); return; }
			if(!obj.response || !obj.response.channelURL) { ret.link=''; ret.error=''; callback(ret); }
			if(obj.response) {
				window.blaze.game_forced=(typeof(obj.response.isForceCreated)!='undefined' && obj.response.isForceCreated);
				window.blaze._debug('_getConvertedGameInfo reported: isForceCreated='+obj.response.isForceCreated);
				window.blaze.homeChannel=obj.response.channelInfo.channelId+'('+obj.response.channelInfo.primaryDomain+')';

				//REALLY
				ret.link=obj.response.channelURL;

			 	//HACK! if DATA IN DATABASE WRONG
				if(!ret.link || ret.link.indexOf('http')==-1 || ret.link.indexOf('game.aspx')==-1) {

					alert("Wrong redirection value in Database! Hack used...");

					//getting one of secondary domains that contain 'blaze'
					var serv='';
					var servers=obj.response.channelInfo.secondaryDomains;	// HACK!
					for(var key in servers) {
						if(servers[key].indexOf('blaze')!=-1) { serv=servers[key]; break; }
						}
					if(serv.indexOf('http')!=0) serv='http://'+serv;		//ADD http:// if no

					var page=obj.response.gamePage;
					serv=serv.replace(/\/$/,'');
					page=page.replace(/^\//,'');
					page=page.replace(/deluxe\.aspx/,'game.aspx');	//HACK! WRONG DATA IN DATABASE
					page=page.replace(/&lc=en/,'');			//HACK! WRONG DATA IN DATABASE
					page=page.replace(/&channel=\d+/,'');		//HACK! WRONG DATA IN DATABASE

					ret.link=serv + '/socialgames/' + page;
					}
				blaze._statusChanged(0,'_queryChannelUrl');
				callback(ret);
				}
			}
			);

		},

	_getSettings : function(callback)
		{
		blaze._statusChanged(1,'_getSettings');

		var url=SERVICE_INFO_URL+'/getSocialRingSettings';
		var command='{}';

		window.ajax.AJAXSendCommand(url,command,function(param) {
			try { eval("var obj="+param); } catch(ex) { alert("GetSettings :: ERROR eval "+param); return; }
			this.settings=obj;
			blaze._statusChanged(0,'_getSettings');
			callback(obj);
			}
			);

		},

	_getOmnitureSuit : function(callback)
		{
		blaze._statusChanged(1,'_getOmnitureSuit');

		if(!window.blaze.channel || window.blaze.channel==0 || window.blaze.channel=='0') { blaze._statusChanged(0,'_getOmnitureSuit'); callback(this.omniture_suit); return; }

		var url=SERVICE_INFO_URL+'/getChannelInformation';
		var command='{"channel":"'+window.blaze.channel+'"}';

		window.ajax.AJAXSendCommand(url,command,function(param) {
			blaze._statusChanged(0,'_getOmnitureSuit');

			try { eval("var obj="+param); } catch(ex) { alert("_getOmnitureSuit. ERROR eval "+param); return; }

			if(!obj || obj.errorCode!=0) {  alert("_getOmnitureSuit.Server reports ERROR: "+param); return;  }
			if(!obj.response) { alert("_getOmnitureSuit. ERROR (2) response: "+param); return;  }
			if(obj.response.channel==0) { callback(window.blaze.omniture_suit); return; }
			if(!obj.response.omnitureSuit) {  alert("_getOmnitureSuit. ERROR response: "+param); return;  }

			window.blaze.omniture_suit=obj.response.omnitureSuit;
			callback(obj.response.omnitureSuit);
			}
			);
		},

	_loadProxy : function(callback)
		{
		blaze._statusChanged(1,'_loadProxy');

		window.ajax=new AJAX('http://ogc.oberon-media.com/sdk-proxy/ajax-proxy.htm',function() {
			blaze._statusChanged(0,'_loadProxy');
			callback();
			} );
		},


	_extend : function(obj)
		{

		for(key in obj) {
			//alert(key + " - " + typeof(obj[key]) );

			if(key in this) {
				//alert('already in');
				}
			else {
				this[key]=obj[key];
				if(key == 'XFBML') {
					this.XFBML.parse=this.parse;
					}
//				if(key == 'Connect') {
//					this.connect.streamPublish=this.streamPublish;
//					}
				}

			}
		},


	// ======================== some REST API function ===========================

	_isAppUser : function(callback)
		{
		var url='https://api.facebook.com/method/users.isAppUser';
		var command='?access_token='+window.blaze.access_token+'&uid='+window.blaze.userId;

		blaze._statusChanged(1,'_isAppUser');

		this._save_isAppUser_callback=callback;
		fakeAJAXSendCommand(url,command,'window.blaze._isAppUser_callback');
		},

	_isAppUser_callback : function(code)
		{
		if(code.indexOf('<error_code>')!=-1) {
			var err_no='';
			code.replace(/<error_code>(.*?)<\/error_code>/,function(str, p1, p2, offset, s) { err_no=p1; } );
			this._save_isAppUser_callback(err_no);
			return;
			}
		blaze._statusChanged(0,'_isAppUser');
		if(code.indexOf('>1<')!=-1) this._save_isAppUser_callback(1);
		else this._save_isAppUser_callback(0);
		},


	//obj.message			//string
	//obj.attachment		//JSON obj
	//obj.action_links		//JSON array
	//obj.privacy			//JSON obj
	_RESTPost : function(to,obj,callback)
		{
		var url='https://api.facebook.com/method/stream.publish';
		var command='?access_token='+window.blaze.access_token+
			'&uid='+window.blaze.userId+
			'&target_id='+to;
		if(obj.message) 	command+='&message='+obj.message;
		if(obj.attachment) 	command+='&attachment='+JSON2str(obj.attachment).replace(/&/gi,'%26').replace(/=/gi,'%3D');
		if(obj.action_links)	command+='&action_links='+JSON2str(obj.action_links).replace(/&/gi,'%26').replace(/=/gi,'%3D');
		if(obj.privacy)	command+='&privacy='+JSON2str(obj.privacy);

		blaze._statusChanged(1,'_RESTPost');
		this._save_RESTPost_callback=callback;

		fakeAJAXSendCommand(url,command,'window.blaze._RESTPost_callback');
		},

	_RESTPost_callback : function(code)
		{
		blaze._statusChanged(0,'_RESTPost');

		if(code.indexOf('<error_code>')!=-1) {
			var error_code='';
			var error_msg='';
			code.replace(/<error_code>(.*)<\/error_code>/i,function(str, p1, p2, offset, s){ error_code=p1; } );
			code.replace(/<error_msg>(.*)<\/error_msg>/i,function(str, p1, p2, offset, s){ error_msg=p1; } );

			if(error_code)
				window.blaze._save_RESTPost_callback(error_code,error_msg);
			else
				window.blaze._save_RESTPost_callback(666,'General ERROR:'+code);
			return;
			}
		var post_id='';
		code.replace(/<stream_publish_response.*?>(.*)<\/stream_publish_response>/i,function(str, p1, p2, offset, s){ post_id=p1; });

		if(post_id)
			window.blaze._save_RESTPost_callback(0,post_id);
		else {
			window.blaze._save_RESTPost_callback('404','General ERROR\r\n'+code);
			}
		},


	//in.text
	//in.caption
	//in.picture
	//in.link
	//in.privacy
	_RESTShare : function(inp,callback)
		{
		var obj=new Object();
		obj.message=inp.text ? inp.text : 'Share link with you!';

		obj.attachment={
			name: 'Title of the Post',
			href: inp.link ? inp.link : 'http://ya.ru',
			caption: inp.caption ? inp.caption : 'Caption of a post',
			description: 'Descriptive text about the story.',
			properties: '',	//anchors in this text
			media: [
					{ 
					"type": "image", 	//"flash", "music"
					"src": inp.picture ? inp.picture : "http://sdk.oberon-media.com/JS/images/logo.png", 
					"href": inp.link ? inp.link : "http://sdk.oberon-media.com/JS/index.html"
					}
				]
			};

		obj.action_links=[ { text:inp.caption, href:inp.link } ];		//array
		obj.privacy={
			value : inp.privacy ? inp.privacy : "EVERYONE"	// CUSTOM, ALL_FRIENDS, NETWORKS_FRIENDS, FRIENDS_OF_FRIENDS, SELF
			//friends : ''		// for CUSTOM  (EVERYONE, NETWORKS_FRIENDS, FRIENDS_OF_FRIENDS, ALL_FRIENDS, SOME_FRIENDS, SELF,  NO_FRIENDS 
			//networks : 'id,id,id'	// for CUSTOM
			//allow : 'id,id,id'		// if  friends='SOME_FRIENDS'
			//deny : 'id,id,id'		// if  friends='SOME_FRIENDS'
			};
		this._RESTPost('',obj,callback);
		},



	// ======================== OMNITURE reporting ===========================

	_omnitureInit : function()
		{
		blaze._statusChanged(1,'_omnitureInit');

		this.omniture=new Omniture(this.omniture_suit);
		this.omniture.prepareFromTemplate(OMNITURE_INIT);

		blaze._statusChanged(0,'_omnitureInit');
		},


	_sureOmniture : function(callback)
		{
		this._getOmnitureSuit(function(suit) {
			window.blaze._omnitureInit();
			if(callback) callback('ok');
			});
		},


	_omnitureSend : function(event_name,obj)
		{
		blaze._statusChanged(1,'_omnitureSend');

		this.omniture.send(event_name,OMNITURE_EVENTS[event_name],obj);

		blaze._statusChanged(0,'_omnitureSend');
		},

	_omnitureLaunch : function()
		{
		if(this.user_forced) {
			//Unique (first time) initialization of a game
			//event49	Game Initialization Unique
			this._omnitureSend('SDKGameInitializationUniqueUser');
			}

		if(this.game_forced) {
			//Unique (first time) initialization of a game
			//event50	Game Initialization Unique
			this._omnitureSend('SDKGameInitializationUniqueGame');
			}

		//event5 Game Initialization	product
		this._omnitureSend('SDKGameInitialization');
		},

	_omnitureSessionStart : function()
		{
		//event51
		this._omnitureSend('SDKGameSessionStart');
		},

	_omniturePurchase : function(price)
		{
		var prod="Social;"+this.gameName+";1;"+price;
		this._omnitureSend('SDKPurchase',{ products:prod });
		},


	_omniturePurchaseGoods : function(thing,qty,totalPrice)
		{
		// [  {name:'thing',qty:1,price:2.45},{name:'thing',qty:1,price:2.45}... ]    ]
		//for(var i in arr) {
		//	if(prod) prod+=',';
		//	prod+="Social;"+arr[i].name+";"+arr[i].qty+";"+arr[i].price;
		//	}

		var prod="Social;"+thing+";"+qty+";"+totalPrice;
		this._omnitureSend('SDKPurchase',{ products:prod });
		},


	// ======================== hooked FB JS API Functions ===========================


	login : function(callback,perms)
		{
		//here do additional work in Blaze ( login() is called )
		blaze._statusChanged(1,'login');

		var keep_callback=callback;
		var keep_this=this;
		this.FB.login(
			function(param)
				{
				//here do additional work in Blaze ( login() is replied )
				//use keep_this. instead of 'this' !

				//get session params
				if(param && param.status=='connected') {
					keep_this.session=param.session;
					keep_this.userId=param.session.uid;
					keep_this.access_token = param.session.access_token;
					}
				blaze._statusChanged(0,'login');
				keep_callback(param);
				},
			perms
			);
		},


	logout : function(callback)
		{
		//here do additional work in Blaze ( logout() is replied )
		blaze._statusChanged(1,'logout');


		var keep_callback=callback;
		var keep_this=this;
		this.FB.logout(
			function(param)
				{
				//here do additional work in Blaze ( logout() is replied )
				//use keep_this. instead of 'this' !

				keep_this.session=null;
				keep_this.userId=null;
				keep_this.access_token=null;
				keep_this.srSession=null;
				keep_this.srLoginResponse=null;

				blaze._statusChanged(0,'logout');
				keep_callback(param);
				}
			);
		},


	getLoginStatus : function(callback)
		{
		//here do additional work in Blaze ( getLoginStatus() is called )
		blaze._statusChanged(1,'getLoginStatus');


		//var session=this.getSession();
		//if(session) { 
		//	this.session=session;
		//	this.userId=session.uid;
		//	this.access_token = session.access_token;
		//	if(callback) callback(session);
		//	return;
		//	}

		var keep_callback=callback;
		var keep_this=this;

		if(!this.FB) { alert('Cannot use FB function getLoginStatus() if FB SDK is not loaded yet'); return; }

		window.blaze.FB.getLoginStatus(function(response)	{
				if(response && response.status=='connected') {
					window.blaze.session=response.session;
					window.blaze.userId=response.session.uid;
					window.blaze.access_token = response.session.access_token;
					}
				//here do additional work in Blaze ( getLoginStatus() is replied )

				blaze._statusChanged(0,'getLoginStatus');
				if(typeof(keep_callback) == 'function') { keep_callback(response); }	//call original callback
				}
			);
		},


	getSession : function()
		{
		return FB.getSession();
		},


	ui : function(obj,callback)
		{
		//here do additional work in Blaze ( ui() is called )
		// we have:
		//
		// obj : {  method: 'stream.publish',
		//	    message: 'getting educated about Facebook Connect',
		//	    attachment: {
		//	       name: 'Connect',
		//	       caption: 'The Facebook Connect JavaScript SDK',
		//	       description: ( 'A small JavaScript library that allows you...' ),
		//	       href: 'http://github.com/facebook/connect-js'
		//	       },
		//	    action_links: [
		//	       { text: 'Code', href: 'http://github.com/facebook/connect-js' }
		//	       ],
		//	     user_message_prompt: 'Share your thoughts about Connect'
		//	   }
		// OR obj : {
		//	   method: 'stream.share',
		//	   u: 'http://fbrell.com/'
		//	   }

		blaze._statusChanged(1,'ui');


		if(obj && "method" in obj && obj.method=="stream.publish") {
			for(var key in obj.action_links)
				obj.action_links[key].href=this._getChannelURL(obj.action_links[key].href,'stream.post.action_link',this.game_generated);
			if(obj.attachment) obj.attachment.href=this._getChannelURL(obj.attachment.href,'stream.post.attachment',this.game_generated);
			}

		if(obj && "method" in obj && obj.method=="stream.share") {
			if(obj.u) { 
				obj.u=this._getChannelURL(obj.u,'stream.share',this.game_generated);
				}
			}

		//var keep_callback=callback;

		this.FB.ui(obj,
			function(param)
				{
				//here do additional work in Blaze ( ui() is replied )

				blaze._statusChanged(0,'ui');
				callback(param);
				}
			);
		},



	api : function()	// (path,....,callback)
		{
		//here do additional work in Blaze  ( api() is called )
		// we have:
		//
		// path=='/f8'	- get F8 Object
		// path=='/me'	- get 'User' Object
		// path=='/f8/posts' - get posts, 		path,{ limit: 3 }, callback
		// path=='/me/feed',  - feeds commands		path,'post', { body: body }, callback

		blaze._statusChanged(1,'api');

		if(arguments[0].indexOf('/feed')!=-1 && arguments[1]=='post') {
			if("link" in arguments[2]) { arguments[2].link=this._getChannelURL(arguments[2].link,'postFeed',this.game_generated); }
			}

		var keep_callback=null;
		for(var i=0;i<arguments.length;i++) {
			if(i>0 && typeof(arguments[i])=='function') {
				keep_callback=arguments[i];
				arguments[i]=function(param) { 
					blaze._statusChanged(0,'api');
					keep_callback(param);
					};	// here do additional work in Blaze.  
				}
			}

		this.FB.api(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6],arguments[7],arguments[8],arguments[9]);
		},


	parse : function(el)
		{

		var inner=el.innerHTML;
		el.innerHTML='[Blaze Logo]<BR><H1>WAITING for BLAZE...</H1>';

		// invite
		if(inner.indexOf('fb:request-form')!=-1 && inner.indexOf('invite="true"') ) {
			inner=inner.replace(/url='(.*?)'/g,"url="+this._getChannelURL("$1",'invite'),this.game_generated);
			inner=inner.replace(/url="(.*?)"/g,"url="+this._getChannelURL("$1",'invite'),this.game_generated);
			}

		// gift
		if(inner.indexOf('fb:request-form')!=-1 && inner.indexOf('invite="false"') ) {
			inner=inner.replace(/url='(.*?)'/g,"url="+this._getChannelURL("$1",'gift'),this.game_generated);
			inner=inner.replace(/url="(.*?)"/g,"url="+this._getChannelURL("$1",'gift'),this.game_generated);
			}

		// share simple
		if(inner.indexOf('<fb:share-button class="url"')!=-1) {
			inner=inner.replace(/href="(.*?)"/g,"href="+this._getChannelURL("$1",'share'),this.game_generated);
			}

		// share complex
		if(inner.indexOf('<fb:share-button class="meta"')!=-1) {
			inner=inner.replace(/<link rel="target_url" href="(.*?)"/g,"<link rel=\"target_url\" href="+this._getChannelURL("$1",'share',this.game_generated));
			}

		el.innerHTML=inner;
		return this.FB.XFBML.parse(el);
		},

	// ======================== OLD JS API =========================== 

	_loadOldApi : function(app_id,callback)
		{
		blaze._statusChanged(1,'_loadOldApi');

		var e = new Date();
		this.oldapi_pipe=new CookiePipe('oldapiPipe'+e.getTime(),'http://sdk.oberon-media.com/JS');

		var host='';	//MY host with path
		var a=window.location.href; a.replace(/(.*)\/.*?/,function(str, p1, p2, offset, s) { host=p1; } );

		loadFrame('oldapi-frame','http://sdk.oberon-media.com/JS/old-api.htm'+"#"+this.oldapi_pipe.name+'&'+host,function(){
			window.blaze.oldapi_pipe.send('load|'+app_id,function(response) {
				blaze._statusChanged(0,'_loadOldApi');
				if(callback) callback(response);
				});
			});
		},

	_requireOldApi : function(services, callback)	// ["XFBML", "CanvasUtil","Payments"]
		{
		blaze._statusChanged(1,'_requireOldApi');

		var count=0;
		for(var i in services) {
			var serv=services[i];
			window.blaze.oldapi_pipe.send('require|'+serv,function(response) {

				var pos=response.indexOf('|');
				var module=response.substr(0,pos);
				response=response.substr(pos+1);

				var proplist='';
				eval('proplist=['+response+']');

				//create module of blaze.
				window.blaze[module]=new Object();

				//create all properties of this module
				for(var prop_ind in proplist) {
					var prop=proplist[prop_ind];
					if(prop=='prototype') continue;
					if(prop=='constructor') continue;
					if(prop.substr(0,1)=='_') continue;
					if(prop.indexOf('.')!=-1) continue;

					var str="var a=function(){"+
						"var args=makeArray(arguments);"+
//"alert(JSON2str(args));"+
						"window.blaze.oldapi_pipe.send('send|"+module+"|"+prop+"|'+JSON2str(args),function(response){"+
							"alert('OK:'+response);"+
							"});"+
						"};"
					eval(str);
					if(a) window.blaze[module][prop]=a;
					else alert('Error enumerating OLD API:\r\n'+str);
					}

				count++;
				if(count==services.length) {
					blaze._statusChanged(0,'_requireOldApi');
					if(callback) callback('all '+services.length+' FB services OK');
					}
				},i*services.length);
			}
		},



	// ======================== our simplified Functions =========================== 


	run : function()
		{
		//do additional work in Blaze


		var keep_callback=[];
		var func_name=arguments[0];
		var str='(';
		for(var i=1;i<arguments.length;i++) {
			switch(typeof(arguments[i])) {
			case 'string' : 
					str+='\"'+arguments[i]+'\"';
					break;
			case 'function' : 
					keep_callback[i]=arguments[i];
					str+='function(param) { keep_callback['+i+'](param); }';	// here do additional work in Blaze.
					break;
			default: 
					str+=arguments[i];
					break;
			}
			if(i<arguments.length - 1) str+=',';
			}
		str+=')';

		var ret=null;
		if(func_name in this) ret=eval('this.'+func_name+str);
		else if(func_name in this.FB) ret=eval('this.FB.'+func_name+str);
		else alert('Method '+func_name+' is not implemented both in Blaze and in Facebook');

		return ret;
		},


	// ========================== scores API ======================

	//SERVICE:     /gsvc/setUserGameEpisodeScore
	//IN:		Integer gameId;
	//		Integer episode;
	//		Integer score;
	//		scoreType = ScoreTypeEnum.GAME; ' GAME,TIME
	//OUT: UserGame
	scores_setUserGameEpisodeScore : function(episode,score,scoreType,callback)
		{
		blaze._statusChanged(1,'scores_setUserGameEpisodeScore');

		if(scoreType!='GAME' && scoreType!='TIME') { scoreType='GAME'; }

		var url=SERVICE_INFO_URL+'/setUserGameEpisodeScore';
		var command='{'+
		'"gameId" : '+this.gameId+','+
		'"episode" : '+episode+','+
		'"score" : '+score+','+
		'"scoreType" : "'+scoreType+'"'+','+
		'"srSession":'+JSON2str(window.blaze.srSession,'')+
		'}';

		window.ajax.AJAXSendCommand(url,command,function(param) {
			//window.blaze._debug('setUserGameEpisodeScore REPLY:'+param);

			try { eval("var obj="+param); }
			catch(ex) { blaze._statusChanged(0,'scores_setUserGameEpisodeScore'); alert("scores_setUserGameEpisodeScore. ERROR eval "+param); return; }

			if(obj.errorCode) { 
				window.blaze.on_error("ERROR from server on scores_setUserGameEpisodeScore. "+param);
				}
			else {
				blaze._statusChanged(0,'scores_setUserGameEpisodeScore');
				callback(obj.response);
				}
			});
		},

	//SERV:	/gsvc/setUserGameScore
	//IN:		Integer gameId;
	//		Integer score;
	//		scoreType = ScoreTypeEnum.GAME;
	//OUT:		UserGame
	scores_setUserGameScore : function(score,scoreType,callback)
		{
		blaze._statusChanged(1,'scores_setUserGameScore');

		if(scoreType!='GAME' && scoreType!='TIME') { scoreType='GAME'; }

		var url=SERVICE_INFO_URL+'/setUserGameScore';
		var command='{'+
		'"gameId" : '+this.gameId+','+
		'"score" : '+score+','+
		'"scoreType" : "'+scoreType+'"'+','+
		'"srSession":'+JSON2str(window.blaze.srSession,'')+
		'}';

		window.ajax.AJAXSendCommand(url,command,function(param) {
			//window.blaze._debug('setUserGameScore REPLY:'+param);

			try { eval("var obj="+param); }
			catch(ex) { blaze._statusChanged(0,'scores_setUserGameScore'); alert("scores_setUserGameScore. ERROR eval "+param); return; }

			if(obj.errorCode) { 
				window.blaze.on_error("ERROR from server on scores_setUserGameScore. "+param);
				}
			else {
				blaze._statusChanged(0,'scores_setUserGameScore');
				callback(obj.response);
				}
			});
		},

	//SERV:	/gsvc/getGameFriendsEpisodeLeaderBoard
	//IN:		Integer gameId;
	//		Integer episode;
	//		Integer boardSize;
	//		scoreType = ScoreTypeEnum.GAME;
	//		sortOrder = SortOrderEnum.DESCENDING; -> ASCENDING, DESCENDING
	//OUT:		UserGame
	scores_getGameFriendsEpisodeLeaderBoard : function(episode,boardSize,scoreType,sortOrder,callback)
		{
		blaze._statusChanged(1,'scores_getGameFriendsEpisodeLeaderBoard');

		if(scoreType!='GAME' && scoreType!='TIME') { scoreType='GAME'; }
		if(sortOrder!='ASCENDING' && sortOrder!='DESCENDING') { sortOrder='ASCENDING'; }

		var url=SERVICE_INFO_URL+'/getGameFriendsEpisodeLeaderBoard';
		var command='{'+
		'"gameId" : '+this.gameId+','+
		'"episode" : '+episode+','+
		'"boardSize" : '+boardSize+','+
		'"scoreType" : "'+scoreType+'"'+','+
		'"sortOrder" : "'+sortOrder+'"'+','+
		'"srSession":'+JSON2str(window.blaze.srSession,'')+
		'}';

		window.ajax.AJAXSendCommand(url,command,function(param) {
			//window.blaze._debug('getGameFriendsEpisodeLeaderBoard REPLY:'+param);

			try { eval("var obj="+param); }
			catch(ex) { blaze._statusChanged(0,'scores_getGameFriendsEpisodeLeaderBoard'); alert("scores_setUserGameScore. ERROR eval "+param); return; }

			if(obj.errorCode) { 
				window.blaze.on_error("ERROR from server on scores_getGameFriendsEpisodeLeaderBoard. "+param);
				}
			else {
				blaze._statusChanged(0,'scores_getGameFriendsEpisodeLeaderBoard');
				callback(obj.responseList);
				}
			});
		},

	//SERV:	/gsvc/getGameFriendsLeaderBoard
	//IN:		Integer gameId;
	//		Integer boardSize;
	//		scoreType = ScoreTypeEnum.GAME;
	//		sortOrder = SortOrderEnum.DESCENDING;
	//OUT:		UserGame
	scores_getGameFriendsLeaderBoard : function(boardSize,scoreType,sortOrder,callback)
		{
		blaze._statusChanged(1,'scores_getGameFriendsLeaderBoard');

		if(scoreType!='GAME' && scoreType!='TIME') { scoreType='GAME'; }
		if(sortOrder!='ASCENDING' && sortOrder!='DESCENDING') { sortOrder='ASCENDING'; }

		var url=SERVICE_INFO_URL+'/getGameFriendsLeaderBoard';
		var command='{'+
		'"gameId" : '+this.gameId+','+
		'"boardSize" : '+boardSize+','+
		'"scoreType" : "'+scoreType+'"'+','+
		'"sortOrder" : "'+sortOrder+'"'+','+
		'"srSession":'+JSON2str(window.blaze.srSession,'')+
		'}';

		window.ajax.AJAXSendCommand(url,command,function(param) {
			//window.blaze._debug('getGameFriendsLeaderBoard REPLY:'+param);

			try { eval("var obj="+param); }
			catch(ex) { blaze._statusChanged(0,'scores_getGameFriendsLeaderBoard'); alert("scores_getGameFriendsLeaderBoard. ERROR eval "+param); return; }

			if(obj.errorCode) { 
				window.blaze.on_error("ERROR from server on scores_getGameFriendsLeaderBoard. "+param);
				}
			else {
				blaze._statusChanged(0,'scores_getGameFriendsLeaderBoard');
				callback(obj.responseList);
				}
			});
		},

	//SERV:	/gsvc/getGameLeaderBoard
	//IN:		srSession;
	//		scoreType = ScoreTypeEnum.GAME;
	//		sortOrder = SortOrderEnum.DESCENDING;
	//OUT:		UserGame
	scores_getGameLeaderBoard : function(scoreType,sortOrder,callback)
		{
		blaze._statusChanged(1,'scores_getGameLeaderBoard');

		if(scoreType!='GAME' && scoreType!='TIME') { scoreType='GAME'; }
		if(sortOrder!='ASCENDING' && sortOrder!='DESCENDING') { sortOrder='ASCENDING'; }

		var url=SERVICE_INFO_URL+'/getGameLeaderBoard';
		var command='{'+
		'"gameId" : '+this.gameId+','+
		'"scoreType" : "'+scoreType+'"'+','+
		'"sortOrder" : "'+sortOrder+'"'+','+
		'"srSession":'+JSON2str(window.blaze.srSession,'')+
		'}';

		window.ajax.AJAXSendCommand(url,command,function(param) {
			//window.blaze._debug('getGameLeaderBoard REPLY:'+param);

			try { eval("var obj="+param); }
			catch(ex) { blaze._statusChanged(0,'scores_getGameLeaderBoard'); alert("scores_getGameLeaderBoard. ERROR eval "+param); return; }

			if(obj.errorCode) { 
				window.blaze.on_error("ERROR from server on scores_getGameLeaderBoard. "+param);
				}
			else {
				blaze._statusChanged(0,'scores_getGameLeaderBoard');
				callback(obj.responseList);
				}
			});
		},

	//SERV:	/gsvc/getUserGameEpisodeScoreAndRank 
	//IN:		Integer gameId;
	//		Integer episode;
	//		scoreType = ScoreTypeEnum.GAME;
	//OUT:		UserGame
	scores_getUserGameEpisodeScoreAndRank : function(episode,scoreType,callback)
		{
		blaze._statusChanged(1,'scores_getUserGameEpisodeScoreAndRank');

		if(scoreType!='GAME' && scoreType!='TIME') { scoreType='GAME'; }

		var url=SERVICE_INFO_URL+'/getUserGameEpisodeScoreAndRank';
		var command='{'+
		'"gameId" : '+this.gameId+','+
		'"episode" : '+episode+','+
		'"scoreType" : "'+scoreType+'"'+','+
		'"srSession":'+JSON2str(window.blaze.srSession,'')+
		'}';

		window.ajax.AJAXSendCommand(url,command,function(param) {
			//window.blaze._debug('getUserGameEpisodeScoreAndRank REPLY:'+param);

			try { eval("var obj="+param); }
			catch(ex) { blaze._statusChanged(0,'scores_getUserGameEpisodeScoreAndRank'); alert("scores_getUserGameEpisodeScoreAndRank. ERROR eval "+param); return; }

			if(obj.errorCode) { 
				window.blaze.on_error("ERROR from server on scores_getUserGameEpisodeScoreAndRank. "+param);
				}
			else {
				blaze._statusChanged(0,'scores_getUserGameEpisodeScoreAndRank');
				callback(obj.response);
				}
			});
		},

	//SERV:	/gsvc/getUserGameEpisodeScore
	//IN:		Integer gameId;
	//		Integer episode;
	//		scoreType = ScoreTypeEnum.GAME;
	//OUT:		UserGame
	scores_getUserGameEpisodeScore : function(episode,scoreType,callback)
		{
		blaze._statusChanged(1,'scores_getUserGameEpisodeScore');

		if(scoreType!='GAME' && scoreType!='TIME') { scoreType='GAME'; }

		var url=SERVICE_INFO_URL+'/getUserGameEpisodeScore';
		var command='{'+
		'"gameId" : '+this.gameId+','+
		'"episode" : '+episode+','+
		'"scoreType" : "'+scoreType+'"'+','+
		'"srSession":'+JSON2str(window.blaze.srSession,'')+
		'}';

		window.ajax.AJAXSendCommand(url,command,function(param) {
			//window.blaze._debug('getUserGameEpisodeScore REPLY:'+param);

			try { eval("var obj="+param); }
			catch(ex) { blaze._statusChanged(0,'scores_getUserGameEpisodeScore'); alert("scores_getUserGameEpisodeScore. ERROR eval "+param); return; }

			if(obj.errorCode) { 
				window.blaze.on_error("ERROR from server on scores_getUserGameEpisodeScore. "+param);
				}
			else {
				blaze._statusChanged(0,'scores_getUserGameEpisodeScore');
				callback(obj.response);
				}
			});
		},

	//SERV:	/gsvc/getUserGameScoreAndRank
	//IN:		Integer gameId;
	//OUT:		UserGame
	scores_getUserGameScoreAndRank : function(callback)
		{
		blaze._statusChanged(1,'scores_getUserGameScoreAndRank');

		var url=SERVICE_INFO_URL+'/getUserGameScoreAndRank';
		var command='{'+
		'"gameId" : '+this.gameId+','+
		'"srSession":'+JSON2str(window.blaze.srSession,'')+
		'}';

		window.ajax.AJAXSendCommand(url,command,function(param) {
			//window.blaze._debug('getUserGameScoreAndRank REPLY:'+param);

			try { eval("var obj="+param); }
			catch(ex) { blaze._statusChanged(0,'scores_getUserGameScoreAndRank'); alert("scores_getUserGameScoreAndRank. ERROR eval "+param); return; }

			if(obj.errorCode) { 
				window.blaze.on_error("ERROR from server on scores_getUserGameScoreAndRank. "+param);
				}
			else {
				blaze._statusChanged(0,'scores_getUserGameScoreAndRank');
				callback(obj.response);
				}
			});
		},

	//SERV:	/gsvc/getUserGameRank
	//IN:		Integer gameId;
	//		scoreType = ScoreTypeEnum.GAME;
	//OUT:		UserGame
	scores_getUserGameRank : function(scoreType,callback)
		{
		blaze._statusChanged(1,'scores_getUserGameRank');

		if(scoreType!='GAME' && scoreType!='TIME') { scoreType='GAME'; }

		var url=SERVICE_INFO_URL+'/getUserGameRank';
		var command='{'+
		'"gameId" : '+this.gameId+','+
		'"scoreType" : "'+scoreType+'"'+','+
		'"srSession":'+JSON2str(window.blaze.srSession,'')+
		'}';

		window.ajax.AJAXSendCommand(url,command,function(param) {
			//window.blaze._debug('getUserGameRank REPLY:'+param);

			try { eval("var obj="+param); }
			catch(ex) { blaze._statusChanged(0,'scores_getUserGameRank'); alert("scores_getUserGameRank. ERROR eval "+param); return; }

			if(obj.errorCode) { 
				window.blaze.on_error("ERROR from server on scores_getUserGameRank. "+param);
				}
			else {
				blaze._statusChanged(0,'scores_getUserGameRank');
				callback(obj.response);
				}
			});
		},

	//SERV:	/gsvc/getUserGameScore
	//IN:		Integer gameId;
	//OUT:		UserGame
	scores_getUserGameScore : function(callback)
		{
		blaze._statusChanged(1,'scores_getUserGameScore');

		var url=SERVICE_INFO_URL+'/getUserGameScore';
		var command='{'+
		'"gameId" : '+this.gameId+','+
		'"srSession":'+JSON2str(window.blaze.srSession,'')+
		'}';

		window.ajax.AJAXSendCommand(url,command,function(param) {
			//window.blaze._debug('REPLY:'+param);

			try { eval("var obj="+param); }
			catch(ex) { blaze._statusChanged(0,'scores_getUserGameScore'); alert("scores_getUserGameScore. ERROR eval "+param); return; }

			if(obj.errorCode) { 
				window.blaze.on_error("ERROR from server on scores_getUserGameScore. "+param);
				}
			else {
				blaze._statusChanged(0,'scores_getUserGameScore');
				callback(obj.response);
				}
			});
		},


	// ============================ redirect ======================


	_waitLoad : function(callback) {
		if(	window.blaze_loaded_0 && 
			window.blaze_loaded_1 &&
			window.blaze_loaded_2 && 
			window.blaze_loaded_3 &&
			window.blaze_loaded_4
			) callback();
		else setTimeout(function(){ window.blaze._waitLoad(callback); },10);
		},


	_redirect : function (ref)
		{
		window.blaze._statusChanged(1,'_redirect');

		var param_ref=getUrlParameter(document.location.href,'ref');
		if(param_ref=='bookmarks') reason='bookmarks';
		else reason=getUrlParameter(document.location.href,'reason');
		if(!reason) {
			window.blaze._statusChanged(0,'_redirect');
			return;
			}

		var referralUserId=getUrlParameter(document.location.href,'userId');	//poster
		var gameId=getUrlParameter(document.location.href,'gameId');
		var ovr_back=getUrlParameter(document.location.href,'ovrBack');
		var referralChannel=getUrlParameter(document.location.href,'channel');
		var isForceCreated=window.blaze.user_forced;		//getUrlParameter(document.location.href,'isForceCreated');
		if(isForceCreated=="false") isForceCreated=false;
		var linkType=getUrlParameter(document.location.href,'linkType');
		var back_url=document.referrer ? document.referrer : window.location.href;
		back_url=back_url.replace(/^http\:\/\//,'');
		back_url=back_url.replace(/^www\./,'');
		back_url=back_url.replace(/\?.*/,'');
		back_url=back_url.replace(/\/.*/,'');
		if(ovr_back) back_url=ovr_back;

		if(param_ref=='bookmarks') {
			referralUserId=window.blaze.srSession.SRUserId;		//poster = clicker
			gameId=window.blaze.gameId;					//game defined by constant on APP page
			linkType='bookmark';
			}

		//if(dashboard????)
		//	linkType='dashboard';

		blaze._queryChannelUrl(function(param) {
			window.blaze._statusChanged(0,'_redirect');

			if(param.error) { window.blaze.on_error(param.error); return; }
			if(typeof(param.link)=='undefined' || !param.link || param.link=='') { window.blaze.on_error('STAY HERE on Facebook'); setTimeout(function(){window.blaze.on_error('');},100); return; }
			window.blaze.on_error('If game page is still not loaded <BR>please <A HREF="'+param.link+'">Click Here!</A> to go '+param.link);
			if(window.blaze.skip_redirect) { window.blaze._debug('redirect skipped!'); return; }
			try { window.top.location.href=param.link; }
			catch(ex) { window.location.href=param.link; }
			},
			gameId,referralUserId,referralChannel,(isForceCreated ? "true" : "false"),linkType,back_url
			);
		},

	_getSite : function(url, callback)
		{
		blaze._statusChanged(1,'_getSite');

		window.ajax.AJAXSendCommand(url,null,function(param) {
			blaze._statusChanged(0,'_getSite');
			if(callback) {
				callback(param);
				}
			},
			true);		//true=GET

		},


	// ======================= Loading Status control functions ===============

	on_error : function(mess)
		{
		alert(mess);
		},

	_debug : function(mess)
		{
		if(this.on_debug) this.on_debug(mess);
		},

	_traverse : function(callback)
		{
		setTimeout(function() { callback(); },0);
		},

	_statusChanged : function(begin,func_name)
		{
		if(begin) {
			this.status_pending.push(func_name);
			if(this.on_begin) { this.on_begin(this,func_name); }
			}
		else {
			var ind=-1;
			for(var i=0;i<this.status_pending.length;i++) {
				if(this.status_pending[i]==func_name) { ind=i; break; }
				}
			if(ind!=-1) this.status_pending.splice(ind,1);

			if(this.on_end) { this.on_end(this,func_name); }
			}

		
		},

	_loopTodo : function()
		{
		for(var i=0;i<this.status_todo.length;i++) {
			if(this._canLaunch(this.status_todo[i])) {
				//call(this.status_todo[i],callback);
				//this.status_todo.splice
				}
			}
		},

	_startLoad : function(func_name,callback)
		{
		this.status_todo.push(func_name);	//if no in loaded!	return true!
		//push all its dependencies! if no in loaded!
		this._loopTodo();
		},

	_canLaunch : function(func_name)
		{
		////
		/////return (this.status_loaded.indexOf(func_name)!=-1);
		return true;
		},

	status_todo:[],
	status_loaded:[],
	status_pending:[],

	loading_logic:[
		{ name:"_getChannelURL",	conditions:['_srLogin']	},
		{ name:"_loadFacebook",	conditions:[/*nothing*/]	},
		{ name:"_srLogin",		conditions:['_loadProxy','_loadFacebook']	},
		{ name:"_isAppUser",		conditions:[] },
		{ name:"_queryChannelUrl",	conditions:[] },
		{ name:"_getSettings",	conditions:[] },
		{ name:"_omnitureInit",	conditions:[] },
		{ name:"_omnitureSend",	conditions:[] },
		{ name:"_omnitureLaunch",	conditions:[] },
		{ name:"_omniturePurchase",	conditions:[] },
		{ name:"login",		conditions:[] },
		{ name:"logout",		conditions:[] },
		{ name:"getLoginStatus",	conditions:[] },
		{ name:"getSession",		conditions:[] },
		{ name:"ui",			conditions:[] },
		{ name:"api",			conditions:[] },
		{ name:"parse",		conditions:[] },
		{ name:"_loadProxy",		conditions:[] },
		]
}



//============== common functions =================

function getUrlParameter(url, name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(url);
	if (results == null)
		return "";
	else
		return results[1];
};

function countObj(obj)
{
var count=0;
for(key in obj) { count++; }
return count;
}

function oneOf(el,arr)
{
if('indexOf' in arr) return (arr.indexOf(el)!=-1);
//alert('indexOf does not works');
for(var i=0;i<arr.length;i++) {
	if(arr[i]==el) return true;
	}
return false;
}


function makeArray(obj)
{
	var s=new Array();
	for(var i=0;i<obj.length;i++) {
		s.push(obj[i]);
		}
	return s;
}


function typeOf(value) {
	var s = typeof(value);
	if (s === 'object') {
		if (value) {
			if (typeof(value.length) === 'number' && typeof value.splice === 'function') return 'array';
			}
		else return 'null';
	}
	return s;
}


function JSON2str(obj)
{
	var str='';
	if(typeOf(obj)=='object') str+='{';
	if(typeOf(obj)=='array') str+='[';

	for(var key in obj) {
		if(str && str.charAt(str.length-1)!='{' && str.charAt(str.length-1)!='[') str+=',';
		if(typeOf(obj)=='object') str+='"'+key+'":';
		if(typeOf(obj[key])=='string') str+='"'+obj[key]+'"';
		if(typeOf(obj[key])=='number') str+=obj[key];
		if(typeOf(obj[key])=='object') str+=JSON2str(obj[key]);
		if(typeOf(obj[key])=='boolean') str+=obj[key];
		if(typeOf(obj[key])=='array') str+=JSON2str(obj[key]);
		if(typeOf(obj[key])=='function') str+=obj[key];
		}

	if(typeOf(obj)=='object') str+='}';
	if(typeOf(obj)=='array') str+=']';
	return str;
}



//goTrough(obj,function(key,obj) { if(key=='href' && typeof(obj[key])=='string') { obj[key]= }  });
function goThrough(obj,action)
{
	for(key in obj) {
		if(typeof(obj[key])=='object') { goThrough(obj[key],action); continue; } 
		if(typeof(obj[key])=='array') { goThrough(obj[key],action); continue; }
		action(key,obj);
		}
}



function loadScript(url,callback)
{
	var script= document.createElement('script');
	script.src = url;
	script.try_load=function() {
		if(this.loaded) return;
		this.loaded=true;
		callback();
		//setTimeout(callback, 0);
		}
	script.onreadystatechange= function () {   
		if (this.readyState == 'complete' || this.readyState == 'loaded') { script.try_load(); }
	}
	script.onload = script.onerror = script.try_load;
	document.body.appendChild(script);
}


function loadStyles(url,callback)
{
	var e = document.createElement("link");
	e.href = url;
	//e.id = key;
	e.rel = "stylesheet";
	e.type = "text/css";

	e.try_load=function() {
		if(this.loaded) return;
		this.loaded=true;
		callback();
		}
	e.onreadystatechange= function () {   
		if (this.readyState == 'complete' || this.readyState == 'loaded') { e.try_load(); }
		}
	e.onload = e.onerror = e.try_load;
	document.body.appendChild(e);
}

function getIframeDocument(iframeNode)
{
	if (iframeNode.contentDocument) return iframeNode.contentDocument;
	if (iframeNode.contentWindow) return iframeNode.contentWindow.document;
	return iframeNode.document;
} 
