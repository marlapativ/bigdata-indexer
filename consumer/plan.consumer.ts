import env from '../src/config/env'
import ElasticSearchServiceFactory from '../src/services/elastic.service'
import QueueServiceFactory from '../src/services/queue.service'
import { ProducerMessage, ProducerOperationType } from '../src/services/plan.service'
import logger from '../src/config/logger'

// Setup .env file
env.loadEnv()

const queueService = QueueServiceFactory.create()
const elasticService = ElasticSearchServiceFactory.create()

const executeElasticSearchOperation = (data: ProducerMessage) => {
  switch (data.operation) {
    case ProducerOperationType.CREATE:
    case ProducerOperationType.UPDATE:
      elasticService.create(data.objectId, data.object!)
      break
    case ProducerOperationType.DELETE:
      elasticService.delete(data.objectId)
      break
  }
}

const execute = async () => {
  const consumerClient = await queueService.createConsumerClient()

  consumerClient.consume((message) => {
    logger.info(`Recieved message from consumer queue`)
    const data = JSON.parse(message.toString()) as ProducerMessage
    const objectId = data.objectId
    logger.info(`Parsed message. Executing operation ${data.operation} on object ${objectId}`)
    executeElasticSearchOperation(data)
  })
}

execute()
