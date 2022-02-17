const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const { username } = request.headers;
  
  if(!username){
    return response.status(400).json({error: 'username is required.'});
  };

  user = users.find(user => user.username === username);

  if(!user){
    return response.status(400).json({error: 'user account not found.'});
  }

  request.user = user

  next();

}

app.post('/users', (request, response) => {
  
  const { name, username } = request.body;

  if(!name){
    return response.status(400).json({error: 'name is required.'});
  }

  if(!username){
    return response.status(400).json({error: 'username is required.'});
  }

  userAlreadyExists = users.find(user => user.username === username);

  if(userAlreadyExists){
    return response.status(400).json({error: 'user already exists.'});
  }

  id = uuidv4();
  todos = [];

  const user = {
    id,
    name,
    username,
    todos
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { user } = request;

  const todos = user.todos;

  return response.send(todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const { title, deadline } = request.body;
  const { user } = request;

  if(!title){
    return response.status(400).json({error: 'title is required.'});
  }

  if(!deadline){
    return response.status(400).json({error: 'deadline is required.'});
  }

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).send(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todoExists = user.todos.some(todo => todo.id === id)

  if(!todoExists){
    response.status(404).send({error: 'todo not found.'});
  }

  let todoResponse = {};

  user.todos.map(todo => {
    if(todo.id !== id){
      return todo;
    }
    
    if(deadline){
      todo.deadline = new Date(deadline);
    }

    if(title){
      todo.title = title;
    }

    todoResponse = todo;

    return todo;

  });


  return response.status(201).send(todoResponse);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const { id } = request.params;
  const { user } = request;

  const todoExists = user.todos.some(todo => todo.id === id)

  if(!todoExists){
    response.status(404).send({error: 'todo not found.'});
  }
  
  let todoResponse = {};

  user.todos.map(todo => {
    if(todo.id !== id){
      return todo;
    }
    
    todo.done = true;

    todoResponse = todo;

    return todo;

  })

  return response.status(201).send(todoResponse);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const { id } = request.params;
  const { user } = request;

  const todoExists = user.todos.some(todo => todo.id === id)

  if(!todoExists){
    response.status(404).send({error: 'todo not found.'});
  }
  
  user.todos = user.todos.filter(todo => todo.id !== id);

  return response.status(204).send();
});

module.exports = app;