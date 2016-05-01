var main = (function(){

  var APP_ID = "6d9001586931106485b0a3b14315adc6";
  var unit = "imperial"; //or metric
  var $typeahead = null;
  var $weatherRetriever = null;
  var $currentConditions = null;
  var $forecast = null;

  function cacheDOMSelectors(){
    $typeahead = $('.typeahead');
    $weatherRetriever = document.querySelector('.weatherRetriever');
    $currentConditions = document.querySelector('.currentConditions');
    $forecast = document.querySelector('.forecast');
  }

  function findUserWithGeolocation(){
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        console.log("position is ", position);
      });
    }
    else {
      console.log("geolocation IS NOT available");
    }
  }

  function setCurrentDate(){
    var $date = $currentConditions.querySelector('.date');
    console.log("$date is ", $date);

    var formatDate = function(date){
      var dayOfWeekIndex = date.getDay();
      var dayOfWeek = weatherApp.DAYS[dayOfWeekIndex];
      var day = date.getDate();

      var lastDigit = (day + "").substr(-1, 1);

      var ordinalIndicator = null;
      if(lastDigit === "1"){
        ordinalIndicator = weatherApp.ORDINAL_INDICATOR_ARR[0];
      }
      else if(lastDigit === "2"){
        ordinalIndicator = weatherApp.ORDINAL_INDICATOR_ARR[1];
      }
      else if(lastDigit === "3"){
        ordinalIndicator = weatherApp.ORDINAL_INDICATOR_ARR[2];
      }
      else{
        ordinalIndicator = weatherApp.ORDINAL_INDICATOR_ARR[3];
      }
      var monthIndex = date.getMonth();
      return dayOfWeek + " " + weatherApp.MONTH_NAMES[monthIndex] + ", " + day + ordinalIndicator;
    };

    var date = formatDate(new Date());
    console.log("date is ", date);
    $date.innerHTML = date;
  }

  function renderWeatherData(data){
    var $temp = $currentConditions.querySelector(".temp");
    $temp.innerHTML = Math.round(data.main.temp);
    var $icon = $currentConditions.querySelector('.icon>i');
    $icon.className = "wi"; //reset the classes
    $icon.classList.add("wi-owm-" + data.weather[0].id);
  }

  function renderForecastData(data){
    var $dayForecastTemplate = document.getElementById('dayForecastTemplate');
    console.log($dayForecastTemplate.content);
    data.forEach(function(dayForecast){
      $dayForecastTemplate.content.querySelector('.day').textContent = dayForecast.date;
      var $icon = $dayForecastTemplate.content.querySelector('.icon>i');
      $icon.className = "wi"; //reset the classes
      $icon.classList.add("wi-owm-" + dayForecast.weatherIcon);
      $dayForecastTemplate.content.querySelector('.max').textContent = Math.round(dayForecast.max);
      $dayForecastTemplate.content.querySelector('.min').textContent = Math.round(dayForecast.min);
      var clone = document.importNode($dayForecastTemplate.content, true);
      $forecast.appendChild(clone);
    });
  }

  function populateWeatherInformation(location){
    var getCurrentWeather = function getCurrentWeather(){
      var url = "http://api.openweathermap.org/data/2.5/weather?q=" + location + "&units=" + unit + "&APPID=" + APP_ID;
      $.ajax({
          type: 'POST',
          url: url,
          cache: false,
          contentType: false,
          processData: false
        })
        .done(function(data) {
          console.log("success current weather data is ", data);
          renderWeatherData(data);
        })
        .fail(function(error) {
          console.log("error is ", error);
        })
        .always(function() {
          console.log("complete");
        });
    };

    var getForecast = function getForecast(){
      var url = "http://api.openweathermap.org/data/2.5/forecast?q=" + location + "&units=" + unit + "&APPID=" + APP_ID;
      $.ajax({
          type: 'POST',
          url: url,
          cache: false,
          contentType: false,
          processData: false
        })
        .done(function(data) {
          console.log("success forecast data is ", data);
          var summaryForecastData = [];
          var forecast = {};
          var currentDate = null;
          var weatherReadingDate = null;
          var weatherIconHourReading = null;
          var todayDate = new Date().getDate();

          data.list.forEach(function(weatherReading) {
            weatherReadingDate = new Date(weatherReading.dt_txt);
            var date = weatherReadingDate.getDate();
            console.log("date is ", date);

            if(date !== todayDate) {
              if (!currentDate) {
                currentDate = date;
                forecast.min = weatherReading.main.temp;
                forecast.max = weatherReading.main.temp;
                forecast.date = weatherApp.DAYS[weatherReadingDate.getDay()];
                weatherIconHourReading = weatherReadingDate.getHours() + 1;
                forecast.weatherIcon = weatherReading.weather[0].id;
              }
              else if (currentDate === date) {
                if (weatherReading.main.temp < forecast.min) {
                  forecast.min = weatherReading.main.temp;
                }
                else if (weatherReading.main.temp > forecast.min) {
                  forecast.max = weatherReading.main.temp;
                }
                if (weatherIconHourReading < 12 && weatherReadingDate.getHours() <= 12) {
                  console.log('weatherIconHourReading is ', weatherIconHourReading);
                  console.log('weatherReadingDate.getHours() + 1 is ', weatherReadingDate.getHours());
                  forecast.weatherIcon = weatherReading.weather[0].id;
                }
              }
              else {
                summaryForecastData.push(forecast);
                currentDate = date;
                forecast = {};
                forecast.min = weatherReading.main.temp;
                forecast.max = weatherReading.main.temp;
                forecast.date = weatherApp.DAYS[weatherReadingDate.getDay()];
                weatherIconHourReading = weatherReadingDate.getHours();
                forecast.weatherIcon = weatherReading.weather[0].id;
              }
            }
          });

          //push the last entry
          summaryForecastData.push(forecast);
          console.log("summaryForecastData is ", summaryForecastData);
          renderForecastData(summaryForecastData);
        })
        .fail(function(error) {
          console.log("error is ", error);
        })
        .always(function() {
          console.log("complete");
        });
    };

    getCurrentWeather();
    getForecast();
  }

  return {
    init: function init(){
      console.log("main init");
      cacheDOMSelectors();
      console.log("weatherApp is ", weatherApp);
      findUserWithGeolocation();
      setCurrentDate();
      populateWeatherInformation("New York, NY");

      var statesArr = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
        'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
        'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
        'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
        'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
        'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
        'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
        'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
      ];

      var data = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: statesArr//weatherApp.cities
      });

      $typeahead.typeahead({
          minLength: 1,
          highlight: true,
          classNames: {
            //input:"",
            //hint: "typeaheadHint",
            //menu: "",
            //dataset:"",
            //suggestion:"",
            //empty:"",
            //open:"",
            //cursor:"",
            //highlight:""
          }},
        {
          name: 'cityData',
          source: data,
          async: true
        }
      );

      $weatherRetriever.addEventListener('click', function(){

        populateWeatherInformation();
      });
    }
  };

})();


window.addEventListener('DOMContentLoaded', function(){
  main.init();
});

