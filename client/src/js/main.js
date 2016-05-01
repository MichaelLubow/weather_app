var main = (function(){

  var APP_ID = "6d9001586931106485b0a3b14315adc6";
  var unit = "imperial"; //or metric
  var $typeahead = null;
  var $weatherRetriever = null;

  function cacheDOMSelectors(){
    $typeahead = $('.typeahead');
    $weatherRetriever = $('.weatherRetriever');
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
    var $currentConditions = document.querySelector('.currentConditions');
    var $date = $currentConditions.querySelector('.date');
    console.log("$date is ", $date);

    var formatDate = function(date){
      var monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];

      var days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ];

      var ordinalIndicatorArr = ['st', 'nd', 'rd', 'th'];

      var dayOfWeekIndex = date.getDay();
      var dayOfWeek = days[dayOfWeekIndex];
      var day = date.getDate();

      var lastDigit = (day + "").substr(-1, 1);

      var ordinalIndicator = null;
      if(lastDigit === "1"){
        ordinalIndicator = ordinalIndicatorArr[0];
      }
      else if(lastDigit === "2"){
        ordinalIndicator = ordinalIndicatorArr[1];
      }
      else if(lastDigit === "3"){
        ordinalIndicator = ordinalIndicatorArr[2];
      }
      else{
        ordinalIndicator = ordinalIndicatorArr[3];
      }
      var monthIndex = date.getMonth();
      return dayOfWeek + " " + monthNames[monthIndex] + ", " + day + ordinalIndicator;
    };

    var date = formatDate(new Date());
    console.log("date is ", date);
    $date.innerHTML = date;
  }

  function populateWeatherInformation(location){
    var url = "http://api.openweathermap.org/data/2.5/weather?q=" + location + "&units=" + unit + "&APPID=" + APP_ID;
    $.ajax({
        type: 'POST',
        url: url,
        cache: false,
        contentType: false,
        processData: false
      })
      .done(function(data) {
        console.log("success data is ", data);
      })
      .fail(function(error) {
        console.log("error is ", error);
      })
      .always(function() {
        console.log("complete");
      });
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

      $weatherRetriever.on('click', function(){

      });
    }
  };

})();

$(function(){
  main.init();
});