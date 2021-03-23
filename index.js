const path = require('path');
const fs = require('fs');

const { prepareData } = require('./build/index');

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
