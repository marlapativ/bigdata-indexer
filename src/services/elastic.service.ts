import env from '../config/env'
import { Client } from '@elastic/elasticsearch'
import logger from '../config/logger'

type ElasticSearchClientOptions = {
  url: string
  index: string
}

export interface IElasticSearchService {
  create<T>(objectId: string, object: T): Promise<boolean>
  delete(objectId: string): Promise<boolean>
}

class ElasticSearchService implements IElasticSearchService {
  options: ElasticSearchClientOptions
  client: Client

  constructor(options: ElasticSearchClientOptions) {
    this.options = options
    this.client = new Client({
      node: this.options.url
    })
  }
  async create<T>(objectId: string, object: T): Promise<boolean> {
    logger.info(`Creating object ${objectId} in ElasticSearch`)
    const response = await this.client.index<T>({
      index: this.options.index,
      id: objectId,
      body: object
    })
    return response.result === 'created'
  }

  async delete(objectId: string): Promise<boolean> {
    logger.info(`Deleting object ${objectId} in ElasticSearch`)
    const response = await this.client.delete({
      index: this.options.index,
      id: objectId
    })
    return response.result === 'deleted'
  }
}

const ElasticSearchServiceFactory = {
  create: (): IElasticSearchService => {
    const options = {
      url: env.getOrDefault('ELASTIC_SEARCH_URL', 'http://localhost:9200'),
      index: env.getOrDefault('ELASTIC_SEARCH_INDEX', 'default')
    }
    return new ElasticSearchService(options)
  }
}

export default ElasticSearchServiceFactory
