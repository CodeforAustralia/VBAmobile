let getLocationButton = document.getElementById('getLocation');
let getTime = document.getElementById('time-button');
let gpsOutput = document.getElementById('locationLabel');
let timeOutput = document.getElementById('timeLabel');

if ("geolocation" in navigator) {
  /* geolocation is available */
	getLocationButton.addEventListener('click', function() {
		function success(position) {
	    var latitude  = position.coords.latitude;
	    var longitude = position.coords.longitude;
	    gpsOutput.innerHTML = '<p>Location : <br> Latitude is ' + latitude + '° <br>Longitude is ' + longitude + '°</p>';
	  }

		function error(e) {
		  gpsOutput.innerHTML = "Unable to retrieve your location <br>" + e.message;
		}

	 	gpsOutput.innerHTML = "<p>Locating…</p>";
	 	navigator.geolocation.getCurrentPosition(success, error, {timeout: 3000});
	});
} else {
  /* geolocation IS NOT available */
  getLocationButton.remove()
}

// get time button

getTime.addEventListener('click', function() {
	let m = new Date()
	let formatedTime =  m.getUTCFullYear() +"/"+
  ("0" + (m.getUTCMonth()+1)).slice(-2) +"/"+
  ("0" + m.getUTCDate()).slice(-2) + " " +
  ("0" + m.getUTCHours()).slice(-2) + ":" +
  ("0" + m.getUTCMinutes()).slice(-2) + ":" +
  ("0" + m.getUTCSeconds()).slice(-2);

	timeOutput.innerHTML = `<p>Time: ${formatedTime} </p>`
});

