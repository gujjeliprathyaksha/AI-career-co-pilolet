const conversations=new Map();
const MAX_MESSAGES=30;
export function addUserMessage(id,text){const conversationId=id||crypto.randomUUID();const history=conversations.get(conversationId)||[];history.push({role:'user',content:text});conversations.set(conversationId,history.slice(-MAX_MESSAGES));return conversationId}
export function addAssistantMessage(id,text){const history=conversations.get(id)||[];history.push({role:'assistant',content:text});conversations.set(id,history.slice(-MAX_MESSAGES))}
export function getConversation(id){return conversations.get(id)||[]}
