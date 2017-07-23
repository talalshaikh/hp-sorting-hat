if(msg.features.keywords.length >0){
    msg.payload = msg.features.keywords;
}
return msg;