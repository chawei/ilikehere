//****************************************************************
//**************************** URI *******************************
//****************************************************************
 
//splits a URI into its parts
//returns null if str is not a valid URI
//does not support IPvFuture domains
//see RFC 3986 http://www.faqs.org/rfcs/rfc3986.html
function parseURI(str)
{
	if(!str) return null;
 
	var regexUri = /^([a-z0-9+.-]+):(?:\/\/(?:((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*)@)?((?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*|\[(?:[0-9A-F:.]{2,})\])(?::(\d*))?(\/(?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*)?|(\/?(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})+(?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*)?)(?:\?((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?(?:#((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?$/i;
	//'
	/*composed as follows:
		^
		([a-z0-9+.-]+):											#scheme
		(?:
			\/\/												#it has an authority:
			(?:((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*)@)?	#userinfo
			((?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*|\[(?:[0-9A-F:.]{2,})\])	#host (loose check to allow for IPv6 addresses)
			(?::(\d*))?											#port
			(\/(?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*)?	#path
			|
																#it doesn't have an authority:
			(\/?(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})+(?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*)?	#path
		)
		(?:
			\?((?:[a-z0-9-._~!$&'()*+,;=:/?@]|%[0-9A-F]{2})*)	#query string
		)?
		(?:
			#((?:[a-z0-9-._~!$&'()*+,;=:/?@]|%[0-9A-F]{2})*)	#fragment
		)?
		$
	*/
	if(!regexUri.test(str)) return null;	//invalid URI
 
	//these extra steps are required to check for validity of the host depending on if it's a URL or not,
	// since URLs allow IPv6 addresses (i.e., they allow '[', ':', and ']')
	var scheme = str.replace(regexUri, "$1").toLowerCase();
	var host = str.replace(regexUri, "$3");
	if(host && (scheme == "http" || scheme == "https"))	//if it's a URL
	{
		if(!normalizeURLDomain(host)) return null;	//invalid host
	}
	else if(host)	//host may not include '[', ':', or ']'
	{
		if((/[:\[\]]/).test(host)) return null;	//invalid host
	}
 
	var parts = {
		uri: scheme+str.slice(scheme.length),	//make sure scheme is lower case
		scheme: scheme,
		authority: "",	//userinfo@host:port
			userinfo: str.replace(regexUri, "$2"),
			host: host,
			port: str.replace(regexUri, "$4"),
		path: str.replace(regexUri, "$5$6"),
		query: str.replace(regexUri, "$7"),
		fragment: str.replace(regexUri, "$8")
	};
	parts.authority = (parts.userinfo ? parts.userinfo+"@" : "") + parts.host + (parts.port ? ":"+parts.port : "");
 
	return parts;
}
 
//splits a query string into its name/value pairs
//returns a 2-D array
function parseQueryNumeric(str)
{
	var results = [];	//array of objects {name, value}
 
	var pairs = str.split("&");
	var pair, j, result;
	for(var i=0; i<pairs.length; i++)
	{
		pair = pairs[i].split("=");
		if(!pair[0]) continue;	//if there is no name, skip it
		result = {
			name: pair[0],
			value: ""
		};
		if(pair.length > 0)	//if it has a value
		{
			result.value = pair[1];	//set the value
			for(j=2; j<pair.length; j++)	//if there is more than one "=", include its encoded form in the value
			{
				result.value += "%3D"+pair[j];
			}
		}
		results.push(result);
	}
 
	return results;
}
//splits a query string into its name/value pairs
//returns an associative array
//if there are multiple pairs with the same name, the last pair is used
function parseQueryAssociative(str)
{
	var results = {};	//associative array
 
	var pairs = str.split("&");
	var pair, j, result;
	for(var i=0; i<pairs.length; i++)
	{
		pair = pairs[i].split("=");
		if(!pair[0]) continue;	//if there is no name, skip it
		results[pair[0]] = "";
		if(pair.length > 0)	//if it has a value
		{
			results[pair[0]] = pair[1];	//set the value
			for(j=2; j<pair.length; j++)	//if there is more than one "=", include its encoded form in the value
			{
				results[pair[0]] += "%3D"+pair[j];
			}
		}
	}
 
	return results;
}
 
//****************************************************************
//**************************** URL *******************************
//****************************************************************
 
//splits a URL (i.e., http(s) scheme URI) into its parts
//returns null if str is not a valid URL
//does not support IPvFuture domains
//see RFC 2616 http://tools.ietf.org/html/rfc2616
//note: according to the RFC, fragments aren't part of a URL (they're only used by the browser, never sent to the server)
// but this function allows them anyway, of course
function parseURL(str)
{
	var uri = parseURI(str);
	if(!uri) return null;	//invalid URI
	if((uri.scheme != "http" && uri.scheme != "https") || !uri.authority) return null;	//it's not a URL
	if(!uri.host) return null;	//no domain
 
	var parts = {
		url: "",
		protocol: uri.scheme,
		authority: "",	//domain:port
			domain: normalizeURLDomain(uri.host),
			port: uri.port,	//defaults: http 80, https 443
		path: (normalizeURLPath(uri.path) || "/"),
		query: uri.query,
		anchor: uri.fragment
	};
	if(!parts.domain) return null;	//invalid domain
	parts.authority = parts.domain + (parts.port ? ":"+parts.port : "");
	parts.url = parts.protocol + "://" + parts.authority + parts.path + (parts.query ? "?"+parts.query : "") +
	 (parts.anchor ? "#"+parts.anchor : "");
 
	return parts;
}
 
//converts an obscured URL domain to a more readable one
//returns "" if it's not a valid domain
//does not support IPvFuture domains
//see http://www.pc-help.org/obscure.htm
// and RFC 1123 http://tools.ietf.org/html/rfc1123#section-2   (Section 2.1)
// and RFC 952 http://tools.ietf.org/html/rfc952   (ASSUMPTIONS 1, GRAMMATICAL HOST TABLE SPECIFICATION)
// and RFC 2181 http://tools.ietf.org/html/rfc2181#section-11   (Section 11)
function normalizeURLDomain(domain)
{
	if(!domain) return "";
	if(domain.toLowerCase() == "localhost") return "localhost";
 
	domain = domain.replace(/%3(\d)/g, "$1");	//decimals
	//upper-case letters (converted to lower-case)
	domain = domain.replace(/%41/ig, "a").replace(/%42/ig, "b").replace(/%43/ig, "c").replace(/%44/ig, "d").replace(/%45/ig, "e");
	domain = domain.replace(/%46/ig, "f").replace(/%47/ig, "g").replace(/%48/ig, "h").replace(/%49/ig, "i").replace(/%4A/ig, "j");
	domain = domain.replace(/%4B/ig, "k").replace(/%4C/ig, "l").replace(/%4D/ig, "m").replace(/%4E/ig, "n").replace(/%4F/ig, "o");
	domain = domain.replace(/%50/ig, "p").replace(/%51/ig, "q").replace(/%52/ig, "r").replace(/%53/ig, "s").replace(/%54/ig, "t");
	domain = domain.replace(/%55/ig, "u").replace(/%56/ig, "v").replace(/%57/ig, "w").replace(/%58/ig, "x").replace(/%59/ig, "y");
	domain = domain.replace(/%5A/ig, "z");
	//lower-case letters
	domain = domain.replace(/%61/ig, "a").replace(/%62/ig, "b").replace(/%63/ig, "c").replace(/%64/ig, "d").replace(/%65/ig, "e");
	domain = domain.replace(/%66/ig, "f").replace(/%67/ig, "g").replace(/%68/ig, "h").replace(/%69/ig, "i").replace(/%6A/ig, "j");
	domain = domain.replace(/%6B/ig, "k").replace(/%6C/ig, "l").replace(/%6D/ig, "m").replace(/%6E/ig, "n").replace(/%6F/ig, "o");
	domain = domain.replace(/%70/ig, "p").replace(/%71/ig, "q").replace(/%72/ig, "r").replace(/%73/ig, "s").replace(/%74/ig, "t");
	domain = domain.replace(/%75/ig, "u").replace(/%76/ig, "v").replace(/%77/ig, "w").replace(/%78/ig, "x").replace(/%79/ig, "y");
	domain = domain.replace(/%7A/ig, "z");
	//allowed symbols
	domain = domain.replace(/%2D/ig, "-").replace(/%2E/ig, ".");
	domain = domain.replace(/%3A/ig, ":").replace(/%5B/ig, "[").replace(/%5D/ig, "]");	//for IPv6 addresses
	if((/[^a-z0-9:\[\].-]/i).test(domain)) return "";	//contains invalid characters
 
	var ip;
	if(ip = normalizeIPv4(domain)) return ip;	//it's a valid IPv4 address
	if(ip = normalizeIPv6(domain)) return ip;	//it's a valid IPv6 address
 
	//it's not an IP address
	if((/[:\[\]]/).test(domain)) return "";	//contains invalid characters
	if(domain.length > 255) return "";	//too long
	//note: the spec doesn't allow a name to start with a digit, but this is not enforced
	if((/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i).test(domain))
		return domain;	//valid domain
	return "";	//invalid domain
}
 
function normalizeIPv4(ip)
{
	if(!(/^(\d+|0x[0-9A-F]+)(\.(\d+|0x[0-9A-F]+)){3}$/i).test(ip))	return '';	//invalid
	var parts = ip.split(".");
	var val, dwordToIp;
	var vals = [];
	for(var i=0; i<parts.length; i++)	//for each part
	{
		val = parseInt(parts[i]);	//convert hex or octal to dword/decimal
 
		//if this is the last part and it's a dword
		//e.g., in an IP of 1192362298 or 71.1179962 or 71.18.314
		if(i == parts.length-1 && i < 3)
		{
			//convert dword to decimal parts
			//e.g., 1179962 becomes 18.1.58
			dwordToIp = [];
			while(i < 4)
			{
				dwordToIp.unshift(val % 256);
				val = (val-dwordToIp[0]) / 256;
				i++;
			}
			vals = vals.concat(dwordToIp);
			break;
		}
		val = val % 256;
		vals.push(val);
	}
	return vals.join(".");	//valid IP address
}
 
//note: this includes the '[' and ']' characters on the ends of the IP (for use in a URL)
function normalizeIPv6(ip)
{
	if(ip.charAt(0) == '[' && ip.charAt(ip.length-1) == ']') ip = ip.slice(1,ip.length-1);
	ip = ip.split('::');	//split the IP at the '::' shortcut (if it's used)
	if(ip.length < 1 || ip.length > 2) return '';	//invalid IP
	var x = ip[0].split(':');
	if(x.length > 8 || (ip.length>1 && x.length+ip[1].split(':').length > 7)) return '';	//invalid IP
	var a = [], b = [];
	for(var i=0; i<x.length; i++)	//for each part left of '::' (or of the entire IP if '::' isn't used)
	{
		if(x[0] == '') break;	//there isn't anything on the left side
		if((/^[0-9A-F]{1,4}$/i).test(x[i])) a.push(normalizeIPv6.pad(x[i]));
		else if(ip.length==1 && i == x.length-1 && (x[i] = normalizeIPv6.v4to6(x[i])) != '')	//last part of entire IP is a ver. 4 IP
		{
			//converted x[i] to a ver. 6 IP
			a.push(x[i].substr(0,4));
			a.push(x[i].substr(4,4));
		}
		else return '';	//invalid IP
	}
	if(ip.length>1)	//if the shortcut was used
	{
		x = ip[1].split(':');
		for(i=0; i<x.length; i++)	//for each part right of '::'
		{
			if(x[0] == '') break;	//there isn't anything on the right side
			if((/^[0-9A-F]{1,4}$/i).test(x[i])) b.push(normalizeIPv6.pad(x[i]));
			else if(i == x.length-1 && (x[i] = normalizeIPv6.v4to6(x[i])) != '')	//last part of entire IP is a ver. 4 IP
			{
				//converted x[i] to a ver. 6 IP
				b.push(x[i].substr(0,4));
				b.push(x[i].substr(5,4));
			}
			else return '';	//invalid IP
		}
		while(a.length+b.length < 8)	//replace the shortcut with the zeroes it represents
		{
			a.push('0000');
		}
	}
	return '['+a.concat(b).join(':')+']';
}
normalizeIPv6.pad = function(x)
{
	x = ''+x;
	while(x.length < 4){ x = '0'+x; }
	return x.toLowerCase();
}
normalizeIPv6.v4to6 = function(ip)
{
	if(!normalizeIPv4(ip)) return '';	//invalid IP
	ip = ip.split('.');
	var h = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
	return '' + h[Math.floor(ip[0]/16)] + h[ip[0]%16] + h[Math.floor(ip[1]/16)] + h[ip[1]%16] + 
		':' + h[Math.floor(ip[2]/16)] + h[ip[2]%16] + h[Math.floor(ip[3]/16)] + h[ip[3]%16];
}
 
//converts an obscured URL path to a more readable one
function normalizeURLPath(path)
{
	if(!path) return "";
 
	path = path.replace(/%3(\d)/g, "$1");	//decimals
	path = path.replace(/%41/ig, "A").replace(/%42/ig, "B").replace(/%43/ig, "C").replace(/%44/ig, "D").replace(/%45/ig, "E");
	path = path.replace(/%46/ig, "F").replace(/%47/ig, "G").replace(/%48/ig, "H").replace(/%49/ig, "I").replace(/%4A/ig, "J");
	path = path.replace(/%4B/ig, "K").replace(/%4C/ig, "L").replace(/%4D/ig, "M").replace(/%4E/ig, "N").replace(/%4F/ig, "O");
	path = path.replace(/%50/ig, "P").replace(/%51/ig, "Q").replace(/%52/ig, "R").replace(/%53/ig, "S").replace(/%54/ig, "T");
	path = path.replace(/%55/ig, "U").replace(/%56/ig, "V").replace(/%57/ig, "W").replace(/%58/ig, "X").replace(/%59/ig, "Y");
	path = path.replace(/%5A/ig, "Z");
	path = path.replace(/%61/ig, "a").replace(/%62/ig, "b").replace(/%63/ig, "c").replace(/%64/ig, "d").replace(/%65/ig, "e");
	path = path.replace(/%66/ig, "f").replace(/%67/ig, "g").replace(/%68/ig, "h").replace(/%69/ig, "i").replace(/%6A/ig, "j");
	path = path.replace(/%6B/ig, "k").replace(/%6C/ig, "l").replace(/%6D/ig, "m").replace(/%6E/ig, "n").replace(/%6F/ig, "o");
	path = path.replace(/%70/ig, "p").replace(/%71/ig, "q").replace(/%72/ig, "r").replace(/%73/ig, "s").replace(/%74/ig, "t");
	path = path.replace(/%75/ig, "u").replace(/%76/ig, "v").replace(/%77/ig, "w").replace(/%78/ig, "x").replace(/%79/ig, "y");
	path = path.replace(/%7A/ig, "z");
	path = path.replace(/%2D/ig, "-").replace(/%2E/ig, ".").replace(/%5F/ig, "_").replace(/%7E/ig, "~").replace(/%21/ig, "!");
	path = path.replace(/%24/ig, "$").replace(/%27/ig, "'").replace(/%28/ig, "(").replace(/%29/ig, ")").replace(/%2A/ig, "*");
	path = path.replace(/%2B/ig, "+").replace(/%2C/ig, ",").replace(/%3B/ig, ";").replace(/%40/ig, "@");
	//path = path.replace(/%20/g, " ");	//more readable, but not valid
 
	return path;
}
 
//****************************************************************
//************************** Mailto ******************************
//****************************************************************
 
//splits a mailto scheme URI into its parts
//returns null if str is not a valid mailto URI or there is no destination
//only includes valid email addresses; the rest are removed
//does not support IPv6 or IPvFuture domains
//see RFC 2368 http://tools.ietf.org/html/rfc2368
function parseMailto(str)
{
	var uri = parseURI(str);
	if(!uri || uri.scheme != "mailto" || uri.authority) return null;
	//note: if there is a fragment, it will simply be left out
 
	uri.uri = uri.uri.replace(/%20/g, " ");
	uri.path = uri.path.replace(/%20/g, " ");
	uri.query = uri.query.replace(/%20/g, " ");
 
	var parts = {
		uri: "",
		scheme: "mailto",
		to: [],
		cc: [],
		bcc: [],
		subject: "",
		body: "",
		headers: []	//other headers besides the above
	};
	var to1 = [], to2 = [];
 
	if(uri.path)
	{
		to1 = to1.concat(splitEmailAddresses(uri.path));
	}
	var headers = parseQueryNumeric(uri.query);
	for(var i=0; i<headers.length; i++)
	{
		if(headers[i].value == "") continue;
		if(headers[i].name == "to")
		{
			to2 = to2.concat(splitEmailAddresses(headers[i].value));
		}
		else if(headers[i].name == "cc")
		{
			parts.cc = parts.cc.concat(splitEmailAddresses(headers[i].value));
		}
		else if(headers[i].name == "bcc")
		{
			parts.bcc = parts.bcc.concat(splitEmailAddresses(headers[i].value));
		}
		else if(headers[i].name == "subject")
		{
			parts.subject = headers[i].value;
		}
		else if(headers[i].name == "body")
		{
			parts.body = headers[i].value;
		}
		else
		{
			parts.headers.push(headers[i]);
		}
	}
 
	parts.to = to1.concat(to2);
	if(parts.to.length == 0 && parts.cc.length == 0 && parts.bcc.length == 0) return null;	//no destination
 
	parts.uri = "mailto:";
	if(to1.length > 0)
	{
		for(i=0; i<to1.length; i++)
		{
			parts.uri += to1[i];
			if(i < to1.length-1) parts.uri += ",";
		}
	}
 
	var qs = [];
	var q = -1;
	if(to2.length > 0)
	{
		qs[++q] = "to=";
		for(i=0; i<to2.length; i++)
		{
			qs[q] += to2[i];
			if(i < to2.length-1) qs[q] += ",";
		}
	}
	if(parts.cc.length > 0)
	{
		qs[++q] = "cc=";
		for(i=0; i<parts.cc.length; i++)
		{
			qs[q] += parts.cc[i];
			if(i < parts.cc.length-1) qs[q] += ",";
		}
	}
	if(parts.bcc.length > 0)
	{
		qs[++q] = "bcc=";
		for(i=0; i<parts.bcc.length; i++)
		{
			qs[q] += parts.bcc[i];
			if(i < parts.bcc.length-1) qs[q] += ",";
		}
	}
	if(parts.subject) qs[++q] = "subject="+parts.subject;
	if(parts.body) qs[++q] = "body="+parts.body;
	for(i=0; i<parts.headers.length; i++)
	{
		qs[++q] = parts.headers[i].name+"="+parts.headers[i].value;
	}
	if(qs.length > 0) parts.uri += "?"+qs.join("&");
 
	return parts;
}
//helper function for parseMailto
//splits the string at the commas, but ignores commas within quoted strings
//only returns valid email addresses
function splitEmailAddresses(str)
{
	var addresses = [];
	var a = 0, c, m;
	var parts = str.split("\"");	//split the string at the quotes
	str = "";
	var inQuote = false;
	for(var i=0; i<parts.length; i++)
	{
		if(inQuote)	//currently inside a pair of quotes
		{
			str += "\"";
			if((/(^|[^\\])(\\\\)*\\$/).test(parts[i]))	//part ends with the escape character (\)
			{
				str += parts[i];
			}
			else	//end quote
			{
				str += parts[i];
				if(i < parts.length-1)
				{
					str += "\"";
					inQuote = false;
				}
			}
		}
		else	//not inside a pair of quotes
		{
			//if((c=parts[i].search(/,|%2C/i)) > -1)	//comma is found
			if((c=parts[i].search(/,/i)) > -1)	//comma is found
			{
				addresses[a++] = str + parts[i].slice(0, c);	//add the address that ends at the comma
				//m = parts[i].match(/(,|%2C)(\s|%20)*/i)[0].length;
				//str = parts[i].slice(c+m);
				str = parts[i].slice(c+1);
			}
			else str += parts[i];
			if(i < parts.length-1) inQuote = true;	//if there are more parts
			else addresses[a] = str;
		}
	}
	if(inQuote) return [];	//no closing quote
	//verify the email addresses
	for(i=0; i<addresses.length; i++)
	{
		addresses[i] = normalizeEmailAddress(addresses[i]);
		if(!addresses[i]) addresses.splice(i--,1);	//if it's not valid, remove it
	}
	return addresses;
}
 
//converts an obscured email address to a more readable one; unfolds and removes comments
//returns "" if it's not a valid address
//does not support IPv6 or IPvFuture domains
//see RFC 2822 http://tools.ietf.org/html/rfc2822
// and http://www.ilovejackdaniels.com/php/email-address-validation/
//obsolete forms are not supported
function normalizeEmailAddress(str)
{
	if(!str) return "";
 
	//remove comments
	//regular expressions do not support nesting, so I have to do this manually
	var c = 0;	//nesting level of comments
	var s = "";	//new string
	var p, m, char;	//position, match, end character
	var inQS = false;	//inside a quoted string
	p = str.search(/(^|[^\\]+?)(\\\\)*[()"]/);
	while(p >= 0)
	{
		m = str.match(/(^|[^\\]+?)(\\\\)*[()"]/)[0];
		char = str.charAt(p+m.length-1);
		if(char == "\"")
		{
			if(c == 0)	//beginning or end of a quoted string (not inside of a comment)
			{
				s += str.slice(0, p+m.length);
				inQS = !inQS;
			}
			str = str.slice(p+m.length);
		}
		else if(char == "(")
		{
			if(inQS) s += str.slice(0, p+m.length);	//inside a quoted string
			else if(c++ == 0) s += str.slice(0, p+m.length-1);	//beginning of a top-level comment
			str = str.slice(p+m.length);
		}
		else if(char == ")")
		{
			if(inQS) s += str.slice(0, p+m.length);	//inside a quoted string
			else c--;	//end of a comment
			str = str.slice(p+m.length);
		}
		if(c < 0) return "";	//invalid comment nesting
		p = str.search(/(^|[^\\]+)(\\\\)*[()"]/);
	}
	str = s + str;
 
	str = str.replace(/\s+/g, " ");	//replace whitespace with a single space
	str = str.replace(/[\\x01-\\x1F\\x7F]+/g, "");	//remove remaining (non-whitespace) control characters
 
	var atext = "[!#$%&'*+`/0-9=?A-Z^_a-z{|}~-]";
	var qtext = "[!#$%&'()*+`./0-9:;<=>?@A-Z\\[\\]^_,a-z{|}~-]";
	var qptext = "("+qtext+"|[\"\\\\])";
	//var dtext = "[!\"#$%&'()*+`./0-9:;<=>?@A-Z^_,a-z{|}~-]";	//for IPv6 or IPvFuture formatted domains
 
	var dotAtom = "( ?"+atext+"+(\\."+atext+"+)* ?)";
	var quotedString = "( ?\"( ?("+qtext+"|\\\\"+qptext+"))* ?\" )";
	//var domainLiteral = "( ?\\[( ?("+dtext+"|\\\\"+qptext+"))* ?\\] ?)";	//for IPv6 or IPvFuture formatted domains
 
	var localPart = "("+dotAtom+"|"+quotedString+")";
	//var domain = "("+dotAtom+"|"+domainLiteral+")";	//we won't support IPv6 or IPvFuture formatted domains
	var domain = dotAtom;
	var addrSpec = "("+localPart+"@"+domain+")";
 
	var displayName = "(( ?"+atext+"+ ?|"+quotedString+")+)";
	var nameAddr = "("+displayName+"? ?<"+addrSpec+"> ?)";
 
	var mailbox = "^("+nameAddr+"|"+addrSpec+")$";
 
	rxp = new RegExp(mailbox);
	if(rxp.test(str))	//valid mailbox so far
	{
		//get the domain
		rxp = new RegExp("@("+domain+")(> ?)?$");
		var d = str.match(rxp)[0];
		var dn = d.replace(rxp, "$2");
		d = d.replace(rxp, "$1");
		d = d.replace(/^ +| +$/g, "");	//remove spaces from ends
 
		//normalize the domain
		var normalizedDomain = normalizeURLDomain(d);
		if(!normalizedDomain) return "";	//invalid domain
 
		//replace the domain with the normalized version
		str = str.replace(rxp, "@"+normalizedDomain+(dn?">":""));
 
		//get the local part
		rxp = new RegExp("("+localPart+")@"+normalizedDomain+">?");
		var lp = str.match(rxp)[0].replace(rxp, "$1");
		lp = lp.replace(/^ +| +$/g, "");	//remove spaces from ends
 
		//replace local part with cleaned-up version
		str = str.replace(rxp, lp+"@"+normalizedDomain+(dn?">":""));
 
		if(dn)
		{
			//get the display name, if there is one
			rxp = new RegExp("^"+displayName);
			var dn = str.match(rxp);
			if(dn)
			{
				dn = dn[0].replace(/^ +| +$/g, "");	//remove spaces from ends of display name
				str = str.replace(rxp, dn);	//replace display name with cleaned-up version
			}
		}
 
		return str;	//valid mailbox
	}
	return "";	//invalid mailbox
}
 
//****************************************************************
//*************************** Fixes ******************************
//****************************************************************
 
//attempts to fix a URL if needed
//domain: domain to use if the url is relative
//returns null if it can't be fixed
function fixURL(str, domain)
{
	str = str.replace(/ /g, "%20");	//make sure all spaces are escaped
	var url = parseURL(str);
	if(url) return url;	//valid URL
 
	domain = normalizeURLDomain(domain);
	str = str.replace(/"/g, "%22");
	str = str.replace(/</g, "%3C");
	str = str.replace(/>/g, "%3E");
	url = parseURI(str);
	if(!url && str.charAt(0) == "/")	//relative path
	{
		if(!domain) return null;	//invalid URL; can't fix it since no valid domain was given
		str = "http://"+domain+str;
		url = parseURL(str);
		if(url) return url;	//it's now a valid URL
		url = parseURI(str);
	}
	if(!url && str.slice(0,7) != "http://" && str.slice(0,8) != "https://")
	{
		str = "http://"+str;
		url = parseURL(str);
		if(url) return url;	//it's now a valid URL
		url = parseURI(str);
	}
	if(!url) return null;	//invalid URI; can't be fixed
 
	//valid URI; try to make it a valid URL
	str = url.scheme+"://";
	str += url.domain || domain;
	str += url.port ? ":"+url.port : "";
	str += normalizeURLPath(url.path)+(url.query ? "?"+url.query : "")+(url.fragment ? "#"+url.fragment : "");
 
	url = parseURL(str);
	if(url) return url;	//it's now a valid URL
	return null;	//invalid URL; can't be fixed
}
 
//attempts to fix a hyperlink address (http(s) or mailto) if needed
//domain = domain to use if the url is relative
//returns "" if it can't be fixed
function fixHyperlink(str, domain, allowMailto)
{
	domain = domain || "";
 
	//get the scheme
	var matches = str.match(/^[a-z0-9+.-]+:/i);
	var scheme = (matches ? matches[0].slice(0, matches[0].length-1).toLowerCase() : "");
	if(scheme != "http" && scheme != "https" && (allowMailto ? scheme!="mailto" : true)) scheme = "";
 
	if(!scheme || scheme == "http" || scheme == "https")	//URL or unknown scheme (assume unknown is meant to be a URL)
	{
		var lnk = fixURL(str, domain);
		if(lnk) return lnk.url;
	}
	else if(allowMailto)	//mailto address
	{
		var lnk = parseMailto(str);
		if(lnk) return lnk.uri;
	}
	return "";	//can't be fixed
}