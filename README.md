# Real-Time Chat

![Chat in Action](https://github.com/davidkelley/real-time-chat/blob/master/images/1.gif?raw=true "Chat in Action")

"Ferret Chat" is a real-time chat project that takes advantage of MQTT over Websockets through AWS IoT. It uses restricted permission credentials to establish a connection over a signed URL (SigV4), using [Paho](https://github.com/eclipse/paho.mqtt.javascript) as the client.

The project also includes a _very_ simple client interface for letting you chat.

# Getting Started

0. Launch the Cloudformation to setup an IAM User with restricted permissions as well as an IoT Thing (which provides an endpoint you can connect to).

0. Copy the outputs from the Cloudformation, whilst will provide a set of AWS Credentials which will be used to connect to the "chat room".

0. In the AWS IoT Console, copy the host domain name for the Thing, ie. `my-endpoint.iot.us-east-1.amazonaws.com`

0. Load up `client/index.html` in your browser.

0. Enter in the IoT Endpoint, the copied Access Key and Secret and hit connect.

0. Once connected, the interface will send a message to the chat room telling everyone that you've connected.

0. Connect using multiple tabs or browsers to increase the number of participants.
