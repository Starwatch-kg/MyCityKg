# 🚀 Быстрый старт MyCityKg

## Установка

```bash
# Установить зависимости
npm install

# Запустить dev сервер
npm run dev

# Открыть в браузере
# http://localhost:3000
```

## Структура проекта

```
MyCityKg/
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── Layout.jsx       # Основной layout с навигацией
│   │   └── FilterModal.jsx  # Модальное окно фильтров
│   ├── pages/              # Страницы приложения
│   │   ├── Onboarding.jsx  # Онбординг
│   │   ├── CityMap.jsx     # Главная карта
│   │   ├── AddIssue.jsx    # Добавление жалобы
│   │   ├── MyIssues.jsx    # Список жалоб
│   │   ├── EcologyInfo.jsx # Экология
│   │   ├── Profile.jsx     # Профиль
│   │   └── IssueDetails.jsx # Детали жалобы
│   ├── store/              # Redux store
│   │   ├── store.js        # Конфигурация store
│   │   └── slices/         # Redux slices
│   │       ├── appSlice.js    # Настройки приложения
│   │       └── issuesSlice.js # Жалобы
│   ├── App.jsx             # Главный компонент
│   ├── main.jsx            # Точка входа
│   └── index.css           # Глобальные стили
├── public/                 # Статические файлы
├── index.html             # HTML шаблон
├── package.json           # Зависимости
├── vite.config.js         # Конфигурация Vite
├── tailwind.config.js     # Конфигурация Tailwind
└── README.md              # Документация
```

## Основные команды

```bash
# Разработка
npm run dev          # Запустить dev сервер на порту 3000

# Сборка
npm run build        # Собрать для продакшена в папку dist/

# Предпросмотр
npm run preview      # Предпросмотр production сборки

# Линтинг
npm run lint         # Проверить код ESLint
```

## Первый запуск

1. **Онбординг**: При первом запуске увидите приветственные слайды
2. **Разрешение геолокации**: Разрешите доступ к местоположению
3. **Карта**: Откроется главная карта с маркерами проблем
4. **Добавить жалобу**: Нажмите "+" в навигации
5. **Заполните форму**: Выберите тип, добавьте фото, получите геолокацию
6. **Отправьте**: Жалоба появится на карте

## Тестовые данные

В приложении есть 3 тестовые жалобы:
- **Мусор** на ул. Чуй, 100 (новое)
- **Освещение** на пр. Манас, 45 (в работе)
- **Дороги** на ул. Киевская, 23 (решено)

## Настройка карты

Координаты центра карты (Бишкек):
```javascript
const center = [42.8746, 74.5698]
```

Для изменения города отредактируйте `src/pages/CityMap.jsx`

## Кастомизация цветов

Отредактируйте `tailwind.config.js`:
```javascript
colors: {
  primary: '#FFD43B',      // Желтый акцент
  accent: '#1E1E1E',       // Темно-серый
  background: '#121212',   // Черный фон
}
```

## Добавление новых типов проблем

В `src/pages/AddIssue.jsx`:
```javascript
const issueTypes = [
  { value: 'новый_тип', label: '🔧 Новый тип', emoji: '🔧' },
  // ...
]
```

## Интеграция с Backend

Замените mock данные в `src/store/slices/issuesSlice.js` на API вызовы:

```javascript
// Вместо
const mockIssues = [...]

// Используйте
import { createAsyncThunk } from '@reduxjs/toolkit'

export const fetchIssues = createAsyncThunk(
  'issues/fetchIssues',
  async () => {
    const response = await fetch('/api/issues')
    return response.json()
  }
)
```

## Деплой на Vercel

```bash
# Установить Vercel CLI
npm i -g vercel

# Деплой
vercel

# Production деплой
vercel --prod
```

## Деплой на Netlify

```bash
# Установить Netlify CLI
npm i -g netlify-cli

# Деплой
netlify deploy

# Production деплой
netlify deploy --prod
```

## Полезные ссылки

- [React документация](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Leaflet документация](https://leafletjs.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)

## Поддержка

Для вопросов и предложений создавайте issues в репозитории.
