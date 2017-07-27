Node-RED Bluemix Starter Application
====================================

### Node-RED in IBM Bluemix

This repository is an example Node-RED application that can be deployed into
Bluemix with only a couple clicks. Try it out for yourself right now by clicking:

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/ibmets/node-red-bluemix-starter.git)

You can also see the sample working demo by changing your directory to 
`assembly-nlu-nlc` and then using `bx app push` to push the code 
to bluemix.

### How does this work?

When you click the button, you are taken to Bluemix where you get a pick a name
for your application at which point the platform takes over, grabs the code from
this repository and gets it deployed.

It will automatically create an instance of the Cloudant service, call it
`sample-node-red-cloudantNoSQLDB` and bind it to you app. This is where your
Node-RED instance will store its data. If you deploy multiple instances of
Node-RED from this repository, they will share the one Cloudant instance.


When you first access the application, you'll be asked to set some security options
to ensure your flow editor remains secure from unauthorised access.

It includes a set of default flows that are automatically deployed the first time
Node-RED runs.

## Customizing Node Red

### Configuring Services

Add and Bind the following services to the application:

    Natural Language Understanding
    Natural Language Classifier
    
You can do that by heading over to the catalog, and going to Watson services, and
selecting the desired service. Give each service the name you want but before 
creating the service, ensure it is bound to the application you created earlier.

### Setting up the flow

Start by adding a an HTTP request, a template, and an HTTP response; this will be the main interface 
for the user when he opens the root address. Then, add the contents of index.html to the template node.

Deploy this and head to the route (example: https://assembly-nlu-nlc.mybluemix.net/) to see the results.
index.html is essentially a single webpage with an entry field and a button to capture the user's input.
If you go through the index.html, you will notice and ajax request at line 108: 
```javascript
    $.ajax({
        method: "GET",
        url: "./api",
        contentType: "application/text",
        data: {"request": request}
    })
```
The url is a custom api we will be creating to perform our functionality. The front end UI should
look like this:

![Imgur](http://i.imgur.com/wkDroeX.png?1)

To start with, add another HTTP request node and set the route to '/api'. Then add a function node 
and connect it to the output of the request. In the function add the following piece of code which
will place the user input to the `msg.payload`:
```javascript
msg.payload = msg.payload['request'];
return msg;
```
Connect the output of the function to a Natural Language Understanding node and configure the node 
to detect entities and keywords by ticking the relevant check boxes. This will allow us to caputure 
only the necessary fields when the node places the results on `msg.features`. 

![Imgur](http://i.imgur.com/GZnO5mE.png)

We then first extract the keywords by adding a function node with the following content:
```javascript
if(msg.features.keywords.length >0){
    msg.payload = msg.features.keywords;
}
return msg;
```
Then the output of the function is sent to a split node followed by join node. This will break all the 
keywords into an array and the combine them into a string. However we need to configure split by adding 
`\n` in the `split using` field. As for the join node, we have to use the manual mode and set the following
paramenters:
    
    combine each: msg.payload.text
    to create: a string
    joined using: , 

After the join node, we have to save the content and then repeat the same procedure for the entities. To do
so, first we connect a function with the following content to the output of the join:
```javascript
msg.keywords = msg.payload;
if(msg.features.entities.length>0){
    msg.payload = msg.features.entities;   
}
return msg;
```
We then add a split and a join node with the same configurations as the previous split and join.
We now add another function to combine the saved entities and keywords into one field and pass it 
on to the Natural Language Classifier:
```javascript
msg.entities = msg.payload;
msg.payload = msg.entities.text + ", " + msg.keywords.text;
return msg;
```
![Imgur](http://i.imgur.com/fEN4uba.png)

The last few nodes are the Natural Language Classifier, followed by a function to set the 
`msg.payload = msg.pyaload.top_class; return msg` and send it to an HTTP response. Deploying and attempting
to run will produce an error becaus the NLC is not yet configured.

![Imgur](http://i.imgur.com/dEKxL65.png)

### Natural Language Classifier
To configure the NLC, head over to the service you created early on, and select the manage tab on 
the left. Thn access the tool kit to create a new classifier. When on the tool, head to the 
training data tab and uppload training_data.csv. When the uppload is complete you should see 
a list of classes on the left and text on the right. You can add more data and then create a classifier;
it will take some time to train the classifier. When the training is done, head to the clasifiers tab 
at the top and copy the classifier ID into the node.

When everything is complete, deploy the node red app and open the URL, type in a text the describes
"What topics did you enjoy most at school". Clicking submit should show you the career path that
would suit you most.

You can import the complete flow from `flow.txt`, and the function content exist in relevant function
files in this repository.

![Imgur](http://i.imgur.com/oNniKIh.png)

![Imgur](http://i.imgur.com/5cTDWM8.png)
