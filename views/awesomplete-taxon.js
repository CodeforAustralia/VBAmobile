var ajax = new XMLHttpRequest();
var input = document.getElementById("name");
var awesomplete = new Awesomplete(input, {
		  minChars: 1,
		});

input.addEventListener('keyup', function() {
	
	console.log(event) 
		if ((event.keyCode >= 46) && (event.keyCode <= 90)) {
		console.log(event.keyCode)
		ajax.open("GET", "http://54.206.104.145:8080/species?COMMON_NAME="+ input.value, true);
		ajax.onload = function() {
			var list = JSON.parse(ajax.responseText).map(function(i) { return [i.COMMON_NAME, i.TAXON_ID]; });
			console.log(list)
			awesomplete.list = list;
		};
		ajax.send();
	}
});
