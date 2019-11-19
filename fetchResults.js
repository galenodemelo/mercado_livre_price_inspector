// Endpoints from Mercado Livre's API
const apiUrls = {
    fetchItem: 'https://api.mercadolibre.com/items/{SEARCH_TERM}/',
    questionsItem: 'https://api.mercadolibre.com/questions/search?item={SEARCH_TERM}',
    reviewsItem: 'https://api.mercadolibre.com/reviews/item/{SEARCH_TERM}/',
    searchItems: 'https://api.mercadolibre.com/sites/MLB/search?q={SEARCH_TERM}&sort=price_asc&sortId=price_asc',
    sellerData: 'https://api.mercadolibre.com/users/{SEARCH_TERM}',
    visitsItem: 'https://api.mercadolibre.com/visits/items?ids={SEARCH_TERM}'
};

// Gets user input on submit the form
function getUserInput() {
    const userInput = document.querySelector('#ean-list').value;

    return userInput;
}

// Split and sanitize the input
function splitAndSanitizeUserInput(userInput) {
    let splittedUserInput = userInput.split(/[\n,]/);
    const sanitizedUserInput = splittedUserInput.map(searchTerm => {
        return searchTerm.trim();
    });

    return sanitizedUserInput;
}

// Send the request to Mercado Livre API
function doAjaxRequest(endpoint, searchTerm) {
    const ajaxUrl = encodeURI(endpoint.replace('{SEARCH_TERM}', searchTerm));

    return new Promise(resolve => {
        const ajax = new XMLHttpRequest();

        ajax.open('GET', ajaxUrl, true);
        // ajax.setRequestHeader();
        ajax.send();
        ajax.onload = () => {
            if (ajax.readyState == 4 && ajax.status == 200) {
                const ajaxJsonResponse = JSON.parse(ajax.responseText);

                resolve(ajaxJsonResponse);
            } else {
                resolve(false);
            }
        }
    });
}

// Create multiples promises based on the multiples API requests
function getSearchResults(searchTerm) {
    const searchPromise = doAjaxRequest(apiUrls.searchItems, searchTerm);
    
    return searchPromise;
}

// Filter only "new" products (to improve)
function getOnlyNewProducts(searchResults) {
    return searchResults.results.filter(item => {
        return (typeof item.condition != 'undefined' && item.condition == 'new');
    });
}

// Compile the ads IDs
function getAdsIdList(adsList) {
    let adsIdList = [];
    adsList.forEach(ad => {
        adsIdList.push(ad.id);
    });
    return adsIdList;
}

// Get ad number of visits
function getAdNumberVisits(searchTerm) {
    const searchPromise = doAjaxRequest(apiUrls.visitsItem, searchTerm);
    
    return searchPromise;
}

// Passes the visits values to the array
function passesAdNumberVisits(adsList, adsNumberOfVisits) {
    return adsList.map(ad =>  {
        let itemId = ad.id;
        ad.number_visits = adsNumberOfVisits[itemId];

        return ad;
    });
}

// Get additional data from the ads
function getAdMetadata(adsList) {
    let promiseList = [];
    adsList.forEach(ad => {
        const promiseMetadata = doAjaxRequest(apiUrls.fetchItem, ad.id);
        promiseList.push(promiseMetadata);
    });
    
    return promiseList;
}

// Passes the additional data to the array
function passesAdMetadata(adsList, adsMetadata) {
    return adsList.map((ad, index) =>  {
        ad.creation_date = adsMetadata[index].date_created;
        ad.health = adsMetadata[index].health;
        ad.initial_stock = adsMetadata[index].initial_quantity;

        return ad;
    });
}

// Get seller data (one by one)
function getAdSellerData(adsList) {
    let promiseList = [];
    adsList.forEach(ad => {
        const promiseSellerData = doAjaxRequest(apiUrls.sellerData, ad.seller.id);
        promiseList.push(promiseSellerData);
    });

    return promiseList;
}

// Passes the seller data to the array
function passesAdSellerData(adsList, sellerList) {
    return adsList.map((ad, index) =>  {
        ad.seller.name = sellerList[index].nickname;
        ad.seller.url = sellerList[index].permalink;
        ad.seller.registration_date = sellerList[index].registration_date;
        ad.seller.statistics = {
            reputation: sellerList[index].seller_reputation.level_id,
            points: sellerList[index].points,
            transactions: sellerList[index].seller_reputation.transactions.completed,
            ratings: sellerList[index].seller_reputation.transactions.ratings
        };

        return ad;
    });
}

// Summarize data
function getSummary(adsList, searchTerm) {
    return {
        title: getSummaryTitle(adsList) + ' - ' + searchTerm,
        thumb: getSummaryThumb(adsList),
        earliestCreationDate: getEarliestCreationDate(adsList),
        lowestPrice: getSummaryLowestPrice(adsList),
        meanPrice: getSummaryMeanPrice(adsList),
        highestPrice: getSummaryHighestPrice(adsList),
        standardDeviation: getSummaryStandardDeviation(adsList),
        numberSellers: getSummaryNumberSellers(adsList),
        totalSold: getSummaryTotalSold(adsList)
    };

    function getSummaryTitle(adsList) {
        return adsList[0].title.trim();
    }

    function getSummaryThumb(adsList) {
        return adsList[0].thumbnail;
    }

    function getEarliestCreationDate(adsList) {
        let earliestCreationDate = adsList[0].creation_date;

        adsList.forEach(ad => {
            if (ad.creation_date < earliestCreationDate) {
                earliestCreationDate = ad.creation_date;
            }
        });

        return earliestCreationDate;
    }

    function getSummaryLowestPrice(adsList) {
        let lowestPrice = adsList[0].price;

        for (let ad of adsList) {
            if (ad.price < lowestPrice) {
                lowestPrice = ad.price;
            }
        }

        return lowestPrice.toFixed(2);
    }

    function getSummaryHighestPrice(adsList) {
        let highestPrice = 0;

        adsList.forEach(ad => {
            if (ad.price > highestPrice) {
                highestPrice = ad.price;
            }
        });

        return highestPrice.toFixed(2);
    }

    function getSummaryVariance(adsList) {
        let summation = 0.00;
        const mean = getSummaryMeanPrice(adsList);

        adsList.forEach(ad => {
            summation += Math.pow(ad.price - mean, 2);
        });

        const variance = summation / adsList.length;
        
        return variance.toFixed(2);
    }

    function getSummaryStandardDeviation(adsList) {
        const variance = getSummaryVariance(adsList);
        const standardDeviation = Math.sqrt(variance);

        return standardDeviation.toFixed(2);
    }

    function getSummaryMeanPrice(adsList) {
        let totalPrice = 0;
        adsList.forEach(ad => {
            totalPrice += ad.price;
        });

        const meanPrice = totalPrice / getSummaryNumberSellers(adsList);

        return meanPrice.toFixed(2);
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