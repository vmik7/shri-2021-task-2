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

    // Ищем текущий спринт в массиве
    let currentSprint = allSprints.find(item => item.id === sprintId);





    // * Реализация слайда 'vote'


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



    // Добавляем слайд
    slides.push({
        alias: 'diagram',
        data: {
            title: 'Размер коммитов',
            subtitle: currentSprint.name,
            totalText: '',
            differenceText: '',
            categories: [
                // {"title": "> 1001 строки", "valueText": "2 коммита", "differenceText": "-3 коммита"},
                // {"title": "501 — 1000 строк", "valueText": "3 коммита", "differenceText": "-3 коммита"},
                // {"title": "101 — 500 строк", "valueText": "13 коммитов", "differenceText": "-22 коммита"},
                // {"title": "1 — 100 строк", "valueText": "86 коммитов", "differenceText": "-78 коммитов"}
            ]
        }
    });




    return slides;
}

module.exports = { prepareData }