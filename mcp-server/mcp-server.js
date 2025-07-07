// mcp-server.js
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

// Адрес вашего REST API сервера Битрикс24
const API_BASE_URL = "http://localhost:3000/api";

async function main() {
  console.error("Инициализация Bitrix24 MCP сервера...");
  
  // Создаем MCP сервер
  const server = new McpServer({
    name: "Bitrix24MCP",
    version: "1.0.0",
  });

  // Проверка соединения с API сервером при запуске
  try {
    const response = await axios.get(`${API_BASE_URL}/lead-statuses`);
    console.error("Соединение с API сервером успешно установлено");
    console.error("Тестовый ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
  } catch (error) {
    console.error("Ошибка соединения с API сервером:", error.message);
    console.error("Убедитесь, что REST API сервер запущен на порту 3000");
  }

 // инструменты для работы с лидами

  // Инструмент для получения списка лидов
  server.tool(
    "getLeads",
    {
      filter: z.string().optional().describe("JSON-строка с фильтром для лидов")
    },
    async ({ filter }) => {
      try {
        const params = {};
        if (filter) {
          params.filter = filter;
        }
        
        console.error(`Отправка запроса GET ${API_BASE_URL}/leads с параметрами:`, params);
        const response = await axios.get(`${API_BASE_URL}/leads`, { params });
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении лидов:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении лидов: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения информации о конкретном лиде
  server.tool(
    "getLead",
    {
      id: z.string().describe("ID лида")
    },
    async ({ id }) => {
      try {
        console.error(`Отправка запроса GET ${API_BASE_URL}/leads/${id}`);
        const response = await axios.get(`${API_BASE_URL}/leads/${id}`);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении лида:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении лида: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для создания нового лида
  server.tool(
    "createLead",
    {
      title: z.string().describe("Название лида"),
      name: z.string().optional().describe("Имя контакта"),
      lastName: z.string().optional().describe("Фамилия контакта"),
      phone: z.string().optional().describe("Телефон контакта"),
      email: z.string().optional().describe("Email контакта"),
      statusId: z.string().optional().describe("ID статуса лида")
    },
    async ({ title, name, lastName, phone, email, statusId }) => {
      try {
        const leadData = {
          TITLE: title
        };
        
        if (name) leadData.NAME = name;
        if (lastName) leadData.LAST_NAME = lastName;
        if (statusId) leadData.STATUS_ID = statusId;
        
        if (phone) {
          leadData.PHONE = [
            { VALUE: phone, VALUE_TYPE: "WORK" }
          ];
        }
        
        if (email) {
          leadData.EMAIL = [
            { VALUE: email, VALUE_TYPE: "WORK" }
          ];
        }
        
        console.error(`Отправка запроса POST ${API_BASE_URL}/leads с данными:`, leadData);
        const response = await axios.post(`${API_BASE_URL}/leads`, leadData);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при создании лида:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при создании лида: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для обновления лида
  server.tool(
    "updateLead",
    {
      id: z.string().describe("ID лида"),
      title: z.string().optional().describe("Название лида"),
      name: z.string().optional().describe("Имя контакта"),
      lastName: z.string().optional().describe("Фамилия контакта"),
      phone: z.string().optional().describe("Телефон контакта"),
      email: z.string().optional().describe("Email контакта"),
      statusId: z.string().optional().describe("ID статуса лида")
    },
    async ({ id, title, name, lastName, phone, email, statusId }) => {
      try {
        const leadData = {};
        
        if (title) leadData.TITLE = title;
        if (name) leadData.NAME = name;
        if (lastName) leadData.LAST_NAME = lastName;
        if (statusId) leadData.STATUS_ID = statusId;
        
        if (phone) {
          leadData.PHONE = [
            { VALUE: phone, VALUE_TYPE: "WORK" }
          ];
        }
        
        if (email) {
          leadData.EMAIL = [
            { VALUE: email, VALUE_TYPE: "WORK" }
          ];
        }
        
        console.error(`Отправка запроса PUT ${API_BASE_URL}/leads/${id} с данными:`, leadData);
        const response = await axios.put(`${API_BASE_URL}/leads/${id}`, leadData);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при обновлении лида:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при обновлении лида: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения статусов лидов
  server.tool(
    "getLeadStatuses",
    {},
    async () => {
      try {
        console.error(`Отправка запроса GET ${API_BASE_URL}/lead-statuses`);
        const response = await axios.get(`${API_BASE_URL}/lead-statuses`);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении статусов лидов:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении статусов лидов: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // инструменты для работы со сделками

  // Инструмент для получения списка сделок
  server.tool(
    "getDeals",
    {
      filter: z.string().optional().describe("JSON-строка с фильтром для сделок")
    },
    async ({ filter }) => {
      try {
        const params = {};
        if (filter) {
          params.filter = filter;
        }
        
        console.error(`Отправка запроса GET ${API_BASE_URL}/deals с параметрами:`, params);
        const response = await axios.get(`${API_BASE_URL}/deals`, { params });
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении сделок:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении сделок: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения конкретной сделки
  server.tool(
    "getDeal",
    {
      id: z.string().describe("ID сделки")
    },
    async ({ id }) => {
      try {
        console.error(`Отправка запроса GET ${API_BASE_URL}/deals/${id}`);
        const response = await axios.get(`${API_BASE_URL}/deals/${id}`);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении сделки:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении сделки: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для создания новой сделки
  server.tool(
    "createDeal",
    {
      title: z.string().describe("Название сделки"),
      contactId: z.string().optional().describe("ID контакта"),
      companyId: z.string().optional().describe("ID компании"),
      categoryId: z.string().optional().describe("ID категории (воронки)"),
      stageId: z.string().optional().describe("ID стадии сделки"),
      amount: z.string().optional().describe("Сумма сделки"),
      currency: z.string().optional().describe("Валюта сделки"),
      responsibleId: z.string().optional().describe("ID ответственного")
    },
    async ({ title, contactId, companyId, categoryId, stageId, amount, currency, responsibleId }) => {
      try {
        const dealData = {
          TITLE: title
        };
        
        if (contactId) dealData.CONTACT_ID = contactId;
        if (companyId) dealData.COMPANY_ID = companyId;
        if (categoryId) dealData.CATEGORY_ID = categoryId;
        if (stageId) dealData.STAGE_ID = stageId;
        if (amount) dealData.OPPORTUNITY = amount;
        if (currency) dealData.CURRENCY_ID = currency;
        if (responsibleId) dealData.ASSIGNED_BY_ID = responsibleId;
        
        console.error(`Отправка запроса POST ${API_BASE_URL}/deals с данными:`, dealData);
        const response = await axios.post(`${API_BASE_URL}/deals`, dealData);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при создании сделки:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при создании сделки: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для обновления сделки
  server.tool(
    "updateDeal",
    {
      id: z.string().describe("ID сделки"),
      title: z.string().optional().describe("Название сделки"),
      contactId: z.string().optional().describe("ID контакта"),
      companyId: z.string().optional().describe("ID компании"),
      categoryId: z.string().optional().describe("ID категории (воронки)"),
      stageId: z.string().optional().describe("ID стадии сделки"),
      amount: z.string().optional().describe("Сумма сделки"),
      currency: z.string().optional().describe("Валюта сделки"),
      responsibleId: z.string().optional().describe("ID ответственного")
    },
    async ({ id, title, contactId, companyId, categoryId, stageId, amount, currency, responsibleId }) => {
      try {
        const dealData = {};
        
        if (title) dealData.TITLE = title;
        if (contactId) dealData.CONTACT_ID = contactId;
        if (companyId) dealData.COMPANY_ID = companyId;
        if (categoryId) dealData.CATEGORY_ID = categoryId;
        if (stageId) dealData.STAGE_ID = stageId;
        if (amount) dealData.OPPORTUNITY = amount;
        if (currency) dealData.CURRENCY_ID = currency;
        if (responsibleId) dealData.ASSIGNED_BY_ID = responsibleId;
        
        console.error(`Отправка запроса PUT ${API_BASE_URL}/deals/${id} с данными:`, dealData);
        const response = await axios.put(`${API_BASE_URL}/deals/${id}`, dealData);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при обновлении сделки:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при обновлении сделки: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения категорий сделок (воронок)
  server.tool(
    "getDealCategories",
    {},
    async () => {
      try {
        console.error(`Отправка запроса GET ${API_BASE_URL}/deal-categories`);
        const response = await axios.get(`${API_BASE_URL}/deal-categories`);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении категорий сделок:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении категорий сделок: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения стадий сделок
  server.tool(
    "getDealStages",
    {
      categoryId: z.string().optional().describe("ID категории сделок (воронки)")
    },
    async ({ categoryId }) => {
      try {
        const url = categoryId 
          ? `${API_BASE_URL}/deal-stages/${categoryId}` 
          : `${API_BASE_URL}/deal-stages`;
          
        console.error(`Отправка запроса GET ${url}`);
        const response = await axios.get(url);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении стадий сделок:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении стадий сделок: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // инструменты для работы с контактами

  // Инструмент для получения списка контактов
  server.tool(
    "getContacts",
    {
      filter: z.string().optional().describe("JSON-строка с фильтром для контактов")
    },
    async ({ filter }) => {
      try {
        const params = {};
        if (filter) {
          params.filter = filter;
        }
        
        console.error(`Отправка запроса GET ${API_BASE_URL}/contacts с параметрами:`, params);
        const response = await axios.get(`${API_BASE_URL}/contacts`, { params });
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении контактов:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении контактов: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения конкретного контакта
  server.tool(
    "getContact",
    {
      id: z.string().describe("ID контакта")
    },
    async ({ id }) => {
      try {
        console.error(`Отправка запроса GET ${API_BASE_URL}/contacts/${id}`);
        const response = await axios.get(`${API_BASE_URL}/contacts/${id}`);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении контакта:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении контакта: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // инструменты для работы с активностями

  // Инструмент для получения списка активностей
  server.tool(
    "getActivities",
    {
      filter: z.string().optional().describe("JSON-строка с фильтром для активностей")
    },
    async ({ filter }) => {
      try {
        const params = {};
        if (filter) {
          params.filter = filter;
        }
        
        console.error(`Отправка запроса GET ${API_BASE_URL}/activities с параметрами:`, params);
        const response = await axios.get(`${API_BASE_URL}/activities`, { params });
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении активностей:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении активностей: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения конкретной активности
  server.tool(
    "getActivity",
    {
      id: z.string().describe("ID активности")
    },
    async ({ id }) => {
      try {
        console.error(`Отправка запроса GET ${API_BASE_URL}/activities/${id}`);
        const response = await axios.get(`${API_BASE_URL}/activities/${id}`);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении активности:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении активности: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для создания новой активности
  server.tool(
    "createActivity",
    {
      ownerTypeId: z.string().describe("ID типа владельца (например, 1 - лид, 2 - сделка)"),
      ownerId: z.string().describe("ID владельца"),
      typeId: z.string().describe("ID типа активности"),
      subject: z.string().describe("Тема активности"),
      description: z.string().optional().describe("Описание активности"),
      responsibleId: z.string().optional().describe("ID ответственного пользователя"),
      priority: z.string().optional().describe("Приоритет активности")
    },
    async ({ ownerTypeId, ownerId, typeId, subject, description, responsibleId, priority }) => {
      try {
        const activityData = {
          OWNER_TYPE_ID: ownerTypeId,
          OWNER_ID: ownerId,
          TYPE_ID: typeId,
          SUBJECT: subject
        };
        
        if (description) activityData.DESCRIPTION = description;
        if (responsibleId) activityData.RESPONSIBLE_ID = responsibleId;
        if (priority) activityData.PRIORITY = priority;
        
        console.error(`Отправка запроса POST ${API_BASE_URL}/activities с данными:`, activityData);
        const response = await axios.post(`${API_BASE_URL}/activities`, activityData);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при создании активности:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при создании активности: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для обновления активности
  server.tool(
    "updateActivity",
    {
      id: z.string().describe("ID активности"),
      subject: z.string().optional().describe("Тема активности"),
      description: z.string().optional().describe("Описание активности"),
      responsibleId: z.string().optional().describe("ID ответственного пользователя"),
      priority: z.string().optional().describe("Приоритет активности"),
      completed: z.boolean().optional().describe("Статус завершения активности")
    },
    async ({ id, subject, description, responsibleId, priority, completed }) => {
      try {
        const activityData = {};
        
        if (subject) activityData.SUBJECT = subject;
        if (description) activityData.DESCRIPTION = description;
        if (responsibleId) activityData.RESPONSIBLE_ID = responsibleId;
        if (priority) activityData.PRIORITY = priority;
        if (completed !== undefined) activityData.COMPLETED = completed ? 'Y' : 'N';
        
        console.error(`Отправка запроса PUT ${API_BASE_URL}/activities/${id} с данными:`, activityData);
        const response = await axios.put(`${API_BASE_URL}/activities/${id}`, activityData);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при обновлении активности:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при обновлении активности: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // инструменты для работы с пользователями

  // Инструмент для получения списка пользователей
  server.tool(
    "getUsers",
    {
      filter: z.string().optional().describe("JSON-строка с фильтром для пользователей")
    },
    async ({ filter }) => {
      try {
        const params = {};
        if (filter) {
          params.filter = filter;
        }
        
        console.error(`Отправка запроса GET ${API_BASE_URL}/users с параметрами:`, params);
        const response = await axios.get(`${API_BASE_URL}/users`, { params });
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении пользователей:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении пользователей: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения конкретного пользователя
  server.tool(
    "getUser",
    {
      id: z.string().describe("ID пользователя")
    },
    async ({ id }) => {
      try {
        console.error(`Отправка запроса GET ${API_BASE_URL}/users/${id}`);
        const response = await axios.get(`${API_BASE_URL}/users/${id}`);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении пользователя:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении пользователя: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // инструменты для работы с задачами

  // Инструмент для получения списка задач
  server.tool(
    "getTasks",
    {
      filter: z.string().optional().describe("JSON-строка с фильтром для задач")
    },
    async ({ filter }) => {
      try {
        const params = {};
        if (filter) {
          params.filter = filter;
        }
        
        console.error(`Отправка запроса GET ${API_BASE_URL}/tasks с параметрами:`, params);
        const response = await axios.get(`${API_BASE_URL}/tasks`, { params });
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении задач:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении задач: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения детальной информации о задаче
  server.tool(
    "getTask",
    {
      id: z.string().describe("ID задачи")
    },
    async ({ id }) => {
      try {
        console.error(`Отправка запроса GET ${API_BASE_URL}/tasks/${id}`);
        const response = await axios.get(`${API_BASE_URL}/tasks/${id}`);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении задачи:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении задачи: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения комментариев к задаче
  server.tool(
    "getTaskComments",
    {
      id: z.string().describe("ID задачи")
    },
    async ({ id }) => {
      try {
        console.error(`Отправка запроса GET ${API_BASE_URL}/tasks/${id}/comments`);
        const response = await axios.get(`${API_BASE_URL}/tasks/${id}/comments`);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении комментариев:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении комментариев: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для добавления комментария к задаче
  server.tool(
    "addTaskComment",
    {
      id: z.string().describe("ID задачи"),
      text: z.string().describe("Текст комментария")
    },
    async ({ id, text }) => {
      try {
        console.error(`Отправка запроса POST ${API_BASE_URL}/tasks/${id}/comments с текстом:`, text);
        const response = await axios.post(`${API_BASE_URL}/tasks/${id}/comments`, { text });
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при добавлении комментария:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при добавлении комментария: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // инструменты для работы с телефонией

  // Инструмент для получения статистики звонков
  server.tool(
    "getCallStatistics",
    {
      dateFrom: z.string().optional().describe("Дата начала периода в формате YYYY-MM-DD"),
      dateTo: z.string().optional().describe("Дата окончания периода в формате YYYY-MM-DD")
    },
    async ({ dateFrom, dateTo }) => {
      try {
        let filter = {};
        
        if (dateFrom) filter.START_DATE_from = dateFrom;
        if (dateTo) filter.START_DATE_to = dateTo;
        
        const params = { filter: JSON.stringify(filter) };
        console.error(`Отправка запроса GET ${API_BASE_URL}/call-statistics с параметрами:`, params);
        const response = await axios.get(`${API_BASE_URL}/call-statistics`, { params });
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении статистики звонков:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении статистики звонков: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // инструменты для работы с файлами

  // Инструмент для получения информации о файле
  server.tool(
    "getFile",
    {
      id: z.string().describe("ID файла")
    },
    async ({ id }) => {
      try {
        console.error(`Отправка запроса GET ${API_BASE_URL}/files/${id}`);
        const response = await axios.get(`${API_BASE_URL}/files/${id}`);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении информации о файле:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении информации о файле: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // инструменты для работы с таймлайном

  // Инструмент для добавления комментария в таймлайн
  server.tool(
    "addTimelineComment",
    {
      entityType: z.string().describe("Тип сущности (lead, deal, contact, etc.)"),
      entityId: z.string().describe("ID сущности"),
      comment: z.string().describe("Текст комментария")
    },
    async ({ entityType, entityId, comment }) => {
      try {
        console.error(`Отправка запроса POST ${API_BASE_URL}/timeline-comment/${entityType}/${entityId} с данными:`, { comment });
        const response = await axios.post(
          `${API_BASE_URL}/timeline-comment/${entityType}/${entityId}`, 
          { comment }
        );
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при добавлении комментария:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при добавлении комментария: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // инструменты для сводной информации

  // Инструмент для получения сводной информации о CRM
  server.tool(
    "getCrmSummary",
    {},
    async () => {
      try {
        const promises = [
          axios.get(`${API_BASE_URL}/leads`, { params: { filter: JSON.stringify({ LIMIT: 1 }) } }),
          axios.get(`${API_BASE_URL}/deals`, { params: { filter: JSON.stringify({ LIMIT: 1 }) } }),
          axios.get(`${API_BASE_URL}/contacts`, { params: { filter: JSON.stringify({ LIMIT: 1 }) } }),
          axios.get(`${API_BASE_URL}/lead-statuses`),
          axios.get(`${API_BASE_URL}/deal-categories`)
        ];
        
        console.error(`Отправка множественных запросов для получения сводной информации`);
        const [leadsRes, dealsRes, contactsRes, statusesRes, categoriesRes] = await Promise.all(promises);
        
        const summary = {
          totalLeads: leadsRes.data.totalCount || 0,
          totalDeals: dealsRes.data.totalCount || 0,
          totalContacts: contactsRes.data.totalCount || 0,
          leadStatuses: statusesRes.data.statuses || [],
          dealCategories: categoriesRes.data.categories || []
        };
        
        console.error("Получена сводная информация о CRM");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summary, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении сводной информации:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении сводной информации: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // служебные инструменты

  // Инструмент для проверки статуса соединения с API
  server.tool(
    "checkApiConnection",
    {},
    async () => {
      try {
        const startTime = Date.now();
        console.error(`Проверка соединения с API сервером: ${API_BASE_URL}`);
        const response = await axios.get(`${API_BASE_URL}/lead-statuses`);
        const endTime = Date.now();
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "connected",
                endpoint: API_BASE_URL,
                responseTime: `${endTime - startTime} ms`,
                timestamp: new Date().toISOString()
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка соединения с API сервером:", error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "error",
                endpoint: API_BASE_URL,
                error: error.message || 'Неизвестная ошибка',
                timestamp: new Date().toISOString()
              }, null, 2)
            }
          ]
        };
      }
    }
  );

  // инструменты для работы с чатами

  // Инструмент для получения списка сообщений
  server.tool(
    "getMessages",
    {
      filter: z.string().optional().describe("JSON-строка с фильтром для сообщений")
    },
    async ({ filter }) => {
      try {
        const params = {};
        if (filter) {
          params.filter = filter;
        }
        
        console.error(`Отправка запроса GET ${API_BASE_URL}/messages с параметрами:`, params);
        const response = await axios.get(`${API_BASE_URL}/messages`, { params });
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении сообщений:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении сообщений: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения списка диалогов
  server.tool(
    "getDialogs",
    {
      filter: z.string().optional().describe("JSON-строка с фильтром для диалогов")
    },
    async ({ filter }) => {
      try {
        const params = {};
        if (filter) {
          params.filter = filter;
        }
        
        console.error(`Отправка запроса GET ${API_BASE_URL}/dialogs с параметрами:`, params);
        const response = await axios.get(`${API_BASE_URL}/dialogs`, { params });
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении диалогов:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении диалогов: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения информации о диалоге
  server.tool(
    "getDialog",
    {
      dialogId: z.string().describe("ID диалога")
    },
    async ({ dialogId }) => {
      try {
        console.error(`Отправка запроса GET ${API_BASE_URL}/dialogs/${dialogId}`);
        const response = await axios.get(`${API_BASE_URL}/dialogs/${dialogId}`);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении диалога:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении диалога: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения истории диалога
  server.tool(
    "getDialogHistory",
    {
      dialogId: z.string().describe("ID диалога"),
      lastId: z.string().optional().describe("ID последнего сообщения для пагинации")
    },
    async ({ dialogId, lastId }) => {
      try {
        const params = {};
        if (lastId) {
          params.lastId = lastId;
        }
        
        console.error(`Отправка запроса GET ${API_BASE_URL}/dialogs/${dialogId}/history с параметрами:`, params);
        const response = await axios.get(`${API_BASE_URL}/dialogs/${dialogId}/history`, { params });
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении истории диалога:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении истории диалога: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // инструменты для работы с LiveChat

  // Инструмент для получения диалогов LiveChat
  server.tool(
    "getLiveChatDialogs",
    {
      filter: z.string().optional().describe("JSON-строка с фильтром для диалогов LiveChat")
    },
    async ({ filter }) => {
      try {
        const params = {};
        if (filter) {
          params.filter = filter;
        }
        
        console.error(`Отправка запроса GET ${API_BASE_URL}/livechat/dialogs с параметрами:`, params);
        const response = await axios.get(`${API_BASE_URL}/livechat/dialogs`, { params });
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении диалогов LiveChat:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении диалогов LiveChat: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения сообщений LiveChat
  server.tool(
    "getLiveChatMessages",
    {
      sessionId: z.string().describe("ID сессии LiveChat")
    },
    async ({ sessionId }) => {
      try {
        console.error(`Отправка запроса GET ${API_BASE_URL}/livechat/messages/${sessionId}`);
        const response = await axios.get(`${API_BASE_URL}/livechat/messages/${sessionId}`);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении сообщений LiveChat:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении сообщений LiveChat: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения статистики LiveChat
  server.tool(
    "getLiveChatStatistics",
    {
      filter: z.string().optional().describe("JSON-строка с фильтром для статистики LiveChat")
    },
    async ({ filter }) => {
      try {
        const params = {};
        if (filter) {
          params.filter = filter;
        }
        
        console.error(`Отправка запроса GET ${API_BASE_URL}/livechat/statistics с параметрами:`, params);
        const response = await axios.get(`${API_BASE_URL}/livechat/statistics`, { params });
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении статистики LiveChat:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении статистики LiveChat: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения операторов LiveChat
  server.tool(
    "getLiveChatOperators",
    {},
    async () => {
      try {
        console.error(`Отправка запроса GET ${API_BASE_URL}/livechat/operators`);
        const response = await axios.get(`${API_BASE_URL}/livechat/operators`);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении операторов LiveChat:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении операторов LiveChat: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для получения информации о сессии LiveChat
  server.tool(
    "getLiveChatSession",
    {
      sessionId: z.string().describe("ID сессии LiveChat")
    },
    async ({ sessionId }) => {
      try {
        console.error(`Отправка запроса GET ${API_BASE_URL}/livechat/session/${sessionId}`);
        const response = await axios.get(`${API_BASE_URL}/livechat/session/${sessionId}`);
        console.error("Получен ответ:", JSON.stringify(response.data).substring(0, 100) + "...");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при получении сессии LiveChat:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при получении сессии LiveChat: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );

  // Инструмент для анализа тональности сообщений
  server.tool(
    "analyzeChatSentiment",
    {
      messages: z.array(z.string()).describe("Массив текстов сообщений для анализа тональности")
    },
    async ({ messages }) => {
      try {
        // Простой анализ тональности на основе ключевых слов
        const positiveWords = ['хорошо', 'отлично', 'спасибо', 'благодарю', 'замечательно', 'прекрасно', 'удобно', 'помогли', 'решили', 'довольны'];
        const negativeWords = ['плохо', 'ужасно', 'проблема', 'ошибка', 'не работает', 'жалоба', 'недоволен', 'расстроен', 'сломано', 'не нравится'];
        
        const analysis = messages.map((message, index) => {
          const lowerMessage = message.toLowerCase();
          let positiveCount = 0;
          let negativeCount = 0;
          
          positiveWords.forEach(word => {
            if (lowerMessage.includes(word)) positiveCount++;
          });
          
          negativeWords.forEach(word => {
            if (lowerMessage.includes(word)) negativeCount++;
          });
          
          let sentiment = 'neutral';
          if (positiveCount > negativeCount) {
            sentiment = 'positive';
          } else if (negativeCount > positiveCount) {
            sentiment = 'negative';
          }
          
          return {
            messageIndex: index,
            text: message,
            sentiment: sentiment,
            confidence: Math.abs(positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1),
            positiveKeywords: positiveCount,
            negativeKeywords: negativeCount
          };
        });
        
        // Общая статистика
        const totalMessages = messages.length;
        const positiveMessages = analysis.filter(a => a.sentiment === 'positive').length;
        const negativeMessages = analysis.filter(a => a.sentiment === 'negative').length;
        const neutralMessages = analysis.filter(a => a.sentiment === 'neutral').length;
        
        const result = {
          analysis: analysis,
          summary: {
            totalMessages: totalMessages,
            positive: positiveMessages,
            negative: negativeMessages,
            neutral: neutralMessages,
            positivePercentage: Math.round((positiveMessages / totalMessages) * 100),
            negativePercentage: Math.round((negativeMessages / totalMessages) * 100),
            neutralPercentage: Math.round((neutralMessages / totalMessages) * 100)
          }
        };
        
        console.error("Анализ тональности выполнен для", totalMessages, "сообщений");
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        console.error("Ошибка при анализе тональности:", error);
        return {
          content: [
            {
              type: "text",
              text: `Ошибка при анализе тональности: ${error.message || 'Неизвестная ошибка'}`
            }
          ]
        };
      }
    }
  );


  // Запуск сервера с использованием stdio транспорта
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("Bitrix24 MCP сервер успешно запущен и готов к работе");
  console.error("Доступны следующие группы инструментов:");
  console.error(" - Лиды: getLeads, getLead, createLead, updateLead, getLeadStatuses");
  console.error(" - Сделки: getDeals, getDeal, createDeal, updateDeal, getDealCategories, getDealStages");
  console.error(" - Контакты: getContacts, getContact");
  console.error(" - Активности: getActivities, getActivity, createActivity, updateActivity");
  console.error(" - Пользователи: getUsers, getUser");
  console.error(" - Задачи: getTasks");
  console.error(" - Телефония: getCallStatistics");
  console.error(" - Файлы: getFile");
  console.error(" - Таймлайн: addTimelineComment");
  console.error(" - Чаты: getMessages, getDialogs, getDialog, getDialogHistory");
  console.error(" - LiveChat: getLiveChatDialogs, getLiveChatMessages, getLiveChatStatistics, getLiveChatOperators, getLiveChatSession");
  console.error(" - Анализ: analyzeChatSentiment");
  console.error(" - Сводная информация: getCrmSummary");
  console.error(" - Служебные: checkApiConnection");
}

// Запускаем наш сервер и обрабатываем возможные ошибки
main().catch(error => {
  console.error("Критическая ошибка в MCP сервере:", error);
  process.exit(1);
});