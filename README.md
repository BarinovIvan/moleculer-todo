[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services)

# moleculer-todo
moleculer-todo это микросервисный проект по работе со списком задач (todo), написанный с помощью фреймворка [Moleculer](https://moleculer.services/), с использованием [postgreSQL](https://www.postgresql.org/).

## Инструкция
Для успешного запуска проекта необходимо настроить подключение к сервису postgreSQL.
Первичная авторизация осуществляется при помощи следующих учетных данных:
- Логин: `admin`
- Пароль: `admin`

После первого запуска проекта, базы данных **"todos"** и **"users"** будут автоматически заполнены начальными данными.

## Сервисы
Проект разделен на два основных сервиса:
1. Сервис **Todos** - предназначен для работы с задачами (todos).
2. Сервис **Users** - отвечает за хранение данных пользователей и управление этими данными.

## Список доступных методов
### Для сервиса Users:
-    **GET**  `/users` 
-   **POST**  `/users/login`
-   **POST**  `/users/logout`
- **DELETE**  `/users/delete`
-   **POST**  `/users/add`
-   **POST**  `/users/getUser`

-    **GET**   `/todos`
-   **POST**   `/todos/add`
-   **POST**   `/todos/check`
-   **POST**   `/todos/uncheck`
-   **POST**   `/todos/find`
-   **POST**   `/todos/edit`
-   **POST**   `/todos/remove`

