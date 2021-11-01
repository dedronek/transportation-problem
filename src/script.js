let supplierSupply = []; //Podaż dostawcy
let supplierPurchase_price = []; //Cena zakupu dostawcy

let customerDemand = []; //Popyt odbiorcy
let customerSelling_price = [] //Cena sprzedaży

let transportCost = []; //Macierz kosztów transportu
let unitProfit = [[], []]; //Macierz zysków jednostkowych
let sortedUnitProfit = []; //Posortowana tablica zyskow jednostowych

let baseTransport = [[], []]; //Tabela trasy bazowej


function getData() {
    supplierSupply = [$('#supply_D1').val(), $('#supply_D2').val()];
    supplierPurchase_price = [$('#purchase_price_D1').val(), $('#purchase_price_D2').val()];

    customerDemand = [$('#demand_O1').val(), $('#demand_O2').val(), $('#demand_O3').val(), $('#demand_O4').val()];
    customerSelling_price = [$('#selling_price_O1').val(), $('#selling_price_O2').val(), $('#selling_price_O3').val(), $('#selling_price_O4').val()];

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
    for (let i = 0; i < 2; i++) {
        for (let l = 0; l < 4; l++) {
            unitProfit[i][l] = customerSelling_price[l] - transportCost[i][l] - supplierPurchase_price[i]; //Macierz zysków jednostkowych
            $('#result1_table_' + (i + 1) + '_' + (l + 1)).text(unitProfit[i][l]); //Wypisywanie danych do html
        }
    }
    $('#result1_header, #result1_table').show(); //Pokazywanie dotychczas ukrytej 1 tabeli z wynikami
}

function sortUnitProfit() { // konwertowanie tabeli zysk -> zysk, wiersz, kolumna wraz z sortowaniem malejaco od zysku
    let counter = 0;
    for (let i = 0; i < 2; i++) {
        for (let l = 0; l < 4; l++) {
            sortedUnitProfit[counter] = [];
            sortedUnitProfit[counter][0] = unitProfit[i][l]; //zysk jednostkowy w pojedynczej komorce
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
}

function calculateBaseTransportTable() { //obliczenie tabeli transportow bazowych
    // na ten moment jest to zrobione dla zbilansowanego zagadnienia (popyt=podaz)
    // x - odbiorcy (customers) - lewo praww
    // y - dostawcy (suppliers) - gora dol

    let customersWithTransport = []; //tablica na obsluzonych odbiorcow (bez popytu)
    let suppliersWithTransport = []; //tablica na obsluzonych dostawcow (bez podazy)

    for (let i = 0; i < 8; i++) { //iterujemy po posortowanej tabeli tras najbardziej zyskownych

        //mozna by to nazwa row i col, nie byloby zdziwienia ze jest na odwrot przy uzyciu

        let y = sortedUnitProfit[i][1];  //wybor dostawcy
        let x = sortedUnitProfit[i][2];  //wybor odbiorcy

        console.log(y + ", " + x + " - " + supplierSupply[y] + ", " + customerDemand[x]);

        if (customersWithTransport.includes(x) || suppliersWithTransport.includes(y)) {
            //jesli w danej komorce nie ma popytu lub podazy, skipujemy
            console.log("Klient obsluzony, skipping...");
            continue;
        }

        if (supplierSupply[y] >= customerDemand[x]) {
            //sytuacja gdy mozemy spelnic w calosci zapotrzebowanie
            console.log("Zapasy wieksze lub rowne niz zapotrzebowanie")
            baseTransport[y][x] = customerDemand[x]; //w to miejsce wieziemy tyle ile popyt
            supplierSupply[y] = supplierSupply[y] - customerDemand[x]; //zmniejszamy ilosc na stanie (podaz)
            customerDemand[x] = 0; //zaspokojony popyt, nie wiem czy potrzebne?
            customersWithTransport.push(x) //ten klient juz nie potrzebuje ("iksy" w tej kolumnie)
            if (supplierSupply[y] == 0) //jesli przy tej akcji skonczyly sie zapasy, to dostawca tez na liste
                suppliersWithTransport.push(y);
        } else {
            //nie mozemy sprostac calemu zapotrzebowaniu
            console.log("Zapasy mniejsze niz zapotrzebowanie")
            baseTransport[y][x] = supplierSupply[y]; //dajemy tyle ile ma dostwca
            customerDemand[x] = customerDemand[x] - supplierSupply[y]; //tutaj zeby sie nie zminusowalo
            supplierSupply[y] = 0; //nie wiem czy potrzebne
            suppliersWithTransport.push(y);
            if (customersWithTransport[x] == 0) //to tez nie wiem czy potrzebne
                customersWithTransport.push(x);
        }
    }


    for (let i = 0; i < 2; i++) { //wincyj pentli, WINCYJ
        for (let l = 0; l < 4; l++) {
            $('#result2_table_' + (i + 1) + '_' + (l + 1)).text(baseTransport[i][l]);//podmiana wartosci w result2
        }
    }
    $('#result2_header, #result2_table').show(); //wyswietlanie
}

$(document).ready(function () { //Główna funkcja, tutaj piszemy kod
    $('#count').click(function () {
        if ($("#main_form")[0].checkValidity()) { //Jeśli formularz jest w pełni wypełniony
            getData(); //Pozyskiwanie danych do zmiennych
            countUnitProfit(); //Wynik 1
            sortUnitProfit(); //Sortowanie od tras najbardziej zyskownych
            calculateBaseTransportTable(); //obliczanie trasy bazowej i jej wyswietlenie (Wynik 1,5)
        }
    })
})