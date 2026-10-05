/* =========================================================
   CALCURA
   OASIS INFOBYTE - LEVEL 2 - TASK 1
   Calculator Logic
   ========================================================= */


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const calculationDisplay =
    document.getElementById("calculationDisplay");

const resultDisplay =
    document.getElementById("resultDisplay");

const displayStatus =
    document.getElementById("displayStatus");

const calculatorKeys =
    document.querySelector(".calculator-keys");

const themeButton =
    document.getElementById("themeButton");

const themeIcon =
    document.getElementById("themeIcon");

const historyButton =
    document.getElementById("historyButton");

const historyPanel =
    document.getElementById("historyPanel");

const historyClose =
    document.getElementById("historyClose");

const historyList =
    document.getElementById("historyList");

const historyCount =
    document.getElementById("historyCount");

const clearHistoryButton =
    document.getElementById("clearHistory");


/* =========================================================
   STATE
   ========================================================= */

let expression = "";

let justCalculated = false;

let history =
    JSON.parse(
        localStorage.getItem("calcuraHistory")
    ) || [];

const themes = [
    "glass",
    "dark",
    "light"
];


/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "0";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "Undefined";
    }

    return number.toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 10
        }
    );
}


/* =========================================================
   DISPLAY EXPRESSION
   ========================================================= */

function formatExpression(value) {

    if (!value) {
        return "";
    }

    return value;
}


/* =========================================================
   TOKENIZE EXPRESSION
   ========================================================= */

function tokenize(value) {

    const tokens = [];

    let currentNumber = "";

    for (const character of value) {

        if (
            /[0-9.]/.test(character)
        ) {

            currentNumber += character;

        } else {

            if (currentNumber !== "") {

                tokens.push(
                    Number(currentNumber)
                );

                currentNumber = "";
            }

            tokens.push(character);
        }
    }

    if (currentNumber !== "") {

        tokens.push(
            Number(currentNumber)
        );
    }

    return tokens;
}


/* =========================================================
   CALCULATE WITHOUT EVAL
   ========================================================= */

function calculateExpression(value) {

    const tokens = tokenize(value);

    if (tokens.length === 0) {
        return null;
    }


    /* -------------------------
       MULTIPLICATION / DIVISION
       ------------------------- */

    const reduced = [];

    let index = 0;

    while (index < tokens.length) {

        const token = tokens[index];

        if (
            token === "×" ||
            token === "÷"
        ) {

            return null;
        }

        reduced.push(token);

        index++;
    }


    /* ------------------------------------------------------
       First pass: × and ÷
       ------------------------------------------------------ */

    let firstPass = [tokens[0]];

    index = 1;

    while (index < tokens.length) {

        const operator = tokens[index];

        const nextValue = tokens[index + 1];

        if (
            typeof nextValue !== "number" ||
            !Number.isFinite(nextValue)
        ) {
            return null;
        }

        if (operator === "×") {

            const previous =
                firstPass.pop();

            firstPass.push(
                previous * nextValue
            );

        } else if (operator === "÷") {

            if (nextValue === 0) {

                return {
                    error: "undefined"
                };
            }

            const previous =
                firstPass.pop();

            firstPass.push(
                previous / nextValue
            );

        } else {

            firstPass.push(operator);

            firstPass.push(nextValue);
        }

        index += 2;
    }


    /* ------------------------------------------------------
       Second pass: + and −
       ------------------------------------------------------ */

    let result =
        Number(firstPass[0]);

    index = 1;

    while (index < firstPass.length) {

        const operator =
            firstPass[index];

        const value =
            Number(firstPass[index + 1]);

        if (operator === "+") {

            result += value;

        } else if (operator === "−") {

            result -= value;

        } else {

            return null;
        }

        index += 2;
    }


    if (!Number.isFinite(result)) {
        return null;
    }

    return {
        value: result
    };
}


/* =========================================================
   UPDATE DISPLAY
   ========================================================= */

function updateDisplay() {

    calculationDisplay.textContent =
        formatExpression(expression);

    if (!expression) {

        resultDisplay.textContent = "0";

        displayStatus.textContent = "READY";

        return;
    }


    const cleanExpression =
        expression.replace(
            /[×÷+−.]$/,
            ""
        );


    if (!cleanExpression) {

        resultDisplay.textContent = "0";

        return;
    }


    const result =
        calculateExpression(cleanExpression);


    if (
        result &&
        result.error === "undefined"
    ) {

        resultDisplay.textContent =
            "Undefined";

        displayStatus.textContent =
            "ERROR";

        return;
    }


    if (
        result &&
        typeof result.value === "number"
    ) {

        if (
            /[×÷+−]/.test(expression)
        ) {

            resultDisplay.textContent =
                formatNumber(result.value);
        }

        else {

            const lastNumber =
                expression.match(
                    /(?:^|[×÷+−])([0-9.]+)$/
                );

            resultDisplay.textContent =
                lastNumber
                    ? formatNumber(lastNumber[1])
                    : formatNumber(result.value);
        }

    } else {

        resultDisplay.textContent =
            expression;
    }
}


