//const tari = ["BG", "CZ", "HR", "HU", "PL", "RO", "SK"];
//const ani = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];

const tari = ["RO", "BG", "HR"];
const ani = [1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];

// load the select-options for country and years
// it needs to be in window.onload method so that the select wont come as undefined
// this method allows the elements to load regarding where I put the code
window.onload = () => {
    var select = document.getElementById("selectCountries")
    for (let tara of tari) {
        document.createElement("option")
        select.options[select.options.length] = new Option(tara, tara)
    }

    let selectYears = document.getElementById("selectYears")
    for (let an of ani) {
        document.createElement("option")
        selectYears.options[selectYears.options.length] = new Option(an, an)
    }

    let selectYearsForTable = document.getElementById("selectYearsForTable")
    for (let an of ani) {
        document.createElement("option")
        selectYearsForTable.options[selectYearsForTable.options.length] = new Option(an, an)
    }
}

clearCanvas = (id) => {
    switch(id) {
        case 1:
            //clear content for the first canvas
            deleteCanvas("histogramCanvas")
            break;
        case 2:
            //clear content for the second canvas
            deleteCanvas("bubbleChartCanvas")
        case 3:
            //clear content for animation canvas
            deleteCanvas("bubbleChartAnimationCanvas")
        case 4:
            //clear content for the data table
            removeValuesFromTable()
        default:
            break;
    }
}

deleteCanvas = (id) => {
    let canvas = document.getElementById(id)
    let ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// read data from the JSON file
// note: the html page needs to be loaded from a web server (using visual studio + right click + view in browser)
readFromJson = async() => {
    const reponse = await fetch('./media/myJson2.json')
    let data = await reponse.json()

    if (data == undefined) {
        console.warn("Error in reading the data from the JSON file")
    } else {
        console.warn("Data read from the JSON file")
    }

    data = data.map(item => {
        const valoriIndicator = data.filter(x => x.indicator === item.indicator).map(x => x.valoare);
        const min = Math.min(...valoriIndicator);
        const max = Math.max(...valoriIndicator);

        item.valoareNormalizata = (item.valoare - min) / (max - min);
        return item;
    });

    return data
}


//---------------------------------------- BAR CHART ----------------------------------------

// main function for creating a simple Histogram
// store in two variables the content that the user selected
// we will need the list of specific values for the country and the characteristic
// then we take the values and draw a simple bar chart
createHistogramBtn = async () => {
    console.log("Create histogram:")
    let country = document.getElementById("selectCountries").value
    let characteristic = document.getElementById("selectCharacteristic2").value

    console.log("This is input for country: " + country + " This is input for characteristic: " + characteristic)
    data = await readFromJson()
    //console.table(data)

    let valuesOfCountry = getCharacteristicOfCountry(country, characteristic, data)
    console.log("Values that appear in the histogram: " + valuesOfCountry)
    let normalisedValuesOfCountry = getNormalisedValuesOfCountry(country, characteristic, data)
    console.log("Normalised values: " + normalisedValuesOfCountry)

    drawOnCanvas(valuesOfCountry, characteristic, normalisedValuesOfCountry)
}

// get the specific values for a country
getCharacteristicOfCountry = (country, characteristic, data) => {
    let values = []

    data.map(value => {
        if (value.tara == country && value.indicator == characteristic) {
            values.push(value.valoare)
        }
    })

    return values
}

getNormalisedValuesOfCountry = (country, characteristic, data) => {
    let normalisedValues = []

    data.map(value => {
        if (value.tara == country && value.indicator == characteristic) {
            normalisedValues.push(value.valoareNormalizata)
        }
    })

    return normalisedValues
}

// draw on canvas a simple bar chart
drawOnCanvas = (values, characteristic, normalisedValuesOfCountry) => {
    let canvas = document.getElementById("histogramCanvas")
    let ctx = canvas.getContext("2d")

    let canvasWidth = canvas.width - 15
    let canvasHeight = canvas.height - 15
    let blockThickness = 25

    // refresh the canvas everytime so we can see multiple inputs
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw a border to mimic xOy coordinates
    ctx.lineWidth = 5;
    ctx.strokeStyle = "blue"
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.height);
    ctx.moveTo(0, canvas.height)
    ctx.lineTo(canvas.width, canvas.height)
    ctx.stroke();

    if (values == undefined) {
        console.warn("Error with the values")
    } else {
        let blockHeight = canvasHeight / Math.max(...values)
        let blockWidth = canvasWidth / values.length

        for (let i = 0; i < values.length; ++i) {
            let block = blockHeight * (values[i])
            ctx.fillStyle = "black"
            ctx.fillRect((i + 0.25) * blockWidth, canvasHeight - block, blockThickness, block)

            ctx.fillStyle = "red"
            if (characteristic == "POP") {
                let smallPopulation = parseInt(values[i] / 1000)
                console.log(smallPopulation)
                ctx.fillText((smallPopulation).toString(), (i + 0.25) * blockWidth, canvas.height - 5)
            } else {
                ctx.fillText((values[i]).toString(), (i + 0.25) * blockWidth, canvas.height - 5)
            }

            ctx.fillStyle = "white"
            ctx.fillText(ani[i].toString(), (i + 0.25)* blockWidth, canvas.height - 25)
        }
    }
}

