import { Model } from './model'

const PLAN_SCHEMA = {
  $schema: 'http://json-schema.org/draft-06/schema#',
  $ref: '#/definitions/Welcome9',
  definitions: {
    Welcome9: {
      type: 'object',
      additionalProperties: false,
      properties: {
        planCostShares: {
          $ref: '#/definitions/PlanCostShares'
        },
        linkedPlanServices: {
          type: 'array',
          items: {
            $ref: '#/definitions/LinkedPlanService'
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
      required: ['_org', 'creationDate', 'linkedPlanServices', 'objectId', 'objectType', 'planCostShares', 'planType'],
      title: 'Welcome9'
    },
    LinkedPlanService: {
      type: 'object',
      additionalProperties: false,
      properties: {
        linkedService: {
          $ref: '#/definitions/LinkedService'
        },
        planserviceCostShares: {
          $ref: '#/definitions/PlanCostShares'
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
      required: ['_org', 'linkedService', 'objectId', 'objectType', 'planserviceCostShares'],
      title: 'LinkedPlanService'
    },
    LinkedService: {
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
      required: ['_org', 'name', 'objectId', 'objectType'],
      title: 'LinkedService'
    },
    PlanCostShares: {
      type: 'object',
      additionalProperties: false,
      properties: {
        deductible: {
          type: 'integer'
        },
        _org: {
          type: 'string'
        },
        copay: {
          type: 'integer'
        },
        objectId: {
          type: 'string'
        },
        objectType: {
          type: 'string'
        }
      },
      required: ['_org', 'copay', 'deductible', 'objectId', 'objectType'],
      title: 'PlanCostShares'
    }
  }
}

const Plan: Model = {
  schema: PLAN_SCHEMA
}

export default Plan