/* =========================================================
   CLEAR
   ========================================================= */

function clearCalculator() {

    expression = "";

    justCalculated = false;

    displayStatus.textContent =
        "READY";

    resultDisplay.textContent =
        "0";

    calculationDisplay.textContent =
        "";
}


/* =========================================================
   BACKSPACE
   ========================================================= */

function backspace() {

    if (justCalculated) {

        clearCalculator();

        return;
    }

    expression =
        expression.slice(0, -1);

    displayStatus.textContent =
        "INPUT";

    updateDisplay();
}


/* =========================================================
   ADD NUMBER
   ========================================================= */

function addNumber(number) {

    if (justCalculated) {

        expression = "";

        justCalculated = false;
    }


    if (
        number === "." &&
        /(?:^|[×÷+−])[^×÷+−]*\./.test(expression)
    ) {
        return;
    }


    if (
        number === "." &&
        (
            expression === "" ||
            /[×÷+−]$/.test(expression)
        )
    ) {

        expression += "0.";

    } else {

        expression += number;
    }


    displayStatus.textContent =
        "INPUT";

    updateDisplay();
}


/* =========================================================
   ADD OPERATOR
   ========================================================= */

function addOperator(operator) {

    if (!expression) {
        return;
    }


    justCalculated = false;


    if (
        /[×÷+−]$/.test(expression)
    ) {

        expression =
            expression.slice(0, -1)
            + operator;

    } else {

        expression += operator;
    }


    displayStatus.textContent =
        "INPUT";

    updateDisplay();
}


/* =========================================================
   PERCENT
   ========================================================= */

function percentage() {

    const match =
        expression.match(
            /([0-9.]+)$/
        );

    if (!match) {
        return;
    }


    const number =
        Number(match[1]) / 100;


    expression =
        expression.slice(
            0,
            expression.length - match[1].length
        )
        + String(number);


    justCalculated = false;

    displayStatus.textContent =
        "INPUT";

    updateDisplay();
}


/* =========================================================
   CALCULATE
   ========================================================= */

function calculate() {

    if (!expression) {
        return;
    }


    const cleanExpression =
        expression.replace(
            /[×÷+−.]$/,
            ""
        );


    if (
        !/[×÷+−]/.test(cleanExpression)
    ) {
        return;
    }


    const result =
        calculateExpression(
            cleanExpression
        );


    if (
        result &&
        result.error === "undefined"
    ) {

        calculationDisplay.textContent =
            cleanExpression;

        resultDisplay.textContent =
            "Undefined";

        displayStatus.textContent =
            "ERROR";

        return;
    }


    if (
        !result ||
        typeof result.value !== "number"
    ) {
        return;
    }


    const finalValue =
        Number(
            result.value.toPrecision(12)
        );


    const formattedResult =
        formatNumber(finalValue);


    /* Save history */

    history.unshift({

        expression:
            cleanExpression,

        result:
            finalValue

    });


    history =
        history.slice(0, 5);


    localStorage.setItem(
        "calcuraHistory",
        JSON.stringify(history)
    );


    renderHistory();


    calculationDisplay.textContent =
        cleanExpression;

    resultDisplay.textContent =
        formattedResult;

    displayStatus.textContent =
        "RESULT";


    expression =
        String(finalValue);

    justCalculated = true;
}


/* =========================================================
   BUTTON EVENTS
   ========================================================= */

calculatorKeys.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(".key");


        if (!button) {
            return;
        }


        const number =
            button.dataset.number;

        const operator =
            button.dataset.operator;

        const action =
            button.dataset.action;


        if (number !== undefined) {

            addNumber(number);

            return;
        }


        if (operator) {

            addOperator(operator);

            return;
        }


        if (action === "clear") {

            clearCalculator();

            return;
        }


        if (action === "backspace") {

            backspace();

            return;
        }


        if (action === "percent") {

            percentage();

            return;
        }


        if (action === "calculate") {

            calculate();
        }

    }
);


