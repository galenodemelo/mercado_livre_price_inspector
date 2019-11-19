<!DOCTYPE html>
<html lang="pt-br">
    <head>
        <meta charset="utf-8">
        <title>Mercado Livre - Comparador de preços</title>

        <link rel="stylesheet" type="text/css" href="style.css?<?= time() ?>">
    </head>
    <body>
        <div class="wrap">
            <h1 align="center">Comparador de anúncios do Mercado Livre</h1>
            <p align="center">
                Digite os números EAN, separados por uma quebra de linha ou vírgula.
            </p>

            <form id="ean-list-form" action="" method="POST">
                <textarea rows="5" id="ean-list" placeholder="Cole aqui a lista de EANs">7896525098935
7896525085553
7896525098911
7896525098898</textarea>
                <button type="submit">Buscar informações</button>
            </form>
        </div>

        <h1 align="center" id="results-list">Resultados</h1>
        <div id="results"></div>
        
        <script src="fetchResults.js?<?= time() ?>"></script>
        <script src="displayResults.js?<?= time() ?>"></script>
        <script src="orchestrator.js?<?= time() ?>"></script>
    </body>
</html>