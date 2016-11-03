var ajax = new XMLHttpRequest();
var input = document.getElementById("taxonId");
var awesomplete = new Awesomplete(input, {
		  minChars: 1,
		});

input.addEventListener('keyup', function(event) {
	let e = event || window.event;
	console.log(e) 
		if ((e.keyCode >= 46) && (e.keyCode <= 90)) {
		console.log(e.keyCode)
		ajax.open("GET", "http://54.206.104.145:8080/species?ALL="+ input.value, true);
		ajax.onload = function() {
			var list = JSON.parse(ajax.responseText).map(function(i) { 
				return [i.COMMON_NAME + " - " + i.SCIENTIFIC_NAME , i.TAXON_ID]; });
			console.log(list)
			awesomplete.list = list;
		};
		ajax.send();
	}
});
