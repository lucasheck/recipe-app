const ulFavMeals = document.getElementById("ul-favorite-meals");
const divRandomMeal = document.getElementById("random-meal");
const divSearchMeals = document.getElementById("search-meals");
const divFavMeals = document.getElementById("fav-meals");
const pNoFavMeals = document.getElementById("no-fav-meals");

/* events listener */

document.getElementById("btn-search").addEventListener("click", () => {
	validateMealName();
});

document.getElementById("search-box").addEventListener("keypress", (event) => {
	if (event.key === "Enter") {
		validateMealName();
	}
});

/* end event listener */

function validateMealName() {
	let mealName = document.getElementById("search-box");
	if (mealName.value.length < 3)
		alert("Meal name must have at least 3 character.");
	else searchMealByName(mealName.value);
}

async function searchMealByName(mealName) {
	const data = await fetch(
		`https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`
	);
	const dataMeal = await data.json();
	const meals = dataMeal.meals;
	let meal = document.createElement("div");
	let ids = "";
	meals.forEach((e) => {
		ids += e.idMeal + ",";
	});
	meal.innerHTML = `<p>${ids}</p>`;
	divSearchMeals.appendChild(meal);
}

function loadFavoriteMeals() {
	const mealIds = getMealsFromLocalStorage();
	if (mealIds.length > 0) pNoFavMeals.style.display = "none";
	/* todo -- colocar msg de nenhuma refeição favorita até então */
	mealIds.forEach((id) => {
		addFavoriteMeal(id);
	});
}

async function addFavoriteMeal(mealId) {
	const data = await fetch(
		`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
	);

	const meal = await data.json();
	const mealData = meal.meals[0];

	let favMeal = document.createElement("li");
	favMeal.id = mealData.idMeal;
	favMeal.innerHTML = `
		<img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
		<i class="fas fa-xmark" id="btn-remove-favorite-meal"></i>
		<span>${mealData.strMeal}</span>
	`;

	/* prettier-ignore */
	favMeal.querySelector("#btn-remove-favorite-meal").addEventListener("click", () => {
		let liFavMeal = document.getElementById(mealData.idMeal);
		ulFavMeals.removeChild(liFavMeal);
		removeMealFromLocalStorage(mealData.idMeal);
	});

	ulFavMeals.appendChild(favMeal);
}

async function getRandomMeal() {
	const data = await fetch(
		"https://www.themealdb.com/api/json/v1/1/random.php"
	);
	const randomMeal = await data.json();
	const randomMealData = randomMeal.meals[0];

	let meal = document.createElement("div");
	meal.innerHTML = `
		<div class="meal-header">
					<span class="random-meal-label">Recipe of the Day</span>
					<img
						src="${randomMealData.strMealThumb}"
						alt="${randomMealData.strMeal}"
					/>
				</div>
				<div class="meal-body">
					<i id="btn-favorite-meal" class="far fa-heart"></i>
					<h4 class="random-meal-title">
						<a id="random-meal-title"> ${randomMealData.strMeal} </a>
					</h4>
					<div class="random-meal-desc">
						<h5>Category:</h5>
						<h6>${randomMealData.strCategory}</h6>
						<h5>Area:</h5>
						<h6>${randomMealData.strArea}</h6>
					</div>
				</div>
				<button class="btn-more-info" id="btn-more-info">
					More Info
				</button>
				<div class="random-meal-info" id="random-meal-info">
					<i class="fas fa-close" id="btn-close-info"></i>
					<h4>Description:</h4>
					<span>${randomMealData.strInstructions.replaceAll("\r\n", "<br/>")}</span>
				</div>
		`;

	/* prettier-ignore */
	meal.querySelector("#random-meal-title").addEventListener("click", () => {
		toggleMoreInfo();
	});

	/* prettier-ignore */
	meal.querySelector("#btn-more-info").addEventListener("click", () => {
		toggleMoreInfo();
	});

	/* prettier-ignore */
	meal.querySelector("#btn-close-info").addEventListener("click", () => {
		toggleMoreInfo();
	});

	/* prettier-ignore */
	meal.querySelector("#btn-favorite-meal").addEventListener("click", () => {
		toggleFavoriteMeal(randomMealData.idMeal, randomMealData.strMeal, randomMealData.strMealThumb)
	});

	divRandomMeal.appendChild(meal);
}

function toggleFavoriteMeal(idMeal, strMeal, strMealThumb) {
	let elFavoriteMeal = document.getElementById("btn-favorite-meal");

	if (elFavoriteMeal.classList.contains("far")) {
		/* change to solid heart */
		elFavoriteMeal.classList.replace("far", "fas");
		/* add favMeal to list*/
		let meal = document.createElement("li");
		meal.id = idMeal;
		meal.innerHTML = `
			<img src="${strMealThumb}" alt="${strMeal}"/>
			<i class="fas fa-xmark" id="btn-remove-favorite-meal"></i>
			<span>${strMeal}</span>
		`;

		/* prettier-ignore*/
		meal.querySelector("#btn-remove-favorite-meal").addEventListener("click", () => {
			toggleFavoriteMeal(idMeal);
		});
		addMealToLocalStorage(idMeal);
		ulFavMeals.appendChild(meal);
	} else {
		/* remove solid heart */
		elFavoriteMeal.classList.replace("fas", "far");
		/* remove the favMeal and from localStorage */
		let liFavMeal = document.getElementById(idMeal);
		ulFavMeals.removeChild(liFavMeal);
		removeMealFromLocalStorage(idMeal);
	}
}

function toggleMoreInfo() {
	let elMealInfo = document.getElementById("random-meal-info");
	elMealInfo.classList.toggle("opacity");
}

function addMealToLocalStorage(idMeal) {
	const mealIds = getMealsFromLocalStorage();

	localStorage.setItem("mealIds", JSON.stringify([...mealIds, idMeal]));

	pNoFavMeals.style.display = "none";
}

function removeMealFromLocalStorage(idMeal) {
	const mealIds = getMealsFromLocalStorage();
	if (mealIds.length === 1) pNoFavMeals.style.display = "inherit";
	/* prettier-ignore */
	localStorage.setItem("mealIds", JSON.stringify(mealIds.filter((id) => id != idMeal)));
}

function getMealsFromLocalStorage() {
	const mealIds = JSON.parse(localStorage.getItem("mealIds"));

	return mealIds === null ? [] : mealIds;
}

getRandomMeal();
loadFavoriteMeals();
