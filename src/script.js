let supplierSupply = []; //Podaż dostawcy
let supplierPurchase_price = []; //Cena zakupu dostawcy

let customerDemand = []; //Popyt odbiorcy
let customerSelling_price = [] //Cena sprzedaży

let transportCost = []; //Macierz kosztów transportu
let unitProfit = [[], []]; //Macierz zysków jednostkowych
let sortedUnitProfit = []; //Posortowana tablica zyskow jednostowych

let baseTransport = [[], [], []]; //Tabela trasy bazowej

let cumulateSupply = 0;
let cumulateDemand = 0;
let demandMet = 0;

let alpha = [];
let beta = [];
let delta = [];
let positiveDeltas = [];

let optimalLoop = [];

let candidateXRow = [];
let candidateXColumn = [];

function getData() {
    supplierSupply = [$('#supply_D1').val(), $('#supply_D2').val()];
    supplierPurchase_price = [$('#purchase_price_D1').val(), $('#purchase_price_D2').val()];

    customerDemand = [$('#demand_O1').val(), $('#demand_O2').val(), $('#demand_O3').val(), $('#demand_O4').val()];
    customerSelling_price = [$('#selling_price_O1').val(), $('#selling_price_O2').val(), $('#selling_price_O3').val(), $('#selling_price_O4').val()];

    //string -> int

    customerSelling_price = customerSelling_price.map(function (x) {
        return parseInt(x, 10);
    });

    customerDemand = customerDemand.map(function (x) {
        return parseInt(x, 10);
    });

    supplierSupply = supplierSupply.map(function (x) {
        return parseInt(x, 10);
    });

    supplierPurchase_price = supplierPurchase_price.map(function (x) {
        return parseInt(x, 10);
    });

    cumulateSupply = supplierSupply.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    cumulateDemand = customerDemand.reduce((a, b) => parseInt(a) + parseInt(b), 0);

    cumulateSupply != cumulateDemand ? demandMet = 1 : demandMet = 0; // 1 -> niezbilansowane, 0 -> zbilansowane

    if (demandMet == 1) {
        supplierSupply.push(cumulateDemand);
        customerDemand.push(cumulateSupply);
    }

    let temp = [];
    $('.shipping_cost').each(function () {
        temp.push($(this).val());
    });

    temp = temp.map(function (x) {
        return parseInt(x, 10);
    });

    transportCost = [ //Macierz kosztów transportu
        [temp[0], temp[1], temp[2], temp[3]],
        [temp[4], temp[5], temp[6], temp[7]],
    ];
}

function countUnitProfit() { //Obliczanie zysku jednostkowego (1 wynik)
    for (let i = 0; i < 2 + demandMet; i++) {
        if (i == 2) unitProfit[i] = [];
        for (let l = 0; l < 4 + demandMet; l++) {
            if (i == 2 || l == 4) unitProfit[i][l] = 0;
            else unitProfit[i][l] = customerSelling_price[l] - transportCost[i][l] - supplierPurchase_price[i]; //Macierz zysków jednostkowych
            $('#result1_table_' + (i + 1) + '_' + (l + 1)).text(unitProfit[i][l]); //Wypisywanie danych do html
        }
    }
    //console.log(unitProfit);
    $('#result1_header, #result1_table').show(); //Pokazywanie dotychczas ukrytej 1 tabeli z wynikami
}

