const express = require('express');
const axios = require('axios');
const Order = require('../models/Order');
const router = express.Router();

router.get('/createDelhiveryShipment', async (req, res) => {
    const { pinCode = '132116', wayBill = 2 } = req.query;

    const warehouseDataBody = {
        name: "Fashion Needles",
        email: "fashionneedles@gmail.com",
        phone: "918595490062",
        address: "First Floor, Lal Mandir Market, C-67, Main Rd, Shital Vihar, Khora Colony, Sector 57, Noida, Uttar Pradesh 201301",
        city: "Noida",
        country: "India",
        pin: "201301",
        return_address: "First Floor, Lal Mandir Market, C-67, Main Rd, Shital Vihar, Khora Colony, Sector 57, Noida, Uttar Pradesh 201301",
        return_pin: "201301",
        return_city: "Noida",
        return_state: "Uttar Pradesh",
        return_country: "India"
    };
    const params = {
        md: 'E',
        ss: 'DTO',
        d_pin: '132116',
        o_pin: '201301',
        cgm: '1000',
        pt: 'COD',
        cod: '800'
    };

    const baseURL = 'https://track.delhivery.com';

    let waybill = '20342910151115'
    let ref_ids = ''

    // Prepare the payload as a URL-encoded string
    const payload = `format=json&data=${encodeURIComponent(JSON.stringify({
        shipments: [
            {
                name: "Satyam Kumar",
                add: "Karnal 23 shamgarh",
                pin: "132116",
                city: "Karnal",
                state: "Haryana",
                country: "India",
                phone: "8059424475",
                order: "Nevia WashFace",
                payment_mode: "Prepaid",
                return_pin: "",
                return_city: "",
                return_phone: "",
                return_add: "",
                return_state: "",
                return_country: "",
                products_desc: "New Latest Product",
                hsn_code: "12",
                cod_amount: "122",
                order_date: "2022-01-05T06:30:00.000Z",
                total_amount: "1234",
                seller_add: "Chajaarsi",
                seller_name: "Fashion Needles",
                seller_inv: "",
                quantity: "1",
                waybill: "",
                shipment_width: "211",
                shipment_height: "12",
                weight: "122",
                seller_gst_tin: "09BSHPG4826L1ZD",
                shipping_mode: "Surface",
                address_type: "home"
            }
        ],
        pickup_location: {
            name: "Default Pickup Location",
            add: "C, 67, Sector 57 Rd, Shital Vihar, Khora Road, Block C, Sector 57, Noida, Uttar Pradesh",
            city: "Noida",
            pin_code: "201301",
            country: "IN",
            phone: "9889880068"
        }
    }))}`;

    let result = {}
    try {
        const PincodeServiceability = await axios.get(`${baseURL}/c/api/pin-codes/json/?filter_codes=${pinCode}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token 03c3304cc1dcba59dbd45f35f12889fe86c33053'
            }
        });
        if (PincodeServiceability.data) {
            result = {
                ...PincodeServiceability.data
            }
        }
    
        // const warehouseData = await axios.post(`${baseURL}/api/backend/clientwarehouse/create/`, warehouseDataBody, {
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Accept': 'application/json',
        //         'Authorization': 'Token 03c3304cc1dcba59dbd45f35f12889fe86c33053'
        //     }
        // });
        // if (warehouseData.data) {
        //     result = {
        //         ...result,
        //         ...warehouseData.data
        //     }
        // }

        const waybillResponse = await axios.get(`${baseURL}/waybill/api/bulk/json/?count=${wayBill}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token 03c3304cc1dcba59dbd45f35f12889fe86c33053'
            }
        });
        console.log(waybillResponse.data)
        if (waybillResponse.data) {
            result = {
                ...result,
                wayBill: waybillResponse.data
            }
        }
        const invoiceChargesResponse = await axios.get(`${baseURL}/api/kinko/v1/invoice/charges/.json`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token 03c3304cc1dcba59dbd45f35f12889fe86c33053'
            },
            params
        });
        if (invoiceChargesResponse.data) {
            result = {
                ...result,
                invoiceCharges: invoiceChargesResponse.data
            }
        }

        // const createShipment = await axios.post(`${baseURL}/api/cmu/create.json`, payload, {
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded',
        //         'Accept': 'application/json',
        //         'Authorization': 'Token 03c3304cc1dcba59dbd45f35f12889fe86c33053'
        //     }
        // });
        // if (createShipment.data) {
        //     result = {
        //         ...result,
        //         createShipment: createShipment.data
        //     }
        // }



        const FetchDetails = await axios.get(`${baseURL}/api/v1/packages/json/`, {
            params: {
                waybill,
                ref_ids
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token 03c3304cc1dcba59dbd45f35f12889fe86c33053' // Replace with your actual token
            }
        });
        if (FetchDetails.data) {
            result = {
                ...result,
                FetchDetails: FetchDetails.data
            }
        }








        res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error?.message || 'Failed to create Delhivery shipment order' });
    }
});






router.get('/getPackageInfo', async (req, res) => {
    const { waybill, ref_ids } = req.query;

    // Validate query parameters
    if (!ref_ids) {
        return res.status(400).json({ message: 'ref_ids parameter is required' });
    }

    try {
        const response = await axios.get('https://track.delhivery.com/api/v1/packages/json/', {
            params: {
                waybill: waybill || '',
                ref_ids
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token 03c3304cc1dcba59dbd45f35f12889fe86c33053' // Replace with actual token
            }
        });

        return res.status(200).json({
            message: 'Package information retrieved successfully',
            data: response.data
        });

    } catch (error) {
        console.error('Error retrieving package information:', error.response?.data || error.message);
        res.status(500).json({ error: error.message || 'Failed to retrieve package information from Delhivery' });
    }
});



