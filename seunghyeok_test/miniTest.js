const http = require('http')
const express = require('express')
const { DataSource } = require('typeorm')
const dotenv = require('dotenv')
const { error } = require('console')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const morgan = require('morgan')
const { errorMonitor } = require('events')


const app = express();

const myDataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: '3306',
    username: 'root',
    password: '1234',
    database: 'minitest'
})

app.use(morgan("dev"))
app.use(cors())
app.use(express.json())

app.get("/", async(req, res) => {
    try{
        return res.status(200).json({"message" : "Seunghyuk's Minitest"})
    } catch (err) {
        console.log(err)
    }
})

app.get('/users', async(req, res) => {
    try{
        const userData = await myDataSource.query('SELECT id, name, email FROM users')

        return res.status(200).json({
            "users" : userData
        })
    } catch (err){
        console.log(err)
    }
})

app.post('/users', async(req, res) => {
    try{
        const newUser = req.body
        
        const{ name, password, email } = newUser

        if(name === undefined || password === undefined || email === undefined){
            const error = new Error("KEY_ERROR")
            error.statusCode = 400
        }

        if(password.length < 8) {
            const error = new Error("INVAILD_PASSWORD")
            error.statusCode = 400
            throw error
        }

        const emailData = await myDataSource.query(`
        SELECT id, email FROM users WHERE email = '${email}';
        `)

        if(emailData.length > 0){
            const error = new Error("DUPLICATED_EMAIL_ADDRESS")
            error.statusCode = 400
            throw error
        }
        
        const userData = await myDataSource.query(`
        INSERT INTO users (
            name,
            password,
            email
        )
        VALUES (
            '${name}',
            '${password}',
            '${email}'
            )
        `)

        console.log('create user', userData.insertId)

        return res.status(201).json({
            "message": "userCreated"
        })
    } catch(err){
        return res.status(error.statusCode).json({
            "message" : "INVALID_PASSWORD"
        })
    }
    })

    app.post('/login', async(req, res) => {
        try{
            const {email, password} = req.body


            
        const emailData = await myDataSource.query(`
        SELECT id, email FROM users WHERE email = '${email}';
        `)
           
        if(emailData.length === 0){
            const error = new Error("DUPLICATED_EMAIL_ADDRESS")
            error.statusCode = 400
            throw error
            }

        const pwData = await myDataSource.query(`
        SELECT id, password FROM users WHERE password = '${password}';
        `)

        if(pwData.length === 0) {
            const error = new Error("PASSWORD_PROTECTED")
            error.statusCode = 400
            throw error
        }

        const token = jwt.sign({id:10}, 'scret_key')


        return res.status(200).json({
            "message" : "LOGIN_SUCCESS",
            "accessToken" : token 
        })

        } catch (err){
            console.log(err)
        }
    })


const server = http.createServer(app) // express app 으로 서버를 만듭니다.

const start = async () => { // 서버를 시작하는 함수입니다.
  try {
    server.listen(8000, () => console.log(`Server is listening on 8000`))
  } catch (err) { 
    console.error(err)
  }
}

myDataSource.initialize()
 .then(() => {
    console.log("Data Source has been initialized!")
 })

start()