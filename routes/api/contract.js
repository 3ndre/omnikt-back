const express = require('express');
const router = express.Router();

var cloudinary = require('cloudinary').v2;

const Contract = require('../../models/Contract');
const authenticateToken = require('../../middleware/authenticateToken');




cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});



//Getting all contracts by the user wallet
router.get("/", authenticateToken, async (req, res) => {

    const wallet = req.header('x-auth-wallet');

    try {
      
      var contracts = await Contract.find({
        wallet: wallet,
      });

      res.status(200).json(contracts);
    } catch (err) {
      res.status(500).json(err);
    }
  });

//---------------------------------------------------------------------------------------------------------------------

//Getting contract details using ID
router.get('/:contractId', async (req, res) => {
 
  try {
    const contract = await Contract.findById(req.params.contractId).select('-url').select('-_id').select('-wallet');
    if(contract !== null) {
      res.json(contract);
    } else {
      res.status(500).send('Not authorized');
    }
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Not authorized');
  }
});


//---------------------------------------------------------------------------------------------------------------------


//---------------------------------------------------------------------------------------------------------------------
//Creating a contractContent for nft
router.post(
  '/create', authenticateToken,
  async (req, res) => {

    const { wallet, name, symbol, amount, price, url, type, contractAddress, contentImageUrl, chains} = req.body;

    const opts = {
      overwrite: true,
      invalidate: true,
      resource_type: "auto",
    }

    try {

      if(contentImageUrl !== null) {
        let contentImageUpload = await cloudinary.uploader.upload(contentImageUrl, opts, (err, result) => {
          if(result && result.secure_url) {
            const cloudinaryUrl = result.secure_url;
            return cloudinaryUrl
          } else {
          console.log(err.message);
          return null
        }
        })

        let contentImage = contentImageUpload.secure_url

        contractContent = new Contract({
        wallet,
        name,
        symbol,
        contentImage,
        amount,
        price,
        url,
        type,
        contractAddress,
        chains,
      });

      await contractContent.save();
      res.json(contractContent);

      } else {

        let contentImage = contentImageUrl;

        contractContent = new Contract({
        wallet,
        name,
        symbol,
        contentImage,
        amount,
        price,
        url,
        type,
        contractAddress,
        chains,
      });

      await contractContent.save();
      res.json(contractContent);

    }

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Unable to create the contract!');
    }
  }
);

//---------------------------------------------------------------------------------------------------------------------

module.exports = router;
