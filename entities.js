msg.keywords = msg.payload;
if(msg.features.entities.length>0){
    msg.payload = msg.features.entities;   
}
return msg;