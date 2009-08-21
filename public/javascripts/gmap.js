var retry_num_of = new Hash();

google.load("search", "1");

function OnLoad() {
  // Create a search control
  var searchControl = new google.search.SearchControl();

  // Add in a full set of searchers
  var localSearch = new google.search.LocalSearch();
  searchControl.addSearcher(localSearch);
  //searchControl.addSearcher(new google.search.WebSearch());
  //searchControl.addSearcher(new google.search.VideoSearch());
  //searchControl.addSearcher(new google.search.BlogSearch());

  // Set the Local Search center point
  localSearch.setCenterPoint("NY");

  // Tell the searcher to draw itself and tell it where to attach
  searchControl.draw(document.getElementById("search_control"));
  //$j(".gsc-control").hide();
  
  // Declare function for using results
  searchControl.setSearchCompleteCallback(this, gotResults);

  // Execute an inital search
  var targetURL = $j.getURLParam("url");
  if (targetURL == "" || targetURL == undefined) targetURL = $j("#place_url").val();
  var strippedURL = stripHeadOfURL(targetURL);
  searchControl.execute(strippedURL);
  
  // initialize
  retry_num_of[targetURL] = 0;
  
  /*
  document.observe('dom:loaded', function() {
    $j('subscription_sub_region').observe('change', subregionSelected);
  });
  */
}

function gotResults(sc, searcher)
{
  var targetURL = $j.getURLParam("url");
  
  if (searcher.results.length > 0) {
  	var resultContent = '';

  	for (var i=0; i<searcher.results.length; i++)
  	{
  		var result = searcher.results[i];
  		var address = "";
  		
  		if (result.addressLines != undefined) {
    		for (var j=0; j<result.addressLines.length; j++) {
          address += result.addressLines[j]+" ";
        }
      }
      resultContent += '<div class="result">';
      if (result.title != undefined)
  		  resultContent += '  <div id="name-'+i+'">'+result.title+'</div>';
  		resultContent += '  <div id="address-'+i+'" class="address">'+address+'</div>';
  		if (result.phoneNumbers != undefined)
  		  resultContent += '  <div id="phone_number-'+i+'">'+result.phoneNumbers[0].number+'</div>';
  		resultContent += '</div>'
  	}
  	$j('#searchresults').html(resultContent);
	
  	for (i=0; i<searcher.results.length; i++) {
  	  ['name', 'address', 'phone_number'].each( function(s) {
  	    var input_id = "#"+s+"-"+i;
  	    $j(input_id).click(function () {
  	      $j("#place_"+s).val($j(this).html()); 
	      })
  	  });
  	  
  	  /*
  	  var title_id = "#title-"+i;
  	  var address_id = "#address-"+i;
  	  $j(address_id).click(function () {
  	    $j("#place_address").val($j(this).html());
      })
      */
    }
  
    if (searcher.results[0] != undefined) {
      var firstResult = searcher.results[0];
      var firstAddress = "";
      for (var n=0; n<firstResult.addressLines.length; n++) {
        firstAddress += firstResult.addressLines[n]+" ";
      }
      if ($j("#place_name").val() == "")
        $j("#place_name").val(firstResult.title.unescapeHTML());
      if ($j("#place_url").val() == "")  
        $j("#place_url").val(targetURL);
      if ($j("#place_address").val() == "")
        $j("#place_address").val(firstAddress);
      if ($j("#place_phone_number").val() == "")
        $j("#place_phone_number").val(firstResult.phoneNumbers[0]['number']);
      if ($j("#placemark_alias").val() == "")  
        $j("#placemark_alias").val(firstResult.title.unescapeHTML());
    }
  } else {
    // Try another solution or notice user that is no result
    retry_num_of[targetURL]++;
    if (retry_num_of[targetURL]==1) {
      var searchControl = new google.search.SearchControl();
      var localSearch = new google.search.LocalSearch();
      
      searchControl.addSearcher(localSearch);
      localSearch.setCenterPoint("NY");
      searchControl.draw($j("search_control"));

      // Declare function for using results
      searchControl.setSearchCompleteCallback(this, gotResults);
      searchControl.execute(getDomain(targetURL));
    }
  }
}
	
google.setOnLoadCallback(OnLoad);

