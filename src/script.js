let supplierSupply = []; //Podaż dostawcy
let supplierPurchase_price = []; //Cena zakupu dostawcy

let customerDemand = []; //Popyt odbiorcy
let customerSelling_price = [] //Cena sprzedaży

let transportCost = []; //Macierz kosztów transportu
let unitProfit = [[],[]]; //Macierz zysków jednostkowych



function getData(){
    supplierSupply = [$('#supply_D1').val(), $('#supply_D2').val()];
    supplierPurchase_price = [$('#purchase_price_D1').val(), $('#purchase_price_D2').val()];

    customerDemand = [$('#demand_O1').val(), $('#demand_O2').val(), $('#demand_O3').val(), $('#demand_O4').val()];
    customerSelling_price = [$('#selling_price_O1').val(), $('#selling_price_O2').val(), $('#selling_price_O3').val(), $('#selling_price_O4').val()];

    let temp = [];
    $('.shipping_cost').each(function(){
        temp.push($(this).val());
    });

    transportCost = [ //Macierz kosztów transportu
        [temp[0], temp[1],temp[2], temp[3]],
        [temp[4], temp[5],temp[6], temp[7]],
    ];
}

function countUnitProfit(){ //Obliczanie zysku jednostkowego (1 wynik)
    for(let i = 0; i < 2; i++){
        for(let l = 0; l < 4; l++){
            unitProfit[i][l] = customerSelling_price[l] - transportCost[i][l] - supplierPurchase_price[i]; //Macierz zysków jednostkowych
            $('#result1_table_'+(i+1)+'_'+(l+1)).text(unitProfit[i][l]); //Wypisywanie danych do html
        }
    }

    $('#result1_header, #result1_table').show(); //Pokazywanie dotychczas ukrytej 1 tabeli z wynikami
}

$(document).ready(function(){ //Główna funkcja, tutaj piszemy kod
    $('#count').click(function (){
        if ($("#main_form")[0].checkValidity()){ //Jeśli formularz jest w pełni wypełniony
            getData(); //Pozyskiwanie danych do zmiennych
            countUnitProfit(); //Wynik 1
        }
    })
})