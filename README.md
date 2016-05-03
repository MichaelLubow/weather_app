Weather App

Showcases the current conditions and temperature for a given location as well as a 5 day forecast. App utilizes typeahead to provide
a dynamic search for all city names within the United States. User can either type their city, select from a the dropdown of suggestions
or click the map pin to auto locate themselves via geolocation. Once the user's location is determined the OpenWeatherMap API (http://openweathermap.org/)
is queried to find the necessary data.

NOTE: As of Google Chrome 50 the geolocation API is not supported on HTTP and will only work on an HTTPS connection. If you would like
to see this feature in action (clicking the map pin) please check the site in another browser. (Firefox, Safari, etc.)

App is responsive and should expand or contract nicely from mobile to desktop.

To see the weather app running live, please go to:

http://michaellubow.com:8080

To run app simply clone, navigate to the root directory and run:

gulp compile:scssAll

node bin/www.js

Please contact me with any feedback.

Thanks!

-Mike