//Load the request module
var request = require('request');
var fs = require('fs');
// iconv  = require('iconv-lite');

function Session(){
	this.urls = {
		login : 'https://vba.dse.vic.gov.au/vba/login',
		myProjects : 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1&isc_tnum=11',
		allProjects :'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1&isc_tnum=7'
	};

	this.jar = request.jar();
	this.login = function(){
	var me = this;
		//Lets configure and request
		request({
			jar: this.jar,
	    url: this.urls.login, //URL to hit
	    method: 'POST',
	    headers: {
				'Host': 'vba.dse.vic.gov.au',
				'Connection': 'keep-alive',
				'Content-Length': '37',
				'Cache-Control': 'max-age=0',
				'Origin': 'https://vba.dse.vic.gov.au',
				'Upgrade-Insecure-Requests': '1',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
				'Referer': 'https://vba.dse.vic.gov.au/vba/login.jsp',
				'Accept-Encoding': 'gzip, deflate, br',
				'Accept-Language': 'en-US,en;q=0.8,fr;q=0.6',
	    },
	    form: {
	        username: 'codeforvic',
	        password: '19910908'
	    }
	  }, 
			function(error, response, body){
		    if(error) {
		        console.log(error);
		    } else {
		      console.log(response.statusCode, body);
		      // var cookie_string = me.jar.getCookieString(me.urls.login); // "key1=value1; key2=value2; ..."
		 			var cookies = me.jar.getCookies(me.urls.login);
					console.log(cookies);
					// debugger;
					// me.getProject();
					debugger;
		    }
			});
	}

	this.getProject = function(){
		// console.log(this.jar.getCookies(this.urls.login).length)
		var me = this;
		var cookies = me.jar.getCookies(me.urls.login)

		request({
			// jar: this.jar,
	    url: this.urls.myProjects, //URL to hit
	    method: 'POST',
	    headers: {
				'Host': 'vba.dse.vic.gov.au',
				'Connection': 'keep-alive',
				// 'Content-Length': '1294',
				'Cache-Control': 'max-age=0',
				'Origin': 'https://vba.dse.vic.gov.au',
				'Upgrade-Insecure-Requests': '1',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': '*/*',
				'Referer': 'https://vba.dse.vic.gov.au/vba/login.jsp',
				// 'Accept-Encoding': 'gzip, deflate, br',
				// 'Accept-Language': 'en-US,en;q=0.8,fr;q=0.6',
				// 'encoding' : 'null',
				'Cookie': (cookies[0])
			},
	    //Lets post the following key/values as form
	    form: {
	        _transaction: '<transaction xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object"><transactionNum xsi:type="xsd:long">11</transactionNum><operations xsi:type="xsd:List"><elem xsi:type="xsd:Object"><criteria xsi:type="xsd:Object"><projectStatusCde>pub</projectStatusCde><isMyProjectSearch xsi:type="xsd:boolean">true</isMyProjectSearch></criteria><operationConfig xsi:type="xsd:Object"><dataSource>Project_DS</dataSource><operationType>fetch</operationType><textMatchStyle>exact</textMatchStyle></operationConfig><startRow xsi:type="xsd:long">0</startRow><endRow xsi:type="xsd:long">75</endRow><componentId>isc_ManageProjectModule$2_0</componentId><appID>builtinApplication</appID><operation>mainProjectSearch</operation><oldValues xsi:type="xsd:Object"><projectStatusCde>pub</projectStatusCde><isMyProjectSearch xsi:type="xsd:boolean">true</isMyProjectSearch></oldValues></elem></operations></transaction>',
	        // _transaction: '<transaction xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object"><transactionNum xsi:type="xsd:long">7</transactionNum><operations xsi:type="xsd:List"><elem xsi:type="xsd:Object"><criteria xsi:type="xsd:Object"><projectStatusCde>pub</projectStatusCde></criteria><operationConfig xsi:type="xsd:Object"><dataSource>Project_DS</dataSource><operationType>fetch</operationType><textMatchStyle>exact</textMatchStyle></operationConfig><startRow xsi:type="xsd:long">0</startRow><endRow xsi:type="xsd:long">75</endRow><componentId>isc_ManageProjectModule$2_0</componentId><appID>builtinApplication</appID><operation>mainProjectSearch</operation><oldValues xsi:type="xsd:Object"><projectStatusCde>pub</projectStatusCde></oldValues></elem></operations></transaction>',
	        protocolVersion: '1.0'
	    }
	  }, 
			function(error, response, body){
		    if(error) {
		        console.log(error);
		    } else {
		      console.log(response.statusCode);
		    	// debugger;
		    	var trimBody = body.slice(25, -20);
					trimBody = trimBody.replace(/Date\.parseServerDate/g, 'Date');
					var data = eval(trimBody)[0];
		      debugger;
		      fs.writeFile("trimbody.txt", JSON.stringify(data), function(err) {
    				if(err) {
       				return console.log(err);
    				}
   					 console.log("The file was saved!");
					}); 


		      // var cookie_string = me.jar.getCookieString(me.urls.login); // "key1=value1; key2=value2; ..."
		 			// var cookies = me.jar.getCookies(me.urls.login);
					// console.log(cookies);
		    }
			});
	}

}; 
var session = new Session();
session.login();





