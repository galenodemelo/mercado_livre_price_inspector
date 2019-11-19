// Trigger and organize the steps
const form = document.querySelector('#ean-list-form');
form.addEventListener('submit', event => {
    event.preventDefault();

    // Trigger the steps
    const userInput = getUserInput();
    const splittedUserInput = splitAndSanitizeUserInput(userInput);

    // For each search term, creates a new promise
    splittedUserInput.forEach(searchTerm => {
        getSearchResults(searchTerm).then(searchResults => {
            let searchResultsOnlyNew = getOnlyNewProducts(searchResults);

            /*
             * Fetches all the others needed endpoints to get more data
             */
            
            // (1) Number of visits
            const adsIdsList = getAdsIdList(searchResultsOnlyNew).join(','); // Compile all the IDs to make only one request
            const promiseNumberVisits = getAdNumberVisits(adsIdsList);
            promiseNumberVisits.then(adsListNumberVisits => {
                searchResultsOnlyNew = passesAdNumberVisits(searchResultsOnlyNew, adsListNumberVisits);
            });

            // (2) Additional item metadata (creation date, health)
            const promiseMetadata = getAdMetadata(searchResultsOnlyNew);
            Promise.all(promiseMetadata).then(adsListMetadata => {
                searchResultsOnlyNew = passesAdMetadata(searchResultsOnlyNew, adsListMetadata);
            });

            // (3) Seller data
            const promiseSellerData = getAdSellerData(searchResultsOnlyNew);
            Promise.all(promiseSellerData).then(adsListSellerData => {
                searchResultsOnlyNew = passesAdSellerData(searchResultsOnlyNew, adsListSellerData);
            });

            // After all the data is compiled
            const listOfPromisses = [promiseNumberVisits].concat(promiseMetadata).concat(promiseSellerData);
            Promise.all(listOfPromisses).then(() => {
                const summarizedResult = getSummary(searchResultsOnlyNew, searchTerm);

                // Display the results
                displayResults(summarizedResult, searchResultsOnlyNew, searchTerm);
            });
        });
    });
});