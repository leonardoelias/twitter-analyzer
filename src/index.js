const Twit = require('twit');
const dotenv = require('dotenv');
const Sentiment = require('sentiment');
const colors = require('colors/safe');

dotenv.config();

const sentiment = new Sentiment();

const config_twitter = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 *1000
};

let api = new Twit(config_twitter);

function getText(tweet) {
  let text = tweet.retweeted_status
    ? tweet.retweeted_status.full_text
    : tweet.full_text;

  return text
    .split(/ |\n/)
    .filter(v => !v.startsWith('http'))
    .join(' ');
}

async function getTweets(q, count) {
  let tweets = await api.get('search/tweets', {q, count, 'tweet_mode': 'extended'});

  return tweets
    .data
    .statuses
    .map(getText);
}

async function init() {
  let keyword = 'javascript';
  let count = 10;
  let tweets = await getTweets(keyword, count);

  for (let tweet of tweets) {
    let score = sentiment
      .analyze(tweet)
      .comparative;
      
    tweet = `${tweet}\n`;

    switch (score) {
      case(score > 0):
        tweet = colors.green(tweet);
        break;
      case(score < 0):
        tweet = colors.red(tweet);
        break;
      default:
        tweet = colors.blue(tweet);
    }

    console.log('>>>> ', tweet)
  }
}

init();
