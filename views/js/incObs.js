let getLocationButton = document.getElementById('getLocation');
let gpsLat = document.getElementById('lat');
let gpsLong = document.getElementById('long');

let timeOutput = document.getElementById('timeLabel');
let gpsOutput = document.getElementById('locationLabel');

let getTime = document.getElementById('time-button');

let date = document.getElementById('date');
let time = document.getElementById('time');

alert('working')
if ("geolocation" in navigator) {
  /* geolocation is available */
	getLocationButton.addEventListener('click', function() {
		function success(position) {
			console.log('getting location' + position)
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
	 	navigator.geolocation.getCurrentPosition(success, error, {
		  enableHighAccuracy: true,
		  timeout: 5000,
		  maximumAge: 0 } );
	 });
} else {
  /* geolocation IS NOT available */
  getLocationButton.remove()
}

// get time button
getTime.addEventListener('click', function() {
	console.log('time button clicked')
	let m = new Date();
	let formatedDate = 	`${ m.getUTCFullYear() }-${ ('0' + m.getUTCMonth()+1).slice(-2) }-${ ('0' + m.getUTCDate()).slice(-2) }`
	let formatedTime = `${ ('0' + m.getUTCHours()).slice(-2) }${ ('0' + m.getUTCSeconds()).slice(-2) }`
	date.value = formatedDate;
	time.value = formatedTime;
});

