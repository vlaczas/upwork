const Query = require('../models/Queries');
const api = require('./upwork');
const { Search } = require('@upwork/node-upwork-oauth2/lib/routers/jobs/search');
const slack = require('./slack');

function startCron() {
  setInterval(() => {
    sendJobUpdates();
  }, 10000);
  console.log('Cron Started');
}

async function sendJobUpdates() {
  const queries = await Query.getDocs({ active: true });
  const jobs = new Search(api);

  queries.forEach(query => {
    const lastSentJobs = query.lastJobs;
    const newSentJobs = [];
    jobs.find(query.query, function(error, status, response) {
      if (error || !response.jobs?.length) return;
      if (lastSentJobs) {
        for (let i = 0; i < lastSentJobs.length; i++) {
          const idx = response.jobs.findIndex(job => job.id === lastSentJobs[i]);
          if (idx > -1) response.jobs.splice(idx);
        }
      }
      if (!response.jobs.length) return;

      const jobsToMessage = [];
      response.jobs.forEach(job => {
        newSentJobs.push(job.id);
        jobsToMessage.push(...buildJobMessage(job));
      });

      try {
        slack.chat.postMessage({
          channel: 'upwork-jobs', blocks: jobsToMessage,
        }).then(() => console.log('Message posted!')).catch(e => console.error(e));
      } catch (error) {
        console.log(error);
      }

      query.lastJobs = newSentJobs;
      const q = new Query(query);
      q.save();
    });
  });
}

function buildJobMessage(job) {
  const date = new Date(job.date_created);
  date.toLocaleString('ru-RU', { timeZone: 'Europe/Kiev' });
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