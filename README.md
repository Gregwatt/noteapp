# Note-taking App with React, Mongo and Docker
![image](https://github.com/Gregwatt/noteapp/assets/6962162/bd2e5d06-200b-4541-af9f-c6181e63d073)

## Features
- Built using TypeScript, React, Express, Node.js, Mongo, and Docker!
- Create notes that will persist across relaunches of the app/Docker restarts.
- Use colors to style your notes, and click on them to view, edit, or delete them!

## About
This was an assignment I made for a server-sided web development course, meant to create a basic web application with a front-end and back-end that communicated with each other and self-contained using Docker. I think it turned out pretty well, and I got to learn a bunch of cool stuff while making it.

## How to run
Ensure you have Docker installed, then run the following to build and run the app.
```
docker build -t Gregwatt/noteapp .
docker compose up
```
Then, wait a minute for the database setup to run, and navigate to http://localhost:3000/

## Known issues
- Because of the way the database stores the files in a local folder to ensure persistence between runs, there are some weird issues if using WSL and running the app in Linux while the app is in a Windows folder. Please copy the files into the home folder of your WSL instance.