function sortUnitProfit() { // konwertowanie tabeli zysk -> zysk, wiersz, kolumna wraz z sortowaniem malejaco od zysku
    let counter = 0;
    let counterDemandMet = 0;
    let temp = [];

    for (let i = 0; i < 2 + demandMet; i++) {
        for (let l = 0; l < 4 + demandMet; l++) {
            if (i < 2 && l == 4 || i == 2) {
                temp[counterDemandMet] = [];
                temp[counterDemandMet][0] = 0; //zysk jednostkowy w pojedynczej komórce
                temp[counterDemandMet][1] = i; //wiersz (dostawca)
                temp[counterDemandMet][2] = l; //kolumna (odbiorca)
                counterDemandMet++;
                continue
            }

            sortedUnitProfit[counter] = [];
            sortedUnitProfit[counter][0] = unitProfit[i][l]; //zysk jednostkowy w pojedynczej komórce
            sortedUnitProfit[counter][1] = i; //wiersz (dostawca)
            sortedUnitProfit[counter][2] = l; //kolumna (odbiorca)
            counter++;
        }
    }
    //sortujemy nowa tablice od tras najbardziej zyskownych do tych najmniej
    sortedUnitProfit = sortedUnitProfit.sort(function (a, b) {
        return a[0] - b[0];
    }).reverse();
    sortedUnitProfit.map(Number);
    sortedUnitProfit = sortedUnitProfit.concat(temp);
}

function calculateBaseTransportTable() { //obliczenie tabeli transportow bazowych
    // na ten moment jest to zrobione dla zbilansowanego zagadnienia (popyt=podaz)
    // col - dostawcy (suppliers) - gora dol
    // row - odbiorcy (customers) - lewo prawo

    let customersWithTransport = []; //tablica na obsluzonych odbiorcow (bez popytu)
    let suppliersWithTransport = []; //tablica na obsluzonych dostawcow (bez podazy)

    for (let i = 0; i < sortedUnitProfit.length; i++) { //iterujemy po posortowanej tabeli tras najbardziej zyskownych

        //mozna by to nazwa row i col, nie byloby zdziwienia ze jest na odwrot przy uzyciu

        let col = sortedUnitProfit[i][1];  //wybor dostawcy
        let row = sortedUnitProfit[i][2];  //wybor odbiorcy

        if (customersWithTransport.includes(row) || suppliersWithTransport.includes(col)) {
            //jesli w danej komorce nie ma popytu lub podazy, skipujemy
            continue;
        }

        //sytuacja gdy mozemy spelnic w calosci zapotrzebowanie
        if (supplierSupply[col] >= customerDemand[row]) {
            //console.log("Zapasy wieksze lub rowne niz zapotrzebowanie")
            baseTransport[col][row] = customerDemand[row]; //w to miejsce wieziemy tyle ile popyt
            supplierSupply[col] = parseInt(supplierSupply[col]) - parseInt(customerDemand[row]); //zmniejszamy ilosc na stanie (podaz)
            customerDemand[row] = 0; //zaspokojony popyt, nie wiem czy potrzebne?
            customersWithTransport.push(row) //ten klient juz nie potrzebuje ("iksy" w tej kolumnie)
            if (supplierSupply[col] == 0) //jesli przy tej akcji skonczyly sie zapasy, to dostawca tez na liste
                suppliersWithTransport.push(col);
        } else {
            //nie mozemy sprostac calemu zapotrzebowaniu
            baseTransport[col][row] = supplierSupply[col]; //dajemy tyle ile ma dostwca
            customerDemand[row] = parseInt(customerDemand[row]) - parseInt(supplierSupply[col]); //tutaj zeby sie nie zminusowalo
            //$('.fictional').show(); //wyswietlanie fikcyjnego dostawcy i odbiorcy


            supplierSupply[col] = 0; //nie wiem czy potrzebne
            suppliersWithTransport.push(col);
            if (customersWithTransport[row] == 0) //to tez nie wiem czy potrzebne
                customersWithTransport.push(row);
        }

    }

    for (let i = 0; i < 2 + demandMet; i++) { //Wypisywanie danych do tabeli optymalnych przewozów
        for (let l = 0; l < 4 + demandMet; l++) {
            $('#result2_table_' + (i + 1) + '_' + (l + 1)).text(baseTransport[i][l]);//podmiana wartosci w result2
        }
    }
    if (demandMet == 1) $('.fictional').show();
    $('#result2_header, #result2_table').show(); //wyswietlanie
}


