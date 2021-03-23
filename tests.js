const path = require('path');
const fs = require('fs');

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
console.log('\n\x1b[37mLeaders: \x1b[0m');
let correctLeaders = correctData.find(item => item.alias === 'leaders');
let myLeaders = myData.find(item => item.alias === 'leaders');
let leadersOK = validateSlide(myLeaders) && compareObjects(correctLeaders, myLeaders, 'users', arrayHandler);
console.log(leadersOK ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFAIL\x1b[0m');

// Сравниваем шаблон vote
console.log('\n\x1b[37mVote: \x1b[0m');
let correctVote = correctData.find(item => item.alias === 'vote');
let myVote = myData.find(item => item.alias === 'vote');
let voteOK = validateSlide(myVote) && compareObjects(correctVote, myVote, 'users', arrayHandler);
console.log(voteOK ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFAIL\x1b[0m');

// Сравниваем шаблон chart
console.log('\n\x1b[37mChart: \x1b[0m');
let correctChart = correctData.find(item => item.alias === 'chart');
let myChart = myData.find(item => item.alias === 'chart');
let chartOK = validateSlide(myChart) && compareObjects(correctChart, myChart, 'values', arrayHandler);
console.log(chartOK ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFAIL\x1b[0m');

// Сравниваем шаблон diagram
console.log('\n\x1b[37mDiagram: \x1b[0m');
let correctDiagram = correctData.find(item => item.alias === 'diagram');
let myDiagram = myData.find(item => item.alias === 'diagram');
let diagramOK = validateSlide(myDiagram) && compareObjects(correctDiagram, myDiagram, 'categories', arrayHandler);
console.log(diagramOK ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFAIL\x1b[0m');

// Сравниваем шаблон activity
console.log('\n\x1b[37mActivity: \x1b[0m');
let correctActivity = correctData.find(item => item.alias === 'activity');
let myActivity = myData.find(item => item.alias === 'activity');
let activityOK = validateSlide(myActivity) && compareObjects(correctActivity, myActivity, 'data', activityHandler);
console.log(activityOK ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFAIL\x1b[0m');

if (leadersOK && voteOK && chartOK && diagramOK && activityOK) {
    console.log('\n\x1b[30m\x1b[42m Tests passed! \x1b[0m\n');
}
else {
    console.log('\n\x1b[37m\x1b[41m Have some errors... \x1b[0m\n');
}