router.get('/createWharehouse', async (req, res) => {


    const warehouseDataBody = {
        name: "Fashion Needles2",
        email: "fashionneedles@gmail.com",
        phone: "918595490062",
        address: "First Floor, Lal Mandir Market, C-67, Main Rd, Shital Vihar, Khora Colony, Sector 57, Noida, Uttar Pradesh 201301",
        city: "Noida",
        country: "India",
        pin: "201301",
        return_address: "First Floor, Lal Mandir Market, C-67, Main Rd, Shital Vihar, Khora Colony, Sector 57, Noida, Uttar Pradesh 201301",
        return_pin: "201301",
        return_city: "Noida",
        return_state: "Uttar Pradesh",
        return_country: "India"
    };

    const baseURL = 'https://track.delhivery.com';

    try {

        const warehouseData = await axios.post(`${baseURL}/api/backend/clientwarehouse/create/`, warehouseDataBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Token 03c3304cc1dcba59dbd45f35f12889fe86c33053'
            }
        });
        if (warehouseData.data) {
            return res.status(200).json({ message: "Warehouse created successfully" });
        } else {
            return res.status(203).json({ message: "Warehouse creation failed" });
        }





    } catch (error) {
        console.log(error.message)
        res.status(203).json({ message: error?.message || 'Failed to create Delhivery shipment order' });
    }
});
router.get('/checkDelivery/:orderID', async (req, res) => {
    const orderID = req.params.orderID

    const baseURL = 'https://track.delhivery.com';

    try {
        const orderDetails = await Order.findById(orderID)
        if (!orderDetails) {

            return res.status(203).json({ message: 'Order not found' });
        }
        const pinCode = orderDetails.user.zip


        const PincodeServiceability = await axios.get(`${baseURL}/c/api/pin-codes/json/?filter_codes=${pinCode}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token 03c3304cc1dcba59dbd45f35f12889fe86c33053'
            }
        });


        if (PincodeServiceability.data && PincodeServiceability.data.delivery_codes.length > 0) {

            const status = PincodeServiceability.data.delivery_codes[0].postal_code.remarks
            if (status == "") {
                return res.status(200).json({ message: "Delhivery Available For This Customer Order" });
            }
            else {
                res.status(203).json({ message: status });
            }

        }
        else {
            res.status(203).json({ message: "Delhivery Not Available For This Customer Order" });
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error?.message || 'Failed to create Delhivery shipment order' });
    }
});


router.post('/createShipment/:orderID', async (req, res) => {
    const orderID = req.params.orderID
    const { weight, width, height } = req.body
    if (!weight || !width || !height) {
        return res.status(203).json({ message: "Please Provide Weight,Width,Height" });
    }
    const baseURL = 'https://track.delhivery.com';

    try {
        const orderDetails = await Order.findById(orderID)
        if (!orderDetails) {

            return res.status(203).json({ message: 'Order not found' });
        }


        const payload = `format=json&data=${encodeURIComponent(JSON.stringify({
            shipments: [
                {
                    name: orderDetails.user.firstName + " " + orderDetails.user.lastName,
                    add: orderDetails.user.address,
                    pin: orderDetails.user.zip,
                    city: orderDetails.user.city,
                    state: orderDetails.user.state,
                    country: orderDetails.user.country,
                    phone: orderDetails.user.phone,
                    order: orderDetails.orderNo,

                    payment_mode: orderDetails.paymentMethod === "COD" ? "cod" : "prepaid",
                    return_pin: "201301",
                    return_city: "Noida",
                    return_phone: "9889880068",
                    return_add: "C, 67, Sector 57 Rd, Shital Vihar, Khora Road, Block C, Sector 57, Noida, Uttar Pradesh",
                    return_state: "Uttar Pradesh",
                    return_country: "IN",
                    products_desc: orderDetails.items.map(item => `${item.name} X ${item.quantity}`).join(' + '),
                    hsn_code: "12",
                    cod_amount: "122",
                    order_date: orderDetails.createdAt,
                    total_amount: orderDetails.subTotal,
                    seller_add: "C, 67, Sector 57 Rd, Shital Vihar, Khora Road, Block C, Sector 57, Noida, Uttar Pradesh",
                    seller_name: "Fashion Needles",
                    seller_inv: "",
                    quantity: orderDetails.totalItems,
                    waybill: "",
                    shipment_width: width,
                    shipment_height: height,
                    weight: weight,
                    seller_gst_tin: "09BSHPG4826L1ZD",
                    shipping_mode: "E",
                    address_type: "home"
                }
            ],
            pickup_location: {
                name: "Default Pickup Location",
                add: "C, 67, Sector 57 Rd, Shital Vihar, Khora Road, Block C, Sector 57, Noida, Uttar Pradesh",
                city: "Noida",
                pin_code: "201301",
                country: "IN",
                phone: "9889880068"
            }
        }))}`;


        const createShipment = await axios.post(`${baseURL}/api/cmu/create.json`, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization': 'Token 03c3304cc1dcba59dbd45f35f12889fe86c33053'
            }
        });
        console.log(createShipment.data)
        if (createShipment.data) {

            return res.status(200).json({ message: "shipment created!" });
        } else {
            return res.status(203).json({ message: 'Order not found' });
        }

    } catch (error) {

        res.status(500).json({ error: error?.message || 'Failed to create Delhivery shipment order' });
    }
});

module.exports = router;