function countAlphaBetaDelta() { //obliczenie alpha, beta, delta
    //console.log('Liczymy delty')

    optimalLoop = [];

    console.log("Liczymy zmienne dualne z tabeli:")
    console.log(baseTransport);

    //Liczenie alphy
    for (let i = 0; i < 2 + demandMet; i++) {
        for (let l = 3 + demandMet; l >= 0; l--) {
            if (baseTransport[i][l] != null && baseTransport[i][l] != 0) {
                i == 2 || l == 4 ? alpha[i] = 0 : alpha[i] = unitProfit[i][l]; //Przypisywanie wartości alphy
                $('#alpha_' + (i + 1)).text(alpha[i]);
                console.log(i + "," + l + ": alfa " + alpha[i]);
                break;
            }
        }
    }

    //Liczenie bety
    for (let l = 3 + demandMet; l >= 0; l--) {
        for (let i = 0; i < 2 + demandMet; i++) {
            if (baseTransport[i][l] != null && baseTransport[i][l] != 0) {
                beta[l] = unitProfit[i][l] - alpha[i];
                $('#beta_' + (l + 1)).text(beta[l]);
                console.log(i + "," + l + ": beta " + beta[l]);
                break;
            }
        }
    }

    let highestDeltaValue = 0;

    //Liczenie delty
    for (let i = 0; i < 2 + demandMet; i++) {
        delta[i] = [];
        for (let l = 0; l < 4 + demandMet; l++) {
            delta[i][l] = 'x';
            if (baseTransport[i][l] == null || baseTransport[i][l] == 0 ) {
                delta[i][l] = unitProfit[i][l] - alpha[i] - beta[l];

                if (highestDeltaValue < delta[i][l]) {
                    //optimalLoop[0] = [i, l];
                    highestDeltaValue = delta[i][l];
                }
            }
        }
    }

    console.log("Tablica delt:")
    console.log(delta);
    findPositiveDeltas();
    console.log("Najwieksza delta: " + highestDeltaValue);

    if(highestDeltaValue > 0) {
        checkOptimalisationLoop()
    }
     else {
        console.log("Brak mozliwosci optymalizacji")
    }
}

function findPositiveDeltas() {

    positiveDeltas = [];
    let minDelta = 0;

    let counter = 0;

    for (let i = 0; i < 2 + demandMet; i++) {
        for (let l = 0; l < 4 + demandMet; l++) {
            if (delta[i][l] != 'x' && delta[i][l] > minDelta) {
                positiveDeltas[counter] = [];
                positiveDeltas[counter][0] = delta[i][l];
                positiveDeltas[counter][1] = i;
                positiveDeltas[counter][2] = l;
                minDelta = delta[i][l];
                counter++
                console.log(minDelta);
            }
        }
    }
    //sortowanie dodatnich delt od najwiekszej do najmniejszej
    positiveDeltas = positiveDeltas.sort(function (a) {
        return a;
    }).reverse();
    console.log("Dodatnie delty:");
    console.log(positiveDeltas);
}

function checkOptimalisationLoop() {  //Sprawdzenie możliwości optymalizacji

    console.log('Sprawdzanie optymalnej petli')

    candidateXRow = [];
    candidateXColumn = [];

    optimalLoop = [];

    let isLoopFounded = false

    positiveDeltas.forEach(function (row) {

        if (isLoopFounded == false) {
            optimalLoop[0] = [row[1], row[2]];
            console.log("Pierwszy element optymalnej trasy")
            console.log(optimalLoop[0]);

            //Searching X in row where our highest value in Delta is
            for (let l = 0; l < 4 + demandMet; l++) {
                if (delta[optimalLoop[0][0]][l] == 'x') {
                    candidateXRow.push([optimalLoop[0][0], l]);
                }
            }

            //Searching X in column where our highest value in Delta is
            for (let i = 0; i < 2 + demandMet; i++) {
                if (delta[i][optimalLoop[0][1]] == 'x') {
                    candidateXColumn.push([i, optimalLoop[0][1]]);
                }
            }

            candidateXRow.forEach(function (row) {
                candidateXColumn.forEach(function (column) {
                    if (delta[column[0]][row[1]] == 'x') {
                        optimalLoop.push(row);
                        optimalLoop.push([column[0], row[1]]);
                        optimalLoop.push(column);
                        return;
                    }
                })
            })

            if (optimalLoop.length == 4) {
                console.log("Kandydaci wiersz:")
                console.log(candidateXRow);
                console.log("Kandydaci kolumna:")
                console.log(candidateXColumn);
                console.log("Optymalna petla:")
                console.log(optimalLoop);
                isLoopFounded = true;
            } else {
                console.log("Brak optymalnej petli dla tej delty");
                optimalLoop = [];
                isLoopFounded = false;
            }
        }

    })
    if (isLoopFounded == true)
        applyOptimalisation();


}

