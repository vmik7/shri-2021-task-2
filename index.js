let path = require('path');
let fs = require('fs');

let { prepareData } = require('./build/index');

// Читаем входной файл
fs.readFile(path.resolve('examples', 'input.json'), 'utf-8', (err, content) => {
    if (err) throw err;

    let data = JSON.parse(content);
    let result = prepareData(data, { sprintId: 977 });

    // Записываем результаты работы функции prepareData
    fs.writeFile(path.resolve('result', 'result.json'), JSON.stringify(result, null, 2), (err) => {
        if (err) {
            throw err;
        }

        // ! Debug
        // console.log('file \'result.json\' written successfully')
    })
})


// * Тестируем

console.log('Testing results...');

// Правильный JSON
let correctData;
try {
    correctData = JSON.parse(fs.readFileSync(path.resolve('examples', 'output.json'), 'utf-8'));
} catch (err) {
    throw err;
}

// Мой JSON
let myData;
try {
    myData = JSON.parse(fs.readFileSync(path.resolve('result', 'result.json'), 'utf-8'));
} catch (err) {
    throw err;
}

// Функция проверки слайда на валидность
let validateSlide = (slide) => {
    if (typeof slide !== 'object') {
        console.log('ERROR! Type of slide is \'' + typeof slide + '\', it is not \'object\'!');
        return false;
    }
    else if (slide === null) {
        console.log('ERROR! Slide is \'null\'');
        return false;
    }
    return true;
}

// Функция проверки равенства слайдов и просто объектов в некотором случае
let compareObjects = (correctObject, myObject, specialKey, specialHandler) => {
    if (correctObject === null || myObject === null) {
        return false;
    }
    for (key in correctObject) {
        if (key === specialKey) {
            return specialHandler(correctObject[key], myObject[key]);
        }
        else {
            return correctObject[key] === myObject[key];
        }
    }
}

// Функция сравнения двух массивов
let compareArrays = (correctArray, myArray) => {
    if (!Array.isArray(correctArray) || !Array.isArray(myArray)) {
        return false;
    }
    return correctArray.length === myArray.length && correctArray.every((item, index) => item === myArray);
}

// Обработчик для сравнения массива объектов (для поля users в шаблоне leaders к примеру)
let arrayHandler = (correctArray, myArray) => {
    if (!Array.isArray(correctArray) || !Array.isArray(myArray)) {
        return false;
    }
    return correctArray.length === myArray.length && correctArray.every((item, index) => compareObjects(item, myArray[index]));
}

// Обработчик для сравнения объектов data в шаблоне activity
let activityHandler = (correctObject, myObject) => {
    if (correctObject === null || myObject === null) {
        return false;
    }
    for (day in correctObject) {
        if (!compareArrays(correctObject[day], myObject[day])) {
            return false;
        }
    }
    return true;
}

// Сравниваем шаблон leaders
console.log('\nLeaders: ');
let correctLeaders = correctData.find(item => item.alias === 'leaders');
let myLeaders = myData.find(item => item.alias === 'leaders');
let leadersOK = validateSlide(myLeaders) && compareObjects(correctLeaders, myLeaders, 'users', arrayHandler);
console.log(leadersOK ? 'OK' : 'FAIL');

// Сравниваем шаблон vote
console.log('\nVote: ');
let correctVote = correctData.find(item => item.alias === 'vote');
let myVote = myData.find(item => item.alias === 'vote');
let voteOK = validateSlide(myVote) && compareObjects(correctVote, myVote, 'users', arrayHandler);
console.log(voteOK ? 'OK' : 'FAIL');

// Сравниваем шаблон chart
console.log('\nChart: ');
let correctChart = correctData.find(item => item.alias === 'chart');
let myChart = myData.find(item => item.alias === 'chart');
let chartOK = validateSlide(myChart) && compareObjects(correctChart, myChart, 'values', arrayHandler);
console.log(chartOK ? 'OK' : 'FAIL');

// Сравниваем шаблон diagram
console.log('\nDiagram: ');
let correctDiagram = correctData.find(item => item.alias === 'diagram');
let myDiagram = myData.find(item => item.alias === 'diagram');
let diagramOK = validateSlide(myDiagram) && compareObjects(correctDiagram, myDiagram, 'categories', arrayHandler);
console.log(diagramOK ? 'OK' : 'FAIL');

// Сравниваем шаблон activity
console.log('\nActivity: ');
let correctActivity = correctData.find(item => item.alias === 'activity');
let myActivity = myData.find(item => item.alias === 'activity');
let activityOK = validateSlide(myActivity) && compareObjects(correctActivity, myActivity, 'data', activityHandler);
console.log(activityOK ? 'OK' : 'FAIL');