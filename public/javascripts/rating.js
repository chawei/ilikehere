$j(function() {
  $j(".ajaxful-rating-wrapper ul li a").click(function(){
    var star = $j(this).html();
    $j(".current-rating").attr("style", "width:"+star+"0%;").html("Current rating: "+star+".0/10");
    $j("#stars").val($j(this).html());
    $j("#dimension").val("overall");
    return false;
  });
});