function applyOptimalisation() { //Zastosowanie optymalizacji

    let optimalLoopMin = Number.MAX_SAFE_INTEGER;

    //Searching for minimum from baseTransport
    optimalLoop.forEach(function (item) {
        if (baseTransport[item[0]][item[1]] < optimalLoopMin && baseTransport[item[0]][item[1]] != '' || baseTransport[item[0]][item[1]] != 'x') {
            optimalLoopMin = baseTransport[item[0]][item[1]];
        }
    })


    //Changing values for baseTransport
    optimalLoop.forEach(function (item, index) {
        if (!baseTransport[item[0]][item[1]] || baseTransport[item[0]][item[1]] == 'x') baseTransport[item[0]][item[1]] = ''; //Jeżeli jest pusta wartość lub X, zmień na 0 aby nie było problemu z typowaniem

        if (index % 2 == 0) baseTransport[item[0]][item[1]] = parseInt(baseTransport[item[0]][item[1]] + optimalLoopMin);
        else baseTransport[item[0]][item[1]] = parseInt(baseTransport[item[0]][item[1]] - optimalLoopMin);
    })


    for (let i = 0; i < 2 + demandMet; i++) { //Wypisywanie danych do tabeli optymalnych przewozów
        for (let l = 0; l < 4 + demandMet; l++) {
            $('#result2_table_' + (i + 1) + '_' + (l + 1)).text(baseTransport[i][l]);//podmiana wartosci w result2
            if (baseTransport[i][l] == 0) {
                $('#result2_table_' + (i + 1) + '_' + (l + 1)).text('x');//podmiana wartosci w result2
            }
        }
    }

    console.log("Zoptymalizowano rozwiazanie");

    countAlphaBetaDelta();

}

function clearData() {
    supplierSupply = []; //Podaż dostawcy
    supplierPurchase_price = []; //Cena zakupu dostawcy

    customerDemand = []; //Popyt odbiorcy
    customerSelling_price = [] //Cena sprzedaży

    transportCost = []; //Macierz kosztów transportu
    unitProfit = [[], []]; //Macierz zysków jednostkowych
    sortedUnitProfit = []; //Posortowana tablica zyskow jednostowych

    baseTransport = [[], [], []]; //Tabela trasy bazowej

    cumulateSupply = 0;
    cumulateDemand = 0;
    demandMet = 0;

    alpha = [];
    beta = [];
    delta = [];

    optimalLoop = [];
}

$(document).ready(function () { //Główna funkcja, tutaj piszemy kod
    $('#count').click(function () {
        if ($("#main_form")[0].checkValidity()) { //Jeśli formularz jest w pełni wypełniony
            $('#result1_header, #result1_table, #result2_header, #result2_table, .fictional').hide(); //wyswietlanie

            clearData();

            getData(); //Pozyskiwanie danych do zmiennych
            countUnitProfit(); //Wynik 1
            sortUnitProfit(); //Sortowanie od tras najbardziej zyskownych
            calculateBaseTransportTable(); //Obliczanie trasy bazowej i jej wyswietlenie (Wynik 1,5)

            countAlphaBetaDelta();

            //countAlphaBetaDelta();
            // checkOptimalisationLoop();
            //applyOptimalisation();
            // console.log(delta);
            //checkOptimalisationLoop();
            //console.log(optimalLoop);
        }
    })
})