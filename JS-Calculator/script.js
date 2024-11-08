let displayValue = "";

function appendToDisplay(value) {
    displayValue += value;
    document.getElementById("display").value = displayValue;
}

function clearDisplay() {
    displayValue = "";
    document.getElementById("display").value = displayValue;
}

function calculateResult() {
    try {
        displayValue = eval(displayValue).toString();
        document.getElementById("display").value = displayValue;
    } catch (error) {
        document.getElementById("display").value = "Error";
    }
}
function deleteLastCharacter() {
    displayValue = displayValue.slice(0, -1); 
    document.getElementById("display").value = displayValue;
}
function toggleSign() {
    if (displayValue.charAt(0) === '-') {
        displayValue = displayValue.slice(1);
    } else {
        displayValue = '-' + displayValue;
    }
    document.getElementById("display").value = displayValue;
}
