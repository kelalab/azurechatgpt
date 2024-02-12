export const doReq = async(method:string,host:string, url:string, body: any) => {
    console.log(host, url, body);
    const response = await fetch(`${host}${url}`,{
        headers: {
            'Content-type': 'application/json'
        },
        method: method,
        //body: body
        body: JSON.stringify(body)
    })
    const json = await response.json();
    return json;
}