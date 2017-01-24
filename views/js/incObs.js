let getLocationButton = document.getElementById('getLocation');
let getTime = document.getElementById('time-button');
let gpsLat = document.getElementById('lat');
let gpsLong = document.getElementById('long');

let timeOutput = document.getElementById('timeLabel');
let gpsOutput = document.getElementById('locationLabel');

if ("geolocation" in navigator) {
  /* geolocation is available */
	getLocationButton.addEventListener('click', function() {
		function success(position) {
	    var latitude  = position.coords.latitude;
	    var longitude = position.coords.longitude;
	    gpsLat.value = latitude;
	    gpsLong.value = longitude;
   	 	getLocationButton.innerHTML = "🎯 &nbsp; Get location";
	  }

		function error(e) {
		  gpsOutput.innerHTML = "Unable to retrieve your location <br>" + e.message;
		  getLocationButton.innerHTML = "🎯 &nbsp; Get location";
		}

	 	getLocationButton.innerHTML = "🎯 &nbsp; Locating...";
	 	navigator.geolocation.getCurrentPosition(success, error, {timeout: 10000});
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

