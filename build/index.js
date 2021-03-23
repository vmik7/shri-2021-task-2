function prepareData(entities, { sprintId }) {

    // Массив, в который будем вставлять слайды
    let slides = [];





    // * Разбиваем все данные на сущности


    // Массивы содержат все сущности своего типа
    let allProjects = [], allUsers = [], allIssues = [], allComments = [], allCommits = [], allSummaries = [], allSprints = [];

    // ! Debug
    // let objectInArrayCnt = 0;

    // Функция обхода
    let go = (obj) => {

        // Отсекаем случаи, когда obj не является объектом или он равен null
        if (typeof obj !== 'object' || obj === null) {
            return;
        }

        // Если объект представляет собой массив, то запускаемся от всех объектов внутри него
        if (Array.isArray(obj)) {
            for (item of obj) {
                if (typeof item === 'object') {
                    go(item);

                    // ! Debug
                    // objectInArrayCnt++;
                }
            }
            return;
        }

        // Помещаем объект в соответствующий его типу массив
        switch (obj.type) {
            case 'Project':
                allProjects.push(obj);
                break;
            case 'User':
                allUsers.push(obj);
                break;
            case 'Issue':
                allIssues.push(obj);
                break;
            case 'Comment':
                allComments.push(obj);
                break;
            case 'Commit':
                allCommits.push(obj);
                break;
            case 'Summary':
                allSummaries.push(obj);
                break;
            case 'Sprint':
                allSprints.push(obj);
                break;
        }

        // Проходимся по всем полям объекта, и если какое-то из них тоже объект, запускаемся и от него
        for (key in obj) {
            if (typeof obj[key] === 'object') {
                go(obj[key]);
            }
        }
    }

    // Запускаем обход по всему массиву данных
    go(entities);

    // ! Debug
    // console.log('Всего Projects: ' + allProjects.length + '. Изначально: ' + entities.filter(item => item.type === 'Project').length);
    // console.log('Всего Users: ' + allUsers.length + '. Изначально: ' + entities.filter(item => item.type === 'User').length);
    // console.log('Всего Issues: ' + allIssues.length + '. Изначально: ' + entities.filter(item => item.type === 'Issue').length);
    // console.log('Всего Comments: ' + allComments.length + '. Изначально: ' + entities.filter(item => item.type === 'Comment').length);
    // console.log('Всего Commits: ' + allCommits.length + '. Изначально: ' + entities.filter(item => item.type === 'Commit').length);
    // console.log('Всего Summaries: ' + allSummaries.length + '. Изначально: ' + entities.filter(item => item.type === 'Summary').length);
    // console.log('Всего Sprints: ' + allSprints.length + '. Изначально: ' + entities.filter(item => item.type === 'Sprint').length);
    // console.log('objectInArrayCnt: ' + objectInArrayCnt + '. Элементов в массиве: ' + entities.length);





    // * Реализация слайда 'vote'


    // Ищем текущий спринт в массиве
    let currentSprint = allSprints.find(item => item.id === sprintId);

    // Считаем лайки
    let voteLikesCnt = [];
    allComments.forEach(comment => {

        // Оставляем только комменты в текущем спринте
        if (comment.createdAt < currentSprint.startAt || comment.createdAt >= currentSprint.finishAt) {
            return;
        }

        // Находим id автора
        let userId = (typeof comment.author === 'number' ? comment.author : comment.author.id);

        // Защита от undefined
        if (!voteLikesCnt[userId]) {
            voteLikesCnt[userId] = 0;
        }

        // Прибавляем лайки
        voteLikesCnt[userId] += comment.likes.length;
    });

    // Формируем новый отсортированный массив
    let voteLikes = [];
    for (userId in voteLikesCnt) {
        voteLikes.push({ id: +userId, likes: voteLikesCnt[userId] });
    }
    voteLikes.sort((a, b) => b.likes - a.likes);

    // Функция добавляет суффикс ' голос{_|а|ов}'
    let getVoteSuffix = (num) => {
        if (11 <= num % 100 && num % 100 <= 14) {
            return ' голосов';
        }
        else if (num % 10 === 1) {
            return ' голос';
        }
        else if (2 <= num % 10 && num % 10 <= 4) {
            return ' голоса';
        }
        else {
            return ' голосов';
        }
    }

    // Формируем массив пользователей
    let voteUsers = [];
    voteLikes.forEach((item) => {

        // Ищем пользователя
        let user = allUsers.find(cur => cur.id === item.id);

        // Добавляем строчку о пользователе в массив
        voteUsers.push({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            valueText: item.likes + getVoteSuffix(item.likes)
        });
    });
    
    // Добавляем слайд
    slides.push({
        alias: 'vote',
        data: {
            title: 'Самый 🔎 внимательный разработчик',
            subtitle: currentSprint.name,
            emoji: '🔎',
            users: voteUsers
        }
    });

    



    // * Реализация слайда 'leaders'


    // Считаем коммиты
    let leadersCommitsCnt = [];
    allCommits.forEach(commit => {

        // Оставляем только комменты в текущем спринте
        if (commit.timestamp < currentSprint.startAt || commit.timestamp >= currentSprint.finishAt) {
            return;
        }

        // Находим id автора
        let userId = (typeof commit.author === 'number' ? commit.author : comment.author.id);

        // Защита от undefined
        if (!leadersCommitsCnt[userId]) {
            leadersCommitsCnt[userId] = 0;
        }

        // Инкремент коммитов по найденному пользователю
        leadersCommitsCnt[userId]++;
    });

    // Формируем новый отсортированный массив
    let leadersCommits = [];
    for (userId in leadersCommitsCnt) {
        leadersCommits.push({ id: +userId, commits: leadersCommitsCnt[userId] });
    }
    leadersCommits.sort((a, b) => b.commits - a.commits);

    // Формируем массив пользователей
    let leadersUsers = [];
    leadersCommits.forEach((item) => {

        // Ищем пользователя
        let user = allUsers.find(cur => cur.id === item.id);

        // Добавляем строчку о пользователе в массив
        leadersUsers.push({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            valueText: String(item.commits)
        });
    });

    // Добавляем слайд
    slides.push({
        alias: 'leaders',
        data: {
            title: 'Больше всего коммитов',
            subtitle: currentSprint.name,
            emoji: '👑',
            users: leadersUsers
        }
    });





    // * Реализация слайда 'chart'


    // Вспомогательный массив, элементы вида: { id, начало, конец, коммиты }
    let chartSprintsData = [];

    // Проходимся по всем коммитами и добавляем данные в массив
    allSprints.forEach(sprint => {
        chartSprintsData.push({
            id: sprint.id,
            begin: sprint.startAt,
            end: sprint.finishAt,
            commits: 0,
            name: sprint.name
        });
    });

    // Сортировка по id
    chartSprintsData.sort((a, b) => a.id - b.id);

    // Подсчет коммитов
    allCommits.forEach(commit => {
        chartSprintsData.some((item, index, array) => {
            if (item.begin <= commit.timestamp && commit.timestamp < item.end) {
                array[index].commits++;
                return true;
            }
            return false;
        });
    });

    // Данные для графика
    let chartValues = [];
    chartSprintsData.forEach(item => {
        let obj = {
            title: String(item.id),
            hint: item.name,
            value: item.commits,
        }
        if (item.id === currentSprint.id) {
            obj.active = true;
        }
        chartValues.push(obj);
    });

    // Упорядоченный массив лидеров по количеству коммитов за текущий спринт можем взять из слайда leaders
    let chartUsers = leadersUsers;

    // Добавляем слайд
    slides.push({
        alias: 'chart',
        data: {
            title: 'Коммиты',
            subtitle: currentSprint.name,
            values: chartValues,
            users: chartUsers
        }
    });





    // * Реализация слайда 'diagram'


    // Ищем предыдущий спринт
    let prevSprint = allSprints.find(item => item.id === sprintId - 1);
    
    // Коммиты за текущий и предыдущий спринты: [0] > 1001 строки, [1] 501 — 1000 строк, [2] 101 — 500 строк, [3] 1 — 100 строк
    let diagramCurrectCommits = [ 0, 0, 0, 0 ], diagramPrevCommits = [ 0, 0, 0, 0 ];

    // Функция, которая по количеству строк кода возвращает номер категории, к которой нуджно отнести коммит
    let getCommitCategory = (value) => {
        if (value <= 100) {
            return 3;
        }
        else if (value <= 500) {
            return 2;
        }
        else if (value <= 1000) {
            return 1;
        }
        else {
            return 0;
        }
    }

    // Перебираем все коммиты
    allCommits.forEach(commit => {

        // Сразу отсеиваем коммиты, не относящиеся к текущему или предыдущему спринту
        if (prevSprint && commit.timestamp < prevSprint.startAt || !prevSprint && commit.timestamp < currentSprint.startAt || commit.timestamp >= currentSprint.finishAt) {
            return;
        }

        // Считаем общее количество строк в коммите
        let commitTotalStrings = 0;
        commit.summaries.forEach(item => {
            let summary = (typeof item === 'object' ? item : allSummaries.find(cur => cur.id === item));
            commitTotalStrings += summary.added + summary.removed;
        });

        // Решаем, в какой спринт добавить коммит
        if (prevSprint && prevSprint.startAt <= commit.timestamp && commit.timestamp < prevSprint.finishAt) {
            diagramPrevCommits[getCommitCategory(commitTotalStrings)]++;
        }
        else if (currentSprint.startAt <= commit.timestamp && commit.timestamp < currentSprint.finishAt) {
            diagramCurrectCommits[getCommitCategory(commitTotalStrings)]++;
        }
    });

    // Считаем разницу
    let diagramDifferences = diagramCurrectCommits.map((item, index) => {
        return item - diagramPrevCommits[index];
    });

    // Считаем сумму коммитов по спринтам
    let diagramCurrentValue = diagramCurrectCommits.reduce((sum, item) => sum += item, 0);
    let diagramPrevValue = diagramPrevCommits.reduce((sum, item) => sum += item, 0);
    let diagramTotalDifference = diagramCurrentValue - diagramPrevValue;

    // Функция, добавляющая суффикс 'коммит{_|а|ов}'
    let getDiagramSuffix = (num) => {
        if (num < 0) {
            num = -num;
        }
        if (11 <= num % 100 && num % 100 <= 14) {
            return ' коммитов';
        }
        else if (num % 10 === 1) {
            return ' коммит';
        }
        else if (2 <= num % 10 && num % 10 <= 4) {
            return ' коммита';
        }
        else {
            return ' коммитов';
        }
    }

    // Добавляем слайд
    slides.push({
        alias: 'diagram',
        data: {
            title: 'Размер коммитов',
            subtitle: currentSprint.name,
            totalText: diagramCurrentValue + getDiagramSuffix(diagramCurrentValue),
            differenceText: (diagramTotalDifference >= 0 ? '+' : '') + diagramTotalDifference + ' с прошлого спринта',
            categories: [
                { 
                    title : '> 1001 строки',
                    valueText: diagramCurrectCommits[0] + getDiagramSuffix(diagramCurrectCommits[0]),
                    differenceText: (diagramDifferences[0] >= 0 ? '+' : '') + diagramDifferences[0] + getDiagramSuffix(diagramDifferences[0])
                },
                { 
                    title : '501 — 1000 строк',
                    valueText: diagramCurrectCommits[1] + getDiagramSuffix(diagramCurrectCommits[1]),
                    differenceText: (diagramDifferences[1] >= 0 ? '+' : '') + diagramDifferences[1] + getDiagramSuffix(diagramDifferences[1])
                },
                { 
                    title : '101 — 500 строк',
                    valueText: diagramCurrectCommits[2] + getDiagramSuffix(diagramCurrectCommits[2]),
                    differenceText: (diagramDifferences[2] >= 0 ? '+' : '') + diagramDifferences[2] + getDiagramSuffix(diagramDifferences[2])
                },
                { 
                    title : '1 — 100 строк',
                    valueText: diagramCurrectCommits[3] + getDiagramSuffix(diagramCurrectCommits[3]),
                    differenceText: (diagramDifferences[3] >= 0 ? '+' : '') + diagramDifferences[3] + getDiagramSuffix(diagramDifferences[3])
                }
            ]
        }
    });





    // * Реализация слайда 'activity'

    // Количество миллисекунд в часе
    const MsPerHour = 60 * 60 * 1000;

    // Название дней недели
    let dayNames = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];

    // Данные для тепловой карты
    let activityData = {};
    for (let day = 0; day < 7; day++) {
        activityData[dayNames[day]] = [];
        for (let hour = 0; hour < 24; hour++) {
            activityData[dayNames[day]][hour] = 0;
        }
    }

    // Считаем коммиты
    allCommits.forEach(commit => {

        // Отсеиваем коммиты, не относящиеся к текущему спринту
        if (commit.timestamp < currentSprint.startAt || currentSprint.finishAt <= commit.timestamp) {
            return;
        }

        // Создаем объект Date и делаем инкремент
        let date = new Date(commit.timestamp);
        activityData[dayNames[date.getDay()]][date.getHours()]++;
    });


    // Добавляем слайд
    slides.push({
        alias: 'activity',
        data: {
            title: 'Коммиты',
            subtitle: currentSprint.name,
            data: activityData
        }
    });



    return slides;
}

module.exports = { prepareData }