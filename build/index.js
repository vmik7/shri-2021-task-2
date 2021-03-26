function prepareData(entities, { sprintId }) {

    // Массив, в который будем вставлять слайды
    let slides = [];



    // ** Разбиваем все данные на сущности *

    // * Не используются
    let allProjects = [];
    let allIssues = [];

    // * Обычные массивы, по ним будем ходить с помощью forEach
    let allComments = [];
    let allCommits = [];

    // * Массив для спринтов будет отсортирован, по нему можно ходить бинпоиском за логарифмическое время
    let allSprints = [];

    // * Ассоциативные массивы по ключу = id - создаём 'чистые' объекты по прототипу null
    let allUsers = Object.create(null);
    let allSummaries = Object.create(null);

    // Стэк для обхода в ширину (стек будет работаеть быстрее очереди, а порядок в нашем случае не важен)
    let entityStack = [];

    // Добавляем исходные сущности в стек
    entities.forEach(entity => entityStack.push(entity));

    // Обход в ширину
    while (entityStack.length > 0) {

        // Достаем элемент из стека
        let entity = entityStack.pop();

        // Кладём в нужную коробочку
        switch (entity.type) {
            case 'Project':
                allProjects.push(entity);
                break;
            case 'Issue':
                allIssues.push(entity);
                break;
            case 'Comment':
                allComments.push(entity);
                break;
            case 'Commit':
                allCommits.push(entity);
                break;
            case 'Sprint':
                allSprints.push(entity);
                break;
            case 'User':
                allUsers[entity.id] = entity;
                break;
            case 'Summary':
                allSummaries[entity.id] = entity;
                break;
        }

        // Смотрим все ключи
        for (key in entity) {

            // Если видим массив - ищем в нём объекты, у которых есть поле type
            if (Array.isArray(entity[key])) {
                entity[key].forEach(item => {
                    if (typeof item === 'object' && item.type) {
                        entityStack.push(item);
                    }
                })
            }

            // Если видим объект, у которого есть поле type - добавляем в стек
            else if (typeof entity[key] === 'object' && entity[key] !== null && entity[key].type) {
                entityStack.push(entity[key]);
            }
        }
    }

    // Сортируем allSprints по id
    allSprints.sort((x, y) => x.id - y.id);

    // Бинпоиск спринта по id
    let findSprintById = id => {
        let l = -1, r = allSprints.length;
        while (r - l > 1) {
            let m = Math.floor((r + l) / 2);
            if (allSprints[m].id <= id)
                l = m;
            else
                r = m;
        }
        if (l === -1 || allSprints[l].id !== id)
            return undefined;
        else
            return allSprints[l];
    }

    // Бинпоиск спринта по timestamp
    let findSprintByTime = time => {
        let l = -1, r = allSprints.length;
        while (r - l > 1) {
            let m = Math.floor((r + l) / 2);
            if (allSprints[m].startAt <= time)
                l = m;
            else
                r = m;
        }
        if (l === -1 || allSprints[l].finishAt <= time)
            return undefined;
        else
            return allSprints[l];
    }



    // ** Реализация слайда 'vote' *

    // Ищем текущий спринт в массиве
    const currentSprint = findSprintById(sprintId);

    // Ассоциативный массив: ключ - id пользователя, значение - количество лайков.
    let voteLikesCnt = Object.create(null);
    for (let key in allUsers) {
        voteLikesCnt[allUsers[key].id] = 0;
    }

    // Перебираем комментарии
    allComments.forEach(comment => {

        // Оставляем только комменты в текущем спринте
        if (comment.createdAt < currentSprint.startAt || currentSprint.finishAt <= comment.createdAt) {
            return;
        }

        // Находим id автора
        let userId = (typeof comment.author === 'number' ? comment.author : comment.author.id);

        // Прибавляем лайки
        voteLikesCnt[userId] += comment.likes.length;
    });

    // Формируем массив c id и лайками, сортируем
    let voteLikes = [];
    for (key in voteLikesCnt) {
        voteLikes.push({
            id: Number(key),
            likes: voteLikesCnt[key]
        });
    }
    voteLikes.sort((a, b) => {
        if (a.likes > b.likes) return -1;
        if (a.likes < b.likes) return 1;
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
    });

    // Функция добавляет суффикс ' голос{_|а|ов}'
    let getVoteSuffix = num => {
        if (11 <= num % 100 && num % 100 <= 19)
            return ' голосов';
        else if (num % 10 === 1)
            return ' голос';
        else if (2 <= num % 10 && num % 10 <= 4)
            return ' голоса';
        return ' голосов';
    }

    // Формируем массив пользователей
    let voteUsers = [];
    voteLikes.forEach(item => {

        // Ищем пользователя
        let user = allUsers[item.id];

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

    

    // ** Реализация слайда 'leaders' *

    // Ассоциативный массив: ключ - id, значение - количество коммитов
    let leadersCommitsCnt = Object.create(null);

    // Считаем коммиты
    allCommits.forEach(commit => {

        // Оставляем только комменты в текущем спринте
        if (commit.timestamp < currentSprint.startAt || currentSprint.finishAt <= commit.timestamp) {
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

    // Формируем массив, сортируем
    let leadersCommits = [];
    for (userId in leadersCommitsCnt) {
        leadersCommits.push({ id: Number(userId), commits: leadersCommitsCnt[userId] });
    }
    leadersCommits.sort((a, b) => {
        if (a.commits > b.commits) return -1;
        if (a.commits < b.commits) return 1;
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
    });

    // Формируем массив пользователей
    let leadersUsers = [];
    leadersCommits.forEach(item => {

        // Ищем пользователя
        let user = allUsers[item.id];

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



    // ** Реализация слайда 'chart' *

    // Ассоциативный массив: ключ - id спринта, значение - количество коммитов
    let chartCommitsCnt = Object.create(null);

    // Проходимся по всем коммитами и добавляем данные в массив
    allSprints.forEach(sprint => {
        chartCommitsCnt[sprint.id] = 0;
    });

    // Подсчет коммитов
    allCommits.forEach(commit => {
        let sprint = findSprintByTime(commit.timestamp);
        chartCommitsCnt[sprint.id]++;
    });

    // Данные для графика
    let chartValues = [];
    for (let key in chartCommitsCnt) {
        let sprint = findSprintById(Number(key));
        let obj = {
            title: String(sprint.id),
            hint: sprint.name,
            value: chartCommitsCnt[key],
        }
        if (sprint.id === currentSprint.id) {
            obj.active = true;
        }
        chartValues.push(obj);
    }

    // Добавляем слайд
    slides.push({
        alias: 'chart',
        data: {
            title: 'Коммиты',
            subtitle: currentSprint.name,
            values: chartValues,

            // Лидеров по количеству коммитов можем взять из слайда leaders
            users: leadersUsers
        }
    });



    // ** Реализация слайда 'diagram' *

    // Ищем предыдущий спринт
    const prevSprint = findSprintById(sprintId - 1);
    
    // Коммиты за текущий и предыдущий спринты: [0] > 1001 строки, [1] 501 — 1000 строк, [2] 101 — 500 строк, [3] 1 — 100 строк
    let diagramCurrectCommits = [ 0, 0, 0, 0 ], diagramPrevCommits = [ 0, 0, 0, 0 ];

    // Функция, которая по количеству строк кода возвращает номер категории, к которой нуджно отнести коммит
    let getCommitCategory = value => {
        if (value <= 100)
            return 3;
        if (value <= 500)
            return 2;
        if (value <= 1000)
            return 1;
        return 0;
    }

    // Перебираем все коммиты
    allCommits.forEach(commit => {

        // Сразу отсеиваем коммиты, не относящиеся к текущему или предыдущему спринту
        if ( prevSprint && (commit.timestamp < prevSprint.startAt    && currentSprint.finishAt <= commit.timestamp)
        ||  !prevSprint && (commit.timestamp < currentSprint.startAt && currentSprint.finishAt <= commit.timestamp) ) {
            return;
        }

        // Считаем общее количество строк в коммите
        let commitTotalStrings = 0;
        commit.summaries.forEach(item => {
            let summary = (typeof item === 'object' ? item : allSummaries[item]);
            commitTotalStrings += summary.added + summary.removed;
        });
        let category = getCommitCategory(commitTotalStrings);

        // Решаем, в какой спринт добавить коммит
        if (prevSprint && prevSprint.startAt <= commit.timestamp && commit.timestamp < prevSprint.finishAt)
            diagramPrevCommits[category]++;
        else if (currentSprint.startAt <= commit.timestamp && commit.timestamp < currentSprint.finishAt)
            diagramCurrectCommits[category]++;
    });

    // Считаем разницу
    let diagramDifferences = diagramCurrectCommits.map((item, index) => diagramCurrectCommits[index] - diagramPrevCommits[index]);

    // Считаем сумму коммитов по спринтам
    let diagramCurrentValue = diagramCurrectCommits.reduce((sum, item) => sum += item, 0);
    let diagramPrevValue = diagramPrevCommits.reduce((sum, item) => sum += item, 0);
    let diagramTotalDifference = diagramCurrentValue - diagramPrevValue;

    // Функция, добавляющая суффикс 'коммит{_|а|ов}'
    let getDiagramSuffix = (num) => {
        num = Math.abs(num);
        if (11 <= num % 100 && num % 100 <= 19)
            return ' коммитов';
        else if (num % 10 === 1)
            return ' коммит';
        else if (2 <= num % 10 && num % 10 <= 4)
            return ' коммита';
        return ' коммитов';
    }

    // Добавляем слайд
    slides.push({
        alias: 'diagram',
        data: {
            title: 'Размер коммитов',
            subtitle: currentSprint.name,
            totalText: diagramCurrentValue + getDiagramSuffix(diagramCurrentValue),
            differenceText: (diagramTotalDifference > 0 ? '+' : '') + diagramTotalDifference + ' с прошлого спринта',
            categories: [
                { 
                    title : '> 1001 строки',
                    valueText: diagramCurrectCommits[0] + getDiagramSuffix(diagramCurrectCommits[0]),
                    differenceText: (diagramDifferences[0] > 0 ? '+' : '') + diagramDifferences[0] + getDiagramSuffix(diagramDifferences[0])
                },
                { 
                    title : '501 — 1000 строк',
                    valueText: diagramCurrectCommits[1] + getDiagramSuffix(diagramCurrectCommits[1]),
                    differenceText: (diagramDifferences[1] > 0 ? '+' : '') + diagramDifferences[1] + getDiagramSuffix(diagramDifferences[1])
                },
                { 
                    title : '101 — 500 строк',
                    valueText: diagramCurrectCommits[2] + getDiagramSuffix(diagramCurrectCommits[2]),
                    differenceText: (diagramDifferences[2] > 0 ? '+' : '') + diagramDifferences[2] + getDiagramSuffix(diagramDifferences[2])
                },
                { 
                    title : '1 — 100 строк',
                    valueText: diagramCurrectCommits[3] + getDiagramSuffix(diagramCurrectCommits[3]),
                    differenceText: (diagramDifferences[3] > 0 ? '+' : '') + diagramDifferences[3] + getDiagramSuffix(diagramDifferences[3])
                }
            ]
        }
    });



    // ** Реализация слайда 'activity' *

    // Название дней недели
    const dayNames = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];

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


    // Возвращаем слайды
    return slides;
}

module.exports = { prepareData }