const crypto = require('crypto');
const axios = require('axios');
const uniqid = require('uniqid');

const MERCHANT_ID = "3068373"; // Your CCAvenue Merchant ID
const ACCESS_CODE = "AVTZ37KL12AD68ZTDA"; // Your CCAvenue Access Code
const WORKING_KEY = "160263EC4BB5661839AE32BC9BCDE753"; // Your CCAvenue Working Key
const APP_BE_URL = "http://localhost:3000"; // your backend URL
const IV = '1234567890123456'; 
function encrypt(data, key) {
  const cipher = crypto.createCipheriv('aes-128-cbc', key.slice(0, 16), IV);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

async function transectionStart(req, res) {

  if (req.method === 'GET') {
    const amount = +req.query.amount;
    const orderId = uniqid();

    const redirectURL = `${APP_BE_URL}/api/statusCCAvenue?orderId=${orderId}`;
    const cancelURL = `${APP_BE_URL}/api/cancelCCAvenue?orderId=${orderId}`;

    const payload = `merchant_id=${MERCHANT_ID}&order_id=${orderId}&amount=${amount}&currency=INR&redirect_url=${redirectURL}&cancel_url=${cancelURL}&billing_name=John Doe&billing_address=123 Street&billing_country=India&billing_tel=1234567890&billing_email=test@example.com`;

    const encryptedData = encrypt(payload, WORKING_KEY);

    const paymentUrl = `https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction&encRequest=${encryptedData}&access_code=${ACCESS_CODE}`;

    res.redirect(paymentUrl);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}



 

// Decrypt function
function decrypt(encryptedData, key) {
  const decipher = crypto.createDecipheriv('aes-128-cbc', key.slice(0, 16), IV);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}


async function handleStatus(req, res) {
  const { encResp } = req.body; // CCAvenue sends the response as `encResp`

  try {
    const decryptedResponse = decrypt(encResp, WORKING_KEY);
    const responseData = JSON.parse(decryptedResponse); // Convert the decrypted response to JSON format
    console.log('Decrypted response:', responseData);

    if (responseData.order_status === 'Success') {
      res.status(200).json({ status: 'success', data: responseData });
    } else {
      res.status(400).json({ status: 'failure', data: responseData });
    }
  } catch (error) {
    console.error('Error decrypting payment status:', error);
    res.status(500).json({ error: 'Error decrypting payment status' });
  }
}

module.exports = { transectionStart, handleStatus };
