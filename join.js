msg.entities = msg.payload;
msg.payload = msg.entities.text + ", " + msg.keywords.text;
return msg;