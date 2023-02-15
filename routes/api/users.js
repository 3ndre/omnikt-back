const express = require('express');
const router = express.Router();

const User = require('../../models/User');

const authenticateToken = require('../../middleware/authenticateToken');



//Getting current user info
router.get('/me', authenticateToken, async (req, res) => {

  const wallet = req.header('x-auth-wallet');

  try {
    const user = await User.findOne({ wallet }).sort({ date: -1 });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Not authorized');
  }
});




//Getting userinfo with Id
router.get('/:userId', authenticateToken, async (req, res) => {

 
  try {
    const user = await User.findById(req.params.userId).sort({ date: -1 });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Not authorized');
  }
});


//Updating user info
router.put(
  '/me',
  async (req, res) => {

    const id = req.header('x-auth-id');
    const updatedData = req.body;
    const options = { new: true };

    try {
      
    const result = await User.findByIdAndUpdate(
        id, updatedData, options
    )

     
      res.json(result);

    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  }
);



//Creating a user
router.post(
  '/',
  async (req, res) => {

    const { wallet } = req.body;

    try {
      let user = await User.findOne({ wallet });

      if (user) {
        return res
          .json({ wallet: user.wallet });
      }


      user = new User({
        wallet,
      });

      await user.save();
      res.json(user);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
