import env from '../config/env'
import { Channel, connect } from 'amqplib'
import logger from '../config/logger'

export interface IProducer {
  produce: (message: string) => boolean
}

export interface IConsumer {
  consume: (callback: (message: string) => void) => void
}

export type RabbitMQClientOptions = {
  url: string
  queueName: string
}

class RabbitMQBaseService {
  protected channel: Channel
  protected options: RabbitMQClientOptions

  protected constructor(channel: Channel, options: RabbitMQClientOptions) {
    this.channel = channel
    this.options = options
  }

  protected static async setup(options: RabbitMQClientOptions): Promise<Channel> {
    const { url, queueName } = options
    const connection = await connect(url)
    const channel = await connection.createChannel()
    channel.assertQueue(queueName)
    return channel
  }
}

class RabbitMQProducerService extends RabbitMQBaseService implements IProducer {
  produce = (message: string | object): boolean => {
    logger.info(`Producing message`)
    const result = this.channel.sendToQueue(this.options.queueName, Buffer.from(JSON.stringify(message)))
    logger.info(`Producing message result: ${result}`)
    return result
  }

  static async create(options: RabbitMQClientOptions): Promise<IProducer> {
    const channel = await this.setup(options)
    return new RabbitMQProducerService(channel, options)
  }
}

class RabbitMQConsumerService extends RabbitMQBaseService implements IConsumer {
  consume = async (callback: (message: string) => void) => {
    this.channel.consume(this.options.queueName, (message) => {
      logger.info(`Consuming message. Has data: ${message ? true : false}`)
      if (message) {
        try {
          logger.info(`Invoking consumer callback`)
          callback(message.content.toString())
          logger.info(`Acking message`)
          this.channel.ack(message)
        } catch (e) {
          logger.error(`Error consuming message: ${e}`)
          logger.error(e)
          this.channel.nack(message)
        }
      }
    })
  }

  static async create(options: RabbitMQClientOptions): Promise<IConsumer> {
    const channel = await this.setup(options)
    return new RabbitMQConsumerService(channel, options)
  }
}

const getDefaultRabbitMQOptions = (options?: RabbitMQClientOptions): RabbitMQClientOptions => {
  if (!options) {
    options = {
      url: env.getOrDefault('RABBITMQ_URL', 'amqp://localhost'),
      queueName: env.getOrDefault('RABBITMQ_QUEUE_NAME', 'elastic-search-queue')
    }
  }
  return options
}

const createProducerClient = async (options?: RabbitMQClientOptions): Promise<IProducer> => {
  options = getDefaultRabbitMQOptions(options)
  const client = await RabbitMQProducerService.create(options)
  return client
}

const createConsumerClient = async (options?: RabbitMQClientOptions): Promise<IConsumer> => {
  options = getDefaultRabbitMQOptions(options)
  const client = await RabbitMQConsumerService.create(options)
  return client
}

export { createProducerClient, createConsumerClient }
