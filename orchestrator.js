// Trigger and organize the steps
const form = document.querySelector('#ean-list-form');
form.addEventListener('submit', event => {
    event.preventDefault();

    // Trigger the steps
    let userInput = getUserInput();
    let splittedUserInput = splitAndSanitizeUserInput(userInput);
    let waitFetchApi = getSearchResults(splittedUserInput);
    Promise.all(waitFetchApi).then(() => {
        setTimeout(() => {
            let searchResultsOnlyNew = getOnlyNewProducts();
            let summarizedResults = summarizeResults(searchResultsOnlyNew);

            displayResults(summarizedResults);
        }, 100);
    });
});