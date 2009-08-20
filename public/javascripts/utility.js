function subdomain(str){
  if (str == null) 
    return "";
  else {
    e = str.split(/\./);
    if (e.length > 1) {
      return(e[e.length-2] + "." +  e[e.length-1]);
    } else{
      return("");
    }
  }
}

function stripHeadOfURL(url) {
  if (url == null)
    return ""
  else 
    return url.replace(/^[a-z0-9+.-]+:\/\/(www)?\.?/, "");
}

function getDomain(url) {
  if (url == null)
    return ""
  else {
    url = url.replace(/^[a-z0-9+.-]+:\/\/(www)?\.?/, "");
    return url.replace(/\/.*/, "");
  }
}