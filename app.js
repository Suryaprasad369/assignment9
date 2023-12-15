const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());




let db = null;

const initializeDBAndServer = async () => {
  try {
    database= await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const hasPriorityAndStatusProperties = (requestQuery) => {
    return (
        requestQuery.priority =/= undefined && requestQuery.status =/= undefined
    );
};

const hasPriorityProperty = (requestQuery) => {
    return requestQuery.properties =/=undefined;
}

const hasStatusProperty =(requestQuery) => {
    requestQuery.status =/= undefined;
};
app.get("/todos/" , async (request ,response) => {
    let data =null;
    let getTodosQuery ="";
    const {search_q="",priority,status}=request.query;

    switch(true) {
        case hasPriorityAndStatusProperties(request.query):
            getTodosQuery=`
            SELECT
            *
            FROM
            todo
            WHERE
            todo LIKE '%${search_q}%'
            AND status ='${status}'
            AND priority = '${priority}';`;
            break;
            case hasPriorityProperty(request.query):
                getTodosQuery=`
            SELECT
            *
            FROM
            todo
            WHERE
            todo LIKE '%${search_q}%'
            AND priority = '${priority}';`;
            break;
            case hasStatusProperty(request.query):
              getTodosQuery=`
            SELECT
            *
            FROM
            todo
            WHERE
            todo LIKE '%${search_q}%'
            AND status = '${status}';`;
            break;
           default:
               getTodosQuery =`
            SELECT
            *
            FROM
            todo
            WHERE
            todo LIKE '%${search_q}%';`;

            
    }
    data =await database.all(getTodosQuery);
    response.send(data)
});

//get
app.get("/todos/:todoId/",) async (request , response) => {
    const {todoId} = request.params;
    const getTodoQuery =`
    SELECT
    *
    FROM
    todo
    WHERE
    id = ${todoId};`;
    const todo=await database.get(getTodoQuery);
    response.send(todo);
    
});
app.post("/todos/", async(request,response) => {
    const {id,todo,priority,status} =request.body;
    const postTodoQuery =`
    INSERT INTO
    todo (id,todo,priority,status)
    VALUES
    (${id},'${todo}','${priority}','${status}');`;
    await database.run(postTodoQuery);
    response.send("Todo Successfully Added");
});
app.put("/todos/:todoId/", async (request ,response) => {
    const {todoId} =request.params;
    let updateColumn ="";
    const requestBody = request.body;
    switch (true) {
        case requestBody.status =/= undefined:
            updatedColumn ="Status";
            break;
        case requestBody.priority =/= undefined:
            updatedColumn ="Priority";
            break;
        case requestBody.todo =/= undefined:
            updatedColumn ="Todo";
    }
    const previousTodoQuery = `
      SELECT
      *
      FROM
      todo
      WHERE
      id = ${todoId};`;
    const previousTodo = await database.get(previousTOdoQuery);

    const {
        todo = previousTodo.todo,
        priority = previousTodo.priority,
        status =previousTodo.status,
    } = request.body;

    const updateTodoQuery =`
    UPDATE
    todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
      WHERE
       id=${todoId};`;
       await database.run(updateTodoQuery);
       response.send(`${updateColumn} Updated`);
});
app.delete("/todos/:todoId/" ,async(request,response) =>{
    const {todoId} =request.params;
    const deleteTodoQuery =request.params;
    const deleteTodoQuery =`
    DELETE FROM
    todo
    WHERE
    id =${todoId};`;

    await database.run(deleteTodoQuery);
    response.send("Todo Deleted");
})
module.exports = app;
