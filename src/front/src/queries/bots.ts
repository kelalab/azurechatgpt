export const fetchMyBots = async() => {
    const myBotResp = await fetch('/bot?userName=Testikäyttäjä')
    if (myBotResp.status === 200) {
      const myBotJson = await myBotResp.json();
      console.log('myBotJson', myBotJson)
      return myBotJson
      //setMyBots(myBotJson)
      //dispatch({ type: MyBotsActions.SET_BOTS, payload: myBotJson })
    }
    return []
}