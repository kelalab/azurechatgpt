from db.repository import Repository
from model.bot import Bot
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get('/get_source')
def get_source(id: str):
    return Repository().get_source(id)

@router.put('/bot')
def create_bot(data: Bot):
    #bot: Bot = json.loads(data)
    return Repository().create_bot(data)

@router.post('/bot')
def update_bot(id: str, data: Bot):
    return Repository().update_bot(id, data)

@router.get('/bot')
def get_bot(userName: str):
    bots = Repository().get_bots(userName)
    print("bots", bots)
    resp = []
    for bot in bots:
        resp.append({"id": bot[0], "name": bot[1], "description": bot[2], "prompt":bot[3],"model":bot[4], "temperature": bot[5], "creator": bot[6]})
    if len(resp) == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return resp

@router.get('/bot/{id}')
def get_bot(id: str):
    bot = Repository().get_bot(id)
    print('bot', bot)
    if bot:
        return {"id": bot[0], "name": bot[1], "description": bot[2], "prompt":bot[3],"model":bot[4], "temperature": bot[5], "creator": bot[6]}
    else:
        raise HTTPException(status_code=404, detail="Item not found")