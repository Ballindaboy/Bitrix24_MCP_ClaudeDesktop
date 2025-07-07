// server.js - Основной файл сервера

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const logger = require('./logger');

// Загружаем переменные окружения из .env файла
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Включаем CORS для возможности взаимодействия с фронтенд-приложениями

// Middleware для логирования запросов
app.use((req, res, next) => {
  req._startTime = Date.now();
  logger.logApiRequest(req);
  
  // Перехватываем отправку ответа для логирования
  const originalSend = res.send;
  res.send = function(data) {
    logger.logApiResponse(req, res, data);
    return originalSend.apply(res, arguments);
  };
  
  next();
});

// Конфигурация Битрикс24
const BITRIX_CONFIG = {
  domain: process.env.BITRIX_DOMAIN,
  webhook: process.env.BITRIX_WEBHOOK_TOKEN,
  apiEndpoint: '/rest'
};

// Model - работа с данными Битрикс24
class Bitrix24Model {
  constructor(config) {
    this.config = config;
    this.baseUrl = `https://${config.domain}${config.apiEndpoint}/${config.webhook}`;
  }

  async makeRequest(method, params = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/${method}`, params);
      return response.data;
    } catch (error) {
      console.error(`Error in Bitrix24 API call to ${method}:`, error.message);
      throw error;
    }
  }

  // Получение списка задач
  async getTasks(filter = {}) {
    return this.makeRequest('tasks.task.list', { filter });
  }

  // Получение детальной информации о задаче
  async getTask(taskId) {
    return this.makeRequest('tasks.task.get', { taskId });
  }

  // Получение комментариев к задаче
  async getTaskComments(taskId) {
    return this.makeRequest('task.commentitem.getlist', { taskId });
  }

  // Добавление комментария к задаче
  async addTaskComment(taskId, text) {
    return this.makeRequest('task.commentitem.add', { taskId, fields: { POST_MESSAGE: text } });
  }

  // Получение списка контактов
  async getContacts(filter = {}) {
    return this.makeRequest('crm.contact.list', { filter });
  }

  // Создание новой сделки
  async createDeal(dealData) {
    return this.makeRequest('crm.deal.add', { fields: dealData });
  }

  // Обновление данных сделки
  async updateDeal(id, dealData) {
    return this.makeRequest('crm.deal.update', { id, fields: dealData });
  }

  // Получение списка сделок
  async getDeals(filter = {}) {
    return this.makeRequest('crm.deal.list', { filter });
  }
  
  // Получение воронок продаж
  async getDealCategories() {
    return this.makeRequest('crm.dealcategory.list');
  }
  
  // Получение стадий сделок
  async getDealStages(categoryId = 0) {
    return this.makeRequest('crm.dealcategory.stage.list', { filter: { CATEGORY_ID: categoryId } });
  }
  
  // Получение конкретной сделки по ID
  async getDealById(id) {
    return this.makeRequest('crm.deal.get', { id });
  }
  
  // Получение списка лидов
  async getLeads(filter = {}) {
    return this.makeRequest('crm.lead.list', { filter });
  }
  
  // Получение конкретного лида по ID
  async getLeadById(id) {
    return this.makeRequest('crm.lead.get', { id });
  }
  
  // Создание нового лида
  async createLead(leadData) {
    return this.makeRequest('crm.lead.add', { fields: leadData });
  }
  
  // Обновление данных лида
  async updateLead(id, leadData) {
    return this.makeRequest('crm.lead.update', { id, fields: leadData });
  }
  
  // Получение стадий лидов
  async getLeadStatuses() {
    return this.makeRequest('crm.status.list', { filter: { ENTITY_ID: 'STATUS' } });
  }
  
  // Получение активностей (дела)
  async getActivity(id) {
    return this.makeRequest('crm.activity.get', { id });
  }
  
  // Обновление активности
  async updateActivity(id, activityData) {
    return this.makeRequest('crm.activity.update', { id, fields: activityData });
  }
  
  // Создание активности
  async createActivity(activityData) {
    return this.makeRequest('crm.activity.add', { fields: activityData });
  }
  
  // Получение списка активностей
  async getActivities(filter = {}) {
    return this.makeRequest('crm.activity.list', { filter });
  }
  
  // Получение информации о пользователе
  async getUser(id) {
    return this.makeRequest('user.get', { id });
  }
  
  // Получение списка пользователей
  async getUsers(filter = {}) {
    return this.makeRequest('user.search', { filter });
  }
  
  // Добавление комментария в таймлайн
  async addTimelineComment(entityId, entityType, comment) {
    return this.makeRequest('crm.timeline.comment.add', {
      fields: {
        ENTITY_ID: entityId,
        ENTITY_TYPE: entityType,
        COMMENT: comment
      }
    });
  }
  
  // Получение статистики звонков
  async getCallStatistics(filter = {}) {
    return this.makeRequest('voximplant.statistic.get', { filter });
  }
  
  // Получение файла
  async getFile(id) {
    return this.makeRequest('disk.file.get', { id });
  }
  
  // Загрузка файла
  async downloadFile(id) {
    const fileInfo = await this.getFile(id);
    
    if (fileInfo && fileInfo.result && fileInfo.result.DOWNLOAD_URL) {
      try {
        const response = await axios.get(fileInfo.result.DOWNLOAD_URL, {
          responseType: 'arraybuffer'
        });
        return response.data;
      } catch (error) {
        console.error(`Error downloading file ID ${id}:`, error.message);
        throw error;
      }
    } else {
      throw new Error(`Failed to get download URL for file ID ${id}`);
    }
  }
  
  // Получение списка сообщений из чата (требует DIALOG_ID)
  async getMessages(dialogId, filter = {}) {
    return this.makeRequest('im.dialog.messages.get', { DIALOG_ID: dialogId, ...filter });
  }
  
  // Получение информации о диалоге
  async getDialog(dialogId) {
    return this.makeRequest('im.dialog.get', { DIALOG_ID: dialogId });
  }
  
  // Получение списка диалогов (получаем последние диалоги)
  async getDialogs(filter = {}) {
    return this.makeRequest('im.recent.get', filter);
  }
  
  // Получение истории диалога
  async getDialogHistory(dialogId, lastId = null) {
    const params = { DIALOG_ID: dialogId };
    if (lastId) {
      params.LAST_ID = lastId;
    }
    return this.makeRequest('im.dialog.messages.get', params);
  }
  
  // Получение диалогов из открытых линий (LiveChat)
  async getLiveChatDialogs(filter = {}) {
    return this.makeRequest('imopenlines.dialog.list', { filter });
  }
  
  // Получение сообщений из открытых линий
  async getLiveChatMessages(sessionId) {
    return this.makeRequest('imopenlines.dialog.messages.get', { SESSION_ID: sessionId });
  }
  
  // Получение статистики открытых линий
  async getLiveChatStatistics(filter = {}) {
    return this.makeRequest('imopenlines.statistics.get', { filter });
  }
  
  // Получение операторов открытых линий
  async getLiveChatOperators() {
    return this.makeRequest('imopenlines.operator.list');
  }
  
  // Получение информации о сессии открытых линий
  async getLiveChatSession(sessionId) {
    return this.makeRequest('imopenlines.session.get', { SESSION_ID: sessionId });
  }
}

// Controller - обработка бизнес-логики
class Bitrix24Controller {
  constructor(model) {
    this.model = model;
  }

  // Обработка получения и фильтрации задач
  async handleTasksRequest(req, res) {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const tasks = await this.model.getTasks(filter);
      res.json(this.presenter.formatTasksResponse(tasks));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Обработка получения детальной информации о задаче
  async handleGetTaskRequest(req, res) {
    try {
      const { id } = req.params;
      const task = await this.model.getTask(id);
      res.json(this.presenter.formatTaskResponse(task));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Обработка получения комментариев к задаче
  async handleTaskCommentsRequest(req, res) {
    try {
      const { id } = req.params;
      const comments = await this.model.getTaskComments(id);
      res.json(this.presenter.formatTaskCommentsResponse(comments));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Обработка добавления комментария к задаче
  async handleAddTaskCommentRequest(req, res) {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const result = await this.model.addTaskComment(id, text);
      res.json(this.presenter.formatCreateResponse(result));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Обработка получения и фильтрации контактов
  async handleContactsRequest(req, res) {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const contacts = await this.model.getContacts(filter);
      res.json(this.presenter.formatContactsResponse(contacts));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Обработка создания сделки
  async handleCreateDealRequest(req, res) {
    try {
      const dealData = req.body;
      const result = await this.model.createDeal(dealData);
      res.json(this.presenter.formatCreateResponse(result));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Обработка обновления сделки
  async handleUpdateDealRequest(req, res) {
    try {
      const { id } = req.params;
      const dealData = req.body;
      const result = await this.model.updateDeal(id, dealData);
      res.json(this.presenter.formatUpdateResponse(result));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Обработка получения сделок
  async handleDealsRequest(req, res) {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const deals = await this.model.getDeals(filter);
      res.json(this.presenter.formatDealsResponse(deals));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения сделки по ID
  async handleGetDealRequest(req, res) {
    try {
      const { id } = req.params;
      const deal = await this.model.getDealById(id);
      res.json(this.presenter.formatDealResponse(deal));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения воронок продаж
  async handleDealCategoriesRequest(req, res) {
    try {
      const categories = await this.model.getDealCategories();
      res.json(this.presenter.formatDealCategoriesResponse(categories));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения стадий сделок
  async handleDealStagesRequest(req, res) {
    try {
      const { categoryId } = req.params;
      const stages = await this.model.getDealStages(categoryId || 0);
      res.json(this.presenter.formatDealStagesResponse(stages));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения лидов
  async handleLeadsRequest(req, res) {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const leads = await this.model.getLeads(filter);
      res.json(this.presenter.formatLeadsResponse(leads));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения лида по ID
  async handleGetLeadRequest(req, res) {
    try {
      const { id } = req.params;
      const lead = await this.model.getLeadById(id);
      res.json(this.presenter.formatLeadResponse(lead));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка создания лида
  async handleCreateLeadRequest(req, res) {
    try {
      const leadData = req.body;
      const result = await this.model.createLead(leadData);
      res.json(this.presenter.formatCreateResponse(result));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка обновления лида
  async handleUpdateLeadRequest(req, res) {
    try {
      const { id } = req.params;
      const leadData = req.body;
      const result = await this.model.updateLead(id, leadData);
      res.json(this.presenter.formatUpdateResponse(result));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения статусов лидов
  async handleLeadStatusesRequest(req, res) {
    try {
      const statuses = await this.model.getLeadStatuses();
      res.json(this.presenter.formatLeadStatusesResponse(statuses));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения активности
  async handleGetActivityRequest(req, res) {
    try {
      const { id } = req.params;
      const activity = await this.model.getActivity(id);
      res.json(this.presenter.formatActivityResponse(activity));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка обновления активности
  async handleUpdateActivityRequest(req, res) {
    try {
      const { id } = req.params;
      const activityData = req.body;
      const result = await this.model.updateActivity(id, activityData);
      res.json(this.presenter.formatUpdateResponse(result));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка создания активности
  async handleCreateActivityRequest(req, res) {
    try {
      const activityData = req.body;
      const result = await this.model.createActivity(activityData);
      res.json(this.presenter.formatCreateResponse(result));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения списка активностей
  async handleActivitiesRequest(req, res) {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const activities = await this.model.getActivities(filter);
      res.json(this.presenter.formatActivitiesResponse(activities));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения пользователя
  async handleGetUserRequest(req, res) {
    try {
      const { id } = req.params;
      const user = await this.model.getUser(id);
      res.json(this.presenter.formatUserResponse(user));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения списка пользователей
  async handleUsersRequest(req, res) {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const users = await this.model.getUsers(filter);
      res.json(this.presenter.formatUsersResponse(users));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка добавления комментария в таймлайн
  async handleAddTimelineCommentRequest(req, res) {
    try {
      const { entityId, entityType } = req.params;
      const { comment } = req.body;
      const result = await this.model.addTimelineComment(entityId, entityType, comment);
      res.json(this.presenter.formatCreateResponse(result));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения статистики звонков
  async handleCallStatisticsRequest(req, res) {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const statistics = await this.model.getCallStatistics(filter);
      res.json(this.presenter.formatCallStatisticsResponse(statistics));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения информации о файле
  async handleGetFileRequest(req, res) {
    try {
      const { id } = req.params;
      const file = await this.model.getFile(id);
      res.json(this.presenter.formatFileResponse(file));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка скачивания файла
  async handleDownloadFileRequest(req, res) {
    try {
      const { id } = req.params;
      const fileInfo = await this.model.getFile(id);
      
      if (fileInfo && fileInfo.result && fileInfo.result.DOWNLOAD_URL) {
        res.redirect(fileInfo.result.DOWNLOAD_URL);
      } else {
        res.status(404).json({ error: 'File not found or download URL not available' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Обработка получения сообщений из чатов (требует dialogId)
  async handleMessagesRequest(req, res) {
    try {
      const { dialogId } = req.params;
      if (!dialogId) {
        return res.status(400).json({ error: 'Dialog ID is required' });
      }
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const messages = await this.model.getMessages(dialogId, filter);
      res.json(this.presenter.formatMessagesResponse(messages));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения списка диалогов
  async handleDialogsRequest(req, res) {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const dialogs = await this.model.getDialogs(filter);
      res.json(this.presenter.formatDialogsResponse(dialogs));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения информации о диалоге
  async handleDialogRequest(req, res) {
    try {
      const { dialogId } = req.params;
      const dialog = await this.model.getDialog(dialogId);
      res.json(this.presenter.formatDialogResponse(dialog));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения истории диалога
  async handleDialogHistoryRequest(req, res) {
    try {
      const { dialogId } = req.params;
      const { lastId } = req.query;
      const history = await this.model.getDialogHistory(dialogId, lastId);
      res.json(this.presenter.formatDialogHistoryResponse(history));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения диалогов LiveChat
  async handleLiveChatDialogsRequest(req, res) {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const dialogs = await this.model.getLiveChatDialogs(filter);
      res.json(this.presenter.formatLiveChatDialogsResponse(dialogs));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения сообщений LiveChat
  async handleLiveChatMessagesRequest(req, res) {
    try {
      const { sessionId } = req.params;
      const messages = await this.model.getLiveChatMessages(sessionId);
      res.json(this.presenter.formatLiveChatMessagesResponse(messages));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения статистики LiveChat
  async handleLiveChatStatisticsRequest(req, res) {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const statistics = await this.model.getLiveChatStatistics(filter);
      res.json(this.presenter.formatLiveChatStatisticsResponse(statistics));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения операторов LiveChat
  async handleLiveChatOperatorsRequest(req, res) {
    try {
      const operators = await this.model.getLiveChatOperators();
      res.json(this.presenter.formatLiveChatOperatorsResponse(operators));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Обработка получения информации о сессии LiveChat
  async handleLiveChatSessionRequest(req, res) {
    try {
      const { sessionId } = req.params;
      const session = await this.model.getLiveChatSession(sessionId);
      res.json(this.presenter.formatLiveChatSessionResponse(session));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Установка презентера
  setPresenter(presenter) {
    this.presenter = presenter;
  }
}

// Presenter - подготовка данных для представления
class Bitrix24Presenter {
  formatTasksResponse(data) {
    // Трансформируем и форматируем данные задач для клиента
    if (!data || !data.result) return { tasks: [] };
    
    return {
      tasks: data.result.tasks.map(task => ({
        id: task.id,
        title: task.title,
        responsible: task.responsibleName,
        deadline: task.deadline,
        status: task.status,
        createdDate: task.createdDate
      })),
      totalCount: data.result.total
    };
  }

  formatTaskResponse(data) {
    // Форматирование детальной информации о задаче
    if (!data || !data.result || !data.result.task) return { task: null };
    
    const task = data.result.task;
    return {
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        responsible: task.responsibleId,
        responsibleName: task.responsibleName,
        deadline: task.deadline,
        status: task.status,
        priority: task.priority,
        createdDate: task.createdDate,
        changedDate: task.changedDate,
        commentsCount: task.commentsCount,
        timeEstimate: task.timeEstimate,
        timeSpent: task.timeSpent,
        tags: task.tags,
        group: task.groupId,
        stage: task.stageId
      }
    };
  }

  formatTaskCommentsResponse(data) {
    // Форматирование комментариев к задаче
    if (!data || !data.result) return { comments: [] };
    
    return {
      comments: data.result.map(comment => ({
        id: comment.ID,
        text: comment.POST_MESSAGE,
        authorId: comment.AUTHOR_ID,
        authorName: comment.AUTHOR_NAME,
        dateCreate: comment.POST_DATE,
        files: comment.UF_FORUM_MESSAGE_DOC || []
      })),
      totalCount: data.result.length
    };
  }

  formatContactsResponse(data) {
    // Трансформируем и форматируем данные контактов для клиента
    if (!data || !data.result) return { contacts: [] };
    
    return {
      contacts: data.result.map(contact => ({
        id: contact.ID,
        name: `${contact.NAME} ${contact.LAST_NAME}`,
        email: contact.EMAIL && contact.EMAIL.length > 0 
          ? contact.EMAIL[0].VALUE 
          : '',
        phone: contact.PHONE && contact.PHONE.length > 0 
          ? contact.PHONE[0].VALUE 
          : '',
        company: contact.COMPANY_ID
      })),
      totalCount: data.total
    };
  }

  formatDealsResponse(data) {
    // Трансформируем и форматируем данные сделок для клиента
    if (!data || !data.result) return { deals: [] };
    
    return {
      deals: data.result.map(deal => ({
        id: deal.ID,
        title: deal.TITLE,
        stage: deal.STAGE_ID,
        amount: deal.OPPORTUNITY,
        currency: deal.CURRENCY_ID,
        clientId: deal.CONTACT_ID,
        responsibleId: deal.ASSIGNED_BY_ID,
        createdDate: deal.DATE_CREATE
      })),
      totalCount: data.total
    };
  }
  
  formatDealResponse(data) {
    // Форматирование данных одной сделки
    if (!data || !data.result) return { deal: null };
    
    const deal = data.result;
    return {
      deal: {
        id: deal.ID,
        title: deal.TITLE,
        stage: deal.STAGE_ID,
        category: deal.CATEGORY_ID,
        amount: deal.OPPORTUNITY,
        currency: deal.CURRENCY_ID,
        clientId: deal.CONTACT_ID,
        companyId: deal.COMPANY_ID,
        responsibleId: deal.ASSIGNED_BY_ID,
        createdDate: deal.DATE_CREATE,
        modifiedDate: deal.DATE_MODIFY,
        comments: deal.COMMENTS,
        closed: deal.CLOSED === 'Y',
        additionalFields: this._extractAdditionalFields(deal)
      }
    };
  }
  
  formatDealCategoriesResponse(data) {
    // Форматирование данных воронок продаж
    if (!data || !data.result) return { categories: [] };
    
    return {
      categories: data.result.map(category => ({
        id: category.ID,
        name: category.NAME,
        sort: category.SORT
      }))
    };
  }
  
  formatDealStagesResponse(data) {
    // Форматирование данных стадий сделок
    if (!data || !data.result) return { stages: [] };
    
    return {
      stages: data.result.map(stage => ({
        id: stage.STATUS_ID,
        name: stage.NAME,
        sort: stage.SORT,
        categoryId: stage.CATEGORY_ID,
        semanticId: stage.SEMANTICS,
        color: stage.COLOR
      }))
    };
  }
  
  formatLeadsResponse(data) {
    // Форматирование данных списка лидов
    if (!data || !data.result) return { leads: [] };
    
    return {
      leads: data.result.map(lead => ({
        id: lead.ID,
        title: lead.TITLE,
        name: lead.NAME,
        lastName: lead.LAST_NAME,
        status: lead.STATUS_ID,
        source: lead.SOURCE_ID,
        responsibleId: lead.ASSIGNED_BY_ID,
        createdDate: lead.DATE_CREATE,
        phone: lead.PHONE && lead.PHONE.length > 0 
          ? lead.PHONE[0].VALUE 
          : '',
        email: lead.EMAIL && lead.EMAIL.length > 0 
          ? lead.EMAIL[0].VALUE 
          : ''
      })),
      totalCount: data.total
    };
  }
  
  formatLeadResponse(data) {
    // Форматирование данных одного лида
    if (!data || !data.result) return { lead: null };
    
    const lead = data.result;
    return {
      lead: {
        id: lead.ID,
        title: lead.TITLE,
        name: lead.NAME,
        lastName: lead.LAST_NAME,
        status: lead.STATUS_ID,
        source: lead.SOURCE_ID,
        responsibleId: lead.ASSIGNED_BY_ID,
        createdDate: lead.DATE_CREATE,
        modifiedDate: lead.DATE_MODIFY,
        comments: lead.COMMENTS,
        phone: lead.PHONE && lead.PHONE.length > 0 
          ? lead.PHONE.map(phone => ({
              type: phone.VALUE_TYPE,
              value: phone.VALUE
            }))
          : [],
        email: lead.EMAIL && lead.EMAIL.length > 0 
          ? lead.EMAIL.map(email => ({
              type: email.VALUE_TYPE,
              value: email.VALUE
            }))
          : [],
        additionalFields: this._extractAdditionalFields(lead)
      }
    };
  }
  
  formatLeadStatusesResponse(data) {
    // Форматирование данных статусов лидов
    if (!data || !data.result) return { statuses: [] };
    
    return {
      statuses: data.result.map(status => ({
        id: status.STATUS_ID,
        name: status.NAME,
        sort: status.SORT,
        systemStatus: status.SYSTEM === 'Y',
        color: status.COLOR
      }))
    };
  }
  
  formatActivityResponse(data) {
    // Форматирование данных активности
    if (!data || !data.result) return { activity: null };
    
    const activity = data.result;
    return {
      activity: {
        id: activity.ID,
        type: activity.TYPE_ID,
        subject: activity.SUBJECT,
        description: activity.DESCRIPTION,
        createdDate: activity.CREATED,
        responsibleId: activity.RESPONSIBLE_ID,
        status: activity.COMPLETED === 'Y' ? 'completed' : 'not_completed',
        ownerType: activity.OWNER_TYPE_ID,
        ownerId: activity.OWNER_ID
      },
      totalCount: data.total
    };
  }
  
  formatUserResponse(data) {
    // Форматирование данных пользователя
    if (!data || !data.result || !data.result[0]) return { user: null };
    
    const user = data.result[0];
    return {
      user: {
        id: user.ID,
        name: user.NAME,
        lastName: user.LAST_NAME,
        email: user.EMAIL,
        position: user.WORK_POSITION,
        phone: user.PERSONAL_PHONE || user.WORK_PHONE,
        avatar: user.PERSONAL_PHOTO,
        department: user.UF_DEPARTMENT
      }
    };
  }
  
  formatUsersResponse(data) {
    // Форматирование данных списка пользователей
    if (!data || !data.result) return { users: [] };
    
    return {
      users: data.result.map(user => ({
        id: user.ID,
        name: user.NAME,
        lastName: user.LAST_NAME,
        email: user.EMAIL,
        position: user.WORK_POSITION
      })),
      totalCount: data.total
    };
  }
  
  formatCallStatisticsResponse(data) {
    // Форматирование данных статистики звонков
    if (!data || !data.result) return { calls: [] };
    
    return {
      calls: data.result.map(call => ({
        id: call.ID,
        callId: call.CALL_ID,
        userId: call.USER_ID,
        userName: call.USER_NAME,
        phone: call.PHONE_NUMBER,
        direction: call.CALL_TYPE,
        duration: call.CALL_DURATION,
        status: call.CALL_STATUS,
        startDate: call.CALL_START_DATE,
        recordingUrl: call.RECORDING_URL,
        recordingFileId: call.RECORD_FILE_ID,
        crmEntityType: call.CRM_ENTITY_TYPE,
        crmEntityId: call.CRM_ENTITY_ID
      })),
      totalCount: data.total
    };
  }
  
  formatFileResponse(data) {
    // Форматирование данных файла
    if (!data || !data.result) return { file: null };
    
    const file = data.result;
    return {
      file: {
        id: file.ID,
        name: file.NAME,
        size: file.SIZE,
        createdDate: file.CREATE_DATE,
        createdBy: file.CREATED_BY,
        type: file.TYPE,
        downloadUrl: file.DOWNLOAD_URL,
        viewUrl: file.VIEW_URL,
        previewUrl: file.PREVIEW_URL
      }
    };
  }

  formatCreateResponse(data) {
    return {
      success: data && data.result > 0,
      id: data ? data.result : null,
      message: data && data.result > 0 
        ? 'Запись успешно создана' 
        : 'Ошибка при создании записи'
    };
  }

  formatUpdateResponse(data) {
    return {
      success: data && data.result,
      message: data && data.result 
        ? 'Запись успешно обновлена' 
        : 'Ошибка при обновлении записи'
    };
  }
  
  // Форматирование данных сообщений чата (для im.dialog.messages.get)
  formatMessagesResponse(data) {
    if (!data || !data.result || !data.result.messages) return { messages: [] };
    
    return {
      messages: data.result.messages.map(message => ({
        id: message.id,
        text: message.text,
        authorId: message.author_id,
        dateCreate: message.date,
        dialogId: data.result.chat_id,
        files: message.attach || [],
        isSystem: message.system === 'Y'
      })),
      totalCount: data.result.messages.length,
      chatId: data.result.chat_id,
      users: data.result.users || {}
    };
  }
  
  // Форматирование данных диалогов (для im.recent.get)
  formatDialogsResponse(data) {
    if (!data || !data.result) return { dialogs: [] };
    
    return {
      dialogs: data.result.map(dialog => ({
        id: dialog.id,
        chatId: dialog.chat_id,
        title: dialog.title,
        type: dialog.type,
        unreadCount: dialog.counter || 0,
        lastMessageId: dialog.last_id,
        lastMessageDate: dialog.date_last_activity,
        lastMessageText: dialog.message ? dialog.message.text : '',
        avatar: dialog.avatar,
        pinned: dialog.pinned || false
      })),
      totalCount: data.result.length
    };
  }
  
  // Форматирование данных одного диалога
  formatDialogResponse(data) {
    if (!data || !data.result) return { dialog: null };
    
    const dialog = data.result;
    return {
      dialog: {
        id: dialog.ID,
        title: dialog.TITLE,
        type: dialog.TYPE,
        participantCount: dialog.USER_COUNT,
        lastMessageId: dialog.LAST_MESSAGE_ID,
        lastMessageDate: dialog.LAST_MESSAGE_DATE,
        unreadCount: dialog.UNREAD_COUNT || 0,
        participants: dialog.USERS || []
      }
    };
  }
  
  // Форматирование истории диалога
  formatDialogHistoryResponse(data) {
    if (!data || !data.result) return { messages: [] };
    
    return {
      messages: data.result.messages.map(message => ({
        id: message.ID,
        text: message.MESSAGE,
        authorId: message.AUTHOR_ID,
        dateCreate: message.DATE_CREATE,
        files: message.FILES || [],
        isSystem: message.SYSTEM === 'Y'
      })),
      hasMore: data.result.hasMore || false,
      totalCount: data.result.messages.length
    };
  }
  
  // Форматирование диалогов LiveChat
  formatLiveChatDialogsResponse(data) {
    if (!data || !data.result) return { dialogs: [] };
    
    return {
      dialogs: data.result.map(dialog => ({
        sessionId: dialog.SESSION_ID,
        lineId: dialog.LINE_ID,
        userId: dialog.USER_ID,
        guestId: dialog.GUEST_ID,
        operatorId: dialog.OPERATOR_ID,
        status: dialog.STATUS,
        startDate: dialog.DATE_CREATE,
        endDate: dialog.DATE_END,
        messageCount: dialog.MESSAGE_COUNT || 0
      })),
      totalCount: data.total || 0
    };
  }
  
  // Форматирование сообщений LiveChat
  formatLiveChatMessagesResponse(data) {
    if (!data || !data.result) return { messages: [] };
    
    return {
      messages: data.result.map(message => ({
        id: message.ID,
        text: message.MESSAGE,
        authorId: message.AUTHOR_ID,
        authorType: message.AUTHOR_TYPE,
        dateCreate: message.DATE_CREATE,
        files: message.FILES || [],
        isSystem: message.SYSTEM === 'Y'
      })),
      totalCount: data.total || 0
    };
  }
  
  // Форматирование статистики LiveChat
  formatLiveChatStatisticsResponse(data) {
    if (!data || !data.result) return { statistics: {} };
    
    const stats = data.result;
    return {
      statistics: {
        totalSessions: stats.TOTAL_SESSIONS || 0,
        activeSessions: stats.ACTIVE_SESSIONS || 0,
        waitingSessions: stats.WAITING_SESSIONS || 0,
        averageResponseTime: stats.AVERAGE_RESPONSE_TIME || 0,
        totalMessages: stats.TOTAL_MESSAGES || 0,
        satisfactionRate: stats.SATISFACTION_RATE || 0
      }
    };
  }
  
  // Форматирование операторов LiveChat
  formatLiveChatOperatorsResponse(data) {
    if (!data || !data.result) return { operators: [] };
    
    return {
      operators: data.result.map(operator => ({
        id: operator.ID,
        name: operator.NAME,
        lastName: operator.LAST_NAME,
        avatar: operator.AVATAR,
        isOnline: operator.IS_ONLINE === 'Y',
        activeSessions: operator.ACTIVE_SESSIONS || 0,
        maxSessions: operator.MAX_SESSIONS || 0
      })),
      totalCount: data.total || 0
    };
  }
  
  // Форматирование данных сессии LiveChat
  formatLiveChatSessionResponse(data) {
    if (!data || !data.result) return { session: null };
    
    const session = data.result;
    return {
      session: {
        sessionId: session.SESSION_ID,
        lineId: session.LINE_ID,
        userId: session.USER_ID,
        guestId: session.GUEST_ID,
        operatorId: session.OPERATOR_ID,
        status: session.STATUS,
        startDate: session.DATE_CREATE,
        endDate: session.DATE_END,
        messageCount: session.MESSAGE_COUNT || 0,
        guestData: session.GUEST_DATA || {},
        operatorData: session.OPERATOR_DATA || {}
      }
    };
  }

  // Вспомогательный метод для извлечения дополнительных полей
  _extractAdditionalFields(data) {
    if (!data) return {};
    
    const excludedFields = [
      'ID', 'TITLE', 'NAME', 'LAST_NAME', 'STAGE_ID', 'STATUS_ID', 'CATEGORY_ID', 
      'OPPORTUNITY', 'CURRENCY_ID', 'CONTACT_ID', 'COMPANY_ID', 'ASSIGNED_BY_ID', 
      'DATE_CREATE', 'DATE_MODIFY', 'COMMENTS', 'PHONE', 'EMAIL', 'CLOSED'
    ];
    
    const additionalFields = {};
    
    for (const key in data) {
      if (!excludedFields.includes(key) && key.startsWith('UF_')) {
        additionalFields[key] = data[key];
      }
    }
    
    return additionalFields;
  }
}

// Инициализация компонентов MCP
const bitrix24Model = new Bitrix24Model(BITRIX_CONFIG);
const bitrix24Presenter = new Bitrix24Presenter();
const bitrix24Controller = new Bitrix24Controller(bitrix24Model);
bitrix24Controller.setPresenter(bitrix24Presenter);

// Настройка маршрутов API
app.get('/api/tasks', (req, res) => bitrix24Controller.handleTasksRequest(req, res));
app.get('/api/tasks/:id', (req, res) => bitrix24Controller.handleGetTaskRequest(req, res));
app.get('/api/tasks/:id/comments', (req, res) => bitrix24Controller.handleTaskCommentsRequest(req, res));
app.post('/api/tasks/:id/comments', (req, res) => bitrix24Controller.handleAddTaskCommentRequest(req, res));
app.get('/api/contacts', (req, res) => bitrix24Controller.handleContactsRequest(req, res));

// Маршруты для работы со сделками
app.get('/api/deals', (req, res) => bitrix24Controller.handleDealsRequest(req, res));
app.get('/api/deals/:id', (req, res) => bitrix24Controller.handleGetDealRequest(req, res));
app.post('/api/deals', (req, res) => bitrix24Controller.handleCreateDealRequest(req, res));
app.put('/api/deals/:id', (req, res) => bitrix24Controller.handleUpdateDealRequest(req, res));
app.get('/api/deal-categories', (req, res) => bitrix24Controller.handleDealCategoriesRequest(req, res));
app.get('/api/deal-stages/:categoryId?', (req, res) => bitrix24Controller.handleDealStagesRequest(req, res));

// Маршруты для работы с лидами
app.get('/api/leads', (req, res) => bitrix24Controller.handleLeadsRequest(req, res));
app.get('/api/leads/:id', (req, res) => bitrix24Controller.handleGetLeadRequest(req, res));
app.post('/api/leads', (req, res) => bitrix24Controller.handleCreateLeadRequest(req, res));
app.put('/api/leads/:id', (req, res) => bitrix24Controller.handleUpdateLeadRequest(req, res));
app.get('/api/lead-statuses', (req, res) => bitrix24Controller.handleLeadStatusesRequest(req, res));

// Маршруты для работы с активностями (дела)
app.get('/api/activities', (req, res) => bitrix24Controller.handleActivitiesRequest(req, res));
app.get('/api/activities/:id', (req, res) => bitrix24Controller.handleGetActivityRequest(req, res));
app.post('/api/activities', (req, res) => bitrix24Controller.handleCreateActivityRequest(req, res));
app.put('/api/activities/:id', (req, res) => bitrix24Controller.handleUpdateActivityRequest(req, res));

// Маршруты для работы с пользователями
app.get('/api/users', (req, res) => bitrix24Controller.handleUsersRequest(req, res));
app.get('/api/users/:id', (req, res) => bitrix24Controller.handleGetUserRequest(req, res));

// Маршруты для работы с комментариями таймлайна
app.post('/api/timeline-comment/:entityType/:entityId', (req, res) => 
  bitrix24Controller.handleAddTimelineCommentRequest(req, res));

// Маршруты для работы с телефонией
app.get('/api/call-statistics', (req, res) => bitrix24Controller.handleCallStatisticsRequest(req, res));
app.get('/api/files/:id', (req, res) => bitrix24Controller.handleGetFileRequest(req, res));
app.get('/api/files/:id/download', (req, res) => bitrix24Controller.handleDownloadFileRequest(req, res));

// Маршруты для работы с чатами
app.get('/api/messages/:dialogId', (req, res) => bitrix24Controller.handleMessagesRequest(req, res));
app.get('/api/dialogs', (req, res) => bitrix24Controller.handleDialogsRequest(req, res));
app.get('/api/dialogs/:dialogId', (req, res) => bitrix24Controller.handleDialogRequest(req, res));
app.get('/api/dialogs/:dialogId/history', (req, res) => bitrix24Controller.handleDialogHistoryRequest(req, res));

// Маршруты для работы с LiveChat
app.get('/api/livechat/dialogs', (req, res) => bitrix24Controller.handleLiveChatDialogsRequest(req, res));
app.get('/api/livechat/messages/:sessionId', (req, res) => bitrix24Controller.handleLiveChatMessagesRequest(req, res));
app.get('/api/livechat/statistics', (req, res) => bitrix24Controller.handleLiveChatStatisticsRequest(req, res));
app.get('/api/livechat/operators', (req, res) => bitrix24Controller.handleLiveChatOperatorsRequest(req, res));
app.get('/api/livechat/session/:sessionId', (req, res) => bitrix24Controller.handleLiveChatSessionRequest(req, res));

// Запуск сервера
const server = app.listen(PORT, () => {
  logger.info(`MCP сервер для Битрикс24 запущен на порту ${PORT}`);
});

// Обработка глобальных ошибок
process.on('uncaughtException', (error) => {
  logger.error('Необработанное исключение:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Необработанное отклонение промиса:', reason);
});

module.exports = server; // Для тестирования
module.exports = server; // Для тестирования
