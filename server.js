const mysql = require('mysql2');
const inquirer = require('inquirer');

require('console.table');
require('dotenv').config()

const connection = mysql.createConnection({
    host: process.env.location,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
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
              } else {
              return 'Please select a task.';
            }
          }
        }
    ])
    .then((response) => {
        switch (response.task) {
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
    connection.query(`SELECT * FROM roles`, (err, res) => {
        err ? console.error(err) : console.table(res);
        launch();
    })
};

// formatted table for view Employee?
    // includes first, last, title, department, salary, manager
const viewEmployee = () => {
    connection.query(`SELECT employee.id, 
    CONCAT (employee.first_name, ' ', employee.last_name) AS employee,
    roles.title, 
    department.name AS department, 
    roles.salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
    LEFT JOIN 
        employee manager on manager.id = employee.manager_id
    INNER JOIN 
        roles ON (roles.id = employee.roles_id)
    INNER JOIN 
        department ON (department.id = roles.department_id)
    ORDER BY 
        employee.id ASC ;`, (err, res) => {
        err ? console.error(err) : console.table(res);
        launch();
    })
};

// add department
    // prompt for name of department
const addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'addDepartment',
            message: 'Please enter the name of the Department you would like to add.'
        }
    ])
        .then ((response) => {
            connection.query ('INSERT INTO department(name) VALUES(?)', response.addDepartment, (err, res) => {
                err ? console.error(err) : console.table(res);
                launch();
            })
        })
}

// add role
    // prompt for name, salary, and department
const addRole = () => {
    const department = () => connection.promise().query('SELECT * FROM department')
        .then((dp) => {
            let name = dp[0].map(o => o.name);
            return name
        })
    inquirer.prompt([
        {
            name:'newRole',
            type: 'input',
            message: 'What new role would you like to add?'
        },
        {
            name: 'salary',
            type: 'input',
            message: 'Please type the employees salary.(numerical characters only)'
        },
        {
            name: 'departmentId',
            type: 'list',
            message: 'What department ID does this new role belong to?',
            choices: department
        }
    ])
    .then(response => {
        connection.promise().query(`SELECT id FROM department WHERE name = ?`, response.departmentId)
            .then(response => {
                let map = response[0].map(o => o.id);
                return map[0]
            })
            .then((map) => {
                connection.query(`INSERT INTO roles(title, salary, department_id) VALUES(?,?,?)`, [response.newRole, response.salary, map], (err, res) => {
                    err ? console.error(err) : console.table(res);
                    launch();
                })
            })
    })
    // .then(response => {
    //     connection.query('INSERT INTO roles(title, salary, department_id) VALUES (?, ?, ?)', 
    //     [response.newRole, response.salary, response.roleId, response.departmentId], (err, res) => {
    //         err ? console.error(err) : console.table(res);
    //     launch();
    //     })
    // })
};
// add employee
    // prompt for first name, last name, role, and manager
const addEmployee = () => {
    inquirer.prompt([
        {
            name:'firstName',
            type: 'input',
            message: 'What is the Employees first name?'
        },
        {
            name:'lastName',
            type: 'input',
            message: 'What is the Employees last name?'
        },
        {
            name:'roleId',
            type: 'input',
            message: 'What is the Employees Role ID?'
        },
        {
            name:'manager',
            type: 'input',
            message: 'What is the ID of the new employees Manager?'
        },
    ])
    .then(response => {
        connection.query('INSERT INTO employee(first_name, last_name, roles_id, manager_id) VALUES (?, ?, ?, ?)', 
        [response.firstName, response.lastName, response.roleId, response.manager], (err, res) => {
            err ? console.error(err) : console.table(res);
        launch();
        })
    })
 };
    
// update employee role
    // prompt for selecting employee to update and their new role and push to database 
const updateRole = () => {
    const roles = () => connection.promise().query(`SELECT * FROM roles`)
        .then((roles) => {
            let title = roles[0].map(o => o.title);
            return title
            })
        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'employeeId',
                    message: `What is the Employee ID number you would like to change?`
                },
                {
                    type: 'list',
                    name: 'employeeRole',
                    message: `What would you like to set the employee role as?`,
                    choices: roles
                }
            ])
            .then(response => {
                connection.promise().query(`SELECT id FROM roles WHERE title = ?`, response.employeeRole)
                    .then(response => {
                        let map = response[0].map(o => o.id);
                        return map[0]
                    })
                    .then((map) => {
                        connection.query(`UPDATE employee SET roles_ID=? WHERE id=?`, [map, response.employeeId], (err, res) => {
                            err ? console.error(err) : console.table(res);
                            launch();
                        })
                    })
            })
};