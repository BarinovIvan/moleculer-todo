[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services) [![PostgreSQL](https://img.shields.io/badge/Powered%20by-PostgreSQL-316192?style=flat&logo=Postgresql&logoColor=white)](https://www.postgresql.org)


# Moleculer-todo
**_Moleculer-todo_** это микросервисный проект по работе со списком задач (todo), написанный с помощью фреймворка [Moleculer](https://moleculer.services/).

## Инструкция
Для успешного запуска проекта необходимо настроить подключение к серверу postgreSQL.
Первичная авторизация осуществляется при помощи следующих учетных данных:
- Логин: `admin`
- Пароль: `admin`

После первого запуска проекта, базы данных **"todos"** и **"users"** будут автоматически заполнены начальными данными.

## Сервисы
Проект разделен на два основных сервиса:
1. Сервис **Todos** - предназначен для работы с задачами (todos).
2. Сервис **Users** - отвечает за хранение данных пользователей и управление этими данными.

## Список доступных методов
### Для сервиса _Users_:
-    **GET**  `/users` 
-   **POST**  `/users/login`
-   **POST**  `/users/logout`
- **DELETE**  `/users/delete`
-   **POST**  `/users/add`
-   **POST**  `/users/getUser`

### Для сервиса _Todos_:
-    **GET**   `/todos`
-   **POST**   `/todos/add`
-   **POST**   `/todos/check`
-   **POST**   `/todos/uncheck`
-   **POST**   `/todos/find`
-   **POST**   `/todos/edit`
-   **POST**   `/todos/remove`

