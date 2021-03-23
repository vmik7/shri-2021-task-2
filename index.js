let path = require('path');
let fs = require('fs');

let { prepareData } = require('./build/index');

fs.readFile(path.resolve('examples', 'input.json'), 'utf-8', (err, content) => {
    if (err) throw err;

    let data = JSON.parse(content);
    let result = prepareData(data, { sprintId: 977 });

    fs.writeFile(path.resolve('result', 'result.json'), JSON.stringify(result, null, 2), (err) => {
        if (err) {
          throw err;
        }
        // console.log('file \'result.json\' written successfully')
    })
})