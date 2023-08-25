require('dotenv').config();
const express = require("express");
const https = require('node:https');
const bodyParser = require("body-parser");
const _ = require("lodash");
const axios = require("axios");

const app= express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');
app.get("/",function(req,res){
     res.render("display");
});
app.post("/",function(req,res){
  let weatherClass = "weather-default";
    const query=req.body.cityName.trim();
    console.log(query);
    const apiKey = process.env.API_KEY;
    const units= "metric";
    const urlNew = "https://api.openweathermap.org/data/2.5/forecast?q="+query+"&appid="+apiKey+"&units="+units;
    const url ="https://api.openweathermap.org/data/2.5/weather?q="+query+"&appid="+apiKey+"&units="+units;
    axios
    .all([axios.get(url),axios.get(urlNew)])
    .then((responses) => {
      const response1 = responses[0];
      const response2 = responses[1];
      console.log('Response from url:', response1.data);
      console.log('Response from urlNew:', response2.data);
   
            const weatherData = response1.data; 
            //console.log(weatherData);
           // console.log(response1.status);
            if(response1.status!==200){
              weatherClass = "weather-error"
              res.render("error",{weatherClass});
              return;
            }
            const forecastData = response2.data.list;
            console.log(forecastData);
            console.log('3-Hourly Forecast Data:', forecastData[0]);
            // Loop through the forecast data
            forecastData.forEach((forecast) => {
              // Extract date and time (dt_txt) from the forecast
              const dtTxt = forecast.dt_txt;
              // Parse the date and time (dt_txt) into separate components
              const [date, time] = dtTxt.split(' ');
              // Extract temperature and weather description
              const temperature = forecast.main.temp;
              const weatherDescription = forecast.weather[0].description;

              console.log('Date:', date);
              console.log('Time:', time);
              console.log('Temperature:', temperature);
              console.log('Weather Description:', weatherDescription);
            }); //forEach loop end
            const temp = weatherData.main.temp;
            const desc = weatherData.weather[0].description
            const icon = weatherData.weather[0].icon
            const pressure = weatherData.main.pressure;
            const humidity = weatherData.main.humidity;
            const imgURL = "https://openweathermap.org/img/wn/"+icon+"@2x.png"
           const description = _.startCase(desc);
           const weatherCondition = weatherData.weather[0].main.toLowerCase();
          const localTimestamp = weatherData.dt; // Local timestamp provided by OpenWeather API
          const localDate = new Date(localTimestamp*1000); // Convert local timestamp to milliseconds
          const dayOfMonth = localDate.getDate();
          //console.log(localDate,dayOfMonth);
    if (weatherCondition.includes("clear")) {
      weatherClass = "weather-sunny";
    } else if (weatherCondition.includes("cloud")) {
      weatherClass = "weather-cloudy";
    } else if (weatherCondition.includes("rain")) {
      weatherClass = "weather-rainy";
    } else if (weatherCondition.includes("snow")) {
      weatherClass = "weather-snowy";
    } else if (weatherCondition.includes("mist")) {
        weatherClass = "weather-mist";
    }else if (weatherCondition.includes("fog") || weatherCondition.includes("haze")  ) {
        weatherClass = "weather-foggy";
    }
            res.render("weather",{temp,description,imgURL,query,pressure,humidity,weatherClass,forecastData,dayOfMonth});
        })
        .catch((error) => {
          console.error('Error:', error);
          weatherClass = "weather-error";
          res.render("error", { weatherClass });
        });
      });
  
app.listen(process.env.PORT || 3000,function(){
console.log("Server started on port 3000");
});