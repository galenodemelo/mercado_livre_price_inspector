var modules = {
    adList: ''
};

function displayResults(summary, adsList, query) {
    // Loads the module if it hasn't been loaded yet
    if (modules.adList.length == 0) {
        getModule('module-ad-item.html?' + Math.random(), 'adList').then(() => {
            displayResults(summary, adsList);
        });

    } else {
        // Checks if it's empty
        let itemHtml = '';
        if (adsList.length == 0) {
            itemHtml = prepareHtmlNotFound(query);
        } else {
            const moduleHtmlWithSummary = prepareHtmlSummary(summary);
            const adsListHtml = prepareHtmlAdsList(adsList);

            itemHtml = moduleHtmlWithSummary.replace('{adList}', adsListHtml);
        }
        
        addItem(itemHtml);
    }

    return;
}

async function getModule(module, objectName) {
    return new Promise(resolve => {
        let ajax = new XMLHttpRequest();
        ajax.open('GET', module, true);
        ajax.send();
        
        ajax.onload = function() {
            if (ajax.readyState == 4 && ajax.status == 200) {
                resolve(ajax.response);
            } else {
                resolve(false);
            }
        }
    }).then(result => {
        modules[objectName] = result;
    });
}

function prepareHtmlNotFound(query) {
    return '<div class="result-item"><h3 align="center">' + query + ' não encontrado :(</h3></div>';
}

function prepareHtmlSummary(summary) {
    let moduleHtml = modules.adList;
    const summaryHtml = moduleHtml.replace('{thumb}', summary.thumb)
                                  .replace('{title}', summary.title)
                                  .replace('{lowestPrice}', convertToBrazilianNumber(summary.lowestPrice, true))
                                  .replace('{highestPrice}', convertToBrazilianNumber(summary.highestPrice, true))
                                  .replace('{meanPrice}', convertToBrazilianNumber(summary.meanPrice, true))
                                  .replace('{standardDeviation}', convertToBrazilianNumber(summary.standardDeviation, true))
                                  .replace('{numberSellers}', summary.numberSellers)
                                  .replace('{earliestCreationDate}', convertToDate(summary.earliestCreationDate));
    return summaryHtml;
}

function prepareHtmlAdsList(adsList) {
    let adList = '';
    adsList.forEach(ad => {
        const adLink = ad.permalink;
        const title = ad.title;
        const sellerLink = ad.seller.url;
        const sellerName = ad.seller.name;
        const price = convertToBrazilianNumber(ad.price, true);
        const installments = getInstallments(ad.installments);
        const soldQuantity = getSoldQuantity(ad.sold_quantity);
        const stock = getStock(ad.available_quantity);
        const numberVisits = convertToBrazilianNumber(ad.number_visits, false);
        const freeShipping = ad.shipping.free_shipping ? 'Sim' : 'Não';
        const sellerAddress = ad.address.city_name + ' (' + ad.address.state_id.replace('BR-', '') + ')';
        const sellerReputation = getSellerReputation(ad.seller);
        const creationDate = convertToDate(ad.creation_date);

        adList += '<tr>' +
                    '<td>' + 
                        '<a href="' + adLink + '" target="_blank">' +
                            title +
                        '</a>' +
                    '</td>' +
                    '<td align="right">' + price + '</td>' +
                    '<td>' + 
                        '<a href="' + sellerLink + '" target="_blank">' +
                            sellerName +
                        '</a>' +
                    '</td>' +
                    '<td>' + sellerReputation + '</td>' +
                    '<td align="right">' + installments + '</td>' +
                    '<td align="right">' + soldQuantity + '</td>' +
                    '<td align="right">' + stock + '</td>' +
                    '<td align="right">' + numberVisits + '</td>' +
                    '<td align="right">' + freeShipping + '</td>' +
                    '<td>' + sellerAddress + '</td>' +
                    '<td align="right">' + creationDate + '</td>' +
                '</tr>';
    });

    return adList;
}

function getInstallments(installments) {
    let installmentsHtml = installments.quantity + '<br><small>({rates})</small>';
    let rate = '';

    // Check if there are rates
    if (installments.rate > 0) {
        rate = convertToBrazilianNumber(installments.rate, true) + '%';
    } else {
        rate = 'sem juros';
    }
    
    return installmentsHtml.replace('{rates}', rate)
}

// Verify the ranges of soldQuantity
function getSoldQuantity(soldQuantity) {
    switch (soldQuantity) {
        case 5:
            return '5 ~ 25';
            break;
        case 25:
            return '25 ~ 50';
            break;
        case 50:
            return '50 ~ 100';
            break;
        case 100:
            return '100 ~ 150';
            break;
        case 150:
            return '150 ~ 200';
            break;
        case 200:
            return '200 ~ 250';
            break;
        case 250:
            return '250 ~ 500';
            break;
        case 500:
            return '500 ~ 5.000';
            break;
        case 5000:
            return '5000 ~ 50.000';
            break;
        case 50000:
            return '+50.000';
            break;
        default:
            return soldQuantity;
    }
}

function getStock(stock) {

    switch (stock) {
        case 1:
            return '1 ~ 50';
            break;
        case 50:
            return '50 ~ 100';
            break;
        case 100:
            return '100 ~ 150';
            break;
        case 150:
            return '150 ~ 200';
            break;
        case 200:
            return '200 ~ 250';
            break;
        case 250:
            return '250 ~ 500';
            break;
        case 500:
            return '500 ~ 5.000';
            break;
        case 5000:
            return '5000 ~ 50.000';
            break;
        case 50000:
            return '+50.000';
            break;
        default:
            return stock;
    }
}

function getSellerReputation(sellerData) {
    let sellerReputationHtml = '<small>👍 {POSITIVE_RATING}</small>&nbsp;' + 
                               '<small>👎 {NEGATIVE_RATING}</small>' +
                               '<div style="margin-bottom: 5px; width: 100%; height: 10px; background-color: {COLOR_RATING};"></div>';
    
    let colorRating = '';
    const reputation = (typeof sellerData.statistics == 'undefined' ? '' : sellerData.statistics.reputation);
    switch (reputation) {
        case '1_red':
            colorRating = 'red';
            break;
        case '2_orange':
            colorRating = 'orange';
            break;
        case '3_yellow':
            colorRating = 'yellow';
            break;
        case '4_light_green':
            colorRating = 'greenyellow';
            break;
        case '5_green':
            colorRating = '#00a650';
            break;
        default:
            colorRating = 'lightgray';
            break;
    }

    const positiveRating = (sellerData.statistics.ratings.positive * 100).toFixed(0) + '%';
    const negativeRating = (sellerData.statistics.ratings.negative * 100).toFixed(0) + '%';

    return sellerReputationHtml.replace('{COLOR_RATING}', colorRating)
                               .replace('{POSITIVE_RATING}', positiveRating)
                               .replace('{NEGATIVE_RATING}', negativeRating);
}

function addItem(item) {
    document.querySelector('#results').innerHTML += item;

    return;
}

function scrollDown(target) {
    const scrollTo = document.querySelector(target).offsetTop - 50;

    document.querySelector('html').scrollTop = scrollTo;

    return;
}

function convertToBrazilianNumber(n, isFloat) {
    return isFloat ? n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2})
                   : n.toLocaleString('pt-BR');
}

function convertToDate(timestamp) {
    let date = new Date(timestamp);

    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
}