// public/javascripts/pagination.js
$j(function() {
  $j(".pagination a").live("click", function() {
    $j.setFragment({ "page" : $j.queryString(this.href).page })
    $j(".pagination").html("<img src='/images/spinner.gif' />");
    $j.get(this.href, null, null, "script");
    return false;
  });
  
  $j.fragmentChange(true);
  $j(document).bind("fragmentChange.page", function() {
    $j.getScript($j.queryString(document.location.href, { "page" : $j.fragment().page }));
  });
  
  if ($j.fragment().page) {
    $j(document).trigger("fragmentChange.page");
  }
});

// For older jQuery versions...
// jQuery.ajaxSetup({ 
//   'beforeSend': function(xhr) {xhr.setRequestHeader("Accept", "text/javascript")}
// });