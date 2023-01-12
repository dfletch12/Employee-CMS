const inquirer= require('inquirer');
const mysql= require('mysql2');
const table= require('console.table');

require('dotenv').config()

const connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
  });

    function launch() {
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'task',
            message: "What would you like to do?",
            choices: [
                "View All Departments",
                "View All Roles",
                "View All Employees",
                "Add A Department",
                "Add A Role",
                "Add An Employee",
                "Update An Employee Role",
                "Quit"
            ],

            validate: (task) => {
              if (task) {
                return true;
              }
              return 'Please select a task.';
            }
          }
    ])
    .then((task) => {
        switch (task.selection) {
            case "View All Departments":
                viewDepartment();
                break;
            case "View All Roles":
                viewRole();
                break;
            case "View All Employees":
                viewEmployee();
                break;
            case "Add A Department":
                addDepartment();
                break;
            case "Add A Role":
                addRole();
                break;
            case "Add An Employee":
                addEmployee();
                break;
            case "Update An Employee Role":
                updateRole();
                break;
            case "Quit":
                console.log("Shutting Down")
                process.exit();
            default:
                console.log('Please select one of the available tasks.');
        }
    })
};
        
launch();

const viewDepartment = () => {
    connection.query(`SELECT * FROM department`, (err, res) => {
        err ? console.error(err) : console.table(res);
        launch();
    })
};

const viewRole = () => {
    connection.query(`SELECT * FROM role`, (err, res) => {
        err ? console.error(err) : console.table(res);
        launch();
    })
};

const viewEmployee = () => {
    connection.query(`SELECT * FROM employee`, (err, res) => {
        err ? console.error(err) : console.table(res);
        launch();
    })
};

