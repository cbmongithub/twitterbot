const Twit = require('twit')
const { Configuration, OpenAIApi } = require('openai')
const { tweetTopics } = require('./tweetTopics')
require('dotenv').config()

const twitter = new Twit({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, 
  strictSSL: false,     
})

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_SECRET,
})

const openai = new OpenAIApi(configuration)
// Use open ai to create a tweet on a given topic
function postTweet() {
  let tweet
  // Generate a random topic for a tweet
  function randomTopic() {
  let randomNum = Math.floor(Math.random() * tweetTopics.length)
  return `Generate a tweet about ${tweetTopics[randomNum]}`
  }
  async function runCompletion() {  
      const completion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: randomTopic(), // Pass randomTopic() to chatgpts prompt  
        max_tokens: 200,
      })
      // Store the result as a tweet
      tweet = completion.data.choices[0].text
  }
  // Function to post our tweet
  function postTweet() {
      twitter.post('statuses/update', { 
          status: tweet // Pass in generated tweet as the status
          }, (err, data, response) => {
          if (err) {
            console.log(err)
          } else {
              console.log('Posted tweet: ', tweet)
          } 
        })
  }
  // Wait for the tweet, then post it  
  runCompletion().then(() => {
      postTweet()
  })
}

console.log('Running task...')

// Search tweets containing a topic and follow that user
function searchAndFollowUser() {
  twitter.get('search/tweets', { 
      q: 'apexlegends', // Change the query to be any tweet you want to search on twitter
      result_type: 'mixed'
      }, (err, data, response) => {
      if (err) {
          console.log(err)
      } else {
        let randomIndex = Math.floor(Math.random() * data.statuses.length)
        let userId = data.statuses[randomIndex].user.id_str
        let isEnglishUser = data.statuses[randomIndex].lang === 'en' ? true : false

        if(typeof userId != 'undefined' && isEnglishUser) {
          twitter.post('friendships/create', { id: userId }, (err, data, response) => {
            if (err) {
              console.log(err)
            } else {
                console.log(`Followed a random user! with user id ${userId}`)
              }              
            })
            
        }

      } 
  })
}

// Follow a user every minute 
setInterval(() => {
  searchAndFollowUser()
}, 1000 * 10)

// Post a tweet every 2 hours 
setInterval(() => {
  postTweet()
}, 1000 * 60 * 60 )
