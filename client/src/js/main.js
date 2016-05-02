var main = (function(){

  var APP_ID = "6d9001586931106485b0a3b14315adc6";
  var unit = "imperial"; //or metric
  var $typeahead = null;
  var $imageContainer = null;
  var $weatherRetriever = null;
  var $currentConditions = null;
  var $forecast = null;
  var $geoLocationContainer = null;
  var $userGeolocation = null;
  var $locationName = null;

  function cacheDOMSelectors(){
    $typeahead = $('.typeahead');
    $imageContainer = document.querySelector('.imageContainer');
    $weatherRetriever = document.querySelector('.weatherRetriever');
    $currentConditions = document.querySelector('.currentConditions');
    $forecast = document.querySelector('.forecast');
    $geoLocationContainer = document.querySelector('.geoLocationContainer');
    $userGeolocation = document.querySelector('.userGeolocation');
    $locationName = document.querySelector('.locationName');
  }

  function findUserWithGeolocation(){
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        console.log("position is ", position);
        populateWeatherInformation({latitude: position.coords.latitude, longitude: position.coords.longitude});
      });
    }
    else {
      console.log("geolocation IS NOT available");
      populateWeatherInformation({cityName: "New York, NY"});
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
    var setBackgroundImage = function setBackgroundImage(weatherCode){
      switch(weatherCode){
        case 800:
        case 904:
        case 905:
        case 957:
          //clear
          $imageContainer.className = "imageContainer";
          $imageContainer.classList.add("clear");
          break;
        case 771:
        case 801:
        case 802:
        case 803:
        case 804:
          //cloudy
          $imageContainer.className = "imageContainer";
          $imageContainer.classList.add("cloudy");
          break;
        case 300:
        case 301:
        case 302:
        case 310:
        case 311:
        case 312:
        case 313:
        case 314:
        case 321:
        case 500:
        case 501:
        case 502:
        case 503:
        case 504:
        case 511:
        case 520:
        case 521:
        case 522:
        case 531:
        case 611:
        case 612:
        case 615:
        case 616:
        case 620:
        case 701:
        case 901:
        case 902:
          //rain
          $imageContainer.className = "imageContainer";
          $imageContainer.classList.add("rain");
          break;
        case 600:
        case 601:
        case 602:
        case 621:
        case 622:
        case 903:
        case 906:
          //snow
          $imageContainer.className = "imageContainer";
          $imageContainer.classList.add("snow");
          break;
        case 711:
        case 721:
        case 731:
        case 741:
        case 761:
        case 762:
        case 781:
        case 900:
          //fog
          $imageContainer.className = "imageContainer";
          $imageContainer.classList.add("fog");
          break;
        case 200:
        case 201:
        case 202:
        case 210:
        case 211:
        case 212:
        case 221:
        case 230:
        case 231:
        case 232:
          //thunderstorms
          $imageContainer.className = "imageContainer";
          $imageContainer.classList.add("thunderstorms");
          break;
        default:
          $imageContainer.className = "imageContainer";
          $imageContainer.classList.add("clear");
      }
    };
    var $temp = $currentConditions.querySelector(".temp");
    $temp.innerHTML = Math.round(data.main.temp);
    var $icon = $currentConditions.querySelector('.icon>i');
    $icon.className = "wi"; //reset the classes
    $icon.classList.add("wi-owm-" + data.weather[0].id);
    setBackgroundImage(data.weather[0].id);
  }

  function renderForecastData(data){
    var $dayForecastTemplate = document.getElementById('dayForecastTemplate');
    console.log($dayForecastTemplate.content);
    //remove previous results
    while ($forecast.firstChild) {
      $forecast.removeChild($forecast.firstChild);
    }
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
      var url = null;
      if(location.cityName) {
        url = "http://api.openweathermap.org/data/2.5/weather?q=" + location.cityName + "&units=" + unit + "&APPID=" + APP_ID;
      }
      else if(location.latitude && location.longitude){
        url = "http://api.openweathermap.org/data/2.5/weather?lat=" + location.latitude + "&lon=" + location.longitude +  "&units=" + unit + "&APPID=" + APP_ID;
      }
      else{
        throw {name: "LocationNotDefinedError", message: "You did not specify a valid location"};
      }
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
      var url = null;
      if(location.cityName) {
        url = "http://api.openweathermap.org/data/2.5/forecast?q=" + location.cityName + "&units=" + unit + "&APPID=" + APP_ID;
      }
      else if(location.latitude && location.longitude){
        url = "http://api.openweathermap.org/data/2.5/forecast?lat=" + location.latitude + "&lon=" + location.longitude +  "&units=" + unit + "&APPID=" + APP_ID;
      }
      else{
        throw {name: "LocationNotDefinedError", message: "You did not specify a valid location"};
      }
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

          //ensure we don't have more than 5 days
          if(summaryForecastData.length > 5){
            var count = summaryForecastData.length - 5;
            summaryForecastData.splice(4, count)
          }
          renderForecastData(summaryForecastData);
          $locationName.value = data.city.name + ", " + data.city.country;
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

  function typeaheadOnChange(){
    console.log("typeaheadOnChange");
  }

  function typeaheadOnSelect(){
    console.log("typeaheadOnSelect");
    console.log($locationName.value);
    populateWeatherInformation({cityName: $locationName.value});
  }

  function typeaheadOnAutoComplete(){
    console.log("typeaheadOnAutoComplete");
    console.log($locationName.value);
    $typeahead.typeahead('close');
    populateWeatherInformation({cityName: $locationName.value});
  }

  return {
    init: function init(){
      console.log("main init");
      cacheDOMSelectors();
      console.log("weatherApp is ", weatherApp);
      setCurrentDate();
      populateWeatherInformation({cityName: "New York, NY"});//Load New York by default initially

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
        local: weatherApp.cities
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
      ).on('typeahead:change', typeaheadOnChange)
        .on('typeahead:select', typeaheadOnSelect)
        .on('typeahead:autocomplete', typeaheadOnAutoComplete);

      $userGeolocation.addEventListener('click', function(){
        findUserWithGeolocation();
      });
      $userGeolocation.addEventListener('mouseover', function(e){
        e.currentTarget.classList.add("rubberBand");
        var $message = $geoLocationContainer.querySelector(".message");
        $message.classList.add('show');
      });
      $userGeolocation.addEventListener('mouseout', function(e){
        e.currentTarget.classList.remove("rubberBand");
        var $message = $geoLocationContainer.querySelector(".message");
        $message.classList.remove('show');
      });
      $weatherRetriever.addEventListener('click', function(){
        console.log($locationName.value);
        populateWeatherInformation({cityName: $locationName.value});
      });
      $locationName.addEventListener('keypress', function(e){
        if (e.which === 13) {
          document.querySelector('.tt-suggestion:first-child').click();
        }
      });
    }
  };
})();

window.addEventListener('DOMContentLoaded', function(){
  main.init();
});

