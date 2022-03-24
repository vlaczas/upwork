const api = require('../config/upwork');
const router = require('express').Router({ mergeParams: true });
const Search = require('@upwork/node-upwork-oauth2/lib/routers/jobs/search').Search;
const { adaptUpworkQuery } = require('../utils/adaptUpworkQuery');
const Query = require('../models/Queries');

const jobs = new Search(api);

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

router.route('/jobs').get((req, res, next) => {
  try {
    jobs.find({ title: 'react' }, function(error, status, response) {
      res.status(status).json(response?.jobs);
    });
  } catch (e) {
    next(e);
  }
});

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

module.exports = router;
