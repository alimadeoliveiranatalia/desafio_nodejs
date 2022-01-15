const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const userExists = users.find(user => user.username === username);
  if(!userExists){
    return response.status(400).json({error : "User não encontrado"});
  }
  request.userExists = userExists;
  return next();
}

app.post('/users', (request, response) => {
  const {name,username} = request.body;
  const usernameAlreadyExists = users.some((user) => user.username === username);
  if(usernameAlreadyExists){
    return response.status(400).json({error : "Username already exists "})
  }
  const user = {
    name,
    username,
    id : uuidv4(),
    todos : []
  }
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {userExists} = request;
  return response.json(userExists.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {userExists} = request;
  const {title, deadline} = request.body;
  const todo = {
    id : uuidv4(),
    title,
    deadline: new Date(deadline), 
    created_at: new Date(),
    done: false
  }
  userExists.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {userExists} = request;
  const {title, deadline} = request.body;
  const {id} = request.params;
  const verifyTodo = userExists.todos.find(todo => todo.id === id);
  if(!verifyTodo){
    return response.status(404).json({error:'Nada de todo registrado'})
  }
  verifyTodo.title = title;
  verifyTodo.deadline = new Date(deadline);
  return response.json(verifyTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {userExists} = request;
  const {id} = request.params;
  const verifyTodo = userExists.todos.find(todo => todo.id = id);
  if(!verifyTodo){
    return response.status(404).json({error : 'todo não registrado'});
  }
  verifyTodo.done = true;
  return response.json(verifyTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {userExists} = request;
  const {id} = request.params;
  const findTodo = userExists.todos.findIndex(todo => todo.id === id);
  if(findTodo === -1 ){
    return response.status(404).json({error: 'todo não encontrado'});
  }
  userExists.todos.splice(findTodo,1);
  return response.status(204).json();

});

module.exports = app;