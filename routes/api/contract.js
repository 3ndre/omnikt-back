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
    const contract = await Contract.findById(req.params.contractId).select('-_id').select('-wallet');
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

    const { wallet, name, symbol, amount, price, url, type, contractAddress, contentImageUrl, chains, trusted, mint} = req.body;

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
        trusted,
        mint
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
        trusted,
        mint
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
//Updating a contractContent for nft

router.put(
  '/update/:id', authenticateToken,
  async (req, res) => {

    const { wallet, name, symbol, amount, price, url, type, contractAddress, contentImageUrl, chains, trusted, mint } = req.body;
    const { id } = req.params;

    const opts = {
      overwrite: true,
      invalidate: true,
      resource_type: "auto",
    }

    try {

      let contractContent = await Contract.findById(id);

      if (!contractContent) {
        return res.status(404).json({ msg: 'Contract not found' });
      }

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

        contractContent.wallet = wallet;
        contractContent.name = name;
        contractContent.symbol = symbol;
        contractContent.contentImage = contentImage;
        contractContent.amount = amount;
        contractContent.price = price;
        contractContent.url = url;
        contractContent.type = type;
        contractContent.contractAddress = contractAddress;
        contractContent.chains = chains;
        contractContent.trusted = trusted;
        contractContent.mint = mint;

        await contractContent.save();
        res.json(contractContent);

      } else {

        let contentImage = contentImageUrl;

        contractContent.wallet = wallet;
        contractContent.name = name;
        contractContent.symbol = symbol;
        contractContent.contentImage = contentImage;
        contractContent.amount = amount;
        contractContent.price = price;
        contractContent.url = url;
        contractContent.type = type;
        contractContent.contractAddress = contractAddress;
        contractContent.chains = chains;
        contractContent.trusted = trusted;
        contractContent.mint = mint;

        await contractContent.save();
        res.json(contractContent);

      }

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Unable to update the contract!');
    }
  }
);



//---------------------------------------------------------------------------------------------------------------------

module.exports = router;
