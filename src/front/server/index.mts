import express from 'express'
import bot from './routes/bot.ts'
import proxy from './routes/proxy.ts'
import multer from 'multer';
const upload = multer();

import path from 'path'

const __pathname = import.meta.url.replace('/index.mts','').replace('file://','');

console.log(__pathname)
const app = express();
// register json body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 8080
const useMock = false;

if(useMock){
    app.use('/bot', bot)
}else{
    app.use('/bot', proxy)
    app.use('/bot/:id', proxy)
    app.use('/add_document', upload.single('file'), proxy)
}
app.use('/message', proxy);
app.use('/messages', proxy);

app.use('/', (req,res, next) => {
    console.log('req received')
    next();
})

app.use(express.static(path.join(__pathname,'static')))
app.use('/', (req,res,next) => {
    res.sendFile(path.resolve(__pathname,'static/index.html'));
})

app.listen(port, () => {
    console.log(`Port: ${port} App listening `)
})