import FormData from 'form-data';
import fetch from 'node-fetch';

export const doReq = async(method:string,host:string, url:string, body: any, contentType: string = 'application/json') => {
    console.log(host, url, body);
    const response = await fetch(`${host}${url}`,{
        headers: {
            'Content-type': contentType
        },
        method: method,
        //body: body
        body: method === 'GET' ? undefined : JSON.stringify(body),
    })
    const status = response.status;
    const json = await response.json();
    return {status: status, json: json };
}

export const doFileUpload = async(method:string,host:string, url:string, file?: any) => {
    let form = new FormData();
    if(file){
        form.append('file', file.buffer, {filename: file.originalname} );
    }
    const formHeaders = form.getHeaders();
    const response = await fetch(`${host}${url}`,{
        method: method,
        headers: {...formHeaders},
        body: form
    })
    const status = response.status;
    const json = await response.json();
    console.log('resp json', json)
    return {status: status, json: json };
}