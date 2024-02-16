export const fetchMyBots = async() => {
    const myBotResp = await fetch('/bot?userName=Testikäyttäjä')
    if (myBotResp.status === 200) {
      const myBotJson = await myBotResp.json();
      //if(myBotJson.detail === 'Not found')
      console.log('myBotJson', myBotJson)
      return myBotJson
      //setMyBots(myBotJson)
      //dispatch({ type: MyBotsActions.SET_BOTS, payload: myBotJson })
    }
    return []
}

export const fetchPublicBots = async() => {
    const publicBotResp = await fetch('/bot')
    if (publicBotResp.status === 200) {
      const publicBotJson = await publicBotResp.json();
      //if(myBotJson.detail === 'Not found')
      console.log('publicBotJson', publicBotJson)
      return publicBotJson
      //setMyBots(myBotJson)
      //dispatch({ type: MyBotsActions.SET_BOTS, payload: myBotJson })
    }
    return []
}