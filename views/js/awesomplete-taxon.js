(function(){
	let speciesListApi = "https://vbaspecies.herokuapp.com/species/search?q=";
	let ajax = new XMLHttpRequest();
	let taxonId = document.getElementById("taxonId");
	let taxonName = document.getElementById("taxonName");
	let awesomplete = new Awesomplete(taxonName, {
			  minChars: 1,
			});

	taxonName.addEventListener('keyup', function(event) {
		let e = event || window.event;
		console.log(e) 
			if ((e.keyCode >= 46) && (e.keyCode <= 90)) {
				// console.log(e.keyCode)
				ajax.open("GET", speciesListApi + taxonName.value, true);
				ajax.onload = function() {
					let list = JSON.parse(ajax.responseText).map(function(i) { 
						return (i.COMMON_NAME ? i.COMMON_NAME + " - " : '') + i.SCIENTIFIC_NAME + ' #'+ i.TAXON_ID; 
					});
					console.log(list)
					awesomplete.list = list;
			};
			ajax.send();
		}
	});

	document.addEventListener('awesomplete-selectcomplete', function(event){
		let extractedTaxonId = /#(\d*)/.exec(event.text.value)[1];
		taxonId.value = extractedTaxonId;
		console.log( extractedTaxonId, ' selected' );
	});
}());