//---------------------------------------- BUBBLE CHART ----------------------------------------
createBubbleChartBtn = async () => {
    console.log("Bubble chart:")
    let chosenYear = document.getElementById("selectYears").value
    console.log("Going to draw bubble chart for this year: " + chosenYear)

    data = await readFromJson()

    drawBubbleChart(data, chosenYear, "bubbleChartCanvas")
}

drawBubbleChart =  (data, chosenYear, canvasID) => {
    let canvas = document.getElementById(canvasID)
    let ctx = canvas.getContext("2d")

    let canvasWidth = canvas.width - 15
    let canvasHeight = canvas.height - 15
    let R = 35
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let tara of tari) {
        //console.log(tara)
        let x, y, r
        data.map(item => {
            if (item.tara == tara && item.an == parseInt(chosenYear) && item.indicator == 'PIB') {
                x = item.valoareNormalizata * canvasWidth
            }
        })

         data.map(item => {
            if (item.tara === tara && item.an === parseInt(chosenYear) && item.indicator === 'INT') {
                 y = canvasHeight - (item.valoareNormalizata * canvasHeight)
            }
        })

         data.map(item => {
            if (item.tara === tara && item.an === parseInt(chosenYear) && item.indicator === 'POP') {
                 r = 10 + (item.valoareNormalizata * R)
            }
        })


        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, 2 * Math.PI);

        let random = Math.floor(Math.random() * 10000)
        ctx.fillStyle = `hsla(${random}, 100%, 50%, 30%)`;
        ctx.strokeStyle = 'black';
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.fillText(tara, x, y);
    }
}

//---------------------------------------- DATA TABLE ----------------------------------------
createDataTable = async() => {
    console.log("Data Table:")
    let chosenYear = document.getElementById("selectYearsForTable").value
    let data = await readFromJson()

    addValuesIntoTable(data, chosenYear)
}

removeValuesFromTable = () => {
    var tBody = document.getElementById("tableBody");
        while (tBody.children.length > 0) {
            tBody.lastElementChild.remove();
        }
}

getIndicatorsValue = (data, country, year) => {
    let indicators = []

    data.map(item => {
        if (item.tara === country && item.an === parseInt(year)) {
            indicators.push(item.valoare)
        }
    })

    //INT, POP, PIB
    return indicators
}


addValuesIntoTable = (data, chosenYear) => {
    removeValuesFromTable()
    var tBody = document.getElementById("tableBody");
    let ok = []
    data.map(item => {
        if (item.an === parseInt(chosenYear)) {
            if (ok[item.tara] == 0 || ok[item.tara] == undefined) {
                //INT, POP, PIB
                let indicators = getIndicatorsValue(data, item.tara, chosenYear)
                createElementsForTable(tBody, item.tara, indicators[2], indicators[0], indicators[1])
                ++ok[item.tara]
            }
        }
    })
}

createElementsForTable = (tBody, country, gdp, int, pop) => {
    var tRow = document.createElement("tr");
    var cCountry = document.createElement("td");
    var cGDP = document.createElement("td");
    var cINT = document.createElement("td");
    var cPOP = document.createElement("td");

    cCountry.innerHTML = country
    cGDP.innerHTML = gdp
    cINT.innerHTML = int
    cPOP.innerHTML = pop

    tRow.appendChild(cCountry)
    tRow.appendChild(cGDP)
    tRow.appendChild(cINT)
    tRow.appendChild(cPOP)

    tBody.appendChild(tRow)
}

//---------------------------------------- BUBBLE CHART ANIMATION ----------------------------------------
startBubbleChartAnimation = async() => {
    let data = await readFromJson()

    for (let an of ani) {
        let displayYearLabel = document.getElementById("displayCurrentAnimationYear")
        displayYearLabel.innerHTML = an.toString()
        drawBubbleChart(data, an, "bubbleChartAnimationCanvas")
        await sleep(1500)
    }
}

sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}