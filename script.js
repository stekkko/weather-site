const API_KEY = "785ed4f210142854757ac62846e64d5d"
const BASE_URL = "https://api.openweathermap.org/data/2.5"
const DEFAULT_CITY = "Москва"

function loadForecastByName(city, onSuccess) {
    const url = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
    return loadForecastByUrl(url, onSuccess)
}

function loadForecastById(cityId, onSuccess) {
    const url = `${BASE_URL}/weather?id=${cityId}&appid=${API_KEY}&units=metric`
    return loadForecastByUrl(url, onSuccess)
}

function loadForecastByCoords(lat, lon, onSuccess) {
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    return loadForecastByUrl(url, onSuccess)
}

function loadForecastByUrl(url, onSuccess) {
    const request = new XMLHttpRequest()
    request.open('GET', url)
    request.onload = function() {
        onSuccess(JSON.parse(request.response), request.status)
    }
    request.onerror = function() {
        onSuccess(null, 123)
    }
    request.send(null)
}

function convertWind(wind) {
    const speed = `${wind.speed} м/с`
    if (wind.deg > 337.5) return `N ${speed}`
    if (wind.deg> 292.5) return `NW ${speed}`
    if (wind.deg > 247.5) return `W ${speed}`
    if (wind.deg > 202.5) return `SW ${speed}`
    if (wind.deg > 157.5) return `S ${speed}`
    if (wind.deg> 122.5) return `SE ${speed}`
    if (wind.deg > 67.5) return `E ${speed}`
    if (wind.deg > 22.5) return `NE ${speed}`
    return `N ${speed}`
}

function createFavoriteCity() {
    let list = document.querySelector('.favorites')

    let newFavorite = tempCity.content.cloneNode(true).childNodes[1]
    list.appendChild(newFavorite)
    return newFavorite
}

function fillFavoriteCity(weatherState, newFavoriteCity){
    let cityId = weatherState.id
	newFavoriteCity.id = cityId
	newFavoriteCity.getElementsByClassName("delete")[0].addEventListener("click", function(){
		    document.getElementsByClassName("favorites")[0].removeChild(newFavoriteCity)
		    removeCityFromStorage(cityId)
	    }
    )
	newFavoriteCity.querySelector('h3').textContent = weatherState.name
	newFavoriteCity.querySelector('.temperature').textContent = Math.round(weatherState.main.temp) + "°C"
	newFavoriteCity.querySelector('.wind .normal').textContent = convertWind(weatherState.wind)
	newFavoriteCity.querySelector('.cloud .normal').textContent = weatherState.clouds.all + "%"
	newFavoriteCity.querySelector('.pressure .normal').textContent = weatherState.main.pressure + " hPa"
	newFavoriteCity.querySelector('.humidity .normal').textContent = weatherState.main.humidity + "%"
	newFavoriteCity.querySelector('.cords .normal').textContent = `[${weatherState.coord.lat}, ${weatherState.coord.lon}]`
	
	newFavoriteCity.querySelector('img').src = `https://openweathermap.org/img/wn/${weatherState.weather[0].icon}.png`
}


function fillMainCity(weatherState){
	let mainCity = document.getElementsByClassName("yourCity")[0]

	mainCity.querySelector('h2').textContent = weatherState.name
	mainCity.querySelector('.temperature').textContent = Math.round(weatherState.main.temp) + "°C"
	mainCity.querySelector('.wind .normal').textContent = convertWind(weatherState.wind)
	mainCity.querySelector('.cloud .normal').textContent = weatherState.clouds.all + "%"
	mainCity.querySelector('.pressure .normal').textContent = weatherState.main.pressure + " hPa"
	mainCity.querySelector('.humidity .normal').textContent = weatherState.main.humidity + "%"
	mainCity.querySelector('.cords .normal').textContent = `[${weatherState.coord.lat}, ${weatherState.coord.lon}]`
	
	mainCity.querySelector('img').src = `https://openweathermap.org/img/wn/${weatherState.weather[0].icon}@4x.png`
}


function getCitiesFromStorage(){
	if (localStorage.favorites === undefined || localStorage.favorites === ""){
		return []
	}
	return JSON.parse(localStorage.favorites)
}

function saveCitiesToStorage(cities){
	localStorage.setItem("favorites", JSON.stringify(cities))
}

function addCityToStorage(city){
	cities = getCitiesFromStorage()
	cities.push(city)
	saveCitiesToStorage(cities)
}

function removeCityFromStorage(city){
	cities = getCitiesFromStorage()
	index = cities.indexOf(city)
	cities.splice(index, 1)
	saveCitiesToStorage(cities)
}

function addCity(city){
	if (city.trim() === ""){
		return
	}
	var newFavoriteCity = createFavoriteCity()
	loadForecastByName(city, (cityResponse, status) => {
		if(status != 200){
				document.getElementsByClassName("favorites")[0].removeChild(newFavoriteCity)
				alert("Ошибка: такого годора не существует!")
				return
			}
		if (getCitiesFromStorage().includes(cityResponse.id)) {
			document.getElementsByClassName("favorites")[0].removeChild(newFavoriteCity)
			alert(`${city} уже добавлен в избранные`)
		} else {
			fillFavoriteCity(cityResponse, newFavoriteCity)
			addCityToStorage(cityResponse.id)
		}
	})
}

function resetMainCity(){
	let mainCity = document.getElementsByClassName("yourCity")[0]
	let cityName = mainCity.querySelector('h2').textContent
	mainCity.querySelector('h2').textContent = "Данные загружаются"
	mainCity.querySelector('.temperature').textContent = ""
	mainCity.querySelector('.wind .normal').textContent = "..."
	mainCity.querySelector('.cloud .normal').textContent = "..."
	mainCity.querySelector('.pressure .normal').textContent = "..."
	mainCity.querySelector('.humidity .normal').textContent = "..."
	mainCity.querySelector('.cords .normal').textContent = "..."
	mainCity.querySelector('img').src = `./images/loading.gif`

	loadForecastByName(cityName, cityResponse => {
		fillMainCity(cityResponse)
	})
}

function updateLocation(){
	navigator.geolocation.getCurrentPosition(
		pos => {
			loadForecastByCoords(pos.coords.latitude, pos.coords.longitude, cityResponse => {
				fillMainCity(cityResponse)
			})	
		},
		pos => {
			loadForecastByName(DEFAULT_CITY, cityResponse => {
				fillMainCity(cityResponse)
			})
		}
	)
}

function updateFavorites() {
    let cities = getCitiesFromStorage()
    console.log(cities)
	for (var cityId of cities){
		let newFavoriteCity = createFavoriteCity()
		loadForecastById(cityId, cityResponse => {
			fillFavoriteCity(cityResponse, newFavoriteCity)
		})
	}
}

window.onload = function(){ 
	document.getElementsByClassName("add_form")[0].addEventListener('submit', event => {
        event.preventDefault()
    })

	document.getElementsByClassName("add_button")[0].addEventListener("click", function(){
		addCity(document.getElementsByClassName("search_city")[0].value)
		document.getElementsByClassName("search_city")[0].value = ""
	})

	updateLocation()
	
	document.getElementsByClassName("update_btn")[0].addEventListener("click", function(){
		resetMainCity()
	})
	
    updateFavorites()
}

window.addEventListener('offline', function() {
	alert("Соединение потеряно. Перезагрузите страницу")
	document.getElementsByClassName("add_button")[0].disabled = true
	document.getElementsByClassName("update_btn")[0].disabled = true
})