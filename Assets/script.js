var containerCurrent = document.querySelector("#currentCity");
var containerForecast = document.querySelector("#forecastInfo");
var containerPriorSearches = document.querySelector("#priorSearches");
var btn = document.querySelector("#btn-search");
var urlImgPath = 'https://openweathermap.org/img/wn/';

var localStoreCity = JSON.parse(localStorage.getItem('cities')) || [];

var weatherCondition = [];

function start() {
    displayPriorSearches();
}

var displayPriorSearches = () => {

    clearContentsEl(containerPriorSearches);

        if(localStoreCity){
            var ulElement = document.createElement("ul");
            ulElement.classList.add("list-unstyled");
            ulElement.classList.add("w-100");
            
            for(var i = 0; i < localStoreCity.length; i++){
                
                var liElement = document.createElement("li");
                liElement.innerHTML = "<button type='button' class='list-group-item list-group-item-action bg-secondary text-white' attr='"+localStoreCity[i]+"'>" + localStoreCity[i] + "</button>";
                ulElement.appendChild(liElement);
                }

                containerPriorSearches.appendChild(ulElement); 
            }
};

$(document).on("click", ".list-group-item", (event) => {
    event.preventDefault();
    var city = $(this).attr("attr");
    callApiFetch(city);
});

var clearContentsEl = (element) => {
    element.innerHTML = "";
};

var converTemp = (temp) => {
    return (Math.floor((parseFloat(temp) -32) * (5/9))).toString();
};

var convertWSpeed = (speed) => {
    return (Math.floor(parseFloat(speed) * 1.609)).toString();
};



var weatherHTML = (city) => {


    clearContentsEl(containerCurrent);
    clearContentsEl(containerForecast); 

    // repopulates with Current City 
    var contain1 = document.createElement("div"); 
    contain1.classList.add("col-6");
    var contain2 = document.createElement("div");
    contain2.classList.add("col-6");

    var cityEl = document.createElement("h2");
    var imageCurrent = document.createElement("img");

    cityEl.textContent = city + " (" + weatherCondition[0].datetime+")";
    imageCurrent.setAttribute("src", weatherCondition[0].icon);
    imageCurrent.classList.add("border");
    imageCurrent.classList.add("bg-info");
    contain1.appendChild(cityEl);
    contain2.appendChild(imageCurrent);
    var contain3  = document.createElement("div");
    contain3.classList.add("col-12");
    contain3.innerHTML = "<p>Temperature: " + weatherCondition[0].temp + " F</p>" + 
                        "<p>Wind Speed: " + weatherCondition[0].speed + " MPH</p>" +
                        "<p>Humidity: " + weatherCondition[0].humidity + "%</p>";
                        
    containerCurrent.appendChild(contain1);
    containerCurrent.appendChild(contain2);
    containerCurrent.appendChild(contain3);

    // 5 DAY FORECAST

    var contain6 = document.createElement("div");
    contain6.classList.add("row");
    var contain7 = document.createElement("div");
    contain7.classList.add("col-12");
    contain7.innerHTML = "<h2>5-Day Forecast:</h2>";
    contain6.appendChild(contain7);
    containerForecast.appendChild(contain6);

    var contain8 = document.createElement("div");
    contain8.classList.add("d-flex");                     


    for(var i=1; i<weatherCondition.length; i++){    
        
        var contain4  = document.createElement("div");
        contain4.classList.add("card");
        contain4.classList.add("bg-secondary");
        contain4.classList.add("text-white");
        contain4.classList.add("mr-2");
        contain4.classList.add("flex-fill");
        var contain5  = document.createElement("div");
        contain5.classList.add("card-body");
        var title = document.createElement("h6");
        title.classList.add("card-title");
        var imageForecast = document.createElement("img");
        title.textContent = weatherCondition[i].dateT;
        imageForecast.setAttribute("src", weatherCondition[i].icon);
        var pEl1 = document.createElement("p");
        var pEl2 = document.createElement("p");
        var pEl3 = document.createElement("p");
        pEl1.classList.add("small");
        pEl1.textContent = "Temperature: " + weatherCondition[i].temp + " °F";
        pEl2.classList.add("small");
        pEl2.textContent = "Wind: " + weatherCondition[i].temp + " MPH";
        pEl3.classList.add("small");
        pEl3.textContent = "Humidity: " + weatherCondition[i].humidity + "%";
        contain5.appendChild(title);
        contain5.appendChild(imageForecast);
        contain5.appendChild(pEl1);
        contain5.appendChild(pEl2);
        contain5.appendChild(pEl3);
        contain4.appendChild(contain5);        
        contain8.appendChild(contain4);
    }
    containerForecast.appendChild(contain8);
    
};

