import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate';

// TODO: Implement businessLogic
const todosAccess = new TodosAccess()

const logger = createLogger('todos')


export async function getAllToDo(userId: string): Promise<TodoItem[]> {
  
  return todosAccess.getAllToDo(userId);
}

export function createToDo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
  logger.info('Creating a new todo item', createTodoRequest)
  const todoId =  uuid();
  const s3BucketName = process.env.S3_BUCKET_NAME;
  
  return todosAccess.createToDo({
      userId: userId,
      todoId: todoId,
      attachmentUrl:  `https://${s3BucketName}.s3.amazonaws.com/${todoId}`, 
      createdAt: new Date().getTime().toString(),
      done: false,
      ...createTodoRequest,
  });
}

export function updateToDo(updateTodoRequest: UpdateTodoRequest, todoId: string, userId: string): Promise<TodoUpdate> {
  
  return todosAccess.updateToDo(updateTodoRequest, todoId, userId);
}


export function deleteToDo(todoId: string, userId: string): Promise<string> {
  
  return todosAccess.deleteToDo(todoId, userId);
}


export function generateUploadUrl(todoId: string): Promise<string> {
  return todosAccess.generateUploadUrl(todoId);
}