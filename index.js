const https = require('https');
const fs = require("fs");

const getInstructions = () => {
    const options = {
        hostname: "nc-leaks.herokuapp.com",
        path: "/api/confidential",
        method: "GET"
    };
    const request = https.request(options, (response) => {
        let body = '';
        response.on('data', (packet) => {
            body += packet.toString();
        });
        response.on('end', () => {
            const parsedBody = JSON.parse(body);
            fs.writeFile("./instructions.md", parsedBody.instructions, (err) => {
                if (err) console.log(err);
                else console.log("Instructions Received");
              });
        });
    });
    request.end();
};

getInstructions();

const getPeople = (cb) => {
    const options = {
        hostname: 'nc-leaks.herokuapp.com',
        path: '/api/people',
        method: 'GET'
    };
    const request = https.request(options, (response) => {
        let body = '';
        response.on('data', (packet) => {
            body += packet.toString();
        });
        response.on('end', () => {
            const parsedBody = JSON.parse(body);
            const northcodersEmployees = parsedBody.people.filter(employee => employee.job.workplace === 'northcoders');
            fs.writeFile("./northcoders.json", JSON.stringify(northcodersEmployees, null, 2), (err) => {
                if (err) console.log(err);
                else {
                    console.log("Employee file created");
                    cb(err, true)
                };
            });
        });
    });
    request.end();
};

const getInterests = () => {
    fs.readFile('northcoders.json', 'utf-8', (err, data) => {
        const parsedData = JSON.parse(data);
        const employeeInterests = [];
        parsedData.forEach((employee) => {
            const options = {
                hostname: 'nc-leaks.herokuapp.com',
                path: `/api/people/${employee.username}/interests`,
                method: 'GET'
            };
            const request = https.request(options, (response) => {
                let body = '';
                response.on('data', (packet) => {
                    body += packet.toString();
                });
                response.on('end', () => {
                    const parsedBody = JSON.parse(body);
                    employeeInterests.push(parsedBody.person);
                    if (parsedData.length === employeeInterests.length) {
                        fs.writeFile('interests.json', JSON.stringify(employeeInterests, null, 2), (err) => {
                            if (err) console.log(err)
                            else console.log('Interests file created');
                        });
                    };
                });
            });
            request.end();
        });
    });
};

const getPets = () => {
    fs.readFile('northcoders.json', 'utf-8', (err, data) => {
        const parsedData = JSON.parse(data);
        const employeePets = [];
        let responses = 0;
        parsedData.forEach((employee) => {
            const options = {
                hostname: 'nc-leaks.herokuapp.com',
                path: `/api/people/${employee.username}/pets`,
                method: 'GET'
            };
            const request = https.request(options, (response) => {
                let body = '';
                response.on('data', (packet) => {
                    body += packet.toString();
                });
                response.on('end', () => {
                    const parsedBody = JSON.parse(body);
                    responses++
                    if (parsedBody.person) employeePets.push(parsedBody.person);
                    if (parsedData.length === responses) {
                        fs.writeFile('pets.json', JSON.stringify(employeePets, null, 2), (err) => {
                            if (err) console.log(err)
                            else console.log('Pets file created');
                        });
                    };
                });
            });
            request.end();
        });
    });
};

const scavengeForNcData = () => {
    getPeople((err, data) => {
        if (data) {
            getInterests();
            getPets();
        } else {
            console.log(err);
        };
    });
};

scavengeForNcData();