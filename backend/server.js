import express from 'express';import cors from 'cors';import dotenv from 'dotenv';import routes from './routes/api.js';dotenv.config();
const app=express(),windowMs=60_000,limit=30,requests=new Map();const allowed=(process.env.CORS_ORIGIN||'http://localhost:5173').split(',').map(x=>x.trim());
app.use(cors({origin(origin,cb){if(!origin||allowed.includes(origin))return cb(null,true);cb(new Error('Origin not allowed'))}}));app.use(express.json({limit:'1mb'}));
app.use('/api', (req,res,next)=>{const now=Date.now(),key=req.ip;const entry=requests.get(key)||{start:now,count:0};if(now-entry.start>windowMs){entry.start=now;entry.count=0}entry.count++;requests.set(key,entry);if(entry.count>limit)return res.status(429).json({success:false,error:'Too many requests. Please try again in a minute.'});next()});
app.use('/api',routes);app.get('/api/health',(_,res)=>res.json({success:true,data:{status:'ok'}}));app.use((err,_req,res,_next)=>{console.error(err);res.status(err.status||500).json({success:false,error:'Caro could not connect right now. Please try again.'})});
const port=process.env.PORT||3001;app.listen(port,()=>console.log(`CareerPilot API listening on ${port}`));
