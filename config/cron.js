const Query = require('../models/Queries');
const api = require('./upwork');
const { Search } = require('@upwork/node-upwork-oauth2/lib/routers/jobs/search');
const slack = require('./slack');
const { isNight } = require('../utils/utilsFuctions');
const Bugsnag = require('@bugsnag/js');

function startCron() {
  setInterval(() => {
    sendJobUpdates();
  }, 300000);
  console.log('Cron Started');
  console.log(new Date());
}

async function sendJobUpdates() {
  try {
    if (isNight()) return;
    const queries = await Query.getDocs({ active: true });
    const jobs = new Search(api);

    queries.forEach(query => {
      let lastJobs = query.lastJobs;
      jobs.find(query.query, function(error, status, response) {
        if (error || !response.jobs?.length) return;
        if (lastJobs) {
          for (let i = 0; i < lastJobs.length; i++) {
            const idx = response.jobs.findIndex(job => job.id === lastJobs[i]);
            if (idx > -1) {
              response.jobs.splice(idx);
              break;
            }
          }
        } else {
          lastJobs = [];
          response.jobs.forEach(job => lastJobs.push(job.id));
        }

        if (!response.jobs.length) return;

        response.jobs.forEach(job => {
          lastJobs.unshift(job.id);
          try {
            slack.chat.postMessage({
              channel: 'upwork-jobs', blocks: buildJobMessage(job), text: job.title,
            }).then(() => console.log('Message posted!')).catch(e => console.error(e));
          } catch (error) {
            console.log(error);
          }
        });

        query.lastJobs = lastJobs.slice(0, 10);
        const q = new Query(query);
        q.save();
      });
    });
  } catch (e) {
    Bugsnag.notify(e);
  }
}

function buildJobMessage(job) {
  const date = new Date(job.date_created).toLocaleString('ru-RU', { timeZone: 'Europe/Kiev' });
  return [
    {
      'type': 'header', 'text': {
        'type': 'plain_text', 'text': job.title, 'emoji': true,
      },
    }, {
      'type': 'section', 'text': {
        'type': 'plain_text', 'text': job.snippet, 'emoji': true,
      },
    }, {
      'type': 'section', 'fields': [
        {
          'type': 'mrkdwn', 'text': `*Categories*: ${ job.category2 }`,
        }, {
          'type': 'mrkdwn', 'text': `*Subcategories*: ${ job.subcategory2 }`,
        }, {
          'type': 'mrkdwn',
          'text': `*Skills*: ${ job.skills ? job.skills.reduce((acc, skill) => acc + `${ skill }, `, '') : '' }`,
        }, {
          'type': 'mrkdwn', 'text': `*Job Type*: ${ job.job_type }`,
        }, {
          'type': 'mrkdwn', 'text': `*Budget*: ${ job.budget }`,
        }, {
          'type': 'mrkdwn', 'text': `*Duration*: ${ job.duration }`,
        }, {
          'type': 'mrkdwn', 'text': `*Workload*: ${ job.workload }`,
        }, {
          'type': 'mrkdwn', 'text': `*Creation Date*: ${ date }`,
        },
      ],
    }, {
      'type': 'section', 'text': {
        'type': 'mrkdwn', 'text': '*Client:* ',
      },
    }, {
      'type': 'section', 'fields': [
        {
          'type': 'mrkdwn', 'text': `*Country:* ${ job.client.country }`,
        }, {
          'type': 'mrkdwn', 'text': `*Feedback:* ${ job.client.feedback } ⭐`,
        }, {
          'type': 'mrkdwn', 'text': `*Jobs posted:* ${ job.client.jobs_posted }`,
        }, {
          'type': 'mrkdwn', 'text': `*Hires:* ${ job.client.past_hires }`,
        }, {
          'type': 'mrkdwn',
          'text': `*Payment Verified:* ${ job.client.payment_verification_status === 'VERIFIED' ? '✅' : '❌' }`,
        },
      ],
    }, {
      'type': 'section', 'text': {
        'type': 'mrkdwn', 'text': `*Link*: <${ job.url }|Here>`,
      },
    }, {
      'type': 'divider',
    },
  ];
}

module.exports = startCron;
