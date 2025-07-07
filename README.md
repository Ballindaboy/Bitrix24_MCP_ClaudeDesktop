# Bitrix24 MCP Server

## Обзор

Bitrix24 MCP (Model-Controller-Presenter) Server - это серверное приложение, предоставляющее REST API для взаимодействия с Bitrix24 CRM. Сервер использует архитектурный паттерн MCP для организации кода и обеспечения четкого разделения ответственности между компонентами.

## Особенности

- Полный доступ к основным сущностям Bitrix24 CRM (сделки, лиды, контакты, задачи и т.д.)
- Форматирование данных для удобного использования на клиентской стороне
- Логирование запросов и ответов
- Обработка ошибок и исключений
- CORS поддержка для взаимодействия с фронтенд-приложениями

## Требования

- Node.js (версия 14.x или выше)
- npm (версия 6.x или выше)
- Доступ к Bitrix24 с настроенным webhook

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/bitrix24-mcp-server.git
cd bitrix24-mcp-server
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` в корневой директории проекта со следующими параметрами:
```
PORT=3000
BITRIX_DOMAIN=your-domain.bitrix24.ru
BITRIX_WEBHOOK_TOKEN=your-webhook-token
LOG_LEVEL=info
```

4. Запустите сервер:
```bash
npm start
```

## Архитектура

Сервер построен на основе архитектурного паттерна MCP (Model-Controller-Presenter):

- **Model (Bitrix24Model)**: Отвечает за взаимодействие с API Bitrix24 и обработку данных.
- **Controller (Bitrix24Controller)**: Обрабатывает HTTP-запросы, применяет бизнес-логику и координирует работу модели и презентера.
- **Presenter (Bitrix24Presenter)**: Форматирует данные для представления клиенту.

## API Endpoints

### Задачи

- `GET /api/tasks` - Получение списка задач
  - Query параметры:
    - `filter` - JSON-строка с фильтрами (опционально)

### Контакты

- `GET /api/contacts` - Получение списка контактов
  - Query параметры:
    - `filter` - JSON-строка с фильтрами (опционально)

### Сделки

- `GET /api/deals` - Получение списка сделок
  - Query параметры:
    - `filter` - JSON-строка с фильтрами (опционально)
- `GET /api/deals/:id` - Получение сделки по ID
- `POST /api/deals` - Создание новой сделки
  - Body: объект с данными сделки
- `PUT /api/deals/:id` - Обновление сделки
  - Body: объект с данными для обновления
- `GET /api/deal-categories` - Получение воронок продаж
- `GET /api/deal-stages/:categoryId?` - Получение стадий сделок для указанной воронки

### Лиды

- `GET /api/leads` - Получение списка лидов
  - Query параметры:
    - `filter` - JSON-строка с фильтрами (опционально)
- `GET /api/leads/:id` - Получение лида по ID
- `POST /api/leads` - Создание нового лида
  - Body: объект с данными лида
- `PUT /api/leads/:id` - Обновление лида
  - Body: объект с данными для обновления
- `GET /api/lead-statuses` - Получение статусов лидов

### Активности (дела)

- `GET /api/activities` - Получение списка активностей
  - Query параметры:
    - `filter` - JSON-строка с фильтрами (опционально)
- `GET /api/activities/:id` - Получение активности по ID
- `POST /api/activities` - Создание новой активности
  - Body: объект с данными активности
- `PUT /api/activities/:id` - Обновление активности
  - Body: объект с данными для обновления

### Пользователи

- `GET /api/users` - Получение списка пользователей
  - Query параметры:
    - `filter` - JSON-строка с фильтрами (опционально)
- `GET /api/users/:id` - Получение пользователя по ID

### Таймлайн

- `POST /api/timeline-comment/:entityType/:entityId` - Добавление комментария в таймлайн
  - Body: `{ "comment": "Текст комментария" }`

### Телефония

- `GET /api/call-statistics` - Получение статистики звонков
  - Query параметры:
    - `filter` - JSON-строка с фильтрами (опционально)

### Файлы

- `GET /api/files/:id` - Получение информации о файле
- `GET /api/files/:id/download` - Скачивание файла

### Чаты и сообщения

- `GET /api/messages` - Получение списка сообщений из чатов
  - Query параметры:
    - `filter` - JSON-строка с фильтрами (опционально)
- `GET /api/dialogs` - Получение списка диалогов
  - Query параметры:
    - `filter` - JSON-строка с фильтрами (опционально)
- `GET /api/dialogs/:dialogId` - Получение информации о конкретном диалоге
- `GET /api/dialogs/:dialogId/history` - Получение истории сообщений диалога
  - Query параметры:
    - `lastId` - ID последнего сообщения для пагинации (опционально)

### LiveChat (Открытые линии)

- `GET /api/livechat/dialogs` - Получение диалогов из открытых линий
  - Query параметры:
    - `filter` - JSON-строка с фильтрами (опционально)
- `GET /api/livechat/messages/:sessionId` - Получение сообщений из сессии LiveChat
- `GET /api/livechat/statistics` - Получение статистики открытых линий
  - Query параметры:
    - `filter` - JSON-строка с фильтрами (опционально)
- `GET /api/livechat/operators` - Получение списка операторов открытых линий
- `GET /api/livechat/session/:sessionId` - Получение информации о сессии LiveChat

## Примеры использования

### Получение списка сделок

```javascript
// Клиентский код
async function getDeals() {
  try {
    const response = await fetch('http://localhost:3000/api/deals');
    const data = await response.json();
    console.log(data.deals);
  } catch (error) {
    console.error('Ошибка при получении сделок:', error);
  }
}
```

### Создание нового лида

```javascript
// Клиентский код
async function createLead() {
  try {
    const leadData = {
      TITLE: 'Новый лид с сайта',
      NAME: 'Иван',
      LAST_NAME: 'Иванов',
      STATUS_ID: 'NEW',
      PHONE: [{ VALUE_TYPE: 'WORK', VALUE: '+7 (999) 123-45-67' }],
      EMAIL: [{ VALUE_TYPE: 'WORK', VALUE: 'ivan@example.com' }]
    };
    
    const response = await fetch('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(leadData)
    });
    
    const result = await response.json();
    console.log('Лид создан:', result);
  } catch (error) {
    console.error('Ошибка при создании лида:', error);
  }
}
```

### Обновление сделки

```javascript
// Клиентский код
async function updateDeal(dealId, stageId) {
  try {
    const dealData = {
      STAGE_ID: stageId
    };
    
    const response = await fetch(`http://localhost:3000/api/deals/${dealId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dealData)
    });
    
    const result = await response.json();
    console.log('Сделка обновлена:', result);
  } catch (error) {
    console.error('Ошибка при обновлении сделки:', error);
  }
}
```

### Получение сообщений чата

```javascript
// Клиентский код
async function getChatMessages() {
  try {
    const filter = JSON.stringify({
      DIALOG_ID: 'chat123'
    });
    
    const response = await fetch(`http://localhost:3000/api/messages?filter=${encodeURIComponent(filter)}`);
    const data = await response.json();
    console.log('Сообщения чата:', data.messages);
  } catch (error) {
    console.error('Ошибка при получении сообщений:', error);
  }
}
```

### Получение диалогов LiveChat

```javascript
// Клиентский код
async function getLiveChatDialogs() {
  try {
    const response = await fetch('http://localhost:3000/api/livechat/dialogs');
    const data = await response.json();
    console.log('Диалоги LiveChat:', data.dialogs);
  } catch (error) {
    console.error('Ошибка при получении диалогов LiveChat:', error);
  }
}
```

### Анализ тональности сообщений (через MCP)

```javascript
// Пример использования MCP инструмента для анализа тональности
const messages = [
  "Спасибо за отличную работу!",
  "У меня проблема с заказом",
  "Все хорошо, доволен сервисом"
];

const result = await model.useToolWithMcp("Bitrix24MCP", "analyzeChatSentiment", { messages });
console.log('Анализ тональности:', result);
```

## Логирование

Сервер использует встроенный механизм логирования для отслеживания запросов и ответов. Уровень логирования можно настроить в файле `.env` с помощью параметра `LOG_LEVEL`.

Доступные уровни логирования:
- `error` - только ошибки
- `warn` - предупреждения и ошибки
- `info` - информационные сообщения, предупреждения и ошибки (по умолчанию)
- `debug` - отладочная информация и все вышеперечисленное

## Обработка ошибок

Сервер обрабатывает ошибки и возвращает соответствующие HTTP-статусы и сообщения:

- `400 Bad Request` - неверный формат запроса
- `404 Not Found` - ресурс не найден
- `500 Internal Server Error` - внутренняя ошибка сервера

Пример ответа с ошибкой:
```json
{
  "error": "Ошибка при получении данных из Bitrix24 API"
}
```

## Безопасность

- Используйте HTTPS для защиты данных при передаче
- Храните webhook-токен в безопасном месте и не включайте его в код
- Регулярно обновляйте webhook-токен для минимизации рисков

## Лицензия

MIT

## MCP Сервер (mcp-server.js)

### Обзор

`mcp-server.js` - это реализация MCP (Model Context Protocol) сервера для Bitrix24, который предоставляет набор инструментов для взаимодействия с Bitrix24 API через REST API сервер. MCP сервер работает как промежуточный слой между языковой моделью (LLM) и REST API сервером Bitrix24, позволяя языковой модели выполнять операции с данными Bitrix24 через структурированные инструменты.

### Принцип работы

MCP сервер использует библиотеку `@modelcontextprotocol/sdk` для создания и регистрации инструментов, которые могут быть вызваны языковой моделью. Каждый инструмент представляет собой функцию, которая:

1. Принимает параметры, определенные с помощью схемы Zod
2. Выполняет запрос к REST API серверу Bitrix24
3. Возвращает результат в структурированном формате

MCP сервер запускается через stdio транспорт, что позволяет ему взаимодействовать с языковой моделью через стандартные потоки ввода/вывода.

### Доступные инструменты

MCP сервер предоставляет следующие группы инструментов:

#### Лиды
- `getLeads` - получение списка лидов с возможностью фильтрации
- `getLead` - получение информации о конкретном лиде по ID
- `createLead` - создание нового лида
- `updateLead` - обновление существующего лида
- `getLeadStatuses` - получение списка статусов лидов

#### Сделки
- `getDeals` - получение списка сделок с возможностью фильтрации
- `getDeal` - получение информации о конкретной сделке по ID
- `createDeal` - создание новой сделки
- `updateDeal` - обновление существующей сделки
- `getDealCategories` - получение списка воронок продаж
- `getDealStages` - получение списка стадий сделок для указанной воронки

#### Контакты
- `getContacts` - получение списка контактов с возможностью фильтрации
- `getContact` - получение информации о конкретном контакте по ID

#### Активности
- `getActivities` - получение списка активностей с возможностью фильтрации
- `getActivity` - получение информации о конкретной активности по ID
- `createActivity` - создание новой активности
- `updateActivity` - обновление существующей активности

#### Пользователи
- `getUsers` - получение списка пользователей с возможностью фильтрации
- `getUser` - получение информации о конкретном пользователе по ID

#### Задачи
- `getTasks` - получение списка задач с возможностью фильтрации

#### Телефония
- `getCallStatistics` - получение статистики звонков

#### Файлы
- `getFile` - получение информации о файле по ID

#### Таймлайн
- `addTimelineComment` - добавление комментария в таймлайн сущности

#### Сводная информация
- `getCrmSummary` - получение сводной информации о CRM (количество лидов, сделок, контактов и т.д.)

#### Чаты и сообщения
- `getMessages` - получение списка сообщений из чатов с возможностью фильтрации
- `getDialogs` - получение списка диалогов с возможностью фильтрации
- `getDialog` - получение информации о конкретном диалоге по ID
- `getDialogHistory` - получение истории сообщений диалога с поддержкой пагинации

#### LiveChat (Открытые линии)
- `getLiveChatDialogs` - получение диалогов из открытых линий с возможностью фильтрации
- `getLiveChatMessages` - получение сообщений из сессии LiveChat по ID сессии
- `getLiveChatStatistics` - получение статистики открытых линий
- `getLiveChatOperators` - получение списка операторов открытых линий
- `getLiveChatSession` - получение информации о сессии LiveChat по ID

#### Анализ коммуникаций
- `analyzeChatSentiment` - анализ тональности сообщений с подсчетом позитивных, негативных и нейтральных реакций

#### Служебные инструменты
- `checkApiConnection` - проверка соединения с API сервером

### Настройка и использование

1. Установите зависимости:
```bash
cd mcp-server
npm install
```

2. Убедитесь, что REST API сервер Bitrix24 запущен на порту 3000 (или измените значение `API_BASE_URL` в файле `mcp-server.js`).

3. Запустите MCP сервер:
```bash
node mcp-server.js
```

4. Настройте языковую модель для использования MCP сервера, добавив его в конфигурацию MCP серверов.

### Настройка Claude Desktop для работы с MCP сервером

Для использования Bitrix24 MCP сервера с Claude Desktop, необходимо создать или отредактировать файл конфигурации `claude_desctop_config.json`. Этот файл должен быть размещен в следующей директории:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Пример содержимого файла `claude_desctop_config.json`:

```json
{
  "mcpServers": {
    "bitrix24": {
      "command": "node",
      "args": ["/полный/путь/к/mcp-server/mcp-server.js"],
      "env": {},
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Где:
- `bitrix24` - уникальное имя MCP сервера, которое будет использоваться для обращения к нему
- `command` - команда для запуска сервера (обычно `node`)
- `args` - массив аргументов команды, включая полный путь к файлу `mcp-server.js`
- `env` - объект с переменными окружения (можно оставить пустым, так как все настройки уже включены в `mcp-server.js`)
- `disabled` - флаг, указывающий, отключен ли сервер (должен быть `false` для работы)
- `autoApprove` - массив имен инструментов, которые могут быть вызваны без явного подтверждения пользователем (рекомендуется оставить пустым для безопасности)

После настройки файла конфигурации перезапустите Claude Desktop, и MCP сервер будет автоматически запущен и подключен к Claude. Теперь вы можете использовать инструменты Bitrix24 MCP сервера в диалоге с Claude.

### Пример использования инструмента через языковую модель

```javascript
// Пример вызова инструмента getLeads
const result = await model.useToolWithMcp("Bitrix24MCP", "getLeads", { filter: JSON.stringify({ STATUS_ID: "NEW" }) });
console.log(result); // Выводит список новых лидов
```

### Обработка ошибок

Каждый инструмент включает обработку ошибок и возвращает структурированный ответ даже в случае возникновения проблем. Ошибки логируются в консоль для отладки.

### Расширение функциональности

Для добавления новых инструментов используйте метод `server.tool()`, указав:
1. Имя инструмента
2. Схему параметров с использованием Zod
3. Асинхронную функцию-обработчик, которая выполняет запрос и возвращает результат
