import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import connectDB from './config/db.js';
import userRouter from './routes/userRoutes.js';
import notFound from './middleware/notFound.js';
import handleError from './middleware/handleError.js';


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


connectDB();

app.use("/api", userRouter);


app.use(notFound);
app.use(handleError);
app.listen(PORT, ()=>{
    console.log(`Listening on PORT ${PORT}`);
})

