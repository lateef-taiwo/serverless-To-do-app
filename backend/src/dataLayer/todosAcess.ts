import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
// import { Types } from 'aws-sdk/clients/acm'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly s3Client: any = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly s3BucketName = process.env.S3_BUCKET_NAME,
  ) {}

  async getAllToDo(userId: string): Promise<TodoItem[]> {
    logger.info("Getting all todo");

    const params = {
        TableName: this.todoTable,
        KeyConditionExpression: "#userId = :userId",
        ExpressionAttributeNames: {
            "#userId": "userId"
        },
        ExpressionAttributeValues: {
            ":userId": userId
        }
    };

    const result = await this.docClient.query(params).promise();
    console.log(result);
    const items = result.Items;

    return items as TodoItem[];
}

async createToDo(todoItem: TodoItem): Promise<TodoItem> {
    logger.info("Creating new todo");

    const params = {
        TableName: this.todoTable,
        Item: todoItem,
    };

    const result = await this.docClient.put(params).promise();
    console.log(result)

    return todoItem as TodoItem;
}

async updateToDo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
    logger.info("Updating todo");

    const params = {
        TableName: this.todoTable,
        Key: {
            "userId": userId,
            "todoId": todoId
        },
        UpdateExpression: "set #a = :a, #b = :b, #c = :c",
        ExpressionAttributeNames: {
            "#a": "name",
            "#b": "dueDate",
            "#c": "done"
        },
        ExpressionAttributeValues: {
            ":a": todoUpdate['name'],
            ":b": todoUpdate['dueDate'],
            ":c": todoUpdate['done']
        },
        ReturnValues: "ALL_NEW"
    };

    const result = await this.docClient.update(params).promise();
    console.log(result);
    const attributes = result.Attributes;

    return attributes as TodoUpdate;
}

async deleteToDo(todoId: string, userId: string): Promise<string> {
    logger.info("Deleting todo");

    const params = {
        TableName: this.todoTable,
        Key: {
            "userId": userId,
            "todoId": todoId
        },
    };

    const result = await this.docClient.delete(params).promise();
    console.log(result);

    return "" as string;
}

async generateUploadUrl(todoId: string): Promise<string> {
    logger.info("Generating URL");

    const url = this.s3Client.getSignedUrl('putObject', {
        Bucket: this.s3BucketName,
        Key: todoId,
        Expires: 1000,
    });
    console.log(url);

    return url as string;
}
}

   const createDynamoDBClient = () => {
     if (process.env.IS_OFFLINE) {
     logger.info('Creating a local DynamoDB instance')
     return new XAWS.DynamoDB.DocumentClient({
       region: 'localhost',
       endpoint: 'http://localhost:8000'
     })
   }

   return new XAWS.DynamoDB.DocumentClient()
 }