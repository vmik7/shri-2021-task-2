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
let compareSlides = (correctSlide, mySlide, specialRules = []) => {
    if (typeof correctSlide !== 'object' || correctSlide === null || typeof mySlide !== 'object' || mySlide === null) {
        console.log('ERROR! Objects are not correct! - function \'compareSlides\'');
        return false;
    }
    for (key in correctSlide.data) {
        let rule = specialRules.find(item => item.key === key);
        if (rule) {
            if (!rule.handler(correctSlide.data[key], mySlide.data[key])) {
                console.log(`ERROR! some data in '${ key }' does not match...`);
                return false;
            }
        }
        else {
            if (correctSlide.data[key] !== mySlide.data[key]) {
                console.log(`ERROR! key '${ key }' does not match!`);
                return false;
            }
        }
    }
    return true;
}

// Функция сравнения объектов без вложенности
let compareObjects = (correctObject, myObject) => {
    if (typeof correctObject !== 'object' || correctObject === null || typeof myObject !== 'object' || myObject === null) {
        console.log('ERROR! Objects are not correct! - function \'compareObjects\'');
        return false;
    }
    for (key in correctObject) {
        if (correctObject[key] !== myObject[key]) {
            console.log(`ERROR! key '${ key }' does not match!`);
            return false;
        }
    }
    return true;
}

// Функция сравнения двух массивов
let compareArrays = (correctArray, myArray) => {
    if (!Array.isArray(correctArray) || !Array.isArray(myArray)) {
        console.log('ERROR! Arrays are not correct! - function \'compareArrays\'');
        return false;
    }
    return correctArray.length === myArray.length && correctArray.every((item, index) => item === myArray[index]);
}

// Обработчик для сравнения массива объектов (для поля users в шаблоне leaders к примеру)
let arrayHandler = (correctArray, myArray) => {
    if (!Array.isArray(correctArray) || !Array.isArray(myArray)) {
        console.log('ERROR! Arrays are not correct! - function \'arrayHandler\'');
        return false;
    }
    return correctArray.length === myArray.length && correctArray.every((item, index) => compareObjects(item, myArray[index]));
}

// Обработчик для сравнения объектов data в шаблоне activity
let activityHandler = (correctObject, myObject) => {
    if (correctObject === null || myObject === null) {
        console.log('ERROR! Objects are not correct! - function \'activityHandler\'');
        return false;
    }
    for (day in correctObject) {
        if (!compareArrays(correctObject[day], myObject[day])) {
            console.log(`ERROR! Arrays are not match on '${ day }'!`);
            return false;
        }
    }
    return true;
}

// Сравниваем шаблон leaders

console.log('\n\x1b[37mLeaders: \x1b[0m');
let correctLeaders = correctData.find(item => item.alias === 'leaders');
let myLeaders = myData.find(item => item.alias === 'leaders');

console.log(JSON.stringify(correctLeaders) === JSON.stringify(myLeaders) ? 'strings equal!' : 'strings not equal...');

let leadersOK = validateSlide(myLeaders) && compareSlides(correctLeaders, myLeaders, [ { key: 'users', handler: arrayHandler } ]);
console.log(leadersOK ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFAIL\x1b[0m');

// Сравниваем шаблон vote

console.log('\n\x1b[37mVote: \x1b[0m');
let correctVote = correctData.find(item => item.alias === 'vote');
let myVote = myData.find(item => item.alias === 'vote');

console.log(JSON.stringify(correctVote) === JSON.stringify(myVote) ? 'strings equal!' : 'strings not equal...');

let voteOK = validateSlide(myVote) && compareSlides(correctVote, myVote, [ { key: 'users', handler: arrayHandler } ]);
console.log(voteOK ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFAIL\x1b[0m');

// Сравниваем шаблон chart

console.log('\n\x1b[37mChart: \x1b[0m');
let correctChart = correctData.find(item => item.alias === 'chart');
let myChart = myData.find(item => item.alias === 'chart');

console.log(JSON.stringify(correctChart) === JSON.stringify(myChart)? 'strings equal!' : 'strings not equal...');

let chartOK = validateSlide(myChart) && compareSlides(correctChart, myChart, [ { key: 'values', handler: arrayHandler }, { key: 'users', handler: arrayHandler } ]);
console.log(chartOK ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFAIL\x1b[0m');

// Сравниваем шаблон diagram

console.log('\n\x1b[37mDiagram: \x1b[0m');
let correctDiagram = correctData.find(item => item.alias === 'diagram');
let myDiagram = myData.find(item => item.alias === 'diagram');

console.log(JSON.stringify(correctDiagram) === JSON.stringify(myDiagram) ? 'strings equal!' : 'strings not equal...');

let diagramOK = validateSlide(myDiagram) && compareSlides(correctDiagram, myDiagram, [ { key: 'categories', handler: arrayHandler } ]);
console.log(diagramOK ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFAIL\x1b[0m');

// Сравниваем шаблон activity

console.log('\n\x1b[37mActivity: \x1b[0m');
let correctActivity = correctData.find(item => item.alias === 'activity');
let myActivity = myData.find(item => item.alias === 'activity');

console.log(JSON.stringify(correctActivity) === JSON.stringify(myActivity) ? 'strings equal!' : 'strings not equal...');

let activityOK = validateSlide(myActivity) && compareSlides(correctActivity, myActivity, [ { key: 'data', handler: activityHandler } ]);
console.log(activityOK ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFAIL\x1b[0m');

// Итоги по всем тестам

if (leadersOK && voteOK && chartOK && diagramOK && activityOK) {
    console.log('\n\x1b[30m\x1b[42m Tests passed! \x1b[0m\n');
}
else {
    console.log('\n\x1b[37m\x1b[41m Have some errors... \x1b[0m\n');
}