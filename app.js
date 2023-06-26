require('dotenv').config();
const express = require("express");
const https = require('node:https');
const bodyParser = require("body-parser");
const _ = require("lodash");

const app= express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');
app.get("/",function(req,res){
     res.render("display");
});
app.post("/",function(req,res){
    const query=req.body.cityName;
    const apiKey = process.env.API_KEY;
    console.log(apiKey);
    const units= "metric";
    const url ="https://api.openweathermap.org/data/2.5/weather?q="+query+"&appid="+apiKey+"&units="+units;
    https.get(url, function(response){ //http get rqst your server --> someone's server
        //console.log(response.statusCode); check status code
        response.on("data",function(data){
            const weatherData = JSON.parse(data); //turn json in hex/string into js object
            console.log(weatherData);
            const temp = weatherData.main.temp;
            const desc = weatherData.weather[0].description
            const icon = weatherData.weather[0].icon
            const pressure = weatherData.main.pressure;
            const humidity = weatherData.main.humidity;
            const imgURL = "https://openweathermap.org/img/wn/"+icon+"@2x.png"
           const description = _.startCase(desc);
           const weatherCondition = weatherData.weather[0].main.toLowerCase();
    let weatherClass = "weather-default";

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
            res.render("weather",{temp,description,imgURL,query,pressure,humidity,weatherClass});
        })
    })
});
app.listen(process.env.PORT || 3000,function(){
console.log("Server started on port 3000");
});