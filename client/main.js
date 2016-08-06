$(document).ready(function() {

  TOPIC = 'Ferret/Chat';

  var client;

  var username = new Date().getTime().toString();

  $('[connect-form]').on('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var id = $('[name=id]').val();
    var endpoint = $('[name=iot]').val();
    var secret = $('[name=secret]').val();

    connect({ endpoint: endpoint.toLowerCase(), id: id, secret: secret });
  });

  $('[chat-form]').on('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();
    onChat($('[name=chat]').val());
  });

  var onMessage = function(message) {
    var $p = $('<p>');
    $p.text(message.payloadString);
    $('[chat-body]').append($p);
  };

  var onSuccess = function() {
    client.subscribe(TOPIC);
    onChat(username + ' has joined the chat.');
    onMessage({ payloadString: 'You have joined the chat.' });
  };

  var onChat = function(msg) {
    var message = new Paho.MQTT.Message(username + ' > ' + msg);
    message.destinationName = TOPIC;
    client.send(message);
  };

  var onConnectionLost = function(err ) {
    if (err.errorCode !== 0) console.log("onConnectionLost: " + err.errorMessage);
  };

  var connect = function(opts) {
    client = new Paho.MQTT.Client(endpoint(opts), username);
    client.onMessageArrived = onMessage;
    client.onConnectionLost = onConnectionLost;
    client.connect({
      useSSL: true,
      timeout: 3,
      mqttVersion: 4,
      onSuccess: onSuccess
    });
  };

  var endpoint = function(opts) {
    var region = opts.endpoint.match(/^.+\.iot\.(.+)\.a.+$/i)[1];
    var time = moment.utc();
    var dateStamp = time.format('YYYYMMDD');
    var amzdate = dateStamp + 'T' + time.format('HHmmss') + 'Z';
    var service = 'iotdevicegateway';
    var algorithm = 'AWS4-HMAC-SHA256';
    var canonicalUri = '/mqtt';

    console.log(opts, region);

    var credentialScope = dateStamp + '/' + region + '/' + service + '/' + 'aws4_request';
    var canonicalQuerystring = 'X-Amz-Algorithm=AWS4-HMAC-SHA256';
    canonicalQuerystring += '&X-Amz-Credential=' + encodeURIComponent(opts.id + '/' + credentialScope);
    canonicalQuerystring += '&X-Amz-Date=' + amzdate;
    canonicalQuerystring += '&X-Amz-SignedHeaders=host';

    var canonicalHeaders = 'host:' + opts.endpoint + '\n';
    var payloadHash = SigV4Utils.sha256('');
    var canonicalRequest = 'GET' + '\n' + canonicalUri + '\n' + canonicalQuerystring + '\n' + canonicalHeaders + '\nhost\n' + payloadHash;

    var stringToSign = algorithm + '\n' +  amzdate + '\n' +  credentialScope + '\n' +  SigV4Utils.sha256(canonicalRequest);
    var signingKey = SigV4Utils.getSignatureKey(opts.secret, dateStamp, region, service);
    var signature = SigV4Utils.sign(signingKey, stringToSign);

    canonicalQuerystring += '&X-Amz-Signature=' + signature;
    return 'wss://' + opts.endpoint + canonicalUri + '?' + canonicalQuerystring;
  };

  function SigV4Utils(){};

  SigV4Utils.sign = function(key, msg) {
    var hash = CryptoJS.HmacSHA256(msg, key);
    return hash.toString(CryptoJS.enc.Hex);
  };

  SigV4Utils.sha256 = function(msg) {
    var hash = CryptoJS.SHA256(msg);
    return hash.toString(CryptoJS.enc.Hex);
  };

  SigV4Utils.getSignatureKey = function(secret, date, region, service) {
    var _date = CryptoJS.HmacSHA256(date, 'AWS4' + secret);
    var _region = CryptoJS.HmacSHA256(region, _date);
    var _service = CryptoJS.HmacSHA256(service, _region);
    return CryptoJS.HmacSHA256('aws4_request', _service);
  };
});
