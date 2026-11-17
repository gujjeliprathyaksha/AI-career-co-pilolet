const base=import.meta.env.VITE_API_URL||'';
async function read(response){const body=await response.json().catch(()=>({}));if(!response.ok||body.success===false){const error=new Error(body.error||'Caro could not connect right now. Please try again.');error.status=response.status;throw error}return body.data??body}
export async function api(path,body){return read(await fetch(`${base}${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}))}
export async function uploadAudio(file){const form=new FormData();form.append('audio',file);return read(await fetch(`${base}/api/speech-to-text`,{method:'POST',body:form}))}
