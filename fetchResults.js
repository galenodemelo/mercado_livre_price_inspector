const apiUrl = 'https://api.mercadolibre.com/sites/MLB/search?q={SEARCH_TERM}&sort=price_asc';
var searchResults = [];

// Gets user input on submit the form
function getUserInput() {
    let userInput = document.querySelector('#ean-list').value;

    return userInput;
}

// Split and sanitize the input
function splitAndSanitizeUserInput(userInput) {
    let splittedUserInput = userInput.split(/[\n,]/);
    let sanitizedUserInput = splittedUserInput.map(searchTerm => {
        return searchTerm.trim();
    });

    return sanitizedUserInput;
}

// Create multiples promises based on the multiples API requests
function getSearchResults(searchTerms) {
    const searchPromises = [];
    searchResults = [];
    searchTerms.map(searchTerm => {
        if (searchTerm.trim().length) {
            searchPromises.push(doAjaxRequest(searchTerm));
        }
    });
    
    return searchPromises;
}

// Send the request to Mercado Livre API
function doAjaxRequest(searchTerm) {
    return new Promise(resolve => {
        let ajax = new XMLHttpRequest();
        let ajaxUrl = encodeURI(apiUrl.replace('{SEARCH_TERM}', searchTerm));

        ajax.open('GET', ajaxUrl, true);
        // ajax.setRequestHeader();
        ajax.send();
        ajax.onload = () => {
            if (ajax.readyState == 4 && ajax.status == 200) {
                let ajaxJsonResponse = JSON.parse(ajax.responseText);
                searchResults.push(ajaxJsonResponse);
                
                resolve(true);
            } else {
                resolve(false);
            }
        }
    });
}

// Filter only "new" products (to improve)
function getOnlyNewProducts() {
    let ads = [];
    searchResults.forEach((searchItem, index) => {
        ads.push({
            query: '',
            title: '',
            thumb: '',
            lowestPrice: 0.00,
            meanPrice: 0.00,
            numberSellers: 0,
            totalSold: 0,
            ads: []
        });
        ads[index].ads = searchItem.results;
        ads[index].query = searchItem.query;
    });

    return ads;
}

// Summarize data
function summarizeResults(organizedAdsData) {
    organizedAdsData.map(item => {
        let adsList = item.ads;

        if (adsList.length > 0) {
            item.title = getSummaryTitle(adsList) + ' - ' + item.query;
            item.thumb = getSummaryThumb(adsList);
            item.lowestPrice = getSummaryLowestPrice(adsList);
            item.meanPrice = getSummaryMeanPrice(adsList);
            item.numberSellers = getSummaryNumberSellers(adsList);
            item.totalSold = getSummaryTotalSold(adsList);
        }

        return item;
    });

    return organizedAdsData;

    function getSummaryTitle(adsList) {
        return adsList[0].title.trim();
    }

    function getSummaryThumb(adsList) {
        return adsList[0].thumbnail;
    }

    function getSummaryLowestPrice(adsList) {
        return adsList[0].price;
    }

    function getSummaryMeanPrice(adsList) {
        let totalPrice = 0;
        adsList.forEach(ad => {
            totalPrice += ad.price;
        });

        return totalPrice / getSummaryNumberSellers(adsList);
    }

    function getSummaryNumberSellers(adsList) {
        return adsList.length;
    }

    function getSummaryTotalSold(adsList) {
        let totalSold = 0;
        adsList.forEach(ad => {
            totalSold += ad.sold_quantity;
        });

        return totalSold;
    }
}