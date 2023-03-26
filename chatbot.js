const Twit = require('twit')
const { Configuration, OpenAIApi } = require('openai')
const { tweetTopics } = require('./tweetTopics')
require('dotenv').config()

const chatBot = new Twit({
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

function runTask() {
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
        chatBot.post('statuses/update', { 
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

// Post a tweet every 2 hours 
setInterval(() => {
    runTask()
}, 1000 * 60 * 120 )
