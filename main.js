// ==UserScript==
// @name       QuadrigaCX Trading Fee Tool
// @namespace  http://github.com/lifeofcows/
// @version    0.1
// @description  Calculates the sale price after QuadrigaCX's fees
// @match      https://www.quadrigacx.com/trade*
// @copyright  2017+, hibbard.eu
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

//Check Trading Fees here: http://support.quadrigacx.com/support/solutions/articles/9000124313-do-you-charge-trading-fees-
$(document).ready(function() {
    function processSaleText() {
        var addedText = "(Receive:" + $('#sell-total').text().replace('Total:', '').split("(")[0] + ")";
        var originalNumStr = numFromString(sellVal);
        var addedNumStr = numFromString(addedText);
        var afterFeesTotal = subtractFees(parseFloat(originalNumStr)); //perform calculations using the original price total
        afterFeesTotal = addCommas(afterFeesTotal); //add commas
        addedNumStr = addCommas(addedNumStr);
        addedText = addedText.replace(addedNumStr, afterFeesTotal); //add old value with calculated value
        sellVal = sellVal.split("(")[0] + addedText;
        $('#sell-total').html($('#sell-total').html().split("<br>")[0] + "<br/>" + addedText);
    }

    function processBuyText() {
        var addedText = "(Receive:" + $('#buy-total').text().replace('Total:', '').split("(")[0] + ")";
        var originalNumStr = numFromString(buyVal);
        var addedNumStr = numFromString(addedText);
        var afterFeesTotal = subtractFees(parseFloat(originalNumStr)); //perform calculations using the original price total
        var cryptoVal = getCryptoVal(afterFeesTotal);
        if (getTradeCurrency() != "ΞTH/XɃT") {
            addedNumStr = addCommas(addedNumStr);
        }
        addedText = addedText.replace(addedNumStr, cryptoVal).replace(getConversionFrom(), "").replace("$",""); //add old value with calculated value
        buyVal = buyVal.split("(")[0] + addedText;
        $('#buy-total').html($('#buy-total').html().split("<br>")[0] + "<br/>" + addedText);
    }

    function getConversionFrom() {
        return getTradeCurrency().split("/")[1];
    }

    function getCryptoVal(amount) {
        var total = (amount/parseFloat($('#buy-rate').val())).toFixed(8); //convert to the cryptocurrency
        var currency = getTradeCurrency().split("/")[0];
        return total.toString() + currency;
    }

    function addCommas(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function numFromString(str) {
        return str.replace(/,/g, '').match(/(\+|-)?((\d+(\.\d+)?)|(\.\d+))/)[0];
    }

    function getTradeCurrency() {
        return $('#selector').text().trim();
    }

    function getFee() {
        var currency = getTradeCurrency();
        var halfPercentFeeList = ["XɃT/USD", "XɃT/CAD", "ΞTH/CAD", "ŁTC/CAD", "BCH/CAD"];
        var fifthPercentFeeList = ["ΞTH/XɃT"];
        var fee = 0;
        if (halfPercentFeeList.indexOf(currency) > -1) {
            fee = 0.005;
        }
        else if (fifthPercentFeeList.indexOf(currency) > -1) {
            fee = 0.002;
        }
        return fee;
    }

    function subtractFees(num) {
        var total = num*(1 - getFee());
        return total.toFixed(2); //round to 2 decimal places
    }

    function getDashboardCurrency(text) {
        var currencyList = ["XɃT", "ΞTH", "ŁTC", "CAD", "USD"];
        for (var i = 0; i < currencyList.length; i++) {
            if (text.indexOf(currencyList[i]) != -1) {
                return currencyList[i];
            }
        }
        return null;
    }

    function getDashboardValue(text, currency) {
        return text.split(currency)[1] + currency;
    }

    function InputChangeListener()
    {
        if($('#sell-total').text() != sellVal)
        {
            sellVal = $('#sell-total').text();
            processSaleText();
        }
        if($('#buy-total').text() != buyVal)
        {
            buyVal = $('#buy-total').text();
            processBuyText();
        }
    }

    $('#sell-total').append("<br>(Receive:", $('#sell-total').text().replace('Total:', ''), ")");
    $('#buy-total').append("<br>(Receive:", $('#buy-total').text().replace('Total:', ''), ")");
    var sellVal;
    var buyVal;
    var dropdown = '<select><option value="cad">CAD</option><option value="usd">USD</option><option value="btc">XɃT</option><option value="eth">ΞTH</option><option value="ltc">ŁTC</option></select>';
    $(".nav.navbar-nav").find(".dropdown").last().append(dropdown);
    var currencyArr = $(".nav.navbar-nav").find(".dropdown").each(function( index ) {
        var section = $(this).find('.balance');
        var originalText = section.text();
        var dashboardCur = getDashboardCurrency(originalText);
        if (dashboardCur !== null) {
            var dashboardValue = getDashboardValue(originalText, dashboardCur);
            $(this).find('.dropdown-toggle').append("<br>" + dashboardValue);
        }
    });

    setInterval(InputChangeListener, 300);
});