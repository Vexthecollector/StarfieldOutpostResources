
function LoadResources() {
    LoadFile("Resources.csv")
}


function SetButtonAsActive(button) {
    var list = document.getElementsByClassName('active')
    for (var i = 0; i < list.length; i++) {
        list[i].classList.add('SelectButton')
        list[i].classList.remove('active')
    }
    button.classList.add('active')
    button.classList.remove('SelectButton')
    console.log(button)
}

var headers
var starterrows = []
var datarows = []
var resources = []
var filters = []


async function LoadFile(FileName) {
    starterrows = []
    regexp = /(?!\B"[^"]*),(?![^"]*"\B)/g
    await fetch(FileName)
        .then((res) => res.text())
        .then((text) => {
            var rows = text.split("\n")
            headers = rows[0].split(",")
            for (var i = 1; i < rows.length; i++) {
                starterrows[i - 1] = rows[i].split(regexp)
            }
        })
        .catch((e) => console.error(e));
    datarows = Array.from(starterrows)
    FillTable()
}

function FillTable() {
    var table = document.getElementById("MainTable")
    var headerRow = document.getElementById("HeaderRow")
    headerRow.innerHTML = ""


    for (var i = 0; i < headers.length; i++) {
        var heading = document.createElement("td")
        heading.innerHTML = headers[i]
        heading.id = i
        headerRow.appendChild(heading)
        heading.addEventListener('click', function (e) { Sort(e) })
    }
    FillRows()

}

async function CleanElements() {
    Array.from(document.querySelectorAll('.sortedA')).forEach(
        (el) => el.classList.remove('sortedA')
    );
    Array.from(document.querySelectorAll('.sortedD')).forEach(
        (el) => el.classList.remove('sortedD')
    );
    return;
}

async function Sort(input) {
    var number = datarows[0][input.target.id]
    if (input.target.classList.contains("sortedA")) {
        if (!isNaN(number)) {
            datarows.sort(function (a, b) {
                return b[input.target.id] - a[input.target.id]
            })
        }
        else {
            datarows.sort(function (a, b) { return a[input.target.id] > b[input.target.id] ? 1 : -1; })
        }
        await CleanElements()
        input.target.classList.add("sortedD")

    }
    else if (input.target.classList.contains("sortedD")) {
        await CleanElements()
        datarows = Array.from(starterrows)

    }
    else {
        if (!isNaN(number)) {
            datarows.sort(function (a, b) {
                return a[input.target.id] - b[input.target.id]
            })
        }
        else {
            datarows.sort(function (a, b) { return a[input.target.id] > b[input.target.id] ? 1 : -1; })
            datarows.reverse()
        }
        await CleanElements()
        input.target.classList.add("sortedA")
    }


    FillRows()


}

function FillRows() {
    var table = document.getElementById("MainTable")

    for (var i = 1; i < table.rows.length; i) {
        table.deleteRow(1);
    }
    for (var i = 0; i < datarows.length; i++) {
        var datarow = document.createElement("tr")
        for (var j = 0; j < datarows[i].length; j++) {
            var cell = document.createElement("td")
            cell.innerHTML = datarows[i][j]
            datarow.appendChild(cell)
        }
        table.appendChild(datarow)
    }
}

function FilterData() {
    datarows = Array.from(EvaluateSkillLevel(Filter(starterrows)))
    FillRows()
}

function Filter(inputarray) {
    let resourceHeader = headers.indexOf("planet_resources")
    let table = document.getElementById("FilterTable")
    if (table.children.length > 1) {
        return inputarray.filter(i => {
            for (let j = 1; j < table.children.length; j++) {
                if (i[resourceHeader].includes(table.children[j].childNodes[1].innerHTML)) {
                }
                else {
                    return false
                }
            }
            return true
        }
        )
    }
    return inputarray
}

window.onload = function () {
    LoadResources()
    PreSetResources()
};

async function PreSetResources() {
    var datalist = document.getElementsByClassName("datalist")[0]
    let resources
    await fetch("resources.txt")
        .then((res) => res.text())
        .then((text) => {
            resources = text.split(",")
        })
        .catch((e) => console.error(e));
    this.resources = resources
    for (var i = 0; i < resources.length; i++) {
        var resource = document.createElement("option")
        resource.value = resources[i]
        datalist.appendChild(resource)
    }
}

function AddResource() {
    var resource = document.getElementById("Resource").value
    let name1 = resource.split("(")[0]
    let name2 = resource.split("(")[1]
    var table = document.getElementById("FilterTable")
    if (resources.indexOf(resource) >= 0) {
        var datarow = document.createElement("tr")
        var cell1 = document.createElement("td")
        cell1.innerHTML = name1
        datarow.appendChild(cell1)
        var cell2 = document.createElement("td")
        cell2.innerHTML = name2.substring(0, name2.length - 1)
        datarow.appendChild(cell2)
        var cell3 = document.createElement("td")
        let deletebutton = document.createElement("input")
        deletebutton.value = "Remove"
        deletebutton.type = "button"
        deletebutton.addEventListener('click', function () {
            DeleteThis(this)
        })
        cell3.appendChild(deletebutton)
        datarow.appendChild(cell3)
    }
    table.appendChild(datarow)

}

function DeleteThis(e) {
    let table = document.getElementById("FilterTable")
    let row = e.parentNode.parentNode.rowIndex;
    table.deleteRow(row)
}



function EvaluateSkillLevel(inputarray) {
    let skillLevel = document.getElementById("habSkill").value
    let temperature = headers.indexOf("temperature")
    let atmosphere = headers.indexOf("atmosphere")
    let badTemps = ["Inferno", "Deep freeze"]
    let badAtmo = ["Tox"]
    if (skillLevel == 0) {
        return inputarray.filter(i => {
            for (let j = 0; j < badTemps.length; j++) {
                if (i[temperature].includes(badTemps[j])) {
                    return false
                }
            }
            for (let j = 0; j < badAtmo.length; j++) {
                if (i[atmosphere].includes(badAtmo[j])) {
                    return false
                }
            }
            return true
        })
    }
    else if (skillLevel == 1) {
        return inputarray.filter(i => {
            for (let j = 0; j < badAtmo.length; j++) {
                if (i[atmosphere].includes(badAtmo[j])) {
                    return false
                }
            }
            return true
        })
    }
    else if (skillLevel == 2) {
        return inputarray.filter(i => {
            for (let j = 0; j < badAtmo.length; j++) {
                if (i[atmosphere].includes(badAtmo[j])) {
                    return false
                }
            }
            return true
        })
    }
    else if (skillLevel == 3) {

    }
    return inputarray
}