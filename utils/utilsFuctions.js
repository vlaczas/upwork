const querystring = require('querystring');

exports.adaptUpworkQuery = (query) => {
  const parsed = querystring.parse(query.split('?')[1]);
  const params = { days_posted: 1 };
  for (let i of Object.entries(parsed)) {
    switch (i[0]) {
      case 't':
        if (i[1] === '0') params.job_type = 'hourly'; else params.job_type = 'fixed';
        break;
      case 'q':
        params.q = i[1];
        break;
      case 'title':
        params.title = i[1];
        break;
      case 'ontology_skill_uid':
        params.skills = i[1];
        break;
      case 'category2_uid':
        params.category2 = i[1];
        break;
      case 'subcategory2_uid':
        params.subcategory2 = i[1];
        break;
      case 'duration_v3':
        params.duration = i[1];
        break;
      case 'workload':
        params.workload = i[1];
        break;
      case 'client_hires':
        params.client_hires = i[1];
    }
  }
  return params;
};

exports.isNight = () => {
  const hours = new Date().getHours();
  //server time GMT+0, so to silence notif for ukraine from 19pm to 10am
  return hours > 17 || hours < 8;
};
