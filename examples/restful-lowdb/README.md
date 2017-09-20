## RESTful API example with Lowdb and Dynapi.js

> Special thanks [JSON Placeholder][json_placeholder] for providing routes model and data.

### Install dependencies

```
$ yarn install
```

### Start the server

```
$ node index.js
```

In default, server starts on [http://127.0.0.1:3000][serv], you can try them through `curl` or
other tools like [Postman][postman].

Database was stored in a local file `db.json`, which will be auto-generated in the first start and
values are fetched from [JSON Placeholder][json_placeholder](if available).

### Availabled paths

#### Resource

| Method | URL                   |
| ------ | --------------------- |
| GET    | [/posts][posts]       |
| GET    | [/comments][comments] |
| GET    | [/albums][albums]     |
| GET    | [/photos][photos]     |
| GET    | [/todos][todos]       |
| GET    | [/users][users]       |

#### Routes

| Method | URL                      |
| ------ | ------------------------ |
| GET    | [/posts][posts]          |
| GET    | [/posts/1][posts_1]      |
| GET    | [/posts/1/comments][p1c] |
| POST   | /posts                   |
| PUT    | /posts/1                 |
| PATCH  | /posts/1                 |
| DELETE | /posts/1                 |

[json_placeholder]: https://jsonplaceholder.typicode.com
[postman]: https://www.getpostman.com

[serv]: http://127.0.0.1:3000
[p1c]: http://127.0.0.1:3000/posts/1/comments
[posts]: http://127.0.0.1:3000/posts
[posts_1]: http://127.0.0.1:3000/posts/1
[comments]: http://127.0.0.1:3000/comments
[albums]: http://127.0.0.1:3000/albums
[photos]: http://127.0.0.1:3000/photos
[todos]: http://127.0.0.1:3000/todos
[users]: http://127.0.0.1:3000/users
