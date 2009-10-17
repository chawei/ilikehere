$j(document).ready(function() {
  for (i=0; i<$j('.result').length; i++) {
    ['name', 'address', 'phone_number'].each( function(s) {
      var input_id = "#"+s+"-"+i;
      $j(input_id).click(function () {
        $j("#place_"+s).val($j(this).html()); 
      })
    });
  }
});
    