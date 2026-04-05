export const contacts = [
  { id: 1, name: "Алексей Морозов", status: "work",     avatar: "АМ", color: "#4A9EFF", lastSeen: "сейчас", role: "Дизайнер" },
  { id: 2, name: "Марина Соколова", status: "online",   avatar: "МС", color: "#FF6B6B", lastSeen: "сейчас", role: "PM" },
  { id: 3, name: "Дмитрий Волков",  status: "busy",     avatar: "ДВ", color: "#FFB347", lastSeen: "5 мин",  role: "Разработчик" },
  { id: 4, name: "Елена Смирнова",  status: "sick",     avatar: "ЕС", color: "#6BCB77", lastSeen: "2 часа", role: "Аналитик" },
  { id: 5, name: "Иван Петров",     status: "study",    avatar: "ИП", color: "#A78BFA", lastSeen: "сейчас", role: "CTO" },
  { id: 6, name: "Ольга Козлова",   status: "vacation", avatar: "ОК", color: "#F472B6", lastSeen: "вчера",  role: "Маркетинг" },
];

export const chats = [
  {
    id: 1, contactId: 1, unread: 2, pinned: true,
    messages: [
      { id: 1, text: "Привет! Как дела с проектом?", from: "them", time: "09:41", date: "сегодня" },
      { id: 2, text: "Всё идёт по плану, завтра покажу первый дизайн-спринт", from: "me", time: "09:43", date: "сегодня" },
      { id: 3, text: "Отлично! Жду с нетерпением 🔥", from: "them", time: "09:44", date: "сегодня" },
      { id: 4, text: "Кстати, можем встретиться в 15:00?", from: "them", time: "10:02", date: "сегодня" },
    ]
  },
  {
    id: 2, contactId: 2, unread: 0, pinned: true,
    messages: [
      { id: 1, text: "Ревью на следующей неделе", from: "them", time: "вчера", date: "вчера" },
      { id: 2, text: "Принял, подготовлю материалы", from: "me", time: "вчера", date: "вчера" },
    ]
  },
  {
    id: 3, contactId: 3, unread: 1, pinned: false,
    messages: [
      { id: 1, text: "Баг в проде пофикшен", from: "them", time: "11:30", date: "сегодня" },
      { id: 2, text: "Деплой через 10 минут", from: "them", time: "11:31", date: "сегодня" },
    ]
  },
  {
    id: 4, contactId: 4, unread: 0, pinned: false,
    messages: [
      { id: 1, text: "Отчёт готов, скинула на почту", from: "them", time: "пн", date: "пн" },
    ]
  },
  {
    id: 5, contactId: 5, unread: 5, pinned: false,
    messages: [
      { id: 1, text: "Нужно обсудить архитектуру нового модуля", from: "them", time: "09:15", date: "сегодня" },
      { id: 2, text: "Позвони когда будет время", from: "them", time: "09:20", date: "сегодня" },
    ]
  },
];

export const notifications = [
  { id: 1, type: "message", text: "Алексей Морозов написал вам", time: "2 мин", read: false, avatar: "АМ", color: "#4A9EFF" },
  { id: 2, type: "call", text: "Пропущенный звонок от Ивана Петрова", time: "15 мин", read: false, avatar: "ИП", color: "#A78BFA" },
  { id: 3, type: "contact", text: "Марина Соколова добавила вас в контакты", time: "1 час", read: true, avatar: "МС", color: "#FF6B6B" },
  { id: 4, type: "message", text: "Дмитрий Волков: Баг в проде пофикшен", time: "2 часа", read: true, avatar: "ДВ", color: "#FFB347" },
  { id: 5, type: "mention", text: "Вас упомянули в группе «Команда»", time: "вчера", read: true, avatar: "К", color: "#6BCB77" },
];

export const mediaItems = [
  { id: 1, type: "photo", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", date: "сегодня" },
  { id: 2, type: "photo", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80", date: "сегодня" },
  { id: 3, type: "photo", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80", date: "вчера" },
  { id: 4, type: "photo", url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80", date: "вчера" },
  { id: 5, type: "photo", url: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=400&q=80", date: "2 дня" },
  { id: 6, type: "photo", url: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&q=80", date: "3 дня" },
  { id: 7, type: "video", url: "https://images.unsplash.com/photo-1536240478700-b869ad10e128?w=400&q=80", date: "неделя", duration: "1:24" },
  { id: 8, type: "video", url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80", date: "неделя", duration: "3:07" },
  { id: 9, type: "music", title: "Boards of Canada — Roygbiv", size: "5.2 MB", date: "неделя", duration: "2:33" },
  { id: 10, type: "music", title: "Aphex Twin — Avril 14th", size: "4.1 MB", date: "месяц", duration: "2:04" },
  { id: 11, type: "music", title: "Brian Eno — An Ending", size: "6.8 MB", date: "месяц", duration: "4:16" },
];