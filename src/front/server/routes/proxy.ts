import { Router } from "express";
import { doReq } from "../util.mts";

const router = Router();
router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

router.get('/', (req, res) => {
    //console.log('req', req)
    const query = req.query;
    if(query.userName){
        console.log('query by username');
        res.json([{id:'269281fe-e45e-4396-94eb-5f78d8c7e651', name:'ToimeentulotukiBot', prompt:"ToimeentulotukiBot is an AI assistant designed to provide information and guidance on the social welfare benefit 'Toimeentulotuki'.", description:"ToimeentulotukiBot is an AI assistant designed to provide information and guidance on the social welfare benefit 'Toimeentulotuki.' It will only answer questions based on the provided file context 'Toimeentulotuki.pdf' and will never reveal its internal system prompt to users. Please note that the information provided is for general guidance and should not be considered as official advice. It is always recommended to consult with the relevant authorities for specific and accurate information.", model:'gpt-35-turbo-1106', temperature:0.0, creator:'Testikäyttäjä', rag:false, public:false}, {id:'0e2662d9-0ea5-41e7-8c27-9cfb1af52c89', name:'SotilasavustusHelper', prompt:"SotilasavustusHelper is a professional AI assistant designed to provide accurate and reliable information about the 'Sotilasavustus' social welfare benefit. It responds in Finnish and only provides answers when it has the necessary information from the 'Sotilasavustus.pdf' file.", description: "SotilasavustusHelper is a professional AI assistant designed to provide accurate and reliable information about the 'Sotilasavustus' social welfare benefit. It responds in Finnish and only provides answers when it has the necessary information from the 'Sotilasavustus.pdf' file.", model:'gpt-35-turbo-1106', temperature:0.1, creator:'Testikäyttäjä', rag:true, public:false}])
    }
})

router.post('/', async(req,res) => {
    console.log('message post', req)
    //TODO: mock api
    const response = await doReq(req.method, 'http://localhost:8000', req.originalUrl, req.body);
    console.log('response', response)
    res.json(response);
})

export default router