function displayResults(results) {
    let adListHtml = '';
    getModule('module-ad-item.html', 'adList').then(() => {
        results.forEach(item => {
            adListHtml += prepareHtml(item);
        });

        document.querySelector('#results').innerHTML = adListHtml;
    });
}

var modules = {};
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

function prepareHtml(item) {
    if (item.ads.length == 0) {
        return '<div class="result-item"><h3 align="center">' + item.query + ' não encontrado</h3></div>';
    } else {
        let itemHtml = modules.adList;
        itemHtml = itemHtml.replace('{thumb}', item.thumb)
                           .replace('{title}', item.title)
                           .replace('{lowestPrice}', item.lowestPrice.toFixed(2))
                           .replace('{meanPrice}', item.meanPrice.toFixed(2))
                           .replace('{numberSellers}', item.numberSellers)
                           .replace('{totalSold}', item.totalSold);

        let adList = '';
        item.ads.forEach(ad => {
            adList += '<tr>' +
                        '<td>${ad.title}</td>' +
                        '<td>${ad.price.toFixed(2)}</td>' +
                        '<td>${ad.installments.quantity}</td>' +
                        '<td>${ad.sold_quantity}</td>' +
                        '<td>' + (ad.shipping.free_shipping ? 'Sim' : 'Não') + '</td>' +
                        '<td>' + ad.seller_address.city.name + ' (' + ad.seller_address.state.id.replace('BR-', '') + ')</td>' +
                        '<td>' + ad.seller.power_seller_status + '</td>' +
                     '</tr>';
        });
        itemHtml = itemHtml.replace('{adList}', adList);

        return itemHtml;
    }
}