/* =========================================================
   KEYBOARD SUPPORT
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        const key =
            event.key;


        if (/^[0-9]$/.test(key)) {

            addNumber(key);

            return;
        }


        if (key === ".") {

            addNumber(".");

            return;
        }


        if (
            key === "+" ||
            key === "-"
        ) {

            addOperator(
                key === "-"
                    ? "−"
                    : "+"
            );

            return;
        }


        if (
            key === "*" ||
            key.toLowerCase() === "x"
        ) {

            addOperator("×");

            return;
        }


        if (key === "/") {

            event.preventDefault();

            addOperator("÷");

            return;
        }


        if (key === "%") {

            percentage();

            return;
        }


        if (
            key === "Enter" ||
            key === "="
        ) {

            calculate();

            return;
        }


        if (key === "Backspace") {

            backspace();

            return;
        }


        if (key === "Escape") {

            clearCalculator();
        }

    }
);


/* =========================================================
   THEME
   ========================================================= */

function setTheme(theme) {

    document.body.classList.remove(
        "theme-glass",
        "theme-dark",
        "theme-light"
    );


    document.body.classList.add(
        `theme-${theme}`
    );


    if (theme === "glass") {

        themeIcon.textContent = "☾";

    } else if (theme === "dark") {

        themeIcon.textContent = "☀";

    } else {

        themeIcon.textContent = "☾";
    }


    localStorage.setItem(
        "calcuraTheme",
        theme
    );
}


function getCurrentTheme() {

    if (
        document.body.classList.contains(
            "theme-glass"
        )
    ) {
        return "glass";
    }


    if (
        document.body.classList.contains(
            "theme-dark"
        )
    ) {
        return "dark";
    }


    return "light";
}


themeButton.addEventListener(
    "click",
    function () {

        const current =
            getCurrentTheme();

        const index =
            themes.indexOf(current);

        const next =
            themes[
                (index + 1) %
                themes.length
            ];


        setTheme(next);
    }
);


/* Load saved theme */

const savedTheme =
    localStorage.getItem(
        "calcuraTheme"
    );


if (
    themes.includes(savedTheme)
) {

    setTheme(savedTheme);

} else {

    setTheme("glass");
}


/* =========================================================
   HISTORY PANEL
   ========================================================= */

function openHistory() {

    historyPanel.classList.add(
        "open"
    );
}


function closeHistory() {

    historyPanel.classList.remove(
        "open"
    );
}


historyButton.addEventListener(
    "click",
    openHistory
);


historyClose.addEventListener(
    "click",
    closeHistory
);


/* =========================================================
   RENDER HISTORY
   ========================================================= */

function renderHistory() {

    historyCount.textContent =
        `(${history.length})`;


    if (history.length === 0) {

        historyList.innerHTML = `
            <div class="empty-history">
                No calculations yet
            </div>
        `;

        return;
    }


    historyList.innerHTML =
        history.map(
            function (item, index) {

                return `
                    <div
                        class="history-item"
                        data-history-index="${index}"
                    >

                        <div class="history-content">

                            <div class="history-expression">
                                ${escapeHTML(
                                    item.expression
                                )}
                            </div>

                            <span class="history-result">
                                = ${formatNumber(
                                    item.result
                                )}
                            </span>

                        </div>

                        <button
                            type="button"
                            class="history-action"
                            data-copy-index="${index}"
                            aria-label="Copy result"
                        >
                            ▣
                        </button>

                    </div>
                `;
            }
        ).join("");
}


/* =========================================================
   HISTORY ITEM CLICK
   ========================================================= */

historyList.addEventListener(
    "click",
    async function (event) {

        const copyButton =
            event.target.closest(
                "[data-copy-index]"
            );


        if (copyButton) {

            event.stopPropagation();


            const index =
                Number(
                    copyButton.dataset.copyIndex
                );


            const item =
                history[index];


            if (!item) {
                return;
            }


            try {

                await navigator.clipboard.writeText(
                    String(item.result)
                );

                copyButton.textContent =
                    "✓";


                setTimeout(
                    function () {

                        copyButton.textContent =
                            "▣";

                    },
                    1000
                );

            } catch {

                /* Clipboard unavailable */
            }


            return;
        }


        const historyItem =
            event.target.closest(
                "[data-history-index]"
            );


        if (!historyItem) {
            return;
        }


        const index =
            Number(
                historyItem.dataset.historyIndex
            );


        const item =
            history[index];


        if (!item) {
            return;
        }


        expression =
            String(item.result);

        justCalculated = true;

        calculationDisplay.textContent =
            item.expression;

        resultDisplay.textContent =
            formatNumber(item.result);

        displayStatus.textContent =
            "RESULT";


        closeHistory();
    }
);


/* =========================================================
   CLEAR HISTORY
   ========================================================= */

clearHistoryButton.addEventListener(
    "click",
    function () {

        history = [];


        localStorage.removeItem(
            "calcuraHistory"
        );


        renderHistory();
    }
);


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

renderHistory();

updateDisplay();