/* ========================= OMNITURE WRAPPER for Blaze SDK ======================

   Microtemplate wrapping for common use of omniture s-code.js

// ===============================================================================
Interface:

	Omniture(account)	- constructor
	.prepare( obj );	- set up all properties of 'obj' into use of s-object
	.prepareFromTemplate( template_obj, override_obj }	- template_obj can contain %var-names% to get values from global vars
						define emply members in template_obj to make them obligatory in override_obj
	.send('post-name')	- 'post-name' = 'event-name' for single event
	.send('post-name', template_obj, override_obj);

//=================================================================================
Usage Example:


//some variables that can be get automatically into templates
window.channel=1110001;
window.gameId='gameIDdddddd';
window.gameName='gameNameAAA';

// Defining the templates:

// template for common properties of s-object
// values in %value% will get from existing variables
var OMNITURE_INIT={ pageName : 'general', channel : '%window.channel%', products : '%window.gameId%' };


// set variables set for every 'post' (really can contain some number of events!)
// define empty variables for obligatory values to be sure that they are will be set!
// it causes the special warning if you forget to set when sending
var OMNITURE_EVENTS={
	'event22' : { pageName:'commonPage', products : '' },
	'event23' : { pageName:'commonPage', products : '' },
	'purchase' : { pageName:'commonPage', products : 'category;%window.gameName%;1;1.44', eVar5 : '' },
	'event5' : { pageName:'commonPage', products : '%window.blaze.gameName%' },
	'event49' : { pageName:'commonPage', products : '%window.blaze.gameName%' },
	'severalEvents' : { events:'event5,event7', products : '', evar8 : '' }
};


// Creation and initialization

	window.omni=new Omniture(account);
	omni.prepare( { pageName:'', channel:'', products:'' } );
	//or
	omni.prepareFromTemplate( OMNITURE_INIT );
	//or
	omni.prepareFromTemplate( OMNITURE_INIT, { pageName : 'override-value' } );



// Sending
	omni.send(post_name, OMNITURE_EVENTS[post_name], obj_of_overrides);


	omni.prepareFromTemplate(OMNITURE_EVENTS['purchase'],{ eVar5 : 'evar5value' });
	omni.send('purchase');
//or
	omni.send('purchase',OMNITURE_EVENTS['purchase'],{ eVar5 : 'evar5value' });

******************************************************************************************************* */



// ========================================= Omniture Object  ======================================

var MAX_PROP_NUMBER = 100;

function Omniture(a_account)
{
	this.account = a_account;

	this.s=s_gi(a_account);

	/* Mandatory variables */
	this.s.currencyCode = "USD";
	this.s.linkInternalFilters = "javascript:,.";
	this.s.linkLeaveQueryString = false;
	this.s.linkTrackVars = "None";
	this.s.linkTrackEvents = "None";
	this.s.channel = '';
	/* Mandatory variables ADDITIONAL if sending from HTML code */
	//this.s.trackDownloadLinks = true;
	//this.s.trackExternalLinks = true;
	//this.s.linkDownloadFileTypes = "exe,zip,wav,mp3,mov,mpg,avi,wmv,doc,pdf,xls"; 	//exists only in launcher!

	/* WARNING: Changing any of the below variables will cause drastic
	changes to how your visitor data is collected.  Changes should only be
	made when instructed to do so by your account manager.*/
	this.s.dc = "112";

	/* Page Name */
	this.s.pageName = '';

	/* List of events to be triggered */
	this.s.events = '';

	/* Commerce variables (evars), Custom traffic variables (sprops) */
	//this.s.evar1 = '';
	//this.s.sprop1 = '';

	/* Campaign variable (if applicable) */
	this.s.campaign = '';

	/* Product variable (if applicable) */
	this.s.products = '';
}


Omniture.prototype.clear=function()
{
	for (var i = 0; i < MAX_PROP_NUMBER; i++) {
		if(this.s["prop"+i])	this.s["prop"+i]='';
		if(typeof(this.s["prop"+i])!='indefined') delete this.s["prop"+i];
		}
	for (var i = 0; i < MAX_PROP_NUMBER; i++) {
		if(this.s["prop"+i])	this.s["prop"+i]='';
		if(typeof(this.s["eVar"+i])!='indefined') delete this.s["prop"+i];
		}
}


Omniture.prototype.prepareFromTemplate=function(evt,obj)
{
	if(typeof(evt)=='undefined') { alert('Omniture error: event template does not exists'); return; }

	for(key in evt) {
		if(typeof(this.s[key])=='undefined') {
			//its OK for evars and props
			if(key.substr(0,4)!='eVar' && key.substr(0,5)!='sprop')
				alert('WARNING Omniture object "s" have no such property "'+key+'"');
			}

		var value=evt[key];
		value=value.replace(/(%.*?%)/g,function(str, p1, p2, offset, s) { 
			var exp=p1.replace(/%/g,'');
			try { val=eval(exp); }
			catch(ex) { alert('ERROR Omniture cannot get external property  "'+exp+'"  \n\r'+ex); val=''; }
			if(typeof(val)=='undefined') { alert('ERROR Omniture cannot get external property  "'+exp+'"  \n\r'+ex); val=''; }
			return val;
			});

		//override from obj
		if(obj && typeof(obj[key])!='undefined') { value=obj[key]; }

		try { this.s[key]=value; }
		catch(ex) { alert('ERROR Omniture cannot init the property "s.'+key+'"  \n\r'+ex); }
		}
}


Omniture.prototype.prepare=function(obj)
{
	for(key in obj) {
		if(typeof(this.s[key])=='undefined') { alert('WARNING Omniture object "s" have no such property "'+key+'"'); }
		try { this.s[key]=obj[key]; }
		catch(ex) { alert('ERROR Omniture cannot init the property "s.'+key+'"'); }
		}
}


Omniture.prototype.send=function(eventName,evt,obj)
{
	if(evt) {
		this.clear();	//kill evars and props
		this.prepareFromTemplate(evt,obj);
		}

	(function(omni) {
	if(typeof(omni.s.events)=='undefined') omni.s.events=eventName;
	omni.s.linkTrackEvents = omni.s.events;

	omni.s.linkTrackVars = 'channel,products,events';
	var key='';
	for(key in omni.s) {
		if(key.substr(0,4)=='eVar') omni.s.linkTrackVars+=','+key;
		if(key.substr(0,5)=='sprop') omni.s.linkTrackVars+=','+key;
		}

	omni.s.tl(omni, 'o', eventName);
	})(this);
}










