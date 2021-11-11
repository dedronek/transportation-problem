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

let optimalLoop = [];

function getData() {
    supplierSupply = [$('#supply_D1').val(), $('#supply_D2').val()];
    supplierPurchase_price = [$('#purchase_price_D1').val(), $('#purchase_price_D2').val()];

    customerDemand = [$('#demand_O1').val(), $('#demand_O2').val(), $('#demand_O3').val(), $('#demand_O4').val()];
    customerSelling_price = [$('#selling_price_O1').val(), $('#selling_price_O2').val(), $('#selling_price_O3').val(), $('#selling_price_O4').val()];

    cumulateSupply = supplierSupply.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    cumulateDemand = customerDemand.reduce((a, b) => parseInt(a) + parseInt(b), 0);

    cumulateSupply != cumulateDemand? demandMet = 1 : demandMet = 0; // 1 -> niezbilansowane, 0 -> zbilansowane

    if(demandMet == 1){
        supplierSupply.push(cumulateDemand);
        customerDemand.push(cumulateSupply);
    }

    let temp = [];
    $('.shipping_cost').each(function () {
        temp.push($(this).val());
    });

    transportCost = [ //Macierz kosztów transportu
        [temp[0], temp[1], temp[2], temp[3]],
        [temp[4], temp[5], temp[6], temp[7]],
    ];
}

function countUnitProfit() { //Obliczanie zysku jednostkowego (1 wynik)
    for (let i = 0; i < 2+demandMet; i++) {
        if(i == 2) unitProfit[i] = [];
        for (let l = 0; l < 4+demandMet; l++) {
            if(i == 2 || l == 4) unitProfit[i][l] = 0;
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

    for (let i = 0; i < 2+demandMet; i++) {
        for (let l = 0; l < 4+demandMet; l++) {
            if(i < 2 && l == 4 || i ==2){
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

    for (let i = 0; i < 2+demandMet; i++) { //Wypisywanie danych do tabeli optymalnych przewozów
        for (let l = 0; l < 4+demandMet; l++) {
            $('#result2_table_' + (i + 1) + '_' + (l + 1)).text(baseTransport[i][l]);//podmiana wartosci w result2
        }
    }
    if(demandMet == 1) $('.fictional').show();
    $('#result2_header, #result2_table').show(); //wyswietlanie
}


function countAlphaBetaDelta() { //obliczenie alpha, beta, delta
    //console.log('Liczymy delty')
    optimalLoop = [];
    alpha = [];
    beta = [];

    //Liczenie alphy
    for (let i = 0; i < 2+demandMet; i++) {
        for (let l = 3+demandMet; l >= 0; l--) {
            if(baseTransport[i][l] != null){
                i == 2 || l == 4 ? alpha[i] = 0 : alpha[i] = unitProfit[i][l]; //Przypisywanie wartości alphy
                $('#alpha_' + (i + 1)).text(alpha[i]);
                break;
            }
        }
    }

    //Liczenie bety
    for (let l = 3+demandMet; l >= 0; l--) {
        for (let i = 0; i < 2+demandMet; i++) {
            if(baseTransport[i][l] != null) {
                beta[l] =  unitProfit[i][l] - alpha[i];
                $('#beta_' + (l + 1)).text(beta[l]);
                break;
            }
        }
    }

    let higestDeltaVal = 0;

    //Liczenie delty
    for (let i = 0; i < 2+demandMet; i++) {
        delta[i] = [];
        for (let l = 0; l < 4+demandMet; l++) {
            delta[i][l] = 'x';
            if(baseTransport[i][l] == null){
                delta[i][l] = unitProfit[i][l] - alpha[i] - beta[l];

                if(higestDeltaVal < delta[i][l]){
                    optimalLoop[0] = [i, l];
                    higestDeltaVal = delta[i][l];
                }
            }
        }
    }
    console.log('delta: ');
    console.log(delta)
    if(higestDeltaVal > 0) checkOptimalisationLoop();
}


function checkOptimalisationLoop() {  //Sprawdzenie możliwości optymalizacji
    //console.log('Sprawdzamy możliwość optymalizacji')

    let candidateXRow = [];
    let candidateXColumn = [];

    //Searching X in row where our highest value in Delta is
    for(let l = 0; l < 4+demandMet; l++) {
        if(delta[optimalLoop[0][0]][l] == 'x'){
            candidateXRow.push([optimalLoop[0][0], l]);
        }
    }

    //Searching X in column where our highest value in Delta is
    for(let i = 0; i  < 2+demandMet; i++) {
        if(delta[i][optimalLoop[0][1]] == 'x'){
            candidateXColumn.push([i, optimalLoop[0][1]]);
        }
    }

    candidateXRow.forEach(function(row){
        candidateXColumn.forEach(function(column){
            if(delta[column[0]][row[1]] == 'x'){
                optimalLoop.push(row);
                optimalLoop.push([column[0],row[1]]);
                optimalLoop.push(column);
                return;
            }
        })
    })
    console.log('optimalLoop: ')
    console.log(optimalLoop)
    console.log('baseTransport przed optymalizacją: ')
    console.log(baseTransport)
    setTimeout(function (){
        applyOptimalisation();
    }, 2000)

}


function applyOptimalisation(){ //Zastosowanie optymalizacji
    let optimalLoopMin = Number.MAX_SAFE_INTEGER;

    //Searching for minimum from baseTransport
    optimalLoop.forEach(function(item){
        if(baseTransport[item[0]][item[1]] < optimalLoopMin && baseTransport[item[0]][item[1]] != '' || baseTransport[item[0]][item[1]] != 'x'){
            optimalLoopMin = baseTransport[item[0]][item[1]];
        }
    })


    //Changing values for baseTransport
    optimalLoop.forEach(function(item, index){
        if(!baseTransport[item[0]][item[1]] || baseTransport[item[0]][item[1]] == 'x') baseTransport[item[0]][item[1]] = 0; //Jeżeli jest pusta wartość lub X, zmień na 0 aby nie było problemu z typowaniem

        if(index % 2 == 0) baseTransport[item[0]][item[1]] += parseInt(optimalLoopMin);
        else baseTransport[item[0]][item[1]] -= parseInt(optimalLoopMin);
    })

    setTimeout(function (){
        console.log('baseTransport po optymalizacji: ')
        console.log(baseTransport)
    })


    for (let i = 0; i < 2+demandMet; i++) { //Wypisywanie danych do tabeli optymalnych przewozów
        for (let l = 0; l < 4+demandMet; l++) {
            $('#result2_table_' + (i + 1) + '_' + (l + 1)).text(baseTransport[i][l]);//podmiana wartosci w result2
            if(baseTransport[i][l] == 0){
                $('#result2_table_' + (i + 1) + '_' + (l + 1)).text('x');//podmiana wartosci w result2
            }
        }
    }

    countAlphaBetaDelta();
}

$(document).ready(function () { //Główna funkcja, tutaj piszemy kod
    $('#count').click(function () {
        if ($("#main_form")[0].checkValidity()) { //Jeśli formularz jest w pełni wypełniony
            $('#result1_header, #result1_table, #result2_header, #result2_table, .fictional').hide(); //wyswietlanie
            getData(); //Pozyskiwanie danych do zmiennych
            countUnitProfit(); //Wynik 1
            sortUnitProfit(); //Sortowanie od tras najbardziej zyskownych
            calculateBaseTransportTable(); //Obliczanie trasy bazowej i jej wyswietlenie (Wynik 1,5)
            countAlphaBetaDelta(); //Obliczenie alpha, beta, delta
        }
    })
})