// Store the city in localStore
var saveCity = (city) => {

    var flag = false
    if(localStoreCity){
        for(var i = 0; i < localStoreCity.length; i++){
            if(localStoreCity[i] === city){
                flag = true;
            }
        }
        if(flag){
            displayErrorMessage(city+" is already in your search results :)")
            //return
        }
    }
    if(!flag){
        localStoreCity.push(city);
        localStorage.setItem("cities",JSON.stringify(localStoreCity));
    }
    
    displayPriorSearches();
};

var dateTimeAtNoon = (str) => {
    var hour = str.split(" ")[1].split(":")[0];
    var flag = false;
    
    if(hour === "12"){
        flag = true;
    }        
    
    return flag;
};

var dateFormatted = (strDate) => {

    var newDate = strDate.split(" ")[0].split("-");

    return (newDate[1]+"/"+newDate[2]+"/"+newDate[0]);
};


var weatherDataObj = (list, position) => {

    // clear the array, set equal to empty array
    if(weatherCondition.length)
        weatherCondition = [];

    var obj = {
        datetime: dateFormatted(list[0].dt_txt),
        humidity : list[0].main.humidity,
        speed: list[0].wind.speed,
        temp: list[0].main.temp,
        icon : urlImgPath + list[0].weather[0].icon + ".png",
        lat : position.lat,
        lon: position.lon
    };

    weatherCondition.push(obj);

    for(var i=1; i<list.length; i++){

        if(dateTimeAtNoon(list[i].dt_txt)){
            obj = {
                datetime: dateFormatted(list[i].dt_txt),
                humidity : list[i].main.humidity,
                speed: list[i].wind.speed,
                temp: list[i].main.temp,
                icon : urlImgPath + list[i].weather[0].icon + ".png",
                lat : position.lat,
                lon: position.lon
            };
            weatherCondition.push(obj);
        }
    }

};

var displayErrorMessage = (msg) => {
    alert(msg);
};


var callApiFetch = (city) => {

    var url;
    if (location.protocol === 'http:') {
        url = 'http://api.openweathermap.org/data/2.5/forecast?q='+city+'&units=imperial&appid=d8cbf50d63cdf4dd27a523d369c92705';
     } else {
        url = 'https://api.openweathermap.org/data/2.5/forecast?q='+city+'&units=imperial&appid=d8cbf50d63cdf4dd27a523d369c92705';
     }

    fetch(url)

    .then((weatherResponse) => {
        return weatherResponse.json();
     })
    .then((weatherResponse) => {

        if (weatherResponse.cod != "200") {
            
            displayErrorMessage("Unable to find " + city + " in OpenWeathermap.org");

            return;
        } else {
                weatherDataObj(weatherResponse.list, weatherResponse.city.coord);
            }

            var url1;
        if (location.protocol === 'http:') {
            url1 = 'http://api.openweathermap.org/data/2.5/forecast?lat=' + weatherCondition[0].lat+'&lon='+weatherCondition[0].lon + 'appid=d8cbf50d63cdf4dd27a523d369c92705';
        } else {
            url1 = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + weatherCondition[0].lat+'&lon='+weatherCondition[0].lon + 'appid=d8cbf50d63cdf4dd27a523d369c92705';
        }

        //store the city in localStore
        saveCity(city);

        // generation the HTML for weather
        weatherHTML(city);
        });
};

var search = (event) => {
    event.preventDefault();

    var inputElement = document.querySelector("#searchCity");
    var textInput = inputElement.value.trim();

    if(inputElement.value === ""){
        alert("You must enter a City");
        return;
    }
    // if the value is a string 
    else{
        callApiFetch(textInput);
    }
};

start();

btn.addEventListener("click", search);

// Relied largeley on github.com/rogers0404/06-weather-dashboard for guidance on this JavaScript.  Check out that repo for 