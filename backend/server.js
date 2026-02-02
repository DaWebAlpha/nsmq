import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

dotenv.config();

const PORT = process.env.PORT || 5500;

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(u => u.trim())
      : [];



const app = express();

app.use(helmet({
    crossOriginResourcePolicy: {policy: 'cross-origin'}
}));


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));



app.get("/", (req, res)=>{
    res.send("Hello World");
})

app.listen(PORT, ()=>{
    console.log(`Listening on PORT ${PORT}`);
})

