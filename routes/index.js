const api = require('../config/upwork');
const router = require('express').Router({ mergeParams: true });
const { adaptUpworkQuery } = require('../utils/adaptUpworkQuery');
const Query = require('../models/Queries');
const { ObjectId } = require('mongodb');
const protect = require('../middleware/protect');
const jwt = require('jsonwebtoken');

router.route('/upwork').get((req, res, next) => {
  try {
    if (!req.query.code) return res.sendStatus(400);
    // get access token/secret pair
    api.getToken(req.query.code, function(error, accessToken) {
      if (error) throw new Error(error);

      api.setNewAccessTokenPair(accessToken, () => {console.log('Upwork done');});
    });
    res.redirect('/');
  } catch (e) {
    next(e);
  }
});

router.post('/login', (req, res, next) => {
  try {
    if (process.env.ADMIN_LOGIN !== req.body.login.trim() || process.env.ADMIN_PASSWORD !== req.body.password.trim()) {
      return res.sendStatus(400);
    }

    const token = jwt.sign({ login: req.body.login }, process.env.TOKEN_SECRET, { expiresIn: '30d' });
    res.status(200).json({ success: true, result: token });
  } catch (e) {
    next(e);
  }
});

router.use(protect());

router.route('/query').post(async (req, res, next) => {
  try {
    const params = adaptUpworkQuery(req.body.query);
    const query = new Query(params, req.body.name);
    await query.save();
    res.status(201).json({ success: true, result: query.query });
  } catch (e) {
    next(e);
  }
})
  .get(async (req, res, next) => {
    try {
      const queries = await Query.getDocs({}, { query: 1, active: 1, name: 1 });

      res.status(200).json({ success: true, result: queries });
    } catch (e) {
      next(e);
    }
  })
  .patch(async (req, res, next) => {
    try {
      const query = new Query(req.body);
      console.log(query);
      await query.save();

      res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  });

router.delete('/query/:id', async (req, res, next) => {
  try {
    await Query.delete({ _id: ObjectId(req.params.id) });

    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
