import database from '../config/database'
import { Model } from '../types/model'
import { SchemaModel } from '../types/schema.model'

export type Plan = {
  planCostShares: PlanCostShares
  linkedPlanServices: LinkedPlanService[]
  _org: string
  objectId: string
  objectType: string
  planType: string
  creationDate: string
}

export type PlanCostShares = {
  deductible: number
  _org: string
  copay: number
  objectId: string
  objectType: string
}

export type LinkedPlanService = {
  linkedService: LinkedService
  planserviceCostShares: PlanserviceCostShares
  _org: string
  objectId: string
  objectType: string
}

export type LinkedService = {
  _org: string
  objectId: string
  objectType: string
  name: string
}

export type PlanserviceCostShares = {
  deductible: number
  _org: string
  copay: number
  objectId: string
  objectType: string
}

const PLAN_SCHEMA: SchemaModel = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Generated schema for Root',
  type: 'object',
  additionalProperties: false,
  properties: {
    planCostShares: {
      type: 'object',
      additionalProperties: false,
      properties: {
        deductible: {
          type: 'number'
        },
        _org: {
          type: 'string'
        },
        copay: {
          type: 'number'
        },
        objectId: {
          type: 'string'
        },
        objectType: {
          type: 'string'
        }
      },
      required: ['deductible', '_org', 'copay', 'objectId', 'objectType']
    },
    linkedPlanServices: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          linkedService: {
            type: 'object',
            additionalProperties: false,
            properties: {
              _org: {
                type: 'string'
              },
              objectId: {
                type: 'string'
              },
              objectType: {
                type: 'string'
              },
              name: {
                type: 'string'
              }
            },
            required: ['_org', 'objectId', 'objectType', 'name']
          },
          planserviceCostShares: {
            type: 'object',
            additionalProperties: false,
            properties: {
              deductible: {
                type: 'number'
              },
              _org: {
                type: 'string'
              },
              copay: {
                type: 'number'
              },
              objectId: {
                type: 'string'
              },
              objectType: {
                type: 'string'
              }
            },
            required: ['deductible', '_org', 'copay', 'objectId', 'objectType']
          },
          _org: {
            type: 'string'
          },
          objectId: {
            type: 'string'
          },
          objectType: {
            type: 'string'
          }
        },
        required: ['linkedService', 'planserviceCostShares', '_org', 'objectId', 'objectType']
      }
    },
    _org: {
      type: 'string'
    },
    objectId: {
      type: 'string'
    },
    objectType: {
      type: 'string'
    },
    planType: {
      type: 'string'
    },
    creationDate: {
      type: 'string'
    }
  },
  required: ['planCostShares', 'linkedPlanServices', '_org', 'objectId', 'objectType', 'planType', 'creationDate']
}

const PlanModel: Model = {
  fallbackSchema: PLAN_SCHEMA,
  schema: async () => await database.getDatabaseConnection().get('schema:plan'),
  key: 'plan'
}

export default PlanModel
