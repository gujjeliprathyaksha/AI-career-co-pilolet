export async function transcribeAudio(file){
  const provider=process.env.STT_PROVIDER||'openai';
  const key=process.env.STT_API_KEY||process.env.AI_API_KEY;
  if(!key)throw Object.assign(new Error('Speech service is not configured.'),{status:503});
  if(provider!=='openai')throw Object.assign(new Error('Configured speech provider is not supported.'),{status:503});
  const form=new FormData();form.append('file',new Blob([file.buffer],{type:file.mimetype}),file.originalname||'voice.webm');form.append('model',process.env.STT_MODEL||'whisper-1');
  const response=await fetch(process.env.STT_API_URL||'https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{Authorization:`Bearer ${key}`},body:form});
  if(!response.ok)throw Object.assign(new Error(`Speech provider returned ${response.status}`),{status:502});
  return(await response.json()).text||'';
}
