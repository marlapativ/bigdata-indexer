import env from '../src/config/env'
import { createConsumerClient } from '../src/services/queue.service'

// Setup .env file
env.loadEnv()

const main = async () => {
  const consumerClient = await createConsumerClient()
  consumerClient.consume((message) => {
    console.log(`Consumed message: ${message}`)
  })
}

